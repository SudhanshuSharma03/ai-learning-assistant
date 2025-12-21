import React from 'react';
import { Sparkles, BookOpen, Target, Brain, ArrowRight, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LandingPage: React.FC = () => {
  const { signIn, isLoading } = useApp();

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: 'AI Study Buddy',
      description: 'Get instant answers to your questions with our intelligent chatbot powered by Google Gemini AI.'
    },
    {
      icon: <BookOpen className="w-8 h-8 text-green-500" />,
      title: 'Smart Quiz Generator',
      description: 'Upload your lecture notes and let AI generate custom quizzes to test your understanding.'
    },
    {
      icon: <Target className="w-8 h-8 text-purple-500" />,
      title: 'Personalized Learning Path',
      description: 'Track your progress and get AI-powered recommendations on what to study next.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AI Study Buddy</span>
          </div>
          <button
            onClick={signIn}
            disabled={isLoading}
            className="px-6 py-2 bg-white text-primary-600 rounded-full font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Sign In'}
          </button>
        </nav>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini AI & Firebase
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Your Personal
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
              AI Learning Assistant
            </span>
          </h1>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Transform how you study with AI-powered tutoring, instant quiz generation, 
            and personalized learning paths designed to help you succeed.
          </p>

          <button
            onClick={signIn}
            disabled={isLoading}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Get Started Free
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>

          <p className="text-white/60 mt-4 text-sm">
            Sign in with your Google account to get started
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Combine the power of AI with proven learning techniques to master any subject faster and more effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join thousands of students using AI to study smarter, not harder.
          </p>
          <button
            onClick={signIn}
            disabled={isLoading}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Start Learning Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 AI Study Buddy. Built with Google Gemini AI & Firebase.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
