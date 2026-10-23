import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Assignment, Submission, Question, QuestionType } from '../../types';
import confetti from 'canvas-confetti';
import {
  ClipboardCheck,
  Plus,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck,
  Award,
  ChevronRight,
  Send,
  Save,
  Eye,
  Trash2,
  X,
  HelpCircle,
  Edit3,
} from 'lucide-react';

export const AssignmentsExams: React.FC = () => {
  const {
    assignments,
    submissions,
    classes,
    currentUser,
    addAssignment,
    deleteAssignment,
    submitAssignment,
    gradeSubmission,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'take' | 'grade'>('list');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);

  // Taking exam state
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(45 * 60);

  // Teacher grading inputs
  const [teacherScore, setTeacherScore] = useState<number>(8.5);
  const [teacherFeedback, setTeacherFeedback] = useState<string>('');
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});

  // Filter
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredAssignments = assignments.filter((a) => {
    return selectedType === 'all' || a.type === selectedType;
  });

  // Start taking exam
  const handleStartExam = (assign: Assignment) => {
    setSelectedAssignment(assign);
    setAnswers({});
    setTimeRemaining(assign.durationMinutes * 60);
    setActiveTab('take');
  };

  // Student submits exam
  const handleSubmitExam = () => {
    if (!selectedAssignment) return;

    // Auto grading for objective questions
    let autoScore = 0;
    selectedAssignment.questions.forEach((q) => {
      if (q.type === 'multiple_choice') {
        if (answers[q.id] === q.correctOptionIndex) {
          autoScore += q.maxScore;
        }
      } else if (q.type === 'true_false') {
        if (answers[q.id] === q.correctBoolean) {
          autoScore += q.maxScore;
        }
      } else if (q.type === 'short_answer' && q.expectedKeywords) {
        const studentAns = (answers[q.id] || '').toString().toLowerCase().trim();
        const matched = q.expectedKeywords.some((kw) => studentAns.includes(kw.toLowerCase()));
        if (matched) {
          autoScore += q.maxScore;
        }
      }
    });

    const hasEssay = selectedAssignment.questions.some((q) =>
      ['reading', 'paragraph_essay', 'full_essay', 'appreciation'].includes(q.type)
    );

    const submissionData: Omit<Submission, 'id' | 'submittedAt'> = {
      assignmentId: selectedAssignment.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentCode: currentUser.studentCode || 'HDA-10A1-001',
      className: currentUser.className || '10A1',
      status: hasEssay ? 'Chờ chấm tự luận' : 'Đã chấm',
      answers,
      autoScore,
      totalScore: hasEssay ? undefined : autoScore,
    };

    submitAssignment(submissionData);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setActiveTab('list');
  };

  // Teacher save grade
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    gradeSubmission(gradingSubmission.id, Number(teacherScore), teacherFeedback, rubricScores);
    setGradingSubmission(null);
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#1769E0] rounded-xl">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#102E56]">
              Phân hệ 4: Bài tập & Đề kiểm tra trực tuyến
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Giao bài, làm bài trực tuyến, tự động chấm trắc nghiệm & hỗ trợ chấm tự luận theo Rubric
            </p>
          </div>
        </div>

        {currentUser.role === 'teacher' && activeTab === 'list' && (
          <button
            onClick={() => {
              showToast('Mở giao diện soạn đề kiểm tra mới với 7 định dạng câu hỏi', 'info');
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1769E0] hover:bg-[#1358BE] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo đề kiểm tra mới</span>
          </button>
        )}
      </div>

      {/* Main Tab: LIST */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'Kiểm tra thường xuyên', 'Luyện tập', 'Kiểm tra giữa kỳ', 'Kiểm tra cuối kỳ'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedType === t
                    ? 'bg-[#1769E0] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t === 'all' ? 'Tất cả dạng bài' : t}
              </button>
            ))}
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssignments.map((assign) => {
              // Check if current user already submitted
              const mySub = submissions.find(
                (s) => s.assignmentId === assign.id && s.studentId === currentUser.id
              );
              const totalSubs = submissions.filter((s) => s.assignmentId === assign.id).length;

              return (
                <div
                  key={assign.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1769E0] border border-blue-100">
                        {assign.type}
                      </span>
                      <span className="text-xs font-bold text-slate-500">Khối {assign.grade}</span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-[#102E56] line-clamp-2 leading-snug">
                      {assign.title}
                    </h3>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Thời gian: {assign.durationMinutes} phút</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hạn nộp: {new Date(assign.deadline).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Số lượng: {assign.questions.length} câu hỏi</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {currentUser.role === 'student' ? (
                      mySub ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            {mySub.status}
                          </span>
                          {mySub.totalScore !== undefined && (
                            <span className="text-sm font-bold text-[#1769E0] bg-blue-50 px-2 py-0.5 rounded">
                              Điểm: {mySub.totalScore.toFixed(1).replace('.', ',')}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartExam(assign)}
                          className="w-full py-2 bg-[#1769E0] hover:bg-[#1358BE] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span>Làm bài trực tuyến</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      // Teacher View
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-slate-500">
                          Đã nộp: <strong className="text-[#102E56]">{totalSubs} bài</strong>
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assign);
                              setActiveTab('grade');
                            }}
                            className="px-3 py-1.5 bg-[#EFF7FF] hover:bg-blue-100 text-[#1769E0] text-xs font-bold rounded-lg transition-colors"
                          >
                            Xem bài nộp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode: TAKE EXAM (Student) */}
      {activeTab === 'take' && selectedAssignment && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-[#1769E0] uppercase tracking-wider">
                {selectedAssignment.type} • Môn Ngữ văn THPT
              </span>
              <h3 className="text-xl font-bold text-[#102E56] mt-0.5">{selectedAssignment.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Thí sinh: {currentUser.name} • Lớp: {currentUser.className || '10A1'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl font-mono text-sm font-bold">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Thời gian: {selectedAssignment.durationMinutes}:00</span>
              </div>
              <button
                onClick={() => setActiveTab('list')}
                className="px-3 py-1.5 border border-slate-200 text-xs text-slate-500 rounded-xl hover:bg-slate-50"
              >
                Thoát
              </button>
            </div>
          </div>

          {/* Questions list */}
          <div className="space-y-6">
            {selectedAssignment.questions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-xl border border-slate-200 bg-[#FAFDFF] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#102E56] text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {q.type === 'multiple_choice' && 'Trắc nghiệm khách quan'}
                      {q.type === 'true_false' && 'Đúng / Sai'}
                      {q.type === 'short_answer' && 'Trả lời ngắn'}
                      {q.type === 'reading' && 'Đọc hiểu văn bản'}
                      {q.type === 'paragraph_essay' && 'Viết đoạn văn'}
                      {q.type === 'full_essay' && 'Viết bài văn nghị luận'}
                      {q.type === 'appreciation' && 'Bài cảm nhận tác phẩm'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#1769E0] bg-blue-50 px-2 py-0.5 rounded">
                    {q.maxScore} điểm
                  </span>
                </div>

                {/* Reading passage if applicable */}
                {q.readingPassage && (
                  <div className="p-4 bg-slate-50 border-l-4 border-[#1769E0] rounded-r-lg text-xs leading-relaxed italic text-slate-800 font-serif whitespace-pre-line">
                    {q.readingPassage}
                  </div>
                )}

                {/* Prompt */}
                <p className="text-sm font-bold text-[#102E56] leading-snug">{q.prompt}</p>

                {/* Input according to Question Type */}
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2 mt-2">
                    {q.options.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          answers[q.id] === optIdx
                            ? 'bg-blue-50 border-[#1769E0] font-semibold text-[#102E56]'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          checked={answers[q.id] === optIdx}
                          onChange={() => setAnswers({ ...answers, [q.id]: optIdx })}
                          className="w-4 h-4 text-[#1769E0]"
                        />
                        <span className="text-xs sm:text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'true_false' && (
                  <div className="flex gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setAnswers({ ...answers, [q.id]: true })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        answers[q.id] === true
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Đúng
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnswers({ ...answers, [q.id]: false })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        answers[q.id] === false
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Sai
                    </button>
                  </div>
                )}

                {['short_answer', 'reading'].includes(q.type) && (
                  <textarea
                    rows={3}
                    placeholder="Nhập câu trả lời ngắn của em..."
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:border-blue-400 focus:outline-hidden font-serif"
                  />
                )}

                {['paragraph_essay', 'full_essay', 'appreciation'].includes(q.type) && (
                  <div>
                    <textarea
                      rows={7}
                      placeholder="Trình bày bài làm cảm nhận / nghị luận của em tại đây (hành văn mạch lạc, có dẫn chứng)..."
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full p-3.5 border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:outline-hidden font-serif leading-relaxed"
                    />
                    <div className="mt-1 text-[11px] text-slate-400 flex justify-between">
                      <span>Số ký tự: {(answers[q.id] || '').length}</span>
                      <span>Hệ thống tự động lưu nháp</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => showToast('Bản nháp câu trả lời đã được lưu an toàn', 'info')}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              <Save className="w-4 h-4" />
              <span>Lưu nháp</span>
            </button>

            <button
              onClick={handleSubmitExam}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#1769E0] to-[#102E56] hover:brightness-110 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Nộp bài cho cô Thủy</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode: TEACHER GRADING SUBMISSIONS */}
      {activeTab === 'grade' && selectedAssignment && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-[#1769E0]">CHẤM BÀI HỌC SINH</span>
              <h3 className="text-lg font-bold text-[#102E56]">{selectedAssignment.title}</h3>
            </div>
            <button
              onClick={() => setActiveTab('list')}
              className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
            >
              Quay lại danh sách
            </button>
          </div>

          {/* Submissions list for this assignment */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-[#F8FBFF] border-b border-blue-100 font-bold text-[#102E56]">
                <tr>
                  <th className="p-3">Học sinh</th>
                  <th className="p-3">Mã HS</th>
                  <th className="p-3">Lớp</th>
                  <th className="p-3">Thời gian nộp</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-center">Điểm số</th>
                  <th className="p-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions
                  .filter((s) => s.assignmentId === selectedAssignment.id)
                  .map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#102E56]">{sub.studentName}</td>
                      <td className="p-3 font-mono text-slate-500">{sub.studentCode}</td>
                      <td className="p-3 font-semibold text-blue-600">{sub.className}</td>
                      <td className="p-3 text-slate-500">
                        {new Date(sub.submittedAt).toLocaleTimeString('vi-VN')} {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            sub.status === 'Đã chấm'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-[#1769E0]">
                        {sub.totalScore !== undefined
                          ? sub.totalScore.toFixed(1).replace('.', ',')
                          : 'Chờ chấm'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setGradingSubmission(sub);
                            setTeacherScore(sub.totalScore || 8.0);
                            setTeacherFeedback(sub.teacherFeedback || '');
                          }}
                          className="px-3 py-1 bg-[#1769E0] text-white text-xs font-bold rounded-lg hover:bg-[#1358BE]"
                        >
                          Chấm bài & Rubric
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Modal: Teacher Rubric Grading */}
          {gradingSubmission && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
              <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-[#102E56]">
                    Chấm bài: {gradingSubmission.studentName} ({gradingSubmission.className})
                  </h3>
                  <button onClick={() => setGradingSubmission(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="my-4 space-y-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-900">
                    <div className="font-bold">Điểm trắc nghiệm tự động: {gradingSubmission.autoScore || 0} điểm</div>
                    <div>Giáo viên xem bài làm tự luận của học sinh phía dưới để cho điểm tổng kết.</div>
                  </div>

                  {/* Student Answers Display */}
                  <div className="space-y-3">
                    {Object.entries(gradingSubmission.answers).map(([qid, val]) => (
                      <div key={qid} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                        <span className="font-bold text-[#102E56] block mb-1">Câu hỏi {qid}:</span>
                        <p className="text-slate-800 font-serif whitespace-pre-wrap">{String(val)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Teacher Input */}
                  <form onSubmit={handleSaveGrade} className="space-y-3 pt-3 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Điểm tổng kết bài làm (thang 10) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.25"
                        required
                        value={teacherScore}
                        onChange={(e) => setTeacherScore(Number(e.target.value))}
                        className="w-32 px-3 py-2 border border-slate-200 rounded-xl font-bold text-sm text-[#1769E0]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lời nhận xét sư phạm của cô Thủy
                      </label>
                      <textarea
                        rows={3}
                        value={teacherFeedback}
                        onChange={(e) => setTeacherFeedback(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-serif"
                        placeholder="Khen ngợi ưu điểm, nhắc nhở lỗi diễn đạt hoặc luận điểm cần bổ sung..."
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setGradingSubmission(null)}
                        className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl"
                      >
                        Đóng
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                      >
                        Lưu điểm & Công bố kết quả
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
