import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  ShieldCheck,
  Database,
  Sparkles,
  RefreshCw,
  X,
  GraduationCap,
  Download,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    switchRole,
    selectedYear,
    setSelectedYear,
    formulaConfig,
    updateFormulaConfig,
    resetToDefaultData,
    showToast,
  } = useApp();

  if (!isOpen) return null;

  const handleExportBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      school: 'THPT Hoài Đức A',
      teacher: 'Thủy Nguyễn',
      state: localStorage,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_Website_Van_Hoc_Co_Thuy_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Đã xuất bản sao lưu hệ thống an toàn');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1769E0]" />
            <h3 className="text-lg font-bold text-[#102E56]">Cài đặt & Cấu hình hệ thống</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-5 text-xs sm:text-sm">
          {/* Academic Year */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Năm học áp dụng</label>
            <input
              type="text"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#102E56]"
            />
          </div>

          {/* Role switcher */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl">
            <span className="font-bold text-[#102E56] block mb-2">Vai trò người dùng đang trải nghiệm:</span>
            <div className="flex gap-2">
              <button
                onClick={() => switchRole('teacher')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  currentUser.role === 'teacher'
                    ? 'bg-[#1769E0] text-white border-[#1769E0]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Giáo viên: Cô Thủy Nguyễn
              </button>
              <button
                onClick={() => switchRole('student')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  currentUser.role === 'student'
                    ? 'bg-[#1769E0] text-white border-[#1769E0]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Học sinh: Trần Minh Tuấn
              </button>
            </div>
          </div>

          {/* Database / Firebase Info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Database className="w-4 h-4 text-[#1769E0]" />
              <span>Cơ sở dữ liệu & Lưu trữ:</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Trạng thái: <strong className="text-emerald-600">Chế độ Demo (LocalStorage)</strong>. Khi triển khai chính thức cho học sinh thật của trường THPT Hoài Đức A, hệ thống sẽ kết nối Cloud Firestore và Firebase Auth thông qua quy trình ủy quyền chính thức.
            </p>
          </div>

          {/* Student Privacy Policy */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Bảo mật dữ liệu học sinh THPT:</span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Tuân thủ nguyên tắc: Không công khai bảng điểm cá nhân ra ngoài, học sinh chỉ xem được điểm của chính mình; dữ liệu cá nhân không gửi cho AI khi chưa mã hóa.
            </p>
          </div>

          {/* Reset Demo Data & Backup buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-between">
            <button
              onClick={() => {
                resetToDefaultData();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Khôi phục dữ liệu mẫu gốc</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold"
            >
              <Download className="w-4 h-4" />
              <span>Sao lưu dữ liệu JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
