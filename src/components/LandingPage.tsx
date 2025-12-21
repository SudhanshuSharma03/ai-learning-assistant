import React from 'react';
import { Sparkles, BookOpen, Target, Brain, ArrowRight, Loader2, Bot, HelpCircle, ClipboardList, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const LandingPage: React.FC = () => {
  const { signIn, isLoading } = useApp();

  const features = [
    {
      icon: <HelpCircle className="w-6 h-6 text-purple-500" />,
      title: 'AI Doubt Solving',
      description: 'Get instant answers to your questions with our intelligent AI powered by Google Gemini.',
      color: 'bg-purple-50 border-purple-100'
    },
    {
      icon: <ClipboardList className="w-6 h-6 text-green-500" />,
      title: 'Smart Quiz Generator',
      description: 'Upload your notes and let AI generate custom quizzes to test your understanding.',
      color: 'bg-green-50 border-green-100'
    },
    {
      icon: <BookOpen className="w-6 h-6 text-orange-500" />,
      title: 'Revision Mode',
      description: 'Focus on weak topics with flashcards and mock tests designed for exam prep.',
      color: 'bg-orange-50 border-orange-100'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-cyan-500" />,
      title: 'Progress Analytics',
      description: 'Track your learning journey with detailed insights and performance metrics.',
      color: 'bg-cyan-50 border-cyan-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">Sentience AI</span>
              <p className="text-xs text-white/60">Learning Assistant</p>
            </div>
          </div>
          <button
            onClick={signIn}
            disabled={isLoading}
            className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 text-sm shadow-lg shadow-blue-900/20"
          >
            {isLoading ? 'Loading...' : 'Sign In with Google'}
          </button>
        </nav>

        <div className="max-w-4xl mx-auto text-center pt-8 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-8 border border-white/20">
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini AI
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Your Personal
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300">
              AI Learning Assistant
            </span>
          </h1>
          
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
            Transform how you study with AI-powered tutoring, instant quiz generation, 
            and personalized learning paths designed to help you succeed.
          </p>

          <button
            onClick={signIn}
            disabled={isLoading}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl shadow-blue-900/30 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-white/50 mt-4 text-sm">
            Sign in with your Google account • No credit card required
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Combine the power of AI with proven learning techniques to master any subject faster and more effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} border rounded-2xl p-6 hover:shadow-lg transition-shadow`}
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Preview Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                See It In Action
              </h2>
              <p className="text-gray-500">
                Experience intelligent learning assistance that adapts to your needs
              </p>
            </div>
            
            {/* Mock Dashboard Preview */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-500">Sentience AI - Learning Dashboard</span>
                </div>
              </div>
              <div className="p-6 bg-gray-50">
                <div className="flex gap-4">
                  {/* Sidebar Mock */}
                  <div className="w-48 bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg"></div>
                      <div>
                        <div className="h-2.5 w-16 bg-gray-200 rounded"></div>
                        <div className="h-2 w-12 bg-gray-100 rounded mt-1"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-blue-50 rounded-lg"></div>
                      <div className="h-8 bg-gray-50 rounded-lg"></div>
                      <div className="h-8 bg-gray-50 rounded-lg"></div>
                      <div className="h-8 bg-gray-50 rounded-lg"></div>
                    </div>
                  </div>
                  
                  {/* Content Mock */}
                  <div className="flex-1 bg-white rounded-xl p-4 shadow-sm">
                    <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-32 bg-gray-100 rounded mb-6"></div>
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 h-20 bg-orange-50 rounded-xl"></div>
                      <div className="flex-1 h-20 bg-blue-50 rounded-xl"></div>
                    </div>
                    <div className="h-32 bg-gray-50 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm">
            Join thousands of students using AI to study smarter, not harder.
          </p>
          <button
            onClick={signIn}
            disabled={isLoading}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Start Learning Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 Sentience AI Learning Assistant. Built with Google Gemini AI & Firebase.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
