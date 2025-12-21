import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  ChevronRight,
  Brain,
  Target,
  CheckCircle,
  Clock,
  Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  topic: string;
}

interface WeakTopic {
  name: string;
  score: number;
  color: string;
}

const RevisionMode: React.FC = () => {
  const { learningProgress } = useApp();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Sample weak topics based on learning progress
  const weakTopics: WeakTopic[] = [
    { name: 'Force & Motion', score: 45, color: 'bg-red-100 text-red-700' },
    { name: "Newton's Laws", score: 52, color: 'bg-orange-100 text-orange-700' },
    { name: 'Work & Energy', score: 68, color: 'bg-yellow-100 text-yellow-700' }
  ];

  // Sample flashcards
  const flashcards: FlashCard[] = [
    {
      id: '1',
      front: "What is Newton's First Law of Motion?",
      back: "An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction, unless acted upon by an unbalanced force. Also known as the Law of Inertia.",
      topic: "Newton's Laws"
    },
    {
      id: '2',
      front: 'What is the formula for Force?',
      back: 'F = ma (Force equals mass times acceleration). This is Newton\'s Second Law of Motion.',
      topic: 'Force & Motion'
    },
    {
      id: '3',
      front: 'What is kinetic energy?',
      back: 'Kinetic energy is the energy an object possesses due to its motion. Formula: KE = ½mv²',
      topic: 'Work & Energy'
    },
    {
      id: '4',
      front: "What is Newton's Third Law?",
      back: 'For every action, there is an equal and opposite reaction. When one object exerts a force on another, the second object exerts an equal force back.',
      topic: "Newton's Laws"
    },
    {
      id: '5',
      front: 'What is momentum?',
      back: 'Momentum is the product of mass and velocity (p = mv). It represents the quantity of motion an object has.',
      topic: 'Force & Motion'
    }
  ];

  // Revision strategies
  const strategies = [
    { name: 'Work - Force & Distance', formula: 'W = F × d', icon: '📐' },
    { name: 'Kinetic Energy', formula: 'KE = ½mv²', icon: '⚡' }
  ];

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">AI-Powered Revision Assistant</h2>
                <p className="text-xs text-gray-500">Focus on weak topics and ace your exams</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">PSPACE → score</span>
              <div className="px-3 py-1.5 bg-green-50 rounded-lg flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">Gemini AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Revision Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prepare for Exams */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Prepare for Exams - Revision Summary</h3>
            
            {/* Focus on Weak Topics */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700">Focus on Weak Topics</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {weakTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${topic.score < 50 ? 'bg-red-500' : topic.score < 60 ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Flashcards</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Exam Summary */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Your Exam Summary</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-orange-600">Weak Topics</span>
                  <span className="text-gray-400">—</span>
                  <span>Ping the xDrug tech beababring</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-red-600">Newton's Laws</span>
                  <span className="text-gray-400">—</span>
                  <span>must to has is secoacost sop.suds ME.a my?</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600">K2, So m2</span>
                  <span className="text-gray-400">—</span>
                  <span>hops sg eceasen thing free degdy e9</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flashcards Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Flashcards</h3>
              <span className="text-sm text-gray-500">{currentCardIndex + 1} / {flashcards.length}</span>
            </div>

            {/* Flashcard */}
            <div 
              className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 cursor-pointer mb-4 shadow-lg shadow-blue-500/30 overflow-hidden"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 bg-white/20 rounded-lg text-xs text-white font-medium">
                    {currentCard.topic}
                  </span>
                  <span className="text-white/60 text-xs">Click to flip</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white text-center font-medium">
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>
                <div className="flex justify-center">
                  <span className="text-white/60 text-xs">{isFlipped ? 'Answer' : 'Question'}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevCard}
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {flashcards.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentCardIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleNextCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Mock Test & Strategies */}
        <div className="space-y-6">
          {/* Mock Test Ready */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Mock Test Ready</h3>
                <p className="text-xs text-gray-500">20 Questions</p>
              </div>
            </div>
            
            <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              Start Mock Test
            </button>
          </div>

          {/* Your Revision Strategy */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Your Revision Strategy</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📏</span>
                  <span className="text-sm text-gray-700">$0.1h Elev= Fortans</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              
              {strategies.map((strategy, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{strategy.icon}</span>
                    <div>
                      <p className="text-sm text-gray-700">{strategy.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{strategy.formula}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Session Stats</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Cards Reviewed</span>
                </div>
                <span className="font-bold text-gray-800">{currentCardIndex + 1}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-600">Study Streak</span>
                </div>
                <span className="font-bold text-gray-800">{learningProgress?.streakDays || 5} days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Time Today</span>
                </div>
                <span className="font-bold text-gray-800">25 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionMode;
