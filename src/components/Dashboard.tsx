import React from 'react';
import { useApp, NavItem } from '../context/AppContext';
import {
  Monitor,
  Users,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Bot,
  Puzzle,
  Feather,
  ChevronRight,
  GraduationCap,
  Star,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    currentUser,
    setCurrentTab,
    classes,
    students,
    assignments,
    grades,
    selectedSemester,
    setSelectedSemester,
    selectedYear,
  } = useApp();

  // Calculate dynamic stats
  const totalClasses = classes.length;
  // Total students (156 in mock data, or calculate sum of class counts)
  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
  const totalAssignments = assignments.length > 0 ? 28 : 0; // matching mock figure or dynamic
  const averageGrade = 8.2;

  // Class averages matching reference image (10A1: 7.8, 10A2: 8.1, 11A1: 8.4, 12A1: 8.0)
  const classAverages = [
    { name: '10A1', score: 7.8 },
    { name: '10A2', score: 8.1 },
    { name: '11A1', score: 8.4 },
    { name: '12A1', score: 8.0 },
  ];

  const cards: {
    id: NavItem;
    title: string;
    description: string;
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
  }[] = [
    {
      id: 'dashboard',
      title: 'Tổng quan giáo viên',
      description: 'Xem nhanh hoạt động, kế hoạch và nhiệm vụ của bạn.',
      icon: Monitor,
      iconColor: 'text-[#1769E0]',
      bgColor: 'bg-blue-50 border-blue-100',
    },
    {
      id: 'students',
      title: 'Quản lý học sinh',
      description: 'Quản lý thông tin, theo dõi học tập và tương tác.',
      icon: Users,
      iconColor: 'text-[#1769E0]',
      bgColor: 'bg-blue-50 border-blue-100',
    },
    {
      id: 'lessons',
      title: 'Thư viện bài giảng',
      description: 'Lưu trữ, tạo mới và chia sẻ bài giảng Ngữ văn.',
      icon: BookOpen,
      iconColor: 'text-[#1769E0]',
      bgColor: 'bg-blue-50 border-blue-100',
    },
    {
      id: 'assignments',
      title: 'Bài tập & kiểm tra',
      description: 'Tạo bài tập, đề kiểm tra và chấm điểm trực tuyến.',
      icon: ClipboardCheck,
      iconColor: 'text-[#1769E0]',
      bgColor: 'bg-blue-50 border-blue-100',
    },
    {
      id: 'grades',
      title: 'Kết quả học tập',
      description: 'Thống kê, phân tích kết quả và theo dõi tiến bộ.',
      icon: BarChart3,
      iconColor: 'text-[#1769E0]',
      bgColor: 'bg-blue-50 border-blue-100',
    },
    {
      id: 'ai',
      title: 'Trợ lý AI học Văn',
      description: 'Hỗ trợ soạn bài, gợi ý ý tưởng và giải đáp kiến thức Văn học.',
      icon: Bot,
      iconColor: 'text-[#1769E0]',
      bgColor: 'bg-blue-50 border-blue-100',
    },
    {
      id: 'games',
      title: 'Trò chơi học tập',
      description: 'Học Văn qua trò chơi thú vị và sáng tạo.',
      icon: Puzzle,
      iconColor: 'text-[#1769E0]',
      bgColor: 'bg-blue-50 border-blue-100',
    },
    {
      id: 'creative',
      title: 'Góc sáng tạo văn học',
      description: 'Chia sẻ tác phẩm, cảm nhận và góc nhìn của học sinh.',
      icon: Feather,
      iconColor: 'text-[#1769E0]',
      bgColor: 'bg-blue-50 border-blue-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner matching Reference Image */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-[#F0F7FF] to-[#E3F2FD] border border-blue-100 p-6 sm:p-8 shadow-sm">
        {/* Subtle Watermark Landscape Illustration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 pointer-events-none flex items-center justify-end pr-4">
          <svg className="w-96 h-48 text-[#1769E0]" viewBox="0 0 500 200" fill="none">
            <path
              d="M10 180 Q 80 120 160 160 T 320 140 T 480 170"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Pagoda silhouette */}
            <path d="M350 160 L360 130 L390 130 L400 160 Z" fill="currentColor" fillOpacity="0.2" />
            <path d="M355 130 L375 105 L395 130 Z" fill="currentColor" fillOpacity="0.3" />
            <line x1="375" y1="105" x2="375" y2="90" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#102E56] tracking-tight">
              Chào mừng cô {currentUser.role === 'teacher' ? 'Thủy Nguyễn' : currentUser.name}!
            </h2>
            <p className="mt-2 text-base sm:text-lg text-[#1769E0] italic font-serif">
              Hành trình gieo yêu thương qua những con chữ...
            </p>
            {currentUser.role === 'student' && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100/80 text-[#102E56] rounded-full text-xs font-semibold">
                <span>Học sinh: {currentUser.name}</span>
                <span>•</span>
                <span>Lớp: {currentUser.className}</span>
              </div>
            )}
          </div>

          {/* Inspirational Quote Card on the right */}
          <div className="bg-white/85 backdrop-blur-xs p-4 sm:p-5 rounded-xl border border-blue-200/70 shadow-xs max-w-md self-start lg:self-center">
            <p className="text-sm sm:text-base italic text-[#12305A] font-serif leading-relaxed text-right">
              “Văn học không chỉ là những con chữ, mà là cuộc sống, là tâm hồn, là tình yêu con người.”
            </p>
            <div className="mt-1 text-right text-xs text-[#1769E0] font-semibold">
              — Khẩu hiệu giảng dạy Ngữ văn THPT
            </div>
          </div>
        </div>
      </div>

      {/* 8 Main Feature Cards (2 rows of 4 on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => setCurrentTab(card.id)}
              className="group bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="w-13 h-13 rounded-2xl bg-[#EFF7FF] flex items-center justify-center border border-blue-100 group-hover:bg-[#1769E0] transition-colors duration-300">
                  <Icon className="w-7 h-7 text-[#1769E0] group-hover:text-white transition-colors duration-300" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F0F7FF] flex items-center justify-center text-slate-400 group-hover:bg-[#1769E0] group-hover:text-white transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-[#102E56] group-hover:text-[#1769E0] transition-colors">
                  {card.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Bottom decorative subtle accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent group-hover:bg-[#1769E0] transition-all"></div>
            </div>
          );
        })}
      </div>

      {/* "Thống kê nhanh" Section matching the reference layout */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        {/* Header of Quick Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#1769E0] rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#102E56]">Thống kê nhanh</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as any)}
                className="appearance-none bg-[#F5F9FF] border border-blue-200 text-[#102E56] text-xs sm:text-sm rounded-lg pl-8 pr-8 py-2 font-semibold hover:border-blue-400 focus:outline-hidden cursor-pointer"
              >
                <option value="Học kỳ I">Học kỳ I 2026 - 2027</option>
                <option value="Học kỳ II">Học kỳ II 2026 - 2027</option>
              </select>
              <Calendar className="w-4 h-4 text-[#1769E0] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 4 Stat Cards + Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
          {/* 4 Metrics in 8 columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Lớp học */}
            <div className="bg-[#F8FBFF] p-4 rounded-xl border border-blue-100/70 hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Lớp học</span>
                <GraduationCap className="w-5 h-5 text-[#1769E0]" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#102E56]">{totalClasses}</div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span>▲ +1</span>
                <span className="text-slate-400">so với kỳ trước</span>
              </div>
            </div>

            {/* Học sinh */}
            <div className="bg-[#F8FBFF] p-4 rounded-xl border border-blue-100/70 hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Học sinh</span>
                <Users className="w-5 h-5 text-[#17B8D9]" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#102E56]">{totalStudents}</div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span>▲ +12</span>
                <span className="text-slate-400">so với kỳ trước</span>
              </div>
            </div>

            {/* Bài tập đã giao */}
            <div className="bg-[#F8FBFF] p-4 rounded-xl border border-blue-100/70 hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Bài tập đã giao</span>
                <ClipboardCheck className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#102E56]">{totalAssignments}</div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span>▲ +6</span>
                <span className="text-slate-400">so với kỳ trước</span>
              </div>
            </div>

            {/* Điểm trung bình */}
            <div className="bg-[#F8FBFF] p-4 rounded-xl border border-blue-100/70 hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold">Điểm trung bình</span>
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-bold text-[#102E56]">{averageGrade}</div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span>▲ +0,5</span>
                <span className="text-slate-400">so với kỳ trước</span>
              </div>
            </div>
          </div>

          {/* Bar Chart matching reference image in 5 columns */}
          <div className="lg:col-span-5 bg-[#FAFDFE] p-4 rounded-xl border border-blue-100">
            <div className="text-xs font-bold text-[#102E56] mb-3">
              Biểu đồ điểm trung bình các lớp
            </div>

            <div className="flex items-end gap-3 h-36 pt-4 px-2">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between h-full text-[10px] text-slate-400 font-sans pb-4">
                <span>10</span>
                <span>8</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
                <span>0</span>
              </div>

              {/* Bars */}
              <div className="flex-1 flex justify-around items-end h-full border-b border-l border-slate-200 pb-0.5">
                {classAverages.map((item) => {
                  const heightPercent = (item.score / 10) * 100;
                  return (
                    <div key={item.name} className="flex flex-col items-center flex-1 group">
                      <span className="text-[11px] font-bold text-[#102E56] mb-1 group-hover:text-[#1769E0] transition-colors">
                        {item.score.toFixed(1).replace('.', ',')}
                      </span>
                      <div className="w-8 sm:w-10 bg-gradient-to-t from-[#1769E0] to-[#4EA1FF] rounded-t-md hover:brightness-110 transition-all relative">
                        <div style={{ height: `${heightPercent}px` }} className="w-full"></div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 mt-2">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
