import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';
import {
  User,
  StudyMaterial,
  ChatSession,
  Quiz,
  QuizAttempt,
  LearningProgress,
  DailyGoal
} from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ============ Authentication ============

export const signInWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create or update user in Firestore
    const userData: User = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Student',
      photoURL: user.photoURL || undefined,
      createdAt: new Date(),
      lastLoginAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
    return userData;
  } catch (error) {
    console.error('Error signing in:', error);
    return null;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// ============ Study Materials ============

export const saveStudyMaterial = async (material: Omit<StudyMaterial, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'studyMaterials'), {
      ...material,
      uploadedAt: Timestamp.fromDate(material.uploadedAt)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving study material:', error);
    throw error;
  }
};

export const getStudyMaterials = async (userId: string): Promise<StudyMaterial[]> => {
  try {
    const q = query(
      collection(db, 'studyMaterials'),
      where('userId', '==', userId),
      orderBy('uploadedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt.toDate()
    })) as StudyMaterial[];
  } catch (error) {
    console.error('Error getting study materials:', error);
    return [];
  }
};

export const deleteStudyMaterial = async (materialId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'studyMaterials', materialId));
  } catch (error) {
    console.error('Error deleting study material:', error);
    throw error;
  }
};

// ============ Chat Sessions ============

export const saveChatSession = async (session: Omit<ChatSession, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'chatSessions'), {
      ...session,
      createdAt: Timestamp.fromDate(session.createdAt),
      updatedAt: Timestamp.fromDate(session.updatedAt),
      messages: session.messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp)
      }))
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat session:', error);
    throw error;
  }
};

export const updateChatSession = async (sessionId: string, session: Partial<ChatSession>): Promise<void> => {
  try {
    const updateData: any = {
      ...session,
      updatedAt: Timestamp.fromDate(new Date())
    };
    
    if (session.messages) {
      updateData.messages = session.messages.map(msg => ({
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp)
      }));
    }
    
    await updateDoc(doc(db, 'chatSessions', sessionId), updateData);
  } catch (error) {
    console.error('Error updating chat session:', error);
    throw error;
  }
};

export const getChatSessions = async (userId: string): Promise<ChatSession[]> => {
  try {
    const q = query(
      collection(db, 'chatSessions'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        messages: data.messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp.toDate()
        }))
      };
    }) as ChatSession[];
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    return [];
  }
};

// ============ Quizzes ============

export const saveQuiz = async (quiz: Omit<Quiz, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'quizzes'), {
      ...quiz,
      createdAt: Timestamp.fromDate(quiz.createdAt)
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz:', error);
    throw error;
  }
};

export const getQuizzes = async (userId: string): Promise<Quiz[]> => {
  try {
    const q = query(
      collection(db, 'quizzes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })) as Quiz[];
  } catch (error) {
    console.error('Error getting quizzes:', error);
    return [];
  }
};

export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'quizzes', quizId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate()
      } as Quiz;
    }
    return null;
  } catch (error) {
    console.error('Error getting quiz:', error);
    return null;
  }
};

// ============ Quiz Attempts ============

export const saveQuizAttempt = async (attempt: Omit<QuizAttempt, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'quizAttempts'), {
      ...attempt,
      completedAt: Timestamp.fromDate(attempt.completedAt)
    });
    
    // Update learning progress
    await updateLearningProgressAfterQuiz(attempt);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    throw error;
  }
};

export const getQuizAttempts = async (userId: string, quizId?: string): Promise<QuizAttempt[]> => {
  try {
    let q;
    if (quizId) {
      q = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', userId),
        where('quizId', '==', quizId),
        orderBy('completedAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'quizAttempts'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc'),
        limit(50)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt.toDate()
    })) as QuizAttempt[];
  } catch (error) {
    console.error('Error getting quiz attempts:', error);
    return [];
  }
};

// ============ Learning Progress ============

export const getLearningProgress = async (userId: string): Promise<LearningProgress | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'learningProgress', userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        lastStudyDate: data.lastStudyDate?.toDate() || new Date(),
        topics: data.topics?.map((t: any) => ({
          ...t,
          lastStudied: t.lastStudied?.toDate() || new Date()
        })) || []
      } as LearningProgress;
    }
    
    // Create initial progress if doesn't exist
    const initialProgress: LearningProgress = {
      userId,
      topics: [],
      totalQuizzesTaken: 0,
      averageScore: 0,
      streakDays: 0,
      lastStudyDate: new Date(),
      studyTimeTotal: 0,
      weakTopics: [],
      strongTopics: []
    };
    
    await setDoc(doc(db, 'learningProgress', userId), {
      ...initialProgress,
      lastStudyDate: Timestamp.fromDate(initialProgress.lastStudyDate)
    });
    
    return initialProgress;
  } catch (error) {
    console.error('Error getting learning progress:', error);
    return null;
  }
};

export const updateLearningProgress = async (userId: string, updates: Partial<LearningProgress>): Promise<void> => {
  try {
    const updateData: any = { ...updates };
    
    if (updates.lastStudyDate) {
      updateData.lastStudyDate = Timestamp.fromDate(updates.lastStudyDate);
    }
    
    if (updates.topics) {
      updateData.topics = updates.topics.map(t => ({
        ...t,
        lastStudied: Timestamp.fromDate(t.lastStudied)
      }));
    }
    
    await updateDoc(doc(db, 'learningProgress', userId), updateData);
  } catch (error) {
    console.error('Error updating learning progress:', error);
    throw error;
  }
};

const updateLearningProgressAfterQuiz = async (attempt: Omit<QuizAttempt, 'id'>): Promise<void> => {
  try {
    const progress = await getLearningProgress(attempt.userId);
    if (!progress) return;
    
    const scorePercent = (attempt.score / attempt.totalQuestions) * 100;
    
    // Update totals
    const newTotalQuizzes = progress.totalQuizzesTaken + 1;
    const newAverageScore = (
      (progress.averageScore * progress.totalQuizzesTaken + scorePercent) / newTotalQuizzes
    );
    
    // Update streak
    const today = new Date();
    const lastStudy = new Date(progress.lastStudyDate);
    const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreak = progress.streakDays;
    if (daysDiff === 0) {
      // Same day, keep streak
    } else if (daysDiff === 1) {
      // Next day, increment streak
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
    
    await updateLearningProgress(attempt.userId, {
      totalQuizzesTaken: newTotalQuizzes,
      averageScore: Math.round(newAverageScore),
      streakDays: newStreak,
      lastStudyDate: today,
      studyTimeTotal: progress.studyTimeTotal + Math.round(attempt.timeSpent / 60)
    });
  } catch (error) {
    console.error('Error updating progress after quiz:', error);
  }
};

// ============ Daily Goals ============

export const getDailyGoal = async (userId: string, date: Date): Promise<DailyGoal | null> => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const docSnap = await getDoc(doc(db, 'dailyGoals', `${userId}_${dateStr}`));
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        date: data.date.toDate()
      } as DailyGoal;
    }
    return null;
  } catch (error) {
    console.error('Error getting daily goal:', error);
    return null;
  }
};

export const saveDailyGoal = async (goal: DailyGoal): Promise<void> => {
  try {
    const dateStr = goal.date.toISOString().split('T')[0];
    await setDoc(doc(db, 'dailyGoals', `${goal.userId}_${dateStr}`), {
      ...goal,
      date: Timestamp.fromDate(goal.date)
    });
  } catch (error) {
    console.error('Error saving daily goal:', error);
    throw error;
  }
};

export { db, auth };
