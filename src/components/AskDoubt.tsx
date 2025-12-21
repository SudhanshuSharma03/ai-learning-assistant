import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  Lightbulb,
  HelpCircle,
  MessageCircle,
  ChevronRight,
  Clock,
  ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../context/AppContext';
import { chatWithStudyBuddy } from '../services/geminiService';
import { ChatMessage } from '../types';

const AskDoubt: React.FC = () => {
  const { user, studyMaterials, setActiveTab } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const quickQuestions = [
    { icon: <Lightbulb className="w-4 h-4" />, text: "Explain Newton's laws simply" },
    { icon: <BookOpen className="w-4 h-4" />, text: "What is kinetic energy?" },
    { icon: <HelpCircle className="w-4 h-4" />, text: "How do I solve momentum problems?" }
  ];

  const recentTopics = [
    { name: "Newton's Second Law", time: "2 hours ago" },
    { name: "Work and Energy", time: "Yesterday" },
    { name: "Forces and Motion", time: "2 days ago" }
  ];

  return (
    <div className="h-full flex gap-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Ask Doubt</h2>
              <p className="text-emerald-100">Get instant answers to your questions</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Gemini AI
              </span>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Hi{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! 👋
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                I'm here to help you understand any concept. Ask me anything about your subjects!
              </p>
              
              {/* Quick Questions */}
              <div className="w-full max-w-md space-y-2">
                <p className="text-sm text-gray-500 mb-2">Try asking:</p>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question.text)}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-xl transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      {question.icon}
                    </div>
                    <span className="text-sm">{question.text}</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                  </button>
                ))}
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-4 ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="markdown-content">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-5 py-4">
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

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your doubt or question here..."
              className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors"
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

      {/* Right Sidebar */}
      <div className="w-72 space-y-4 hidden xl:block">
        {/* AI Features */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-sm p-5 text-white">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI-Powered Features
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
              <Lightbulb className="w-5 h-5" />
              <div>
                <p className="font-medium text-sm">Step-by-step solutions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
              <BookOpen className="w-5 h-5" />
              <div>
                <p className="font-medium text-sm">Concept explanations</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
              <HelpCircle className="w-5 h-5" />
              <div>
                <p className="font-medium text-sm">Practice problems</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Topics */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Topics</h3>
          <div className="space-y-3">
            {recentTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(`Explain ${topic.name}`)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors text-left"
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{topic.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {topic.time}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Related Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('quizzes')}
              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Generate Quiz</span>
            </button>
            <button 
              onClick={() => setActiveTab('revision')}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Start Revision</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskDoubt;
