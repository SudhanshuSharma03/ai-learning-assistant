import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Trash2,
  ClipboardList,
  Play,
  Clock,
  Target,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Trophy,
  XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateQuizFromContent, extractKeyConcepts } from '../services/geminiService';
import { saveQuiz } from '../services/firebaseService';
import { Quiz } from '../types';

interface UploadedFile {
  file: File;
  content: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  concepts?: string[];
}

const QuizGenerator: React.FC = () => {
  const { user, setQuizzes, quizzes } = useApp();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [quizSettings, setQuizSettings] = useState({
    numQuestions: 5,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    subject: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [activeView, setActiveView] = useState<'generate' | 'history'>('generate');

  const handleSelectQuizFromHistory = (quiz: Quiz) => {
    setGeneratedQuiz(quiz);
    setSelectedAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setQuizStarted(true);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const newFile: UploadedFile = {
        file,
        content: '',
        status: 'processing'
      };
      
      setUploadedFiles(prev => [...prev, newFile]);

      try {
        const content = await readFileContent(file);
        const concepts = await extractKeyConcepts(content);
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, content, concepts, status: 'ready' }
              : f
          )
        );
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file === file 
              ? { ...f, status: 'error' }
              : f
          )
        );
      }
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
    }
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

  const handleGenerateQuiz = async () => {
    if (!selectedFile || !user) return;

    setIsGenerating(true);
    try {
      const questions = await generateQuizFromContent(
        selectedFile.content,
        quizSettings.numQuestions,
        quizSettings.difficulty,
        quizSettings.subject
      );

      const quiz: Quiz = {
        id: '',
        userId: user.id,
        title: `Quiz: ${selectedFile.file.name}`,
        subject: quizSettings.subject || 'General',
        questions,
        createdAt: new Date(),
        sourceContent: selectedFile.file.name,
        difficulty: quizSettings.difficulty
      };

      const quizId = await saveQuiz(quiz);
      quiz.id = quizId;

      setGeneratedQuiz(quiz);
      setQuizzes(prev => [quiz, ...prev]);
      setSelectedAnswers(new Array(questions.length).fill(null));
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveFile = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file));
    if (selectedFile?.file === file) {
      setSelectedFile(null);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResults) return;
    
    setSelectedAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (generatedQuiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = (): number => {
    if (!generatedQuiz) return 0;
    let correct = 0;
    generatedQuiz.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const resetQuiz = () => {
    setGeneratedQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
    setSelectedFile(null);
  };

  // Quiz Taking View
  if (generatedQuiz && quizStarted) {
    const currentQuestion = generatedQuiz.questions[currentQuestionIndex];
    const score = calculateScore();
    const percentage = Math.round((score / generatedQuiz.questions.length) * 100);

    if (showResults) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
              percentage >= 70 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Trophy className={`w-12 h-12 ${
                percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">
              You scored <span className="font-bold text-blue-600">{score}</span> out of <span className="font-bold">{generatedQuiz.questions.length}</span> questions
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <span className={`text-2xl font-bold ${
                percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {percentage}%
              </span>
              <span className="text-gray-500">accuracy</span>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto mb-6">
            {generatedQuiz.questions.map((q, i) => {
              const isCorrect = selectedAnswers[i] === q.correctAnswer;
              return (
                <div key={q.id} className={`p-4 rounded-xl border ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm mb-2">{q.question}</p>
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Correct:</span> {q.options[q.correctAnswer]}
                      </p>
                      {!isCorrect && selectedAnswers[i] !== null && (
                        <p className="text-xs text-red-600 mt-1">
                          <span className="font-medium">Your answer:</span> {q.options[selectedAnswers[i]!]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={resetQuiz}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Generate New Quiz
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Quiz Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {generatedQuiz.questions.length}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
              {currentQuestion.topic}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / generatedQuiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium text-sm ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-800 text-sm">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          {currentQuestionIndex === generatedQuiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={selectedAnswers.some(a => a === null)}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz Ready View
  if (generatedQuiz) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Ready!</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Your quiz has been generated with {generatedQuiz.questions.length} questions.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{generatedQuiz.questions.length}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 capitalize">{generatedQuiz.difficulty}</p>
              <p className="text-xs text-gray-500">Difficulty</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{generatedQuiz.subject || 'General'}</p>
              <p className="text-xs text-gray-500">Subject</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetQuiz}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setQuizStarted(true)}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Smart Quiz Generator</h2>
                <p className="text-xs text-gray-500">Generate quizzes from your notes</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">AI Powered</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveView('generate')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeView === 'generate'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Generate Quiz
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeView === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Quiz History ({quizzes.length})
          </button>
        </div>
      </div>

      {activeView === 'generate' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Upload Notes</h3>
            <p className="text-sm text-gray-500 mb-4">
              We upload, upload dbu-beatabad your fence size.
            </p>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1 text-sm">
                {isDragActive ? 'Drop your files here' : 'Drag from PDF/Notes'}
              </p>
              <p className="text-xs text-gray-400">
                from your device ↑
              </p>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => item.status === 'ready' && setSelectedFile(item)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedFile === item
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{item.file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'processing' && (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      )}
                      {item.status === 'ready' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {item.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(item.file);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Generate Button */}
            {selectedFile && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Questions</label>
                    <select
                      value={quizSettings.numQuestions}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, numQuestions: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Difficulty</label>
                    <select
                      value={quizSettings.difficulty}
                      onChange={(e) => setQuizSettings(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Auto-Generate Quiz
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quiz Preview Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Quiz Preview</h3>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-medium">BNGL · G</span>
            </div>

            {selectedFile?.concepts && selectedFile.concepts.length > 0 ? (
              <div className="space-y-3">
                {selectedFile.concepts.slice(0, 5).map((concept, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">{concept}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  Upload notes to see quiz preview
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Quiz History */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 mb-4">Click on a quiz to take it again</p>
          {quizzes.length > 0 ? (
            <div className="space-y-3">
              {quizzes.map((quiz, index) => (
                <div 
                  key={quiz.id || index} 
                  onClick={() => handleSelectQuizFromHistory(quiz)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{quiz.title}</p>
                      <p className="text-xs text-gray-500">{quiz.questions.length} questions · {quiz.difficulty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                      {quiz.subject}
                    </span>
                    <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      Take Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No quizzes generated yet</p>
              <button
                onClick={() => setActiveView('generate')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Generate Your First Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
