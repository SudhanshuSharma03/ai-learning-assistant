import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle,
  TrendingUp,
  Target,
  Award,
  ChevronRight,
  Flame,
  BookOpen,
  Trophy,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import {
  LineChart,
  Line,
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

const Analytics: React.FC = () => {
  const { user, learningProgress, quizzes, setActiveTab } = useApp();

  // Stats data
  const stats = {
    studyTime: learningProgress?.studyTimeTotal || 320,
    quizzesTaken: learningProgress?.totalQuizzesTaken || 12,
    flashcards: 61,
    attempts: 23,
    avgScore: learningProgress?.averageScore || 65,
    streakDays: learningProgress?.streakDays || 7
  };

  // Chart data
  const weeklyData = [
    { name: 'Mon', time: 45, quizzes: 2 },
    { name: 'Tue', time: 60, quizzes: 3 },
    { name: 'Wed', time: 30, quizzes: 1 },
    { name: 'Thu', time: 75, quizzes: 2 },
    { name: 'Fri', time: 50, quizzes: 2 },
    { name: 'Sat', time: 40, quizzes: 1 },
    { name: 'Sun', time: 20, quizzes: 1 }
  ];

  const topicMastery = [
    { name: "Newton's Laws", value: 15, color: '#3b82f6' },
    { name: "Force & Motion", value: 50, color: '#22c55e' },
    { name: "Work & Energy", value: 45, color: '#f59e0b' },
    { name: "Thermodynamics", value: 30, color: '#8b5cf6' }
  ];

  const performanceData = [
    { name: "Newton's Laws", progress: 15 },
    { name: "Force & Motion", progress: 50 },
    { name: "Work & Energy", progress: 45 }
  ];

  const suggestedNextSteps = [
    { topic: "Newton's Laws", type: "Continue Learning", color: "bg-blue-100 text-blue-700" },
    { topic: "Success: Force & Motion", type: "Practice More", color: "bg-green-100 text-green-700" },
    { topic: "Weak Points: Energy Lecture", type: "Review", color: "bg-orange-100 text-orange-700" }
  ];

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="h-full flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Your Learning Analytics</h1>
                <p className="text-gray-500 text-sm">Track your progress and performance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium flex items-center gap-1">
                <Target className="w-3 h-3" />
                Study Goal: 94%
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Study Time</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800">5h</span>
                  <span className="text-lg font-semibold text-gray-800">20m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Quizzes Taken</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800">{stats.quizzesTaken}</span>
                  <span className="text-xs text-gray-500">quizzes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Flashcards</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800">{stats.flashcards}</span>
                  <span className="text-xs text-gray-500">reviewed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Attempts</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800">-{stats.attempts}</span>
                  <span className="text-xs text-gray-500">attempts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Overview - Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Performance Overview</h3>
              <span className="text-xs text-gray-500">SOMEWHAT PAINLESS</span>
            </div>
            <div className="flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={topicMastery}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {topicMastery.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center -mt-28">
                  <span className="text-3xl font-bold text-gray-800">{stats.avgScore}%</span>
                </div>
              </div>
              <div className="w-1/2 space-y-2">
                {topicMastery.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: topic.color }}></div>
                    <span className="text-xs text-gray-600 truncate">{topic.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Topics Progress */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Key Topics</h3>
            <div className="space-y-4">
              {performanceData.map((topic, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{topic.name}</span>
                    <span className="text-sm font-medium text-gray-800">{topic.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${topic.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Activity */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">Weekly Activity</h4>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={weeklyData}>
                  <Bar dataKey="time" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 space-y-4 hidden xl:block">
        {/* Suggested Next Steps */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Suggested Next Steps</h3>
          <div className="space-y-3">
            {suggestedNextSteps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveTab('revision')}
                className={`w-full text-left p-3 rounded-xl ${step.color} hover:opacity-80 transition-opacity`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-70">{step.type}</p>
                    <p className="text-sm font-medium">{step.topic}</p>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2a4a73] rounded-2xl shadow-sm p-5 text-white">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Achievements
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-medium text-sm">{stats.streakDays} Day Streak</p>
                <p className="text-xs text-white/60">Keep it going!</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
              <span className="text-2xl">📚</span>
              <div>
                <p className="font-medium text-sm">Quiz Master</p>
                <p className="text-xs text-white/60">{stats.quizzesTaken}/10 quizzes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-medium text-sm">High Achiever</p>
                <p className="text-xs text-white/60">Score 90%+ on any quiz</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Continue Learning</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('quizzes')}
              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Take a Quiz</span>
              <ArrowUpRight className="w-4 h-4 ml-auto text-blue-600" />
            </button>
            <button 
              onClick={() => setActiveTab('revision')}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors flex items-center gap-3"
            >
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Review Flashcards</span>
              <ArrowUpRight className="w-4 h-4 ml-auto text-purple-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
