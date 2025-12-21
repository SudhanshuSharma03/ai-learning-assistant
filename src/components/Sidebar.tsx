import React from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  ClipboardList,
  BookOpen,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Bot
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  onNavigate: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { user, signOut, activeTab, sidebarOpen, setSidebarOpen } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'chat', label: 'Ask Doubt', icon: HelpCircle, color: 'text-purple-500' },
    { id: 'quiz', label: 'Quizzes', icon: ClipboardList, color: 'text-green-500' },
    { id: 'revision', label: 'Revision Mode', icon: BookOpen, color: 'text-orange-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-cyan-500' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-800 text-sm">Sentience AI</h1>
                  <p className="text-xs text-gray-500">Learning Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : item.color}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {activeTab === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />
                )}
              </button>
            ))}
          </nav>

          {/* User Section */}
          {user && (
            <div className="p-3 border-t border-gray-100">
              <div className="p-3 bg-gray-50 rounded-xl mb-3">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center ${user.photoURL ? 'hidden' : ''}`}>
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate text-sm">{user.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 left-6 z-30 lg:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
};

export default Sidebar;
