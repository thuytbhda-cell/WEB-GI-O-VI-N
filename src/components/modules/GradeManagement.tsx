import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentGrade, GradeFormulaConfig } from '../../types';
import * as XLSX from 'xlsx';
import {
  BarChart3,
  TrendingUp,
  Award,
  Filter,
  Download,
  UploadCloud,
  Search,
  Sliders,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  Eye,
  X,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';

export const GradeManagement: React.FC = () => {
  const {
    grades,
    classes,
    students,
    currentUser,
    selectedYear,
    setSelectedYear,
    selectedSemester,
    setSelectedSemester,
    formulaConfig,
    updateFormulaConfig,
    updateGradeRecord,
    importGrades,
    showToast,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedScoreRange, setSelectedScoreRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentGrade | null>(null);

  // Quick edit mode in table
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<StudentGrade>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute Official Semester Average strictly according to configured weights:
  // e.g. ( (TX1 + TX2 + TX3 + TX4)*txWeight + GK*gkWeight + CK*ckWeight ) / (totalWeights)
  // Only calculated if required components exist according to rules
  const calculateSemesterAverage = (record: StudentGrade): number | null => {
    if (!formulaConfig.useOfficialFormula) return null;

    const txScores = [record.tx1, record.tx2, record.tx3, record.tx4].filter(
      (v): v is number => typeof v === 'number' && !isNaN(v)
    );

    // If teacher hasn't entered at least 2 TX and GK, official score is not finalized
    if (txScores.length < 2 || record.gk === null || record.gk === undefined) {
      return null;
    }

    const txSum = txScores.reduce((sum, v) => sum + v, 0);
    const txCount = txScores.length;

    // Standard Vietnamese Circular 22/TT-BGDĐT:
    // ĐTB_mhk = (Tổng điểm TX + 2*GK + 3*CK) / (Số điểm TX + 2 + 3)
    if (record.ck !== null && record.ck !== undefined) {
      const numerator = txSum * formulaConfig.txWeight + record.gk * formulaConfig.gkWeight + record.ck * formulaConfig.ckWeight;
      const denominator = txCount * formulaConfig.txWeight + formulaConfig.gkWeight + formulaConfig.ckWeight;
      return Math.round((numerator / denominator) * 10) / 10;
    } else {
      // Temporary interim average before final semester exam
      const numerator = txSum * formulaConfig.txWeight + record.gk * formulaConfig.gkWeight;
      const denominator = txCount * formulaConfig.txWeight + formulaConfig.gkWeight;
      return Math.round((numerator / denominator) * 10) / 10;
    }
  };

  // Filtered grades list
  const filteredGrades = grades.filter((g) => {
    // If student role, they can ONLY see their own grade
    if (currentUser.role === 'student' && g.studentId !== currentUser.id && g.studentCode !== currentUser.studentCode) {
      return false;
    }

    const matchClass = selectedClassId === 'all' || g.classId === selectedClassId;
    const matchSearch =
      g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.className.toLowerCase().includes(searchQuery.toLowerCase());

    const avg = calculateSemesterAverage(g);
    let matchRange = true;
    if (selectedScoreRange === 'gioi') {
      matchRange = avg !== null && avg >= 8.0;
    } else if (selectedScoreRange === 'kha') {
      matchRange = avg !== null && avg >= 6.5 && avg < 8.0;
    } else if (selectedScoreRange === 'dat') {
      matchRange = avg !== null && avg >= 5.0 && avg < 6.5;
    } else if (selectedScoreRange === 'chuadat') {
      matchRange = avg !== null && avg < 5.0;
    }

    return matchClass && matchSearch && matchRange;
  });

  // Excel Export
  const handleExportExcel = () => {
    const rows = filteredGrades.map((g, idx) => {
      const avg = calculateSemesterAverage(g);
      return {
        STT: idx + 1,
        'Mã Học Sinh': g.studentCode,
        'Họ và Tên': g.fullName,
        Lớp: g.className,
        TX1: g.tx1 ?? '',
        TX2: g.tx2 ?? '',
        TX3: g.tx3 ?? '',
        TX4: g.tx4 ?? '',
        'ĐG Giữa Kỳ (GK)': g.gk ?? '',
        'ĐG Cuối Kỳ (CK)': g.ck ?? '',
        'ĐTB Môn Chính Thức': avg !== null ? avg.toFixed(1).replace('.', ',') : 'Chưa hoàn tất',
        'Điểm Luyện Tập Trực Tuyến': g.practiceScore ?? '',
        'Số Bài Luyện': g.practiceCount ?? 0,
        'Nhận Xét Giáo Viên': g.teacherNote || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SoDiemNguVan');
    XLSX.writeFile(wb, `So_Diem_Ngu_Van_Hoai_Duc_A_${selectedSemester}_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Đã xuất sổ điểm môn Ngữ văn thành công');
  };

  // Excel Import handler
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]) as any[];

        const parsed: Partial<StudentGrade>[] = [];
        data.forEach((row) => {
          const code = (row['Mã Học Sinh'] || row['Mã HS'] || row['studentCode'] || '').toString().trim();
          if (!code) return;

          parsed.push({
            studentCode: code,
            tx1: row['TX1'] !== undefined && row['TX1'] !== '' ? Number(row['TX1']) : undefined,
            tx2: row['TX2'] !== undefined && row['TX2'] !== '' ? Number(row['TX2']) : undefined,
            tx3: row['TX3'] !== undefined && row['TX3'] !== '' ? Number(row['TX3']) : undefined,
            tx4: row['TX4'] !== undefined && row['TX4'] !== '' ? Number(row['TX4']) : undefined,
            gk: row['ĐG Giữa Kỳ (GK)'] !== undefined && row['ĐG Giữa Kỳ (GK)'] !== '' ? Number(row['ĐG Giữa Kỳ (GK)']) : undefined,
            ck: row['ĐG Cuối Kỳ (CK)'] !== undefined && row['ĐG Cuối Kỳ (CK)'] !== '' ? Number(row['ĐG Cuối Kỳ (CK)']) : undefined,
            teacherNote: row['Nhận Xét Giáo Viên'] || undefined,
          });
        });

        importGrades(parsed);
      } catch (err: any) {
        showToast('Lỗi khi đọc file điểm Excel: ' + err.message, 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleStartEdit = (record: StudentGrade) => {
    setEditingRowId(record.id);
    setEditForm({
      tx1: record.tx1,
      tx2: record.tx2,
      tx3: record.tx3,
      tx4: record.tx4,
      gk: record.gk,
      ck: record.ck,
      teacherNote: record.teacherNote,
    });
  };

  const handleSaveEdit = (id: string) => {
    updateGradeRecord(id, editForm);
    setEditingRowId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#1769E0] rounded-xl">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#102E56]">
              Phân hệ 5: Quản lý kết quả học tập & Sổ điểm điện tử
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Phân định minh bạch giữa <strong className="text-[#1769E0]">Điểm luyện tập website</strong> và{' '}
              <strong className="text-[#102E56]">Điểm đánh giá chính thức</strong> theo TT 22-BGDĐT
            </p>
          </div>
        </div>

        {currentUser.role === 'teacher' && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleExcelImport}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F0F7FF] text-[#1769E0] hover:bg-blue-100 border border-blue-200 text-xs sm:text-sm font-bold rounded-xl transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Nhập điểm Excel</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F0F7FF] text-[#102E56] hover:bg-blue-100 border border-slate-200 text-xs sm:text-sm font-bold rounded-xl transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Xuất sổ điểm Excel</span>
            </button>

            <button
              onClick={() => setIsFormulaModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1769E0] hover:bg-[#1358BE] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              <Sliders className="w-4 h-4" />
              <span>Cấu hình công thức</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester */}
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value as any)}
            className="px-3 py-2 bg-[#EFF7FF] border border-blue-200 text-[#102E56] rounded-xl text-xs sm:text-sm font-semibold"
          >
            <option value="Học kỳ I">Học kỳ I (2026–2027)</option>
            <option value="Học kỳ II">Học kỳ II (2026–2027)</option>
          </select>

          {/* Class (if teacher) */}
          {currentUser.role === 'teacher' && (
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold"
            >
              <option value="all">Tất cả lớp giảng dạy</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} (Khối {c.grade})
                </option>
              ))}
            </select>
          )}

          {/* Score Range Filter */}
          <select
            value={selectedScoreRange}
            onChange={(e) => setSelectedScoreRange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold"
          >
            <option value="all">Tất cả mức điểm</option>
            <option value="gioi">Giỏi (Từ 8,0 trở lên)</option>
            <option value="kha">Khá (6,5 đến 7,9)</option>
            <option value="dat">Đạt (5,0 đến 6,4)</option>
            <option value="chuadat">Chưa đạt (Dưới 5,0)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã HS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-blue-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F6FAFF] border-b border-blue-100 text-[12px] font-bold text-[#102E56]">
                <th className="py-3 px-3 text-center w-10">STT</th>
                <th className="py-3 px-3">Mã HS</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-3 text-center">Lớp</th>
                <th className="py-3 px-2 text-center bg-blue-50/50">TX 1</th>
                <th className="py-3 px-2 text-center bg-blue-50/50">TX 2</th>
                <th className="py-3 px-2 text-center bg-blue-50/50">TX 3</th>
                <th className="py-3 px-2 text-center bg-blue-50/50">TX 4</th>
                <th className="py-3 px-3 text-center bg-indigo-50/50">Giữa kỳ</th>
                <th className="py-3 px-3 text-center bg-purple-50/50">Cuối kỳ</th>
                <th className="py-3 px-3 text-center bg-amber-50/60 text-amber-900">
                  Luyện tập Web
                </th>
                <th className="py-3 px-3 text-center bg-emerald-50 text-emerald-900">
                  ĐTB Chính thức
                </th>
                <th className="py-3 px-4">Nhận xét giáo viên</th>
                <th className="py-3 px-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredGrades.map((g, idx) => {
                const isEditing = editingRowId === g.id;
                const semAvg = calculateSemesterAverage(g);

                return (
                  <tr key={g.id} className="hover:bg-[#FBFDFF] transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#1769E0] text-xs">
                      {g.studentCode}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#102E56]">{g.fullName}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-[#102E56]">
                        {g.className}
                      </span>
                    </td>

                    {/* TX Columns */}
                    {['tx1', 'tx2', 'tx3', 'tx4'].map((txKey) => (
                      <td key={txKey} className="py-3 px-2 text-center bg-blue-50/30 font-medium">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            value={(editForm as any)[txKey] ?? ''}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                [txKey]: e.target.value === '' ? null : Number(e.target.value),
                              })
                            }
                            className="w-12 text-center border border-blue-300 rounded p-1 font-bold text-xs"
                          />
                        ) : (g as any)[txKey] !== null && (g as any)[txKey] !== undefined ? (
                          (g as any)[txKey].toFixed(1).replace('.', ',')
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    ))}

                    {/* GK */}
                    <td className="py-3 px-3 text-center bg-indigo-50/30 font-bold text-indigo-700">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={editForm.gk ?? ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, gk: e.target.value === '' ? null : Number(e.target.value) })
                          }
                          className="w-12 text-center border border-indigo-300 rounded p-1 font-bold text-xs"
                        />
                      ) : g.gk !== null && g.gk !== undefined ? (
                        g.gk.toFixed(1).replace('.', ',')
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* CK */}
                    <td className="py-3 px-3 text-center bg-purple-50/30 font-bold text-purple-700">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={editForm.ck ?? ''}
                          onChange={(e) =>
                            setEditForm({ ...editForm, ck: e.target.value === '' ? null : Number(e.target.value) })
                          }
                          className="w-12 text-center border border-purple-300 rounded p-1 font-bold text-xs"
                        />
                      ) : g.ck !== null && g.ck !== undefined ? (
                        g.ck.toFixed(1).replace('.', ',')
                      ) : (
                        <span className="text-slate-300 text-xs">Chưa thi</span>
                      )}
                    </td>

                    {/* Practice Score */}
                    <td className="py-3 px-3 text-center bg-amber-50/40 font-bold text-amber-800">
                      {g.practiceScore !== null && g.practiceScore !== undefined ? (
                        <div>
                          <span>{g.practiceScore.toFixed(1).replace('.', ',')}</span>
                          <span className="block text-[10px] text-amber-600 font-normal">
                            ({g.practiceCount || 0} bài)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Official Semester Average */}
                    <td className="py-3 px-3 text-center bg-emerald-50 font-bold text-emerald-800 text-sm">
                      {semAvg !== null ? (
                        semAvg.toFixed(1).replace('.', ',')
                      ) : (
                        <span className="text-[11px] text-slate-400 font-normal" title="Cần có đủ điểm TX và GK">
                          Chờ công bố
                        </span>
                      )}
                    </td>

                    {/* Teacher Note */}
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate font-serif">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.teacherNote ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, teacherNote: e.target.value })}
                          className="w-full border border-slate-300 rounded p-1 text-xs"
                        />
                      ) : (
                        g.teacherNote || '—'
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {currentUser.role === 'teacher' ? (
                        isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveEdit(g.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Lưu điểm"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingRowId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                              title="Hủy"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(g)}
                              className="p-1.5 text-slate-400 hover:text-[#1769E0] hover:bg-blue-50 rounded-lg"
                              title="Sửa điểm trực tiếp"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedStudentDetail(g)}
                              className="p-1.5 text-slate-400 hover:text-[#102E56] hover:bg-slate-100 rounded-lg"
                              title="Xem tiến độ cá nhân"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => setSelectedStudentDetail(g)}
                          className="px-2.5 py-1 text-xs font-bold bg-[#1769E0] text-white rounded-lg"
                        >
                          Xem chi tiết
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-[#F8FBFF] border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#1769E0] flex-shrink-0" />
            <span>
              Công thức ĐTB chính thức: (Tổng TX × {formulaConfig.txWeight} + GK × {formulaConfig.gkWeight} + CK × {formulaConfig.ckWeight}) ÷ Tổng hệ số.
            </span>
          </div>
          <div className="font-semibold text-slate-700">
            Tổng số học sinh: {filteredGrades.length}
          </div>
        </div>
      </div>

      {/* Modal: Student Detailed Progress View */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#1769E0]">TIẾN ĐỘ HỌC TẬP CÁ NHÂN</span>
                <h3 className="text-lg font-bold text-[#102E56]">{selectedStudentDetail.fullName}</h3>
                <div className="text-xs text-slate-400">
                  Mã: {selectedStudentDetail.studentCode} • Lớp: {selectedStudentDetail.className}
                </div>
              </div>
              <button onClick={() => setSelectedStudentDetail(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <span className="text-slate-500 block mb-1">Đánh giá thường xuyên (TX)</span>
                  <div className="flex items-center gap-2 font-bold text-[#102E56] text-sm">
                    <span>TX1: {selectedStudentDetail.tx1 ?? '—'}</span>
                    <span>TX2: {selectedStudentDetail.tx2 ?? '—'}</span>
                    <span>TX3: {selectedStudentDetail.tx3 ?? '—'}</span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                  <span className="text-slate-500 block mb-1">Đánh giá định kỳ</span>
                  <div className="font-bold text-indigo-900 text-sm">
                    GK: {selectedStudentDetail.gk ?? '—'} • CK: {selectedStudentDetail.ck ?? 'Chưa thi'}
                  </div>
                </div>
              </div>

              {/* Progress chart simulation */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Đồ thị tiến bộ qua các lần kiểm tra
                </div>
                <div className="h-28 flex items-end justify-between px-4 pt-2 border-b border-l border-slate-300">
                  {[
                    { label: 'TX1', val: selectedStudentDetail.tx1 || 7.0 },
                    { label: 'TX2', val: selectedStudentDetail.tx2 || 7.5 },
                    { label: 'TX3', val: selectedStudentDetail.tx3 || 8.0 },
                    { label: 'GK', val: selectedStudentDetail.gk || 8.5 },
                  ].map((pt, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-[#1769E0] mb-1">{pt.val}</span>
                      <div
                        style={{ height: `${(pt.val / 10) * 80}px` }}
                        className="w-6 bg-gradient-to-t from-[#1769E0] to-[#59A2FF] rounded-t"
                      ></div>
                      <span className="text-[10px] text-slate-500 mt-1">{pt.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teacher Assessment */}
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs">
                <span className="font-bold text-amber-900 block mb-1">Nhận xét & Định hướng cải thiện:</span>
                <p className="text-amber-900/90 font-serif leading-relaxed">
                  {selectedStudentDetail.teacherNote ||
                    'Học sinh có ý thức học tập tốt, kỹ năng giải quyết câu hỏi đọc hiểu chuẩn xác. Khuyến khích em mở rộng dẫn chứng đời sống để bài văn nghị luận thêm sinh động và sâu sắc.'}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="px-4 py-2 bg-[#1769E0] text-white text-xs font-bold rounded-xl"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Configure Formula */}
      {isFormulaModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#102E56] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#1769E0]" />
                Cấu hình công thức đánh giá môn học
              </h3>
              <button onClick={() => setIsFormulaModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useFormula"
                  checked={formulaConfig.useOfficialFormula}
                  onChange={(e) => updateFormulaConfig({ useOfficialFormula: e.target.checked })}
                  className="w-4 h-4 text-[#1769E0] rounded"
                />
                <label htmlFor="useFormula" className="font-bold text-slate-800 cursor-pointer">
                  Áp dụng công thức tính điểm trung bình chính thức
                </label>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl space-y-2 text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Hệ số đánh giá thường xuyên (TX):</span>
                  <span className="font-bold font-mono">× {formulaConfig.txWeight}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hệ số đánh giá giữa kỳ (GK):</span>
                  <span className="font-bold font-mono">× {formulaConfig.gkWeight}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hệ số đánh giá cuối kỳ (CK):</span>
                  <span className="font-bold font-mono">× {formulaConfig.ckWeight}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                * Quy định tuân thủ Thông tư 22/2021/TT-BGDĐT đối với trường THPT Hoài Đức A.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsFormulaModalOpen(false)}
                  className="px-4 py-2 bg-[#1769E0] text-white font-bold rounded-xl"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
