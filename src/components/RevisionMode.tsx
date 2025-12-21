import React, { useState, useEffect } from 'react';
import { 
  BookOpenCheck, 
  Sparkles, 
  ChevronRight, 
  Play, 
  RotateCcw,
  Brain,
  Lightbulb,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Trophy,
  ArrowRight,
  Loader2,
  FlipHorizontal
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateQuizFromContent } from '../services/geminiService';
import { Quiz, QuizQuestion } from '../types';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  topic: string;
}

const RevisionMode: React.FC = () => {
  const { user, studyMaterials, learningProgress, quizzes } = useApp();
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'mock-test'>('summary');
  const [isLoading, setIsLoading] = useState(false);
  const [mockTest, setMockTest] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const weakTopics = [
    { name: "Force & Motion", progress: 45, color: "bg-red-500" },
    { name: "Newton's Laws", progress: 55, color: "bg-orange-500" },
    { name: "Work & Energy", progress: 60, color: "bg-yellow-500" }
  ];

  const revisionStrategies = [
    { formula: "S0 1n D(ev) = Faltams", icon: "📐", topic: "Work + Force & Distance" },
    { formula: "K2 = √2 mv²", icon: "⚡", topic: "Kinetic Energy Formula" }
  ];

  const defaultFlashcards: FlashCard[] = [
    {
      id: '1',
      front: "What is Newton's First Law of Motion?",
      back: "An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an unbalanced force.",
      topic: "Newton's Laws"
    },
    {
      id: '2',
      front: "Define Kinetic Energy",
      back: "Kinetic energy is the energy possessed by an object due to its motion. Formula: KE = ½mv²",
      topic: "Work & Energy"
    },
    {
      id: '3',
      front: "What is the formula for Force?",
      back: "F = ma (Force equals mass times acceleration)",
      topic: "Force & Motion"
    },
    {
      id: '4',
      front: "What is Potential Energy?",
      back: "Potential energy is stored energy due to position or configuration. Gravitational PE = mgh",
      topic: "Work & Energy"
    }
  ];

  useEffect(() => {
    setFlashcards(defaultFlashcards);
  }, []);

  const handleGenerateMockTest = async () => {
    setIsLoading(true);
    try {
      const content = studyMaterials.length > 0 
        ? studyMaterials.slice(0, 3).map(m => m.content).join('\n\n')
        : `
          Newton's Laws of Motion:
          1. First Law (Inertia): An object at rest stays at rest and an object in motion stays in motion.
          2. Second Law: F = ma (Force equals mass times acceleration)
          3. Third Law: For every action, there is an equal and opposite reaction.
          
          Work and Energy:
          - Work = Force × Distance
          - Kinetic Energy = ½mv²
          - Potential Energy = mgh
          - Conservation of Energy: Energy cannot be created or destroyed
        `;

      const questions = await generateQuizFromContent(content, 20, 'medium', 'Physics');
      
      const quiz: Quiz = {
        id: Date.now().toString(),
        userId: user?.id || '',
        title: 'Mock Test - Physics Revision',
        subject: 'Physics',
        questions: questions.slice(0, 20),
        createdAt: new Date(),
        difficulty: 'medium'
      };

      setMockTest(quiz);
      setSelectedAnswers(new Array(quiz.questions.length).fill(null));
    } catch (error) {
      console.error('Error generating mock test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

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

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const handleSubmitTest = () => {
    setShowResults(true);
  };

  const calculateScore = (): number => {
    if (!mockTest) return 0;
    let correct = 0;
    mockTest.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const resetTest = () => {
    setMockTest(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setTestStarted(false);
  };

  return (
    <div className="h-full flex gap-6">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <BookOpenCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AI-Powered Revision Assistant</h1>
                <p className="text-gray-500 text-sm">Prepare for Exams - Revision Summary</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                PSPRACLE + more
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Gemini AI
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Focus on Weak Topics
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'flashcards'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab('mock-test')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'mock-test'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mock Test
            </button>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
            {/* Weak Topics */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Focus on Weak Topics
              </h3>
              <div className="space-y-4">
                {weakTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${topic.color}`}></div>
                      <span className="text-gray-700 font-medium">{topic.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${topic.color} rounded-full`}
                          style={{ width: `${topic.progress}%` }}
                        />
                      </div>
                      <button className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                        Flashcards
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-3">Your Exam Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-600 font-medium">Weak Topics:</span>
                    <span className="text-gray-500">Practice the above topics with flashcards</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-500">
                    <span>📌</span>
                    <span>Newton's Laws — must solve problems in ME, a my...</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-500">
                    <span>📌</span>
                    <span>K2, S0 m2 — hope to receive extra marks O3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Resources */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Study Resources</h3>
                  <span className="text-xs text-gray-500">Recently Added</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Flashcards Quiz</span>
                  </button>
                  <button className="p-4 bg-purple-50 rounded-xl text-left hover:bg-purple-100 transition-colors">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-2">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Funknowledgle</span>
                  </button>
                  <button className="p-4 bg-green-50 rounded-xl text-left hover:bg-green-100 transition-colors">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-2">
                      <BookOpenCheck className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Study Private</span>
                  </button>
                  <button className="p-4 bg-orange-50 rounded-xl text-left hover:bg-orange-100 transition-colors">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mb-2">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Quick Review</span>
                  </button>
                </div>
              </div>

              {/* Formulas */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Your Revision Strategy</h3>
                <div className="space-y-3">
                  {revisionStrategies.map((strategy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{strategy.icon}</span>
                        <div>
                          <p className="font-mono text-sm text-gray-800">{strategy.formula}</p>
                          <p className="text-xs text-gray-500">{strategy.topic}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flashcards' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            {flashcards.length > 0 && (
              <>
                <div 
                  className="w-full max-w-lg h-72 perspective-1000 cursor-pointer mb-6"
                  onClick={handleFlipCard}
                >
                  <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Front */}
                    <div className={`absolute w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg p-8 flex flex-col justify-center items-center text-white backface-hidden ${isFlipped ? 'invisible' : ''}`}>
                      <span className="text-xs text-purple-200 mb-4">{flashcards[currentCardIndex].topic}</span>
                      <h3 className="text-xl font-semibold text-center">{flashcards[currentCardIndex].front}</h3>
                      <p className="text-purple-200 text-sm mt-4 flex items-center gap-2">
                        <FlipHorizontal className="w-4 h-4" />
                        Click to reveal answer
                      </p>
                    </div>
                    {/* Back */}
                    <div className={`absolute w-full h-full bg-white rounded-2xl shadow-lg p-8 flex flex-col justify-center items-center text-gray-800 backface-hidden rotate-y-180 ${!isFlipped ? 'invisible' : ''}`}>
                      <span className="text-xs text-purple-600 mb-4">{flashcards[currentCardIndex].topic}</span>
                      <p className="text-center">{flashcards[currentCardIndex].back}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevCard}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-500">
                    {currentCardIndex + 1} / {flashcards.length}
                  </span>
                  <button
                    onClick={handleNextCard}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'mock-test' && (
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
            {!mockTest ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Trophy className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Mock Test Ready</h3>
                <p className="text-gray-500 mb-6">20 Questions to test your knowledge</p>
                <button
                  onClick={handleGenerateMockTest}
                  disabled={isLoading}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Mock Test
                    </>
                  )}
                </button>
              </div>
            ) : showResults ? (
              <div className="text-center py-8">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  calculateScore() / mockTest.questions.length >= 0.7 ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <span className={`text-3xl font-bold ${
                    calculateScore() / mockTest.questions.length >= 0.7 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {Math.round((calculateScore() / mockTest.questions.length) * 100)}%
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Mock Test Complete!</h3>
                <p className="text-gray-600 mb-6">
                  You scored {calculateScore()} out of {mockTest.questions.length} questions
                </p>
                <button
                  onClick={resetTest}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </div>
            ) : (
              <div>
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Question {currentQuestionIndex + 1} of {mockTest.questions.length}</span>
                    <span className="text-purple-600 font-medium">{mockTest.questions[currentQuestionIndex].topic}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / mockTest.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  {mockTest.questions[currentQuestionIndex].question}
                </h3>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {mockTest.questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium ${
                          selectedAnswers[currentQuestionIndex] === index
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : 'border-gray-300 text-gray-500'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-gray-800">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl font-medium transition-colors"
                  >
                    Previous
                  </button>
                  {currentQuestionIndex === mockTest.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitTest}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      Submit Test
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-72 space-y-4 hidden xl:block">
        {/* Mock Test Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-sm p-5 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <img src="https://via.placeholder.com/40" alt="Gemini" className="w-8 h-8 rounded" />
            </div>
            <div>
              <h3 className="font-semibold">Mock Test Ready</h3>
              <p className="text-sm text-purple-200">20 Questions</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setActiveTab('mock-test');
              if (!mockTest) handleGenerateMockTest();
            }}
            className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Mock Test
          </button>
        </div>

        {/* Revision Strategy */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Your Revision Strategy</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Work + Force & Distance</p>
              <p className="font-mono text-sm text-gray-800">S0 1n D(ev) = Faltams</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Kinetic Energy</p>
              <p className="font-mono text-sm text-gray-800">K2 = √2 mv²</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionMode;
