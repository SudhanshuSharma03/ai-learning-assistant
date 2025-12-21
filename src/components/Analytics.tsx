import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Clock,
  Target,
  Award,
  ChevronRight,
  Flame,
  BookOpen,
  Brain,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useApp } from '../context/AppContext';
import { getQuizAttempts } from '../services/firebaseService';
import { QuizAttempt } from '../types';

const Analytics: React.FC = () => {
  const { user, learningProgress } = useApp();
  const [, setQuizHistory] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (user) {
      loadQuizHistory();
    }
  }, [user]);

  const loadQuizHistory = async () => {
    if (!user) return;
    try {
      const attempts = await getQuizAttempts(user.id);
      setQuizHistory(attempts);
    } catch (error) {
      console.error('Error loading quiz history:', error);
    }
  };

  // Stats
  const stats = {
    studyTime: '5h 20m',
    quizzesTaken: learningProgress?.totalQuizzesTaken || 12,
    avgScore: learningProgress?.averageScore || 65,
    streak: learningProgress?.streakDays || 5,
    flashcards: 61,
    adaptQuizzes: 23
  };

  // Chart data
  const studyTimeData = [
    { name: 'Mon', hours: 2 },
    { name: 'Tue', hours: 3.5 },
    { name: 'Wed', hours: 1.5 },
    { name: 'Thu', hours: 4 },
    { name: 'Fri', hours: 2.5 },
    { name: 'Sat', hours: 5 },
    { name: 'Sun', hours: 3 }
  ];

  const performanceData = [
    { name: 'Forces Laws', value: 30, color: '#3b82f6' },
    { name: 'Force & Motion', value: 25, color: '#22c55e' },
    { name: 'Work & Energy', value: 25, color: '#f59e0b' },
    { name: 'STANCEEAR PANCILLESS', value: 20, color: '#8b5cf6' }
  ];

  const keyTopics = [
    { name: "Newton's Laws", progress: 75, trend: 'up' },
    { name: 'Force & Motion', progress: 50, trend: 'up' },
    { name: 'Work & Energy', progress: 45, trend: 'down' }
  ];

  const suggestedNextSteps = [
    { topic: "Newton's Laws", action: 'Continue learning', icon: BookOpen },
    { topic: 'Suizzess Force & Motion', action: 'Review fundamentals', icon: Brain },
    { topic: 'Weak Fortale: Energy Lecuse', action: 'Practice more', icon: Target }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Your Learning Analytics</h2>
                <p className="text-xs text-gray-500">Track your progress and performance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                All time ▼
              </button>
              <div className="px-3 py-1.5 bg-green-50 rounded-lg flex items-center gap-1.5">
                <Target className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">Study Goal: 90%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.studyTime}</p>
              <p className="text-xs text-gray-500">Study Time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.quizzesTaken}</p>
              <p className="text-xs text-gray-500">quizzes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.flashcards}</p>
              <p className="text-xs text-gray-500">flashcards</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">-23</p>
              <p className="text-xs text-gray-500">adaptquizzes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Study Time Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Quizzes Taken</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-xs text-gray-500">This week</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={studyTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Topics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Key Topics</h3>
            <div className="space-y-4">
              {keyTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full ${
                      topic.progress >= 70 ? 'bg-green-500' : topic.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-700 min-w-[120px]">{topic.name}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          topic.progress >= 70 ? 'bg-green-500' : topic.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${topic.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-sm font-medium text-gray-800">{topic.progress}%</span>
                    {topic.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Performance Overview</h3>
            <div className="relative">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-2xl font-bold text-gray-800">{stats.avgScore}%</p>
                <p className="text-xs text-gray-500">Average</p>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {performanceData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600 text-xs">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Next Steps */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Suggested Next Steps</h3>
            <div className="space-y-3">
              {suggestedNextSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{step.topic}</p>
                    <p className="text-xs text-gray-500">{step.action}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Badge */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-8 h-8" />
              <div>
                <h3 className="font-semibold">Achievement Unlocked!</h3>
                <p className="text-sm text-white/80">Week Warrior</p>
              </div>
            </div>
            <p className="text-sm text-white/80">
              You've studied for 7 days in a row! Keep up the great work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
