import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthChange, signInWithGoogle, signOutUser } from '../services/firebaseService';
import { User, LearningProgress, StudyMaterial, ChatSession, Quiz } from '../types';

interface AppContextType {
  // Auth
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // Study Materials
  studyMaterials: StudyMaterial[];
  setStudyMaterials: React.Dispatch<React.SetStateAction<StudyMaterial[]>>;
  
  // Chat
  chatSessions: ChatSession[];
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  currentChatSession: ChatSession | null;
  setCurrentChatSession: React.Dispatch<React.SetStateAction<ChatSession | null>>;
  
  // Quizzes
  quizzes: Quiz[];
  setQuizzes: React.Dispatch<React.SetStateAction<Quiz[]>>;
  
  // Learning Progress
  learningProgress: LearningProgress | null;
  setLearningProgress: React.Dispatch<React.SetStateAction<LearningProgress | null>>;
  
  // UI State
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatSession, setCurrentChatSession] = useState<ChatSession | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setUser({
          id: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Student',
          photoURL: fbUser.photoURL || undefined,
          createdAt: new Date(),
          lastLoginAt: new Date()
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    try {
      const userData = await signInWithGoogle();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setStudyMaterials([]);
    setChatSessions([]);
    setCurrentChatSession(null);
    setQuizzes([]);
    setLearningProgress(null);
  };

  const value: AppContextType = {
    user,
    firebaseUser,
    isLoading,
    signIn,
    signOut,
    studyMaterials,
    setStudyMaterials,
    chatSessions,
    setChatSessions,
    currentChatSession,
    setCurrentChatSession,
    quizzes,
    setQuizzes,
    learningProgress,
    setLearningProgress,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
