import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, SchoolClass } from '../../types';
import * as XLSX from 'xlsx';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  ArrowRightLeft,
  X,
  UploadCloud,
  FileText,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const {
    students,
    classes,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    addClass,
    updateClass,
    deleteClass,
    showToast,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // Excel Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<Omit<Student, 'id'>[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form student state
  const [formData, setFormData] = useState({
    code: '',
    fullName: '',
    gender: 'Nam' as 'Nam' | 'Nữ',
    dateOfBirth: '2011-01-01',
    classId: classes[0]?.id || '',
    status: 'Đang học' as 'Đang học' | 'Nghỉ học' | 'Chuyển lớp',
    email: '',
    phone: '',
    notes: '',
  });

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchStatus && matchSearch;
  });

  // Excel Export
  const handleExportExcel = () => {
    const exportRows = filteredStudents.map((s, idx) => ({
      STT: idx + 1,
      'Mã Học Sinh': s.code,
      'Họ Và Tên': s.fullName,
      'Giới Tính': s.gender,
      'Ngày Sinh': s.dateOfBirth,
      Lớp: s.className,
      'Năm Học': s.academicYear,
      'Trạng Thái': s.status,
      Email: s.email || '',
      'Số Điện Thoại': s.phone || '',
      'Ghi Chú': s.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh');
    XLSX.writeFile(workbook, `Danh_Sach_Hoc_Sinh_Hoai_Duc_A_${selectedClassId}_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất file Excel thành công');
  };

  // Excel Import Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const parsed: Omit<Student, 'id'>[] = [];
        const errs: string[] = [];

        data.forEach((row, i) => {
          const rowNum = i + 2;
          const code = (row['Mã Học Sinh'] || row['Mã HS'] || row['MaHS'] || row['code'] || '').toString().trim();
          const fullName = (row['Họ Và Tên'] || row['Họ Tên'] || row['HoTen'] || row['fullName'] || '').toString().trim();
          const className = (row['Lớp'] || row['Lop'] || row['className'] || '10A1').toString().trim();
          const gender = (row['Giới Tính'] || row['GioiTinh'] || 'Nam').toString().trim() === 'Nữ' ? 'Nữ' : 'Nam';
          const dob = (row['Ngày Sinh'] || row['NgaySinh'] || '2011-01-01').toString().trim();

          if (!code || !fullName) {
            errs.push(`Dòng ${rowNum}: Thiếu mã học sinh hoặc họ tên.`);
            return;
          }

          const targetClass = classes.find((c) => c.name.toLowerCase() === className.toLowerCase()) || classes[0];

          parsed.push({
            code,
            fullName,
            gender,
            dateOfBirth: dob,
            classId: targetClass.id,
            className: targetClass.name,
            academicYear: '2026-2027',
            status: 'Đang học',
            email: (row['Email'] || '').toString().trim(),
            phone: (row['Số Điện Thoại'] || row['SDT'] || '').toString().trim(),
            notes: (row['Ghi Chú'] || '').toString().trim(),
          });
        });

        setImportPreviewData(parsed);
        setImportErrors(errs);
        setIsImportModalOpen(true);
      } catch (err: any) {
        showToast('Không thể đọc file Excel: ' + err.message, 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const confirmImport = () => {
    if (importPreviewData.length === 0) return;
    importStudents(importPreviewData);
    setIsImportModalOpen(false);
    setImportPreviewData([]);
    setImportErrors([]);
  };

  const handleOpenAdd = () => {
    setFormData({
      code: `HDA-${classes[0]?.name || '10A1'}-${String(students.length + 1).padStart(3, '0')}`,
      fullName: '',
      gender: 'Nam',
      dateOfBirth: '2011-01-01',
      classId: classes[0]?.id || '',
      status: 'Đang học',
      email: '',
      phone: '',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.code.trim()) {
      showToast('Vui lòng điền đầy đủ Mã học sinh và Họ tên', 'error');
      return;
    }

    const cls = classes.find((c) => c.id === formData.classId) || classes[0];

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        ...formData,
        className: cls.name,
      });
      setEditingStudent(null);
    } else {
      // Check duplicate code
      if (students.some((s) => s.code.trim().toUpperCase() === formData.code.trim().toUpperCase())) {
        showToast('Mã học sinh này đã tồn tại trong hệ thống!', 'error');
        return;
      }
      addStudent({
        ...formData,
        className: cls.name,
        academicYear: '2026-2027',
      });
      setIsAddModalOpen(false);
    }
  };

  const handleTransfer = (newClassId: string) => {
    if (!transferringStudent) return;
    const targetClass = classes.find((c) => c.id === newClassId);
    if (!targetClass) return;

    updateStudent(transferringStudent.id, {
      classId: targetClass.id,
      className: targetClass.name,
    });
    setTransferringStudent(null);
    showToast(`Đã chuyển học sinh ${transferringStudent.fullName} sang lớp ${targetClass.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#1769E0] rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#102E56]">
                Phân hệ 2: Quản lý học sinh
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Quản lý hồ sơ, lớp học, chuyển lớp và đồng bộ danh sách học sinh THPT Hoài Đức A
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F0F7FF] text-[#1769E0] hover:bg-blue-100 border border-blue-200 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Nhập danh sách Excel</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F0F7FF] text-[#102E56] hover:bg-blue-100 border border-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={() => setIsClassModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#102E56] hover:bg-slate-50 border border-slate-300 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs"
          >
            <GraduationCap className="w-4 h-4 text-[#1769E0]" />
            <span>Quản lý lớp học</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1769E0] hover:bg-[#1358BE] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm học sinh</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 bg-[#EFF7FF] border border-blue-200 text-[#102E56] rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden"
          >
            <option value="all">Tất cả các lớp ({students.length} HS)</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} ({students.filter((s) => s.classId === c.id).length} HS)
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden"
          >
            <option value="all">Mọi trạng thái</option>
            <option value="Đang học">Đang học</option>
            <option value="Nghỉ học">Nghỉ học</option>
            <option value="Chuyển lớp">Chuyển lớp</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã học sinh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-blue-400 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6FAFF] border-b border-blue-100/80 text-[13px] font-bold text-[#102E56]">
                <th className="py-3.5 px-4 text-center w-12">STT</th>
                <th className="py-3.5 px-4">Mã Học Sinh</th>
                <th className="py-3.5 px-4">Họ và Tên</th>
                <th className="py-3.5 px-4 text-center">Giới tính</th>
                <th className="py-3.5 px-4">Ngày sinh</th>
                <th className="py-3.5 px-4 text-center">Lớp</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4">Ghi chú</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#1769E0]" />
                    <p className="font-semibold text-slate-500">Không tìm thấy học sinh nào</p>
                    <p className="text-xs text-slate-400 mt-1">Thử thay đổi bộ lọc hoặc thêm học sinh mới.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu, index) => (
                  <tr key={stu.id} className="hover:bg-[#F9FCFF] transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-medium">{index + 1}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#1769E0] text-xs">
                      {stu.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#102E56]">
                      <div className="flex items-center gap-2">
                        <span>{stu.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">{stu.gender}</td>
                    <td className="py-3 px-4 text-slate-600">{stu.dateOfBirth}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#102E56]">
                        {stu.className}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          stu.status === 'Đang học'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stu.status === 'Chuyển lớp'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {stu.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {stu.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingStudent(stu)}
                          className="p-1.5 text-slate-400 hover:text-[#1769E0] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem hồ sơ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTransferringStudent(stu)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Chuyển lớp"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(stu);
                            setFormData({
                              code: stu.code,
                              fullName: stu.fullName,
                              gender: stu.gender,
                              dateOfBirth: stu.dateOfBirth,
                              classId: stu.classId,
                              status: stu.status,
                              email: stu.email || '',
                              phone: stu.phone || '',
                              notes: stu.notes || '',
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingStudentId(stu.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa học sinh"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="p-4 bg-[#F8FBFF] border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div>
            Hiển thị <span className="font-bold text-[#102E56]">{filteredStudents.length}</span> / {students.length} học sinh
          </div>
          <div>Năm học: 2026–2027 • Trường THPT Hoài Đức A</div>
        </div>
      </div>

      {/* Modal: Add or Edit Student */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#102E56]">
                {editingStudent ? 'Chỉnh sửa thông tin học sinh' : 'Thêm học sinh mới'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                    placeholder="VD: HDA-10A1-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp phân bổ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - Khối {c.grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  placeholder="VD: Nguyễn Văn An"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                    placeholder="VD: 098xxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái học tập</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  >
                    <option value="Đang học">Đang học</option>
                    <option value="Nghỉ học">Nghỉ học</option>
                    <option value="Chuyển lớp">Chuyển lớp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú sư phạm</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden"
                  placeholder="Ghi chú về học lực, năng khiếu cảm thụ văn chương..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1769E0] hover:bg-[#1358BE] text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20"
                >
                  {editingStudent ? 'Cập nhật' : 'Lưu học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Student Profile */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#102E56]">Hồ sơ học sinh</h3>
              <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4 bg-[#EFF7FF] p-4 rounded-xl border border-blue-100">
                <div className="w-14 h-14 rounded-full bg-[#1769E0] text-white font-bold flex items-center justify-center text-xl shadow-md">
                  {viewingStudent.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#102E56]">{viewingStudent.fullName}</h4>
                  <div className="text-xs text-blue-600 font-mono">{viewingStudent.code}</div>
                  <div className="text-xs text-slate-500">Lớp: {viewingStudent.className} • Năm học: 2026-2027</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Giới tính</span>
                  <span className="font-bold text-slate-700">{viewingStudent.gender}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Ngày sinh</span>
                  <span className="font-bold text-slate-700">{viewingStudent.dateOfBirth}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Số điện thoại</span>
                  <span className="font-bold text-slate-700">{viewingStudent.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Trạng thái</span>
                  <span className="font-bold text-emerald-600">{viewingStudent.status}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs">
                <span className="font-bold text-amber-900 block mb-1">Ghi chú của cô Thủy:</span>
                <p className="text-amber-800 leading-relaxed">
                  {viewingStudent.notes || 'Học sinh chăm ngoan, tích cực tham gia các tiết học Ngữ văn.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 bg-[#1769E0] text-white text-xs font-bold rounded-xl"
                >
                  Đóng hồ sơ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Transfer Class */}
      {transferringStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#102E56] mb-2 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-500" />
              Chuyển lớp học sinh
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Chuyển học sinh <span className="font-bold text-slate-800">{transferringStudent.fullName}</span> (Lớp hiện tại: {transferringStudent.className}) sang lớp mới:
            </p>

            <div className="space-y-2">
              {classes
                .filter((c) => c.id !== transferringStudent.classId)
                .map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => handleTransfer(cls.id)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#102E56]">Lớp {cls.name}</div>
                      <div className="text-xs text-slate-400">Khối {cls.grade} • Sĩ số: {cls.studentCount} HS</div>
                    </div>
                    <span className="text-xs font-bold text-[#1769E0]">Chuyển sang &rarr;</span>
                  </button>
                ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setTransferringStudent(null)}
                className="px-4 py-1.5 text-xs text-slate-500 hover:text-slate-700"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingStudentId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Xác nhận xóa học sinh</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Hành động này sẽ xóa vĩnh viễn thông tin và điểm số liên quan của học sinh khỏi hệ thống. Bạn có chắc chắn?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingStudentId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  deleteStudent(deletingStudentId);
                  setDeletingStudentId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import Excel Preview */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-[#102E56]">Xem trước dữ liệu nhập Excel</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 text-xs text-slate-500">
              Hệ thống đã nhận diện được <span className="font-bold text-emerald-600">{importPreviewData.length}</span> dòng hợp lệ.
              {importErrors.length > 0 && (
                <span className="text-rose-500 font-bold ml-2">({importErrors.length} dòng lỗi bị bỏ qua)</span>
              )}
            </div>

            {/* Preview table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Mã HS</th>
                    <th className="p-2.5">Họ và tên</th>
                    <th className="p-2.5">Giới tính</th>
                    <th className="p-2.5">Ngày sinh</th>
                    <th className="p-2.5">Lớp nhận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importPreviewData.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-mono text-[#1769E0] font-semibold">{row.code}</td>
                      <td className="p-2 font-bold text-slate-800">{row.fullName}</td>
                      <td className="p-2 text-slate-600">{row.gender}</td>
                      <td className="p-2 text-slate-600">{row.dateOfBirth}</td>
                      <td className="p-2 font-semibold text-blue-700">{row.className}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importErrors.length > 0 && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-600 max-h-24 overflow-y-auto">
                {importErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmImport}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Xác nhận nhập vào danh sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Class Management */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#102E56] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#1769E0]" />
                Danh sách lớp học đang giảng dạy
              </h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-3.5 rounded-xl border border-blue-100 bg-[#F9FBFF] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[#102E56]">Lớp {cls.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        Khối {cls.grade}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Sĩ số: <span className="font-bold text-slate-700">{cls.studentCount} HS</span> • {cls.room}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{cls.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="px-4 py-2 bg-[#1769E0] text-white text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
