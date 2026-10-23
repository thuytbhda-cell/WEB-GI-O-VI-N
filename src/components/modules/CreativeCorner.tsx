import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreativeWork } from '../../types';
import {
  Feather,
  Plus,
  Heart,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  Eye,
  MessageSquare,
  X,
  Send,
  BookOpen,
} from 'lucide-react';

export const CreativeCorner: React.FC = () => {
  const {
    creativeWorks,
    currentUser,
    addCreativeWork,
    updateCreativeWorkStatus,
    likeCreativeWork,
    showToast,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [viewingWork, setViewingWork] = useState<CreativeWork | null>(null);

  // Form submit state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Bài viết cảm nhận' as CreativeWork['category'],
    content: '',
    excerpt: '',
    status: 'Chờ duyệt' as CreativeWork['status'],
  });

  const categories: CreativeWork['category'][] = [
    'Bài viết cảm nhận',
    'Bài thơ',
    'Truyện ngắn',
    'Giới thiệu sách',
    'Nhật ký đọc sách',
    'Sản phẩm học tập sáng tạo',
  ];

  // Filtering:
  // If teacher: sees all (including drafts / pending approval)
  // If student: sees approved / featured works, and their own submissions
  const filteredWorks = creativeWorks.filter((w) => {
    if (currentUser.role === 'student' && w.status !== 'Đã duyệt' && w.status !== 'Nổi bật') {
      if (w.studentCode !== currentUser.studentCode) {
        return false;
      }
    }

    const matchCat = selectedCategory === 'all' || w.category === selectedCategory;
    const matchSearch =
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Vui lòng điền tiêu đề và nội dung sáng tạo', 'error');
      return;
    }

    addCreativeWork({
      title: formData.title,
      category: formData.category,
      content: formData.content,
      excerpt: formData.content.substring(0, 120) + '...',
      authorName: currentUser.name,
      studentCode: currentUser.studentCode || 'HDA-10A1-001',
      className: currentUser.className || '10A1',
      status: 'Chờ duyệt',
    });

    setIsSubmitModalOpen(false);
    setFormData({
      title: '',
      category: 'Bài viết cảm nhận',
      content: '',
      excerpt: '',
      status: 'Chờ duyệt',
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#1769E0] rounded-xl">
            <Feather className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#102E56]">
              Phân hệ 8: Góc sáng tạo văn học THPT Hoài Đức A
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Nơi chắp cánh tâm hồn: Cảm nhận tác phẩm, thơ ca, truyện ngắn và nhật ký đọc sách của học sinh
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1769E0] hover:bg-[#1358BE] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Gửi tác phẩm sáng tạo</span>
        </button>
      </div>

      {/* Filter and Categories Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#1769E0] text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả thể loại
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === c
                  ? 'bg-[#1769E0] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Tìm theo tác giả, tiêu đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-blue-400 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Works Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWorks.map((work) => (
          <div
            key={work.id}
            className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
              work.status === 'Nổi bật'
                ? 'border-amber-300 shadow-md ring-1 ring-amber-400/30'
                : 'border-slate-100 shadow-sm hover:shadow-md'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1769E0] border border-blue-100">
                  {work.category}
                </span>

                {work.status === 'Nổi bật' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Tác phẩm tiêu biểu
                  </span>
                ) : (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      work.status === 'Đã duyệt'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {work.status}
                  </span>
                )}
              </div>

              <h3 className="mt-3 text-base font-bold text-[#102E56] font-serif line-clamp-2 leading-snug">
                {work.title}
              </h3>

              <div className="mt-1 text-xs text-slate-400 font-sans">
                Tác giả: <strong className="text-slate-700">{work.authorName}</strong> • Lớp {work.className}
              </div>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 font-serif line-clamp-3 leading-relaxed italic">
                “{work.excerpt}”
              </p>

              {work.teacherFeedback && (
                <div className="mt-3 p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 font-serif">
                  <span className="font-bold">Cô Thủy khen tặng:</span> {work.teacherFeedback}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => likeCreativeWork(work.id)}
                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 font-bold"
              >
                <Heart className="w-4 h-4 fill-rose-500" />
                <span>{work.likes}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingWork(work)}
                  className="px-3 py-1.5 bg-[#EFF7FF] text-[#1769E0] hover:bg-blue-100 rounded-lg text-xs font-bold"
                >
                  Đọc toàn văn
                </button>

                {currentUser.role === 'teacher' && (
                  <button
                    onClick={() => {
                      const nextStatus = work.status === 'Nổi bật' ? 'Đã duyệt' : 'Nổi bật';
                      updateCreativeWorkStatus(work.id, nextStatus);
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg"
                    title="Đánh dấu tác phẩm tiêu biểu"
                  >
                    <Award className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: View Full Work */}
      {viewingWork && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#1769E0] uppercase">{viewingWork.category}</span>
                <h3 className="text-lg sm:text-xl font-bold text-[#102E56] font-serif">{viewingWork.title}</h3>
                <div className="text-xs text-slate-400 font-sans mt-0.5">
                  Tác giả: {viewingWork.authorName} ({viewingWork.className}) • Ngày gửi: {viewingWork.createdAt}
                </div>
              </div>
              <button onClick={() => setViewingWork(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 p-5 bg-[#FAFCFF] border border-blue-100 rounded-xl font-serif text-sm leading-relaxed whitespace-pre-wrap text-slate-800">
              {viewingWork.content}
            </div>

            {viewingWork.teacherFeedback && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-serif text-amber-900">
                <strong>Lời nhận xét của cô Thủy:</strong> {viewingWork.teacherFeedback}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setViewingWork(null)}
                className="px-5 py-2 bg-[#1769E0] text-white text-xs font-bold rounded-xl"
              >
                Đóng tác phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Submit Creative Work */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#102E56] flex items-center gap-2">
                <Feather className="w-5 h-5 text-[#1769E0]" />
                Gửi bài sáng tạo văn học
              </h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitWork} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề tác phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden font-serif"
                  placeholder="VD: Nhớ ánh mắt người lính Tây Tiến..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thể loại</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung bài viết / bài thơ / cảm nhận <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden font-serif leading-relaxed"
                  placeholder="Viết bài sáng tạo của em tại đây..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  * Tác phẩm sẽ được cô Thủy duyệt trước khi hiển thị cho cả lớp.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1769E0] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"
                  >
                    Gửi cho cô Thủy
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
