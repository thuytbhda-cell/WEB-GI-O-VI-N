import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentManagement } from './components/modules/StudentManagement';
import { LessonLibrary } from './components/modules/LessonLibrary';
import { AssignmentsExams } from './components/modules/AssignmentsExams';
import { GradeManagement } from './components/modules/GradeManagement';
import { AIAssistant } from './components/modules/AIAssistant';
import { LearningGames } from './components/modules/LearningGames';
import { CreativeCorner } from './components/modules/CreativeCorner';
import { NotificationsView } from './components/modules/NotificationsView';
import { HelpView } from './components/modules/HelpView';
import { SettingsModal } from './components/modules/SettingsModal';
import { Menu, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentTab, setCurrentTab, toast } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const renderActiveModule = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'classes':
      case 'students':
        return <StudentManagement />;
      case 'lessons':
        return <LessonLibrary />;
      case 'assignments':
        return <AssignmentsExams />;
      case 'grades':
        return <GradeManagement />;
      case 'ai':
        return <AIAssistant />;
      case 'games':
        return <LearningGames />;
      case 'creative':
        return <CreativeCorner />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <Dashboard />;
      case 'help':
        return <HelpView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#EFF7FF] flex flex-col font-serif">
      {/* Top Main Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifications={() => setCurrentTab('notifications')}
      />

      {/* Mobile Menu Toggle Bar */}
      <div className="lg:hidden bg-[#0C223F] border-b border-[#1A3D6B] px-4 py-2 flex items-center justify-between text-white">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="flex items-center gap-2 text-xs font-bold py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Menu className="w-4 h-4 text-cyan-300" />
          <span>Danh mục chức năng</span>
        </button>

        <span className="text-xs text-cyan-200 font-bold uppercase tracking-wider">
          {currentTab === 'dashboard'
            ? 'BẢNG ĐIỀU KHIỂN'
            : currentTab === 'students'
            ? 'QUẢN LÝ HỌC SINH'
            : currentTab === 'lessons'
            ? 'THƯ VIỆN BÀI GIẢNG'
            : currentTab === 'assignments'
            ? 'BÀI TẬP & KIỂM TRA'
            : currentTab === 'grades'
            ? 'KẾT QUẢ HỌC TẬP'
            : currentTab === 'ai'
            ? 'TRỢ LÝ AI HỌC VĂN'
            : currentTab === 'games'
            ? 'TRÒ CHƠI HỌC TẬP'
            : currentTab === 'creative'
            ? 'GÓC SÁNG TẠO VĂN HỌC'
            : 'THÔNG TIN'}
        </span>
      </div>

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveModule()}
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#102E56] text-white rounded-2xl shadow-2xl border border-cyan-400/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 flex-shrink-0" />}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
