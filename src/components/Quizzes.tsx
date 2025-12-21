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
  ChevronRight,
  Clock,
  Target,
  Zap,
  Plus,
  Play,
  RotateCcw
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

const Quizzes: React.FC = () => {
  const { user, quizzes, setQuizzes, setActiveTab } = useApp();
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
  const [activeView, setActiveView] = useState<'upload' | 'preview' | 'taking'>('upload');

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
      setActiveView('preview');
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
    setActiveView('upload');
  };

  // Sample quiz preview questions
  const previewQuestions = generatedQuiz?.questions.slice(0, 5) || [
    { question: "Ananye Gorta quaternions...", topic: "Point of size" },
    { question: "Neptplace ontload...", topic: "Concepts" },
    { question: "Newton's correct...", topic: "Laws" }
  ];

  return (
    <div className="h-full flex gap-6">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Generate Quizzes from Notes</h1>
                <p className="text-gray-500 text-sm">Upload your notes and create quizzes instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                HINDI • EN
              </span>
            </div>
          </div>
        </div>

        {/* Quiz Taking View */}
        {activeView === 'taking' && generatedQuiz && (
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 overflow-auto">
            {showResults ? (
              <div className="text-center py-8">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  calculateScore() / generatedQuiz.questions.length >= 0.7 ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <span className={`text-3xl font-bold ${
                    calculateScore() / generatedQuiz.questions.length >= 0.7 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {Math.round((calculateScore() / generatedQuiz.questions.length) * 100)}%
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Quiz Complete!</h3>
                <p className="text-gray-600 mb-6">
                  You scored {calculateScore()} out of {generatedQuiz.questions.length} questions
                </p>

                <div className="space-y-3 max-h-72 overflow-y-auto mb-6">
                  {generatedQuiz.questions.map((q, i) => {
                    const isCorrect = selectedAnswers[i] === q.correctAnswer;
                    return (
                      <div key={q.id} className={`p-4 rounded-xl border text-left ${
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{q.question}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Correct: {q.options[q.correctAnswer]}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Create New Quiz
                </button>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Question {currentQuestionIndex + 1} of {generatedQuiz.questions.length}</span>
                    <span className="text-orange-600 font-medium">{generatedQuiz.questions[currentQuestionIndex].topic}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / generatedQuiz.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  {generatedQuiz.questions[currentQuestionIndex].question}
                </h3>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {generatedQuiz.questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium ${
                          selectedAnswers[currentQuestionIndex] === index
                            ? 'border-orange-500 bg-orange-500 text-white'
                            : 'border-gray-300 text-gray-500'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-gray-800 text-sm">{option}</span>
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
                  {currentQuestionIndex === generatedQuiz.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Next
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Upload View */}
        {activeView === 'upload' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Notes */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Upload Notes</h3>
              <p className="text-sm text-gray-500 mb-4">We upload, upload also branded your fence size.</p>
              
              {/* Upload Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4 ${
                  isDragActive
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-orange-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1 text-sm">
                  {isDragActive ? 'Drop your files here' : '⬆ Drag from PDF/Notes'}
                </p>
                <p className="text-xs text-gray-500">
                  from your device ▼
                </p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 mb-4">
                  {uploadedFiles.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => item.status === 'ready' && setSelectedFile(item)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedFile === item
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                          {item.file.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'processing' && <Loader2 className="w-4 h-4 text-orange-600 animate-spin" />}
                        {item.status === 'ready' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveFile(item.file); }}
                          className="p-1 hover:bg-gray-200 rounded-full"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quiz Settings */}
              {selectedFile && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Questions</label>
                      <select
                        value={quizSettings.numQuestions}
                        onChange={(e) => setQuizSettings(prev => ({ ...prev, numQuestions: Number(e.target.value) }))}
                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Difficulty</label>
                      <select
                        value={quizSettings.difficulty}
                        onChange={(e) => setQuizSettings(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                        className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerateQuiz}
                disabled={!selectedFile || isGenerating}
                className="w-full mt-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Auto-Generate Quiz
                  </>
                )}
              </button>
            </div>

            {/* Quiz Preview */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quiz Preview</h3>
              
              {generatedQuiz ? (
                <div className="space-y-3">
                  {generatedQuiz.questions.slice(0, 4).map((q, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-orange-600">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{q.question}</p>
                          <p className="text-xs text-gray-500 mt-1">{q.topic}</p>
                        </div>
                        <span className="text-xs text-green-600">✓</span>
                      </div>
                    </div>
                  ))}
                  {generatedQuiz.questions.length > 4 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{generatedQuiz.questions.length - 4} more questions
                    </p>
                  )}

                  <button
                    onClick={() => { setActiveView('taking'); setQuizStarted(true); }}
                    className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start Quiz
                  </button>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Upload notes and generate a quiz to see preview
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview View - Ready to Start */}
        {activeView === 'preview' && generatedQuiz && !quizStarted && (
          <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Ready!</h2>
              <p className="text-gray-600 mb-6">
                {generatedQuiz.questions.length} questions generated from your notes
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{generatedQuiz.questions.length}</p>
                    <p className="text-xs text-gray-500">Questions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600 capitalize">{generatedQuiz.difficulty}</p>
                    <p className="text-xs text-gray-500">Difficulty</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-600">{generatedQuiz.subject || 'General'}</p>
                    <p className="text-xs text-gray-500">Subject</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetQuiz}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setActiveView('taking'); setQuizStarted(true); }}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="w-72 space-y-4 hidden xl:block">
        {/* Recent Quizzes */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Quizzes</h3>
          <div className="space-y-3">
            {quizzes.slice(0, 3).map((quiz, index) => (
              <div
                key={quiz.id || index}
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-xl cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{quiz.title}</p>
                  <p className="text-xs text-gray-500">{quiz.questions?.length || 0} questions</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            {quizzes.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No quizzes yet</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-sm p-5 text-white">
          <h3 className="font-semibold mb-4">Your Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-100">Quizzes Taken</span>
              <span className="font-bold">{quizzes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-100">Total Questions</span>
              <span className="font-bold">{quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('revision')}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-3"
            >
              <Target className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Start Revision</span>
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className="w-full text-left px-4 py-3 bg-pink-50 hover:bg-pink-100 rounded-xl transition-colors flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-pink-600" />
              <span className="text-sm font-medium text-pink-700">View Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
