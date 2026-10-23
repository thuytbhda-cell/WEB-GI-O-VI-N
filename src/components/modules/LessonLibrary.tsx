import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LessonMaterial, LessonType } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Video,
  FileText,
  Presentation,
  FileCode,
  Map,
  ClipboardList,
  Eye,
  Trash2,
  Edit,
  X,
  ExternalLink,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export const LessonLibrary: React.FC = () => {
  const { lessons, addLesson, updateLesson, deleteLesson, classes, currentUser, showToast } = useApp();

  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingLesson, setViewingLesson] = useState<LessonMaterial | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonMaterial | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    grade: 10 as 10 | 11 | 12,
    topic: '',
    textbook: 'Kết nối tri thức với cuộc sống',
    type: 'Kế hoạch bài dạy' as LessonType,
    description: '',
    author: 'Cô Thủy Nguyễn',
    downloadAllowed: true,
    sharedClasses: [classes[0]?.id || ''],
    videoUrl: '',
    fileSize: '1.2 MB',
  });

  const lessonTypes: LessonType[] = [
    'Kế hoạch bài dạy',
    'Bài giảng PowerPoint',
    'Tài liệu Word',
    'Tài liệu PDF',
    'Video bài giảng',
    'Hình ảnh minh họa',
    'Sơ đồ tư duy',
    'Phiếu học tập',
    'Tài liệu ôn tập',
  ];

  const filteredLessons = lessons.filter((l) => {
    const matchGrade = selectedGrade === 'all' || l.grade === selectedGrade;
    const matchType = selectedType === 'all' || l.type === selectedType;
    const matchSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGrade && matchType && matchSearch;
  });

  const getTypeIcon = (type: LessonType) => {
    switch (type) {
      case 'Bài giảng PowerPoint':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'Video bài giảng':
        return <Video className="w-5 h-5 text-rose-500" />;
      case 'Sơ đồ tư duy':
        return <Map className="w-5 h-5 text-emerald-500" />;
      case 'Phiếu học tập':
        return <ClipboardList className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-[#1769E0]" />;
    }
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tiêu đề học liệu', 'error');
      return;
    }

    if (editingLesson) {
      updateLesson(editingLesson.id, formData);
      setEditingLesson(null);
    } else {
      addLesson(formData);
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#1769E0] rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#102E56]">
              Phân hệ 3: Thư viện bài giảng & Học liệu Ngữ văn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Bộ sách: <span className="font-semibold text-[#1769E0]">Kết nối tri thức với cuộc sống</span> • Khối 10, 11, 12
            </p>
          </div>
        </div>

        {currentUser.role === 'teacher' && (
          <button
            onClick={() => {
              setFormData({
                title: '',
                grade: 10,
                topic: '',
                textbook: 'Kết nối tri thức với cuộc sống',
                type: 'Kế hoạch bài dạy',
                description: '',
                author: 'Cô Thủy Nguyễn',
                downloadAllowed: true,
                sharedClasses: [classes[0]?.id || ''],
                videoUrl: '',
                fileSize: '1.5 MB',
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1769E0] hover:bg-[#1358BE] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học liệu mới</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Grade tabs */}
          <div className="flex items-center bg-[#EFF7FF] p-1 rounded-xl border border-blue-200">
            <button
              onClick={() => setSelectedGrade('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGrade === 'all' ? 'bg-[#1769E0] text-white shadow-xs' : 'text-[#102E56] hover:bg-blue-100'
              }`}
            >
              Tất cả khối
            </button>
            <button
              onClick={() => setSelectedGrade(10)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGrade === 10 ? 'bg-[#1769E0] text-white shadow-xs' : 'text-[#102E56] hover:bg-blue-100'
              }`}
            >
              Ngữ văn 10
            </button>
            <button
              onClick={() => setSelectedGrade(11)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGrade === 11 ? 'bg-[#1769E0] text-white shadow-xs' : 'text-[#102E56] hover:bg-blue-100'
              }`}
            >
              Ngữ văn 11
            </button>
            <button
              onClick={() => setSelectedGrade(12)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedGrade === 12 ? 'bg-[#1769E0] text-white shadow-xs' : 'text-[#102E56] hover:bg-blue-100'
              }`}
            >
              Ngữ văn 12
            </button>
          </div>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden"
          >
            <option value="all">Tất cả định dạng học liệu</option>
            {lessonTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên bài học, chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-blue-400 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Lesson Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLessons.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-100">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-base font-bold text-slate-600">Chưa tìm thấy học liệu phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Cô Thủy có thể tải lên tài liệu mới để học sinh tra cứu.</p>
          </div>
        ) : (
          filteredLessons.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    {getTypeIcon(item.type)}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#1769E0] border border-blue-100">
                    Lớp {item.grade}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-[#102E56] hover:text-[#1769E0] transition-colors leading-snug line-clamp-2">
                  {item.title}
                </h3>

                <div className="mt-1 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded inline-block">
                  Chủ đề: {item.topic}
                </div>

                <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700">{item.type}</span>
                  {item.fileSize && <span className="text-slate-400 ml-1">({item.fileSize})</span>}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingLesson(item)}
                    className="p-1.5 text-slate-500 hover:text-[#1769E0] hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem trước nội dung"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {item.downloadAllowed ? (
                    <button
                      onClick={() => showToast(`Bắt đầu tải về: ${item.title}`)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Tải tài liệu"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="p-1.5 text-slate-300" title="Tài liệu chỉ xem trực tuyến">
                      <Lock className="w-4 h-4" />
                    </span>
                  )}

                  {currentUser.role === 'teacher' && (
                    <button
                      onClick={() => deleteLesson(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa học liệu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: View Lesson Document Preview */}
      {viewingLesson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {getTypeIcon(viewingLesson.type)}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#102E56]">{viewingLesson.title}</h3>
                  <div className="text-xs text-slate-400">
                    Ngữ văn {viewingLesson.grade} • {viewingLesson.textbook}
                  </div>
                </div>
              </div>
              <button onClick={() => setViewingLesson(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content Simulation */}
            <div className="flex-1 overflow-y-auto my-4 p-5 bg-[#FAFCFF] border border-blue-100 rounded-xl space-y-4 text-sm leading-relaxed text-slate-800 font-serif">
              <div className="border-b border-slate-200 pb-3 text-center">
                <div className="text-xs uppercase tracking-wider text-slate-500 font-sans">
                  TRƯỜNG THPT HOÀI ĐỨC A • TỔ NGỮ VĂN
                </div>
                <h4 className="text-lg font-bold text-[#102E56] mt-1">{viewingLesson.title}</h4>
                <div className="text-xs text-slate-500 font-sans mt-0.5">
                  Giáo viên: {viewingLesson.author} • Ngày cập nhật: {viewingLesson.createdAt}
                </div>
              </div>

              <div>
                <h5 className="font-bold text-[#1769E0] font-sans text-xs uppercase tracking-wider mb-1">
                  I. MỤC TIÊU CẦN ĐẠT & YÊU CẦU NĂNG LỰC:
                </h5>
                <p>{viewingLesson.description}</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700 text-xs font-sans">
                  <li>Phát triển năng lực cảm thụ văn học và kỹ năng phân tích thi pháp tác phẩm.</li>
                  <li>Rèn luyện tư duy phản biện, liên hệ thực tiễn xã hội và bồi đắp lòng nhân ái.</li>
                </ul>
              </div>

              {viewingLesson.videoUrl && (
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-center font-sans">
                  <Video className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Liên kết video bài giảng:</p>
                  <a
                    href={viewingLesson.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#1769E0] underline mt-1 inline-block"
                  >
                    {viewingLesson.videoUrl}
                  </a>
                </div>
              )}

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <h5 className="font-bold text-[#102E56] text-xs font-sans uppercase mb-1">
                  II. HƯỚNG DẪN HỌC TẬP TẠI NHÀ DÀNH CHO HỌC SINH:
                </h5>
                <p className="text-xs text-slate-600">
                  1. Đọc kỹ văn bản trước giờ học, gạch chân các từ ngữ giàu hình ảnh và biện pháp tu từ tiêu biểu.<br />
                  2. Trả lời các câu hỏi trong phiếu học tập trước khi đến lớp.<br />
                  3. Thực hành làm bài tập luyện tập trên hệ thống website Văn học Cô Thủy.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Quyền tải xuống: {viewingLesson.downloadAllowed ? 'Được phép' : 'Chỉ xem trực tuyến'}
              </span>
              <div className="flex gap-2">
                {viewingLesson.downloadAllowed && (
                  <button
                    onClick={() => showToast(`Đã tải về tài liệu ${viewingLesson.title}`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải tài liệu</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingLesson(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Lesson */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#102E56]">Thêm học liệu Ngữ văn mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề bài giảng / Học liệu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  placeholder="VD: Kế hoạch bài dạy: Tây Tiến (Quang Dũng)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  >
                    <option value={10}>Ngữ văn 10</option>
                    <option value={11}>Ngữ văn 11</option>
                    <option value={12}>Ngữ văn 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Định dạng học liệu</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  >
                    {lessonTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề bài học</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  placeholder="VD: Vẻ đẹp lãng mạn và bi tráng của người lính"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả tóm tắt nội dung</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  placeholder="Mô tả mục tiêu, yêu cầu cần đạt, phương pháp giảng dạy..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đường dẫn Video bài giảng (nếu có)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dlAllowed"
                  checked={formData.downloadAllowed}
                  onChange={(e) => setFormData({ ...formData, downloadAllowed: e.target.checked })}
                  className="w-4 h-4 text-[#1769E0] rounded"
                />
                <label htmlFor="dlAllowed" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Cho phép học sinh tải tài liệu về máy tính/điện thoại
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1769E0] text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  Lưu học liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
