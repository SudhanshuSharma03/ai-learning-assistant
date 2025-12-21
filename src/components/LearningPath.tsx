import React, { useEffect, useState } from 'react';
import {
  Target,
  Trophy,
  TrendingUp,
  BookOpen,
  Clock,
  Flame,
  Star,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Lightbulb,
  Brain,
  Award
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
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import { generateStudyRecommendations } from '../services/geminiService';
import { getLearningProgress, getQuizAttempts } from '../services/firebaseService';
import { StudyRecommendation, QuizAttempt } from '../types';

const LearningPath: React.FC = () => {
  const { user, learningProgress, setLearningProgress } = useApp();
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'progress' | 'recommendations'>('overview');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [progress, attempts] = await Promise.all([
        getLearningProgress(user.id),
        getQuizAttempts(user.id)
      ]);

      if (progress) {
        setLearningProgress(progress);
      }
      setQuizHistory(attempts);

      // Generate AI recommendations
      if (progress && progress.topics.length > 0) {
        const recs = await generateStudyRecommendations(
          progress.topics,
          progress.weakTopics,
          progress.topics.slice(0, 5).map(t => t.topic)
        );
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    streak: learningProgress?.streakDays || 0,
    quizzesTaken: learningProgress?.totalQuizzesTaken || 0,
    avgScore: learningProgress?.averageScore || 0,
    studyTime: learningProgress?.studyTimeTotal || 0
  };

  // Prepare chart data
  const scoreHistory = quizHistory.slice(0, 10).reverse().map((attempt, index) => ({
    name: `Quiz ${index + 1}`,
    score: Math.round((attempt.score / attempt.totalQuestions) * 100)
  }));

  const topicDistribution = learningProgress?.topics.slice(0, 5).map(t => ({
    name: t.topic.length > 15 ? t.topic.substring(0, 15) + '...' : t.topic,
    value: t.masteryLevel
  })) || [];

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const achievements = [
    { id: 1, title: 'First Steps', desc: 'Complete your first quiz', icon: '🎯', unlocked: stats.quizzesTaken >= 1 },
    { id: 2, title: 'Quiz Master', desc: 'Complete 10 quizzes', icon: '📚', unlocked: stats.quizzesTaken >= 10 },
    { id: 3, title: 'Streak Starter', desc: 'Study for 3 days in a row', icon: '🔥', unlocked: stats.streak >= 3 },
    { id: 4, title: 'Week Warrior', desc: 'Study for 7 days in a row', icon: '⚔️', unlocked: stats.streak >= 7 },
    { id: 5, title: 'High Achiever', desc: 'Score 90%+ on any quiz', icon: '⭐', unlocked: quizHistory.some(q => (q.score / q.totalQuestions) >= 0.9) },
    { id: 6, title: 'Dedicated Learner', desc: 'Study for 100+ minutes', icon: '🏆', unlocked: stats.studyTime >= 100 }
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Your Learning Path</h2>
              <p className="text-purple-100">Personalized progress tracking and recommendations</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'progress', label: 'Progress', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
                activeSection === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-4 card-hover">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.streak}</p>
                  <p className="text-sm text-gray-500">Day Streak</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 card-hover">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.quizzesTaken}</p>
                  <p className="text-sm text-gray-500">Quizzes Taken</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 card-hover">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.avgScore}%</p>
                  <p className="text-sm text-gray-500">Avg Score</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-4 card-hover">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.studyTime}m</p>
                  <p className="text-sm text-gray-500">Study Time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score History */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quiz Score History</h3>
              {scoreHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">
                  <p>Complete quizzes to see your progress</p>
                </div>
              )}
            </div>

            {/* Topic Mastery */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Topic Mastery</h3>
              {topicDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={topicDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topicDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500">
                  <p>Study more topics to see mastery levels</p>
                </div>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Achievements
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl text-center transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200'
                      : 'bg-gray-50 border-2 border-gray-200 opacity-50'
                  }`}
                >
                  <span className="text-3xl">{achievement.icon}</span>
                  <p className="font-medium text-gray-800 mt-2 text-sm">{achievement.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{achievement.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Progress Section */}
      {activeSection === 'progress' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Topic Progress
          </h3>
          
          {learningProgress?.topics && learningProgress.topics.length > 0 ? (
            <div className="space-y-4">
              {learningProgress.topics.map((topic, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{topic.topic}</h4>
                      <p className="text-sm text-gray-500">{topic.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">{topic.masteryLevel}%</p>
                      <p className="text-xs text-gray-500">{topic.quizzesTaken} quizzes</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 progress-animate"
                      style={{ width: `${topic.masteryLevel}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No topic progress yet</p>
              <p className="text-sm text-gray-400 mt-1">Complete quizzes to track your progress</p>
            </div>
          )}

          {/* Weak & Strong Topics */}
          {learningProgress && (learningProgress.weakTopics.length > 0 || learningProgress.strongTopics.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {learningProgress.weakTopics.length > 0 && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Needs Improvement
                  </h4>
                  <ul className="space-y-2">
                    {learningProgress.weakTopics.map((topic, i) => (
                      <li key={i} className="text-sm text-red-700 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {learningProgress.strongTopics.length > 0 && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {learningProgress.strongTopics.map((topic, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recommendations Section */}
      {activeSection === 'recommendations' && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            AI-Powered Study Recommendations
          </h3>
          
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-xl border-l-4 ${
                    rec.priority === 'high'
                      ? 'bg-red-50 border-red-500'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-green-50 border-green-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">{rec.topic}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          rec.priority === 'high'
                            ? 'bg-red-200 text-red-700'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-200 text-yellow-700'
                            : 'bg-green-200 text-green-700'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{rec.subject}</p>
                      <p className="text-gray-700">{rec.reason}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{rec.estimatedTime} min</span>
                      </div>
                    </div>
                  </div>
                  
                  {rec.suggestedResources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Suggested Resources:</p>
                      <div className="flex flex-wrap gap-2">
                        {rec.suggestedResources.map((resource, i) => (
                          <span
                            key={i}
                            className="text-xs bg-white px-2 py-1 rounded-full border border-gray-200"
                          >
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recommendations yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Complete more quizzes to get personalized study recommendations
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LearningPath;
