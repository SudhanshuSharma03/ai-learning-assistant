import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Trash2
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
  const { user, setQuizzes } = useApp();
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

      // Save to Firebase
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
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
              percentage >= 70 ? 'bg-green-100' : percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className={`text-3xl font-bold ${
                percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {percentage}%
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">
              You scored {score} out of {generatedQuiz.questions.length} questions correctly.
            </p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {generatedQuiz.questions.map((q, i) => {
              const isCorrect = selectedAnswers[i] === q.correctAnswer;
              return (
                <div key={q.id} className={`p-4 rounded-xl border ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-2">{q.question}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Correct Answer:</span> {q.options[q.correctAnswer]}
                      </p>
                      {!isCorrect && selectedAnswers[i] !== null && (
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Your Answer:</span> {q.options[selectedAnswers[i]!]}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-2 italic">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={resetQuiz}
            className="mt-6 w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            Generate New Quiz
          </button>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {generatedQuiz.questions.length}</span>
            <span className="text-primary-600 font-medium">{currentQuestion.topic}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / generatedQuiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all quiz-option ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
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
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz Generation View
  if (generatedQuiz) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Ready!</h2>
        <p className="text-gray-600 mb-6">
          Your quiz has been generated with {generatedQuiz.questions.length} questions.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600">{generatedQuiz.questions.length}</p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600 capitalize">{generatedQuiz.difficulty}</p>
              <p className="text-sm text-gray-500">Difficulty</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600">{generatedQuiz.subject}</p>
              <p className="text-sm text-gray-500">Subject</p>
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
            onClick={() => setQuizStarted(true)}
            className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-700 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Quiz Generator</h2>
            <p className="text-accent-100 text-sm">Upload notes and generate quizzes instantly</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-1">
            {isDragActive ? 'Drop your files here' : 'Drag & drop lecture notes here'}
          </p>
          <p className="text-sm text-gray-500">
            Supports TXT, PDF, MD, DOC, DOCX files
          </p>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-medium text-gray-800">Uploaded Files</h3>
            {uploadedFiles.map((item, index) => (
              <div
                key={index}
                onClick={() => item.status === 'ready' && setSelectedFile(item)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedFile === item
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800">{item.file.name}</p>
                    {item.concepts && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.concepts.slice(0, 3).map((concept, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {concept}
                          </span>
                        ))}
                        {item.concepts.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{item.concepts.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'processing' && (
                    <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                  )}
                  {item.status === 'ready' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(item.file);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
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
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-gray-800">Quiz Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Number of Questions</label>
                <select
                  value={quizSettings.numQuestions}
                  onChange={(e) => setQuizSettings(prev => ({ ...prev, numQuestions: Number(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={5}>5 questions</option>
                  <option value={10}>10 questions</option>
                  <option value={15}>15 questions</option>
                  <option value={20}>20 questions</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Difficulty</label>
                <select
                  value={quizSettings.difficulty}
                  onChange={(e) => setQuizSettings(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Subject (optional)</label>
              <input
                type="text"
                value={quizSettings.subject}
                onChange={(e) => setQuizSettings(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Biology, History, Computer Science"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="w-full py-3 bg-accent-600 hover:bg-accent-700 disabled:bg-gray-300 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Quiz
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizGenerator;
