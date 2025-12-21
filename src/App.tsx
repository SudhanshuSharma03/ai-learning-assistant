import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import StudyBuddyChat from './components/StudyBuddyChat';
import QuizGenerator from './components/QuizGenerator';
import StudyMaterials from './components/StudyMaterials';
import LearningPath from './components/LearningPath';
import { getStudyMaterials, getQuizzes, getLearningProgress } from './services/firebaseService';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    user, 
    activeTab, 
    setActiveTab,
    setStudyMaterials,
    setQuizzes,
    setLearningProgress
  } = useApp();

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const [materials, quizzes, progress] = await Promise.all([
        getStudyMaterials(user.id),
        getQuizzes(user.id),
        getLearningProgress(user.id)
      ]);

      setStudyMaterials(materials);
      setQuizzes(quizzes);
      if (progress) {
        setLearningProgress(progress);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return <StudyBuddyChat />;
      case 'quiz':
        return <QuizGenerator />;
      case 'materials':
        return <StudyMaterials />;
      case 'learning':
        return <LearningPath />;
      default:
        return <StudyBuddyChat />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onNavigate={setActiveTab} />
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
