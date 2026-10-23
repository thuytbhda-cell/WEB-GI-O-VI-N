import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Bell,
  Settings,
  Sparkles,
  BookOpen,
  UserCheck,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenNotifications }) => {
  const { currentUser, switchRole, notifications, resetToDefaultData } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="relative z-30 bg-gradient-to-r from-[#0C223F] via-[#102E56] to-[#15467E] text-white shadow-lg border-b border-[#1E4D8C]">
      {/* Top Banner / Indicator */}
      <div className="bg-[#091A30] text-xs py-1 px-4 flex items-center justify-between border-b border-[#16365F]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Info className="w-3 h-3" />
            CHẾ ĐỘ DEMO & DỮ LIỆU MINH HỌA
          </span>
          <span className="hidden sm:inline text-slate-300 text-[12px]">
            Hệ thống quản lý & giảng dạy môn Ngữ văn - Năm học 2026–2027
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefaultData}
            title="Khôi phục lại dữ liệu mẫu gốc ban đầu"
            className="flex items-center gap-1 text-[11px] text-cyan-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Khôi phục dữ liệu mẫu</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3.5">
          {/* Stylized Book with Quill Icon */}
          <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#1769E0] to-[#102E56] p-2 flex items-center justify-center border border-cyan-400/40 shadow-inner">
            <svg
              className="w-8 h-8 text-cyan-200 filter drop-shadow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M14 6l4 4-7 7H7v-4l7-7z" stroke="gold" strokeWidth="2" fill="#FBBF24" fillOpacity="0.3" />
            </svg>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-white drop-shadow-md flex items-center gap-2">
              <span>VĂN HỌC CÙNG CÔ THỦY</span>
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-200/90 font-medium tracking-wider">
              <span className="h-[1px] w-6 bg-cyan-400/50 hidden sm:inline-block"></span>
              <span>TRƯỜNG THPT HOÀI ĐỨC A</span>
              <span className="h-[1px] w-6 bg-cyan-400/50 hidden sm:inline-block"></span>
            </div>
          </div>
        </div>

        {/* Right Section: Teacher badge, Avatar, Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Role Badge with interactive dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 bg-[#0c264a] hover:bg-[#133769] border border-cyan-400/30 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all shadow-sm"
              title="Nhấn để đổi vai trò thử nghiệm"
            >
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-200">
                {currentUser.role === 'teacher' ? 'Giáo viên:' : 'Học sinh:'}
              </span>
              <span className="font-bold text-white">{currentUser.name}</span>
              <span className="text-[10px] bg-cyan-500/30 text-cyan-200 px-1.5 py-0.5 rounded">
                Đổi vai trò
              </span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Chuyển đổi vai trò người dùng
                </div>
                <button
                  onClick={() => {
                    switchRole('teacher');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-sm hover:bg-[#EFF7FF] transition-colors ${
                    currentUser.role === 'teacher' ? 'bg-blue-50 font-semibold text-[#1769E0]' : ''
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[#1769E0] flex items-center justify-center font-bold">
                    T
                  </div>
                  <div className="flex-1">
                    <div className="text-sm leading-tight">Cô Thủy Nguyễn</div>
                    <div className="text-xs text-slate-500">Giáo viên Ngữ văn THPT</div>
                  </div>
                  {currentUser.role === 'teacher' && <CheckCircle2 className="w-4 h-4 text-[#1769E0]" />}
                </button>

                <button
                  onClick={() => {
                    switchRole('student');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-sm hover:bg-[#EFF7FF] transition-colors ${
                    currentUser.role === 'student' ? 'bg-blue-50 font-semibold text-[#1769E0]' : ''
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    S
                  </div>
                  <div className="flex-1">
                    <div className="text-sm leading-tight">Trần Minh Tuấn</div>
                    <div className="text-xs text-slate-500">Học sinh lớp 10A1</div>
                  </div>
                  {currentUser.role === 'student' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white/80 shadow-md ring-2 ring-cyan-400/40"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Xem thông báo"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            title="Cài đặt hệ thống"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
