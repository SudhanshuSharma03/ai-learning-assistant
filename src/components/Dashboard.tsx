import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  Lightbulb,
  Clock,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../context/AppContext';
import { chatWithStudyBuddy } from '../services/geminiService';
import { ChatMessage } from '../types';

const Dashboard: React.FC = () => {
  const { user, studyMaterials, learningProgress, quizzes, setActiveTab } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = studyMaterials.length > 0
        ? studyMaterials.slice(0, 3).map(m => m.content).join('\n\n')
        : undefined;

      const response = await chatWithStudyBuddy(
        userMessage.content,
        context,
        chatHistory
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      setChatHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: userMessage.content }] },
        { role: 'model', parts: [{ text: response }] }
      ]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedTopics = [
    { name: "Newton's Laws", color: "bg-blue-100 text-blue-700" },
    { name: "Motion & Forces", color: "bg-purple-100 text-purple-700" },
    { name: "Energy", color: "bg-green-100 text-green-700" }
  ];

  const stats = {
    streak: learningProgress?.streakDays || 5,
    quizzesCompleted: quizzes?.length || 55,
    studyTime: learningProgress?.studyTimeTotal || 120
  };

  return (
    <div className="h-full flex gap-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-800">
            Hello, {user?.displayName?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">What do you want to learn today?</p>
        </div>

        {/* Chat Input */}
        <div className="px-6 py-4">
          <div className="relative">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
              <Sparkles className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="What is Newton's second law of motion?"
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="w-10 h-10 bg-[#1e3a5f] hover:bg-[#2a4a73] disabled:bg-gray-300 text-white rounded-lg flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-4">
                Ask me anything about your subjects!
              </p>
              <div className="text-left w-full max-w-lg bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm">
                      <strong>Newton's second law of motion</strong> states that the force acting on an object is equal to the mass of the object times its acceleration.
                    </p>
                    <p className="text-gray-600 text-sm mt-2 font-medium">F = m × a</p>
                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p>Key points to remember:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Newton's second law of motion states the relationship between force and acceleration</li>
                        <li>The formula shows how mass affects acceleration</li>
                        <li>Force can be measured in Newtons (N)</li>
                      </ol>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                        🔴 Prerequisite: Forces & Motion basics
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      💡 Understand common misconceptions about Newton's Laws
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 message-enter ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-[#1e3a5f] text-white'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#1e3a5f] text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="markdown-content text-sm">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Right Sidebar - Stats */}
      <div className="w-72 space-y-4 hidden xl:block">
        {/* Learning Overview Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Your Learning Overview</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.streak} <span className="text-sm font-normal text-gray-500">days</span></p>
                <p className="text-xs text-gray-500">Current streak</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.quizzesCompleted} <span className="text-sm font-normal text-gray-500">quizzes</span></p>
                <p className="text-xs text-gray-500">completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Topics */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Suggested Topics</h3>
          <div className="space-y-2">
            {suggestedTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(`Explain ${topic.name}`)}
                className={`w-full text-left px-4 py-3 rounded-xl ${topic.color} hover:opacity-80 transition-opacity flex items-center justify-between`}
              >
                <span className="font-medium text-sm">{topic.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a73] rounded-2xl shadow-sm p-5 text-white">
          <h3 className="text-sm font-semibold text-white/80 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('quizzes')}
              className="w-full text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-3"
            >
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Generate Quiz</span>
            </button>
            <button 
              onClick={() => setActiveTab('revision')}
              className="w-full text-left px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-3"
            >
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium">Start Revision</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
