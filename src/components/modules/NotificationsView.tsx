import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, Calendar, Info, AlertCircle, X } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#1769E0] rounded-xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#102E56]">
              Thông báo & Lịch kiểm tra môn Ngữ văn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Cập nhật thông tin từ Tổ Ngữ văn trường THPT Hoài Đức A
            </p>
          </div>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F0F7FF] text-[#1769E0] hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Đánh dấu tất cả đã đọc</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationAsRead(n.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              n.isRead
                ? 'bg-white border-slate-100 opacity-80'
                : 'bg-white border-blue-200 shadow-sm ring-1 ring-blue-300/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    n.isRead ? 'bg-slate-300' : 'bg-[#1769E0] ring-2 ring-blue-200'
                  }`}
                />
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    n.priority === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : n.priority === 'normal'
                      ? 'bg-blue-100 text-[#102E56]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {n.priority === 'high' ? 'Khẩn / Quan trọng' : 'Thông báo'}
                </span>
                <span className="text-xs text-slate-400">{n.date}</span>
              </div>
            </div>

            <h3 className="mt-2 text-base font-bold text-[#102E56] font-serif">{n.title}</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 font-serif leading-relaxed">
              {n.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
