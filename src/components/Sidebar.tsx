import React from 'react';
import { useApp, NavItem } from '../context/AppContext';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Bot,
  Puzzle,
  Feather,
  Bell,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const { currentTab, setCurrentTab, currentUser, notifications } = useApp();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const mainNavItems: { id: NavItem; label: string; icon: React.ElementType; teacherOnly?: boolean }[] = [
    { id: 'dashboard', label: 'BẢNG ĐIỀU KHIỂN', icon: LayoutDashboard },
    { id: 'classes', label: 'Quản lý lớp học', icon: GraduationCap, teacherOnly: true },
    { id: 'students', label: 'Học sinh', icon: Users, teacherOnly: true },
    { id: 'lessons', label: 'Bài giảng', icon: BookOpen },
    { id: 'assignments', label: 'Bài tập & kiểm tra', icon: ClipboardCheck },
    { id: 'grades', label: 'Kết quả học tập', icon: BarChart3 },
    { id: 'ai', label: 'Trợ lý AI học Văn', icon: Bot },
    { id: 'games', label: 'Trò chơi học tập', icon: Puzzle },
    { id: 'creative', label: 'Góc sáng tạo văn học', icon: Feather },
  ];

  const bottomNavItems: { id: NavItem; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'notifications', label: 'Thông báo', icon: Bell, badge: unreadCount },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
    { id: 'help', label: 'Hỗ trợ', icon: HelpCircle },
  ];

  const handleSelect = (id: NavItem) => {
    setCurrentTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-[#0B213D] via-[#0E2849] to-[#0A1D36] text-slate-200 flex flex-col justify-between shadow-xl border-r border-[#15345D] transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              if (item.teacherOnly && currentUser.role === 'student') {
                return null; // Student does not access teacher administrative sections
              }
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1769E0] text-white font-bold shadow-md shadow-blue-900/40 translate-x-1'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.id === 'ai' && (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 ml-auto animate-pulse flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-3 border-t border-[#1C3E69]/60"></div>

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#1769E0] text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-cyan-400/90" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Quote & Artistic Sketch */}
        <div className="p-4 border-t border-[#173760] bg-[#08182B]/60 text-center relative overflow-hidden">
          {/* Subtle Quill Sketch Background */}
          <div className="absolute right-2 bottom-2 opacity-15 pointer-events-none">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
              <line x1="16" y1="8" x2="2" y2="22" />
              <line x1="17.5" y1="15" x2="9" y2="15" />
            </svg>
          </div>

          <p className="text-xs italic text-cyan-200/90 leading-relaxed font-serif relative z-10">
            “Văn chương là ánh sáng<br />dẫn lối tâm hồn...”
          </p>
          <div className="mt-2 text-[10px] text-slate-400">
            Năm học 2026–2027
          </div>
        </div>
      </aside>
    </>
  );
};
