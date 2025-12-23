import React, { useEffect, useState, useMemo } from 'react';
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
  ArrowDownRight,
  Loader2,
  AlertCircle
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
import { getQuizAttempts, getQuizzes } from '../services/firebaseService';
import { QuizAttempt, Quiz } from '../types';
import { generateStudyRecommendations } from '../services/geminiService';

interface TopicPerformance {
  name: string;
  correct: number;
  total: number;
  percentage: number;
}

const Analytics: React.FC = () => {
  const { user, learningProgress, quizzes: contextQuizzes } = useApp();
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<{ topic: string; action: string; icon: typeof BookOpen }[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [attempts, quizzes] = await Promise.all([
        getQuizAttempts(user.id),
        getQuizzes(user.id)
      ]);
      setQuizHistory(attempts);
      setAllQuizzes(quizzes.length > 0 ? quizzes : contextQuizzes);

      // Generate AI recommendations if we have progress data
      if (learningProgress && learningProgress.topics.length > 0) {
        const recs = await generateStudyRecommendations(
          learningProgress.topics,
          learningProgress.weakTopics,
          learningProgress.topics.slice(0, 5).map(t => t.topic)
        );
        setRecommendations(recs.slice(0, 3).map(r => ({
          topic: r.topic,
          action: r.reason,
          icon: r.priority === 'high' ? Target : r.priority === 'medium' ? Brain : BookOpen
        })));
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate real stats from data
  const stats = useMemo(() => {
    const studyTimeMinutes = learningProgress?.studyTimeTotal || 0;
    const hours = Math.floor(studyTimeMinutes / 60);
    const minutes = studyTimeMinutes % 60;
    
    return {
      studyTime: studyTimeMinutes > 0 ? `${hours}h ${minutes}m` : '0h 0m',
      quizzesTaken: learningProgress?.totalQuizzesTaken || quizHistory.length,
      avgScore: learningProgress?.averageScore || 0,
      streak: learningProgress?.streakDays || 0,
      totalQuestions: quizHistory.reduce((sum, a) => sum + a.totalQuestions, 0),
      correctAnswers: quizHistory.reduce((sum, a) => sum + a.score, 0)
    };
  }, [learningProgress, quizHistory]);

  // Calculate quizzes per day for the last 7 days
  const quizActivityData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days: { name: string; quizzes: number; date: Date }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      last7Days.push({
        name: days[date.getDay()],
        quizzes: 0,
        date: date
      });
    }

    quizHistory.forEach(attempt => {
      const attemptDate = new Date(attempt.completedAt);
      last7Days.forEach(day => {
        if (
          attemptDate.getFullYear() === day.date.getFullYear() &&
          attemptDate.getMonth() === day.date.getMonth() &&
          attemptDate.getDate() === day.date.getDate()
        ) {
          day.quizzes++;
        }
      });
    });

    return last7Days.map(d => ({ name: d.name, quizzes: d.quizzes }));
  }, [quizHistory]);

  // Calculate topic performance from quiz data
  const topicPerformance = useMemo((): TopicPerformance[] => {
    const topicStats: Record<string, { correct: number; total: number }> = {};
    
    // Get all questions from quizzes and calculate performance
    const quizzesToAnalyze = allQuizzes.length > 0 ? allQuizzes : contextQuizzes;
    
    quizzesToAnalyze.forEach(quiz => {
      quiz.questions.forEach(q => {
        if (!topicStats[q.topic]) {
          topicStats[q.topic] = { correct: 0, total: 0 };
        }
        topicStats[q.topic].total++;
      });
    });

    // If we have learning progress topics, use their mastery levels
    if (learningProgress?.topics) {
      learningProgress.topics.forEach(t => {
        if (topicStats[t.topic]) {
          topicStats[t.topic].correct = Math.round((t.masteryLevel / 100) * topicStats[t.topic].total);
        }
      });
    }

    return Object.entries(topicStats)
      .map(([name, stats]) => ({
        name: name.length > 20 ? name.substring(0, 20) + '...' : name,
        correct: stats.correct,
        total: stats.total,
        percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [allQuizzes, contextQuizzes, learningProgress]);

  // Performance pie chart data
  const performanceData = useMemo(() => {
    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    if (topicPerformance.length === 0) {
      return [{ name: 'No data yet', value: 100, color: '#e5e7eb' }];
    }

    const total = topicPerformance.reduce((sum, t) => sum + t.total, 0);
    return topicPerformance.map((topic, index) => ({
      name: topic.name,
      value: total > 0 ? Math.round((topic.total / total) * 100) : 0,
      color: colors[index % colors.length]
    }));
  }, [topicPerformance]);

  // Key topics with trends
  const keyTopics = useMemo(() => {
    if (learningProgress?.topics && learningProgress.topics.length > 0) {
      return learningProgress.topics.slice(0, 5).map(t => ({
        name: t.topic.length > 20 ? t.topic.substring(0, 20) + '...' : t.topic,
        progress: t.masteryLevel,
        trend: t.masteryLevel >= 50 ? 'up' : 'down' as 'up' | 'down'
      }));
    }

    // Fallback to topic performance if no learning progress
    return topicPerformance.slice(0, 3).map(t => ({
      name: t.name,
      progress: t.percentage,
      trend: t.percentage >= 50 ? 'up' : 'down' as 'up' | 'down'
    }));
  }, [learningProgress, topicPerformance]);

  // Suggested next steps from AI or fallback
  const suggestedNextSteps = useMemo(() => {
    if (recommendations.length > 0) {
      return recommendations;
    }

    // Fallback based on weak topics
    if (learningProgress?.weakTopics && learningProgress.weakTopics.length > 0) {
      return learningProgress.weakTopics.slice(0, 3).map(topic => ({
        topic,
        action: 'Needs more practice',
        icon: Target
      }));
    }

    // Default suggestions
    return [
      { topic: 'Upload study materials', action: 'Get started with learning', icon: BookOpen },
      { topic: 'Take a quiz', action: 'Test your knowledge', icon: Brain },
      { topic: 'Set daily goals', action: 'Stay consistent', icon: Target }
    ];
  }, [recommendations, learningProgress]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your analytics...</p>
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
              <p className="text-xs text-gray-500">Quizzes Taken</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.avgScore}%</p>
              <p className="text-xs text-gray-500">Avg Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.streak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quiz Activity Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Quiz Activity</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-xs text-gray-500">Last 7 days</span>
              </div>
            </div>
            {quizActivityData.some(d => d.quizzes > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={quizActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`${value} quiz${value !== 1 ? 'zes' : ''}`, 'Quizzes']}
                  />
                  <Bar dataKey="quizzes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No quiz activity this week</p>
                  <p className="text-xs text-gray-400">Take some quizzes to see your activity</p>
                </div>
              </div>
            )}
          </div>

          {/* Key Topics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Topic Mastery</h3>
            {keyTopics.length > 0 ? (
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No topics studied yet</p>
                <p className="text-xs text-gray-400">Take quizzes to track your topic mastery</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Topic Distribution</h3>
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
                <p className="text-xs text-gray-500">Avg Score</p>
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
              {suggestedNextSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{step.topic}</p>
                      <p className="text-xs text-gray-500">{step.action}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements Badge */}
          {stats.streak >= 7 && (
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-8 h-8" />
                <div>
                  <h3 className="font-semibold">Achievement Unlocked!</h3>
                  <p className="text-sm text-white/80">Week Warrior</p>
                </div>
              </div>
              <p className="text-sm text-white/80">
                You've studied for {stats.streak} days in a row! Keep up the great work.
              </p>
            </div>
          )}

          {stats.streak > 0 && stats.streak < 7 && (
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <Flame className="w-8 h-8" />
                <div>
                  <h3 className="font-semibold">{stats.streak} Day Streak!</h3>
                  <p className="text-sm text-white/80">{7 - stats.streak} more days to Week Warrior</p>
                </div>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${(stats.streak / 7) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
