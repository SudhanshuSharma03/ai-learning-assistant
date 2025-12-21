import React from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  ClipboardList,
  BookOpenCheck,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
  Battery
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  onNavigate: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { user, signOut, activeTab, sidebarOpen, setSidebarOpen } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
    { id: 'ask-doubt', label: 'Ask Doubt', icon: HelpCircle, color: 'text-emerald-500' },
    { id: 'quizzes', label: 'Quizzes', icon: ClipboardList, color: 'text-orange-500' },
    { id: 'revision', label: 'Revision Mode', icon: BookOpenCheck, color: 'text-purple-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-pink-500' }
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1e3a5f] text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-white text-lg">Sentience AI</h1>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 mx-3 mt-4 bg-white/10 rounded-xl">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-sm"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center ${user.photoURL ? 'hidden' : ''}`}>
                  <span className="text-white font-semibold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-sm">Hello, {user.displayName.split(' ')[0]}!</p>
                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <Battery className="w-3 h-3" />
                    <span>30%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 mt-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-white text-[#1e3a5f]'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#1e3a5f]' : 'text-white/70'}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {activeTab === item.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/10 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed bottom-6 left-6 z-30 lg:hidden w-14 h-14 bg-[#1e3a5f] text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
};

export default Sidebar;
