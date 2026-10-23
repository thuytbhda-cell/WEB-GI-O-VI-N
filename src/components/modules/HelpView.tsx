import React from 'react';
import { HelpCircle, BookOpen, FileSpreadsheet, Bot, ShieldCheck, Mail, Phone } from 'lucide-react';

export const HelpView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 text-[#1769E0] rounded-xl">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#102E56]">
            Trung tâm Hỗ trợ & Hướng dẫn sử dụng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Cẩm nang vận hành hệ thống dạy học Văn học Cô Thủy - Trường THPT Hoài Đức A
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Guide 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102E56]">
            <FileSpreadsheet className="w-4 h-4 text-[#1769E0]" />
            <span>Cách nhập và xuất danh sách học sinh từ Excel</span>
          </div>
          <p className="text-xs text-slate-600 font-serif leading-relaxed">
            Hệ thống hỗ trợ cả định dạng .xlsx và .csv. Khi nhập file, hệ thống tự động nhận diện các cột: Mã học sinh, Họ và tên, Giới tính, Ngày sinh, Lớp. Trước khi lưu, bạn sẽ được xem màn hình xem trước (preview) để đối soát dữ liệu và tránh trùng lặp mã.
          </p>
        </div>

        {/* Guide 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102E56]">
            <BookOpen className="w-4 h-4 text-[#1769E0]" />
            <span>Quy định tính điểm trung bình chính thức môn Ngữ văn</span>
          </div>
          <p className="text-xs text-slate-600 font-serif leading-relaxed">
            Theo Thông tư 22/2021/TT-BGDĐT: ĐTB môn = (Tổng điểm TX + 2×GK + 3×CK) / (Số điểm TX + 5). Điểm luyện tập trực tuyến trên website được theo dõi riêng biệt nhằm khích lệ tinh thần tự học, không tự ý gộp vào điểm chính thức khi chưa cấu hình.
          </p>
        </div>

        {/* Guide 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102E56]">
            <Bot className="w-4 h-4 text-[#1769E0]" />
            <span>Kích hoạt Trợ lý AI học Văn Cô Thủy (Gemini)</span>
          </div>
          <p className="text-xs text-slate-600 font-serif leading-relaxed">
            Trợ lý AI kết nối bảo mật qua máy chủ Express (`/api/ai/chat`), hoàn toàn không để lộ khóa API ở trình duyệt học sinh. Để kích hoạt kết nối thực tế, giáo viên chỉ cần nhập <code className="bg-blue-50 px-1 py-0.5 rounded text-blue-700">GEMINI_API_KEY</code> trong bảng Secrets của AI Studio.
          </p>
        </div>

        {/* Guide 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[#102E56]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Chính sách bảo mật dữ liệu học sinh THPT</span>
          </div>
          <p className="text-xs text-slate-600 font-serif leading-relaxed">
            Học sinh đăng nhập chỉ xem được thông tin cá nhân và bảng điểm của chính mình. Toàn bộ các thao tác chỉnh sửa điểm, xóa bài kiểm tra hoặc duyệt tác phẩm đều được kiểm soát nghiêm ngặt theo phân quyền máy chủ.
          </p>
        </div>
      </div>

      {/* Contact Box */}
      <div className="bg-gradient-to-r from-blue-50 to-[#EFF7FF] p-5 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-[#102E56] text-sm">Cần hỗ trợ kỹ thuật thêm?</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Liên hệ Tổ Trưởng chuyên môn Ngữ văn - Trường THPT Hoài Đức A
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-[#1769E0]">
          <span className="flex items-center gap-1">
            <Mail className="w-4 h-4" /> thuytbhda@gmail.com
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-4 h-4" /> 098.xxx.xxxx
          </span>
        </div>
      </div>
    </div>
  );
};
