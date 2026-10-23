import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  SchoolClass,
  Student,
  LessonMaterial,
  Assignment,
  Submission,
  StudentGrade,
  GradeFormulaConfig,
  CreativeWork,
  NotificationItem,
} from '../types';
import {
  TEACHER_USER,
  STUDENT_USER,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_LESSONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_GRADES,
  INITIAL_CREATIVE_WORKS,
  INITIAL_NOTIFICATIONS,
  CURRENT_ACADEMIC_YEAR,
} from '../data/mockData';

export type NavItem =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'lessons'
  | 'assignments'
  | 'grades'
  | 'ai'
  | 'games'
  | 'creative'
  | 'notifications'
  | 'settings'
  | 'help';

interface AppContextType {
  // Navigation & User
  currentTab: NavItem;
  setCurrentTab: (tab: NavItem) => void;
  currentUser: User;
  switchRole: (role: UserRole) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedSemester: 'Học kỳ I' | 'Học kỳ II';
  setSelectedSemester: (sem: 'Học kỳ I' | 'Học kỳ II') => void;

  // Data Collections
  classes: SchoolClass[];
  students: Student[];
  lessons: LessonMaterial[];
  assignments: Assignment[];
  submissions: Submission[];
  grades: StudentGrade[];
  creativeWorks: CreativeWork[];
  notifications: NotificationItem[];
  formulaConfig: GradeFormulaConfig;

  // Class Actions
  addClass: (cls: Omit<SchoolClass, 'id'>) => void;
  updateClass: (id: string, cls: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;

  // Student Actions
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  importStudents: (students: Omit<Student, 'id'>[]) => { successCount: number; duplicateCount: number };

  // Lesson Actions
  addLesson: (lesson: Omit<LessonMaterial, 'id' | 'createdAt'>) => void;
  updateLesson: (id: string, lesson: Partial<LessonMaterial>) => void;
  deleteLesson: (id: string) => void;

  // Assignment Actions
  addAssignment: (assign: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, assign: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Submission & Grading Actions
  submitAssignment: (sub: Omit<Submission, 'id' | 'submittedAt'>) => void;
  gradeSubmission: (id: string, score: number, feedback: string, rubricScores?: Record<string, number>) => void;

  // Grade Actions
  updateGradeRecord: (id: string, record: Partial<StudentGrade>) => void;
  importGrades: (newGrades: Partial<StudentGrade>[]) => number;
  updateFormulaConfig: (cfg: Partial<GradeFormulaConfig>) => void;

  // Creative Works Actions
  addCreativeWork: (work: Omit<CreativeWork, 'id' | 'createdAt' | 'likes'>) => void;
  updateCreativeWorkStatus: (id: string, status: CreativeWork['status'], feedback?: string) => void;
  likeCreativeWork: (id: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // System Demo controls
  resetToDefaultData: () => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'VAN_HOC_CO_THUY_STATE_V1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [currentUser, setCurrentUser] = useState<User>(TEACHER_USER);
  const [selectedYear, setSelectedYear] = useState<string>(CURRENT_ACADEMIC_YEAR);
  const [selectedSemester, setSelectedSemester] = useState<'Học kỳ I' | 'Học kỳ II'>('Học kỳ I');

  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
      return saved ? JSON.parse(saved) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [lessons, setLessons] = useState<LessonMaterial[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_lessons`);
      return saved ? JSON.parse(saved) : INITIAL_LESSONS;
    } catch {
      return INITIAL_LESSONS;
    }
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_assignments`);
      return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
    } catch {
      return INITIAL_ASSIGNMENTS;
    }
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_submissions`);
      return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  const [grades, setGrades] = useState<StudentGrade[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_grades`);
      return saved ? JSON.parse(saved) : INITIAL_GRADES;
    } catch {
      return INITIAL_GRADES;
    }
  });

  const [creativeWorks, setCreativeWorks] = useState<CreativeWork[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_creative`);
      return saved ? JSON.parse(saved) : INITIAL_CREATIVE_WORKS;
    } catch {
      return INITIAL_CREATIVE_WORKS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [formulaConfig, setFormulaConfig] = useState<GradeFormulaConfig>({
    useOfficialFormula: true,
    txWeight: 1,
    gkWeight: 2,
    ckWeight: 3,
    requiredTxCount: 4,
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${STORAGE_KEY}_lessons`, JSON.stringify(lessons));
      localStorage.setItem(`${STORAGE_KEY}_assignments`, JSON.stringify(assignments));
      localStorage.setItem(`${STORAGE_KEY}_submissions`, JSON.stringify(submissions));
      localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(grades));
      localStorage.setItem(`${STORAGE_KEY}_creative`, JSON.stringify(creativeWorks));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [classes, students, lessons, assignments, submissions, grades, creativeWorks, notifications]);

  const switchRole = (role: UserRole) => {
    if (role === 'teacher') {
      setCurrentUser(TEACHER_USER);
      showToast('Đã chuyển sang vai trò: Giáo viên (Cô Thủy Nguyễn)', 'info');
    } else {
      setCurrentUser(STUDENT_USER);
      showToast('Đã chuyển sang vai trò: Học sinh (Trần Minh Tuấn - 10A1)', 'info');
    }
  };

  // Class actions
  const addClass = (cls: Omit<SchoolClass, 'id'>) => {
    const newClass: SchoolClass = {
      ...cls,
      id: `class-${Date.now()}`,
    };
    setClasses((prev) => [...prev, newClass]);
    showToast(`Đã tạo thành công lớp ${cls.name}`);
  };

  const updateClass = (id: string, updated: Partial<SchoolClass>) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('Đã cập nhật thông tin lớp học');
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    showToast('Đã xóa lớp học thành công', 'info');
  };

  // Student actions
  const addStudent = (stu: Omit<Student, 'id'>) => {
    const newStu: Student = {
      ...stu,
      id: `stu-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStu]);
    // update class student count
    setClasses((prev) =>
      prev.map((c) => (c.id === stu.classId ? { ...c, studentCount: c.studentCount + 1 } : c))
    );
    // add empty grade record
    const newGrade: StudentGrade = {
      id: `grd-${Date.now()}`,
      studentId: newStu.id,
      studentCode: newStu.code,
      fullName: newStu.fullName,
      classId: newStu.classId,
      className: newStu.className,
      academicYear: selectedYear,
      semester: selectedSemester,
      tx1: null,
      tx2: null,
      tx3: null,
      tx4: null,
      gk: null,
      ck: null,
      practiceScore: null,
      practiceCount: 0,
      teacherNote: '',
    };
    setGrades((prev) => [...prev, newGrade]);
    showToast(`Đã thêm học sinh: ${stu.fullName}`);
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    if (updated.fullName || updated.code || updated.className) {
      setGrades((prev) =>
        prev.map((g) =>
          g.studentId === id
            ? {
                ...g,
                fullName: updated.fullName ?? g.fullName,
                studentCode: updated.code ?? g.studentCode,
                className: updated.className ?? g.className,
              }
            : g
        )
      );
    }
    showToast('Đã cập nhật hồ sơ học sinh');
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    if (target) {
      setClasses((prev) =>
        prev.map((c) => (c.id === target.classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c))
      );
    }
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setGrades((prev) => prev.filter((g) => g.studentId !== id));
    showToast('Đã xóa học sinh khỏi danh sách', 'info');
  };

  const importStudents = (imported: Omit<Student, 'id'>[]) => {
    let successCount = 0;
    let duplicateCount = 0;
    const existingCodes = new Set(students.map((s) => s.code.trim().toUpperCase()));
    const validStudents: Student[] = [];
    const validGrades: StudentGrade[] = [];

    imported.forEach((item, idx) => {
      const codeKey = item.code.trim().toUpperCase();
      if (!codeKey || existingCodes.has(codeKey)) {
        duplicateCount++;
        return;
      }
      existingCodes.add(codeKey);
      const studentId = `stu-imp-${Date.now()}-${idx}`;
      const newStudent: Student = {
        ...item,
        id: studentId,
      };
      validStudents.push(newStudent);
      validGrades.push({
        id: `grd-imp-${Date.now()}-${idx}`,
        studentId: studentId,
        studentCode: newStudent.code,
        fullName: newStudent.fullName,
        classId: newStudent.classId,
        className: newStudent.className,
        academicYear: selectedYear,
        semester: selectedSemester,
        tx1: null,
        tx2: null,
        tx3: null,
        tx4: null,
        gk: null,
        ck: null,
        practiceScore: null,
        practiceCount: 0,
      });
      successCount++;
    });

    if (validStudents.length > 0) {
      setStudents((prev) => [...prev, ...validStudents]);
      setGrades((prev) => [...prev, ...validGrades]);
      // re-calculate class counts
      setClasses((prev) =>
        prev.map((c) => {
          const addedForClass = validStudents.filter((s) => s.classId === c.id).length;
          return { ...c, studentCount: c.studentCount + addedForClass };
        })
      );
      showToast(`Đã nhập thành công ${successCount} học sinh từ Excel`, 'success');
    } else {
      showToast(`Không có học sinh mới được thêm (${duplicateCount} mã bị trùng)`, 'error');
    }

    return { successCount, duplicateCount };
  };

  // Lesson actions
  const addLesson = (item: Omit<LessonMaterial, 'id' | 'createdAt'>) => {
    const newLesson: LessonMaterial = {
      ...item,
      id: `les-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLessons((prev) => [newLesson, ...prev]);
    showToast(`Đã thêm học liệu: ${item.title}`);
  };

  const updateLesson = (id: string, updated: Partial<LessonMaterial>) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
    showToast('Đã cập nhật thông tin học liệu');
  };

  const deleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    showToast('Đã xóa học liệu khỏi thư viện', 'info');
  };

  // Assignment actions
  const addAssignment = (assign: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAssign: Assignment = {
      ...assign,
      id: `assign-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAssignments((prev) => [newAssign, ...prev]);
    showToast(`Đã giao bài: ${assign.title}`);
  };

  const updateAssignment = (id: string, updated: Partial<Assignment>) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    showToast('Đã cập nhật bài tập / đề kiểm tra');
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    showToast('Đã xóa đề kiểm tra', 'info');
  };

  // Submission & Grading actions
  const submitAssignment = (sub: Omit<Submission, 'id' | 'submittedAt'>) => {
    const newSub: Submission = {
      ...sub,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    setSubmissions((prev) => [newSub, ...prev]);
    showToast('Bài nộp đã được gửi thành công đến cô Thủy!', 'success');
  };

  const gradeSubmission = (id: string, score: number, feedback: string, rubricScores?: Record<string, number>) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              totalScore: score,
              manualScore: score - (s.autoScore || 0),
              teacherFeedback: feedback,
              rubricScores: rubricScores || s.rubricScores,
              status: 'Đã chấm',
            }
          : s
      )
    );
    showToast('Đã chấm điểm và gửi phản hồi cho học sinh', 'success');
  };

  // Gradebook actions
  const updateGradeRecord = (id: string, updated: Partial<StudentGrade>) => {
    setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
    showToast('Đã lưu kết quả đánh giá');
  };

  const importGrades = (imported: Partial<StudentGrade>[]) => {
    let count = 0;
    setGrades((prev) => {
      const copy = [...prev];
      imported.forEach((row) => {
        if (!row.studentCode) return;
        const idx = copy.findIndex((g) => g.studentCode.trim().toUpperCase() === row.studentCode?.trim().toUpperCase());
        if (idx !== -1) {
          copy[idx] = { ...copy[idx], ...row };
          count++;
        }
      });
      return copy;
    });
    showToast(`Đã cập nhật điểm cho ${count} học sinh từ Excel`);
    return count;
  };

  const updateFormulaConfig = (cfg: Partial<GradeFormulaConfig>) => {
    setFormulaConfig((prev) => ({ ...prev, ...cfg }));
    showToast('Đã áp dụng cấu hình công thức đánh giá môn học');
  };

  // Creative corner actions
  const addCreativeWork = (work: Omit<CreativeWork, 'id' | 'createdAt' | 'likes'>) => {
    const newWork: CreativeWork = {
      ...work,
      id: `cr-${Date.now()}`,
      likes: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCreativeWorks((prev) => [newWork, ...prev]);
    showToast('Đã gửi tác phẩm sáng tạo thành công (Chờ cô duyệt)', 'success');
  };

  const updateCreativeWorkStatus = (id: string, status: CreativeWork['status'], feedback?: string) => {
    setCreativeWorks((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              status,
              teacherFeedback: feedback !== undefined ? feedback : w.teacherFeedback,
            }
          : w
      )
    );
    showToast(`Đã cập nhật trạng thái tác phẩm thành: ${status}`);
  };

  const likeCreativeWork = (id: string) => {
    setCreativeWorks((prev) => prev.map((w) => (w.id === id ? { ...w, likes: w.likes + 1 } : w)));
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Đã đánh dấu tất cả thông báo là đã đọc');
  };

  // Reset demo data
  const resetToDefaultData = () => {
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setLessons(INITIAL_LESSONS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setGrades(INITIAL_GRADES);
    setCreativeWorks(INITIAL_CREATIVE_WORKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.clear();
    showToast('Đã khôi phục dữ liệu mẫu ban đầu của trường THPT Hoài Đức A', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        currentUser,
        switchRole,
        selectedYear,
        setSelectedYear,
        selectedSemester,
        setSelectedSemester,
        classes,
        students,
        lessons,
        assignments,
        submissions,
        grades,
        creativeWorks,
        notifications,
        formulaConfig,
        addClass,
        updateClass,
        deleteClass,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        addLesson,
        updateLesson,
        deleteLesson,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignment,
        gradeSubmission,
        updateGradeRecord,
        importGrades,
        updateFormulaConfig,
        addCreativeWork,
        updateCreativeWorkStatus,
        likeCreativeWork,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToDefaultData,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
