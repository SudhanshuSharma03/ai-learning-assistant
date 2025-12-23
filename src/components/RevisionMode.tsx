import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  BookOpen,
  Play,
  Brain,
  Target,
  CheckCircle,
  Clock,
  Flame,
  Upload,
  FileText,
  Loader2,
  Sparkles,
  RotateCcw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateFlashcards, extractKeyConcepts, generateQuizFromContent } from '../services/geminiService';
import { Quiz } from '../types';
import { saveQuiz } from '../services/firebaseService';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  topic: string;
}

interface WeakTopic {
  name: string;
  score: number;
  questionsWrong: number;
  totalQuestions: number;
}

interface UploadedContent {
  name: string;
  content: string;
  concepts: string[];
}

const RevisionMode: React.FC = () => {
  const { learningProgress, quizzes, user, setQuizzes, setActiveTab } = useApp();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedContent, setUploadedContent] = useState<UploadedContent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numCards, setNumCards] = useState(10);
  
  // Mock test state
  const [isGeneratingMockTest, setIsGeneratingMockTest] = useState(false);
  const [mockTestGenerated, setMockTestGenerated] = useState(false);

  // Calculate weak topics from quiz history
  const calculateWeakTopics = (): WeakTopic[] => {
    const topicStats: Record<string, { wrong: number; total: number }> = {};
    
    quizzes.forEach(quiz => {
      quiz.questions.forEach(q => {
        if (!topicStats[q.topic]) {
          topicStats[q.topic] = { wrong: 0, total: 0 };
        }
        topicStats[q.topic].total++;
      });
    });

    return Object.entries(topicStats)
      .map(([name, stats]) => ({
        name,
        score: Math.round(((stats.total - stats.wrong) / stats.total) * 100),
        questionsWrong: stats.wrong,
        totalQuestions: stats.total
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);
  };

  const weakTopics = calculateWeakTopics();

  // File upload handling
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const content = await readFileContent(file);
      const concepts = await extractKeyConcepts(content);
      
      setUploadedContent({
        name: file.name,
        content,
        concepts
      });
    } catch (err) {
      setError('Failed to process file. Please try again.');
      console.error('Error processing file:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'text/markdown': ['.md'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Generate flashcards from uploaded content
  const handleGenerateFlashcards = async () => {
    if (!uploadedContent) return;

    setIsGenerating(true);
    setError(null);

    try {
      const cards = await generateFlashcards(uploadedContent.content, numCards);
      
      const flashcardsWithIds: FlashCard[] = cards.map((card, index) => ({
        id: `card-${index}`,
        front: card.front,
        back: card.back,
        topic: uploadedContent.concepts[index % uploadedContent.concepts.length] || 'General'
      }));

      setFlashcards(flashcardsWithIds);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      setError('Failed to generate flashcards. Please try again.');
      console.error('Error generating flashcards:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate mock test from uploaded content
  const handleGenerateMockTest = async () => {
    if (!uploadedContent || !user) {
      setError('Please upload study material first and make sure you are logged in.');
      return;
    }

    setIsGeneratingMockTest(true);
    setError(null);

    try {
      const questions = await generateQuizFromContent(
        uploadedContent.content,
        20,
        'medium',
        uploadedContent.concepts[0] || 'General'
      );

      const quiz: Quiz = {
        id: '',
        userId: user.id,
        title: `Mock Test: ${uploadedContent.name}`,
        subject: uploadedContent.concepts[0] || 'General',
        questions,
        createdAt: new Date(),
        sourceContent: uploadedContent.name,
        difficulty: 'medium'
      };

      const quizId = await saveQuiz(quiz);
      quiz.id = quizId;

      setQuizzes(prev => [quiz, ...prev]);
      setMockTestGenerated(true);
      
      setTimeout(() => setMockTestGenerated(false), 3000);
    } catch (err) {
      setError('Failed to generate mock test. Please try again.');
      console.error('Error generating mock test:', err);
    } finally {
      setIsGeneratingMockTest(false);
    }
  };

  const handleReset = () => {
    setFlashcards([]);
    setUploadedContent(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setError(null);
  };

  const handleNextCard = () => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrevCard = () => {
    if (flashcards.length === 0) return;
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
                <p className="text-xs text-gray-500">Generate flashcards from your study materials</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-green-50 rounded-lg flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">Gemini AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Flashcards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          {flashcards.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Upload Study Material</h3>
              
              {!uploadedContent ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                      <p className="text-sm text-gray-600">Processing your file...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-1">
                        {isDragActive ? 'Drop your file here' : 'Drag & drop your study material'}
                      </p>
                      <p className="text-sm text-gray-400">or click to browse (TXT, PDF, MD, DOC)</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Uploaded file info */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{uploadedContent.name}</p>
                      <p className="text-xs text-gray-500">{uploadedContent.concepts.length} concepts detected</p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Detected concepts */}
                  {uploadedContent.concepts.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Key Concepts Detected:</p>
                      <div className="flex flex-wrap gap-2">
                        {uploadedContent.concepts.slice(0, 8).map((concept, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {concept}
                          </span>
                        ))}
                        {uploadedContent.concepts.length > 8 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{uploadedContent.concepts.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Number of cards selector */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-600">Number of flashcards:</label>
                    <select
                      value={numCards}
                      onChange={(e) => setNumCards(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value={5}>5 cards</option>
                      <option value={10}>10 cards</option>
                      <option value={15}>15 cards</option>
                      <option value={20}>20 cards</option>
                    </select>
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={handleGenerateFlashcards}
                    disabled={isGenerating}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Flashcards...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate AI Flashcards
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Flashcards Section */}
          {flashcards.length > 0 && currentCard && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-800">Flashcards</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                    AI Generated
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{currentCardIndex + 1} / {flashcards.length}</span>
                  <button
                    onClick={handleReset}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Generate new flashcards"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flashcard */}
              <div 
                className="relative h-56 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 cursor-pointer mb-4 shadow-lg shadow-blue-500/30 overflow-hidden transform transition-transform hover:scale-[1.02]"
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
                  <div className="flex-1 flex items-center justify-center px-4">
                    <p className="text-white text-center font-medium text-lg leading-relaxed">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isFlipped 
                        ? 'bg-green-400/30 text-green-100' 
                        : 'bg-white/20 text-white/80'
                    }`}>
                      {isFlipped ? '✓ Answer' : '? Question'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevCard}
                  disabled={flashcards.length <= 1}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex gap-1 max-w-xs overflow-hidden">
                  {flashcards.slice(0, 15).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentCardIndex ? 'bg-blue-600' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    />
                  ))}
                  {flashcards.length > 15 && (
                    <span className="text-xs text-gray-400 ml-1">...</span>
                  )}
                </div>
                <button
                  onClick={handleNextCard}
                  disabled={flashcards.length <= 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Weak Topics from Quiz History */}
          {weakTopics.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-gray-800">Topics to Review</h3>
                <span className="text-xs text-gray-500">(from quiz history)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {weakTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        topic.score < 50 ? 'bg-red-500' : 
                        topic.score < 70 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      topic.score < 50 ? 'bg-red-100 text-red-700' : 
                      topic.score < 70 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {topic.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Mock Test & Stats */}
        <div className="space-y-6">
          {/* Mock Test */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Generate Mock Test</h3>
                <p className="text-xs text-gray-500">20 AI-generated questions</p>
              </div>
            </div>
            
            {mockTestGenerated ? (
              <div className="w-full py-3 bg-green-100 text-green-700 rounded-xl font-medium flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Mock Test Created! Check Quiz Generator.
              </div>
            ) : (
              <button 
                onClick={handleGenerateMockTest}
                disabled={!uploadedContent || isGeneratingMockTest}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingMockTest ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate Mock Test
                  </>
                )}
              </button>
            )}
            
            {!uploadedContent && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Upload study material first
              </p>
            )}
          </div>

          {/* Recent Quizzes */}
          {quizzes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Quizzes</h3>
              <p className="text-xs text-gray-500 mb-3">Click to take a quiz</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {quizzes.slice(0, 5).map((quiz, index) => (
                  <div 
                    key={quiz.id || index} 
                    onClick={() => setActiveTab('quiz')}
                    className="flex items-center gap-3 p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-purple-200"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{quiz.title}</p>
                      <p className="text-xs text-gray-500">{quiz.questions.length} questions</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white rounded-lg text-xs font-medium">
                      <Play className="w-3 h-3" />
                      Take
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Stats */}
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
                <span className="font-bold text-gray-800">
                  {flashcards.length > 0 ? currentCardIndex + 1 : 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">Total Flashcards</span>
                </div>
                <span className="font-bold text-gray-800">{flashcards.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-600">Study Streak</span>
                </div>
                <span className="font-bold text-gray-800">{learningProgress?.streakDays || 0} days</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Quizzes Taken</span>
                </div>
                <span className="font-bold text-gray-800">{quizzes.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionMode;
