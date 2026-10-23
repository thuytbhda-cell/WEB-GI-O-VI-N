export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  school: string;
  classId?: string;
  className?: string;
  studentCode?: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. 10A1, 10A2, 11A1, 12A1
  grade: 10 | 11 | 12;
  academicYear: string;
  studentCount: number;
  room: string;
  subject: string;
  description: string;
}

export interface Student {
  id: string;
  code: string; // e.g. HDA-10A1-001
  fullName: string;
  gender: 'Nam' | 'Nữ';
  dateOfBirth: string;
  classId: string;
  className: string;
  academicYear: string;
  status: 'Đang học' | 'Nghỉ học' | 'Chuyển lớp';
  email?: string;
  phone?: string;
  notes?: string;
}

export type LessonType =
  | 'Kế hoạch bài dạy'
  | 'Bài giảng PowerPoint'
  | 'Tài liệu Word'
  | 'Tài liệu PDF'
  | 'Video bài giảng'
  | 'Hình ảnh minh họa'
  | 'Sơ đồ tư duy'
  | 'Phiếu học tập'
  | 'Tài liệu ôn tập';

export interface LessonMaterial {
  id: string;
  title: string;
  grade: 10 | 11 | 12;
  topic: string;
  textbook: string; // e.g. 'Kết nối tri thức với cuộc sống'
  type: LessonType;
  description: string;
  author: string;
  downloadAllowed: boolean;
  sharedClasses: string[]; // class ids
  fileUrl?: string;
  videoUrl?: string;
  fileSize?: string;
  createdAt: string;
}

export type QuestionType =
  | 'multiple_choice' // Trắc nghiệm nhiều lựa chọn
  | 'true_false'      // Đúng - Sai
  | 'short_answer'    // Trả lời ngắn
  | 'reading'         // Đọc hiểu
  | 'paragraph_essay' // Viết đoạn văn
  | 'full_essay'      // Viết bài văn nghị luận
  | 'appreciation';   // Bài cảm nhận tác phẩm

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  readingPassage?: string; // Text snippet for reading comprehension
  options?: string[]; // For multiple choice
  correctOptionIndex?: number;
  correctBoolean?: boolean; // For true_false
  expectedKeywords?: string[]; // For short_answer
  rubricGuide?: string; // Guidance for essay grading
  maxScore: number;
}

export interface Assignment {
  id: string;
  title: string;
  grade: 10 | 11 | 12;
  classIds: string[];
  type: 'Luyện tập' | 'Kiểm tra thường xuyên' | 'Kiểm tra giữa kỳ' | 'Kiểm tra cuối kỳ';
  durationMinutes: number;
  deadline: string;
  maxAttempts: number;
  showAnswers: boolean;
  questions: Question[];
  createdAt: string;
  totalScore: number;
  isPublished: boolean;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  submittedAt: string;
  status: 'Đã chấm' | 'Chờ chấm tự luận' | 'Đã nộp';
  answers: Record<string, any>;
  autoScore?: number;
  manualScore?: number;
  totalScore?: number;
  teacherFeedback?: string;
  rubricScores?: Record<string, number>;
}

export interface StudentGrade {
  id: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  classId: string;
  className: string;
  academicYear: string;
  semester: 'Học kỳ I' | 'Học kỳ II';
  // Đánh giá thường xuyên (hệ số 1)
  tx1?: number | null;
  tx2?: number | null;
  tx3?: number | null;
  tx4?: number | null;
  // Đánh giá giữa kỳ (hệ số 2)
  gk?: number | null;
  // Đánh giá cuối kỳ (hệ số 3)
  ck?: number | null;
  // Điểm luyện tập trực tuyến trên website (riêng biệt với điểm chính thức)
  practiceScore?: number | null;
  practiceCount?: number;
  // Nhận xét giáo viên
  teacherNote?: string;
}

export interface GradeFormulaConfig {
  useOfficialFormula: boolean;
  txWeight: number; // usually 1
  gkWeight: number; // usually 2
  ckWeight: number; // usually 3
  requiredTxCount: number; // e.g. 3 or 4
}

export interface CreativeWork {
  id: string;
  title: string;
  category: 'Bài viết cảm nhận' | 'Bài thơ' | 'Truyện ngắn' | 'Giới thiệu sách' | 'Nhật ký đọc sách' | 'Sản phẩm học tập sáng tạo';
  authorName: string;
  studentCode: string;
  className: string;
  content: string;
  excerpt: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Nổi bật' | 'Bản nháp';
  teacherFeedback?: string;
  likes: number;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  date: string;
  isRead: boolean;
  targetClass?: string;
  priority: 'low' | 'normal' | 'high';
}
