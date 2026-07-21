export type UserRole = "ADMIN" | "SCHOOL_ADMIN" | "TEACHER" | "STUDENT";

export type IssuedCredentials = {
  email: string;
  temporaryPassword: string;
  mustChangePassword: boolean;
};

export type User = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  schoolId?: string | null;
  gender?: string;
  dateOfBirth?: string | null;
  mustChangePassword?: boolean;
  status?: string;
  teacher?: Teacher | null;
  student?: Student | null;
  school?: School | null;
};

export type Teacher = {
  id: string;
  employeeNumber: string;
  department?: string | null;
  qualification?: string | null;
  bio?: string | null;
};

export type Student = {
  id: string;
  studentNumber: string;
  guardianName: string;
  guardianPhone?: string;
  guardianEmail?: string | null;
  emergencyContact?: string | null;
};

export type School = {
  id: string;
  name: string;
  code: string;
  email: string;
  phoneNumber?: string;
  website?: string | null;
  address?: string;
  city: string;
  province: string;
  country?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export type AdminUserSummary = {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender?: string | null;
  role: UserRole;
  status: string;
  schoolId?: string | null;
  mustChangePassword?: boolean;
  lastLogin?: string | null;
  createdAt: string;
  school?: { id: string; name: string; code: string } | null;
  teacher?: {
    id: string;
    employeeNumber: string;
    department?: string | null;
    qualification?: string | null;
  } | null;
  student?: {
    id: string;
    studentNumber: string;
    guardianName: string;
  } | null;
};

export type AdminUserDetail = AdminUserSummary & {
  dateOfBirth?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  updatedAt?: string;
  school?: School | null;
  teacher?:
    | (Teacher & {
        classTeachers?: Array<{
          class: {
            id: string;
            name: string;
            classCode: string;
            status: string;
            subject?: { name: string; code: string };
            _count?: { classStudents: number; assignments: number };
          };
        }>;
      })
    | null;
  student?:
    | (Student & {
        classStudents?: Array<{
          class: {
            id: string;
            name: string;
            classCode: string;
            status: string;
            subject?: { name: string; code: string };
          };
        }>;
        _count?: { submissions: number };
      })
    | null;
};

export type AdminSchoolDetail = School & {
  createdAt?: string;
  updatedAt?: string;
  _count: { users: number; classes: number };
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    status: string;
    createdAt: string;
    teacher?: { employeeNumber: string; department?: string | null } | null;
    student?: { studentNumber: string } | null;
  }>;
  classes: Array<{
    id: string;
    name: string;
    classCode: string;
    academicYear: number;
    semester: number;
    status: string;
    subject?: { id: string; name: string; code: string };
    _count: { classStudents: number; assignments: number };
  }>;
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isAssigned?: boolean;
};

export type ClassRoom = {
  id: string;
  name: string;
  description?: string | null;
  classCode: string;
  academicYear: number;
  semester: number;
  status: "ACTIVE" | "ARCHIVED";
  subject?: Subject;
  _count?: { classStudents: number; assignments: number };
  classTeachers?: Array<{
    teacher: {
      user: { firstName: string; lastName: string; email: string };
    };
  }>;
  classStudents?: Array<{
    student: {
      id?: string;
      studentNumber?: string;
      user: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
      };
    };
  }>;
};

export type SubjectDetail = Subject & {
  classes: Array<{
    id: string;
    name: string;
    classCode: string;
    academicYear: number;
    semester: number;
    status: string;
    _count: { classStudents: number; assignments: number };
  }>;
  students: Array<{
    id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    classes: Array<{ id: string; name: string }>;
  }>;
};

export type Assignment = {
  id: string;
  classId: string;
  title: string;
  description: string;
  instructions?: string | null;
  attachment?: string | null;
  dueDate: string;
  totalMarks: number;
  allowLateSubmission: boolean;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  class?: { id: string; name: string; classCode: string };
  _count?: { submissions: number };
  submissions?: Array<{
    id: string;
    status: string;
    submittedAt: string;
    score: number | null;
  }>;
};

export type Submission = {
  id: string;
  assignmentId: string;
  attachment: string;
  submittedAt: string;
  status: "PENDING" | "SUBMITTED" | "LATE" | "GRADED" | "MISSING";
  score?: number | null;
  feedback?: string | null;
  assignment?: {
    id: string;
    title: string;
    dueDate: string;
    totalMarks?: number;
    status?: string;
  };
  student?: {
    id: string;
    user: { firstName: string; lastName: string; email: string };
  };
};

export type AppNotification = {
  id: string;
  type:
    | "ASSIGNMENT_PUBLISHED"
    | "SUBMISSION_RECEIVED"
    | "SUBMISSION_GRADED"
    | "GENERAL";
  title: string;
  body: string;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type TeacherDashboard = {
  role: "TEACHER";
  profile: {
    employeeNumber: string;
    department?: string | null;
    qualification?: string | null;
    bio?: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  school: School | null;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
    description?: string | null;
    classCount: number;
  }>;
  classes: Array<{
    id: string;
    name: string;
    classCode: string;
    academicYear: number;
    semester: number;
    status: "ACTIVE" | "ARCHIVED";
    subject: Subject | null;
    classStudents?: Array<{
      student: {
        studentNumber: string;
        user: { firstName: string; lastName: string };
      };
    }>;
    _count: { classStudents: number; assignments: number };
  }>;
  totalSubjects: number;
  totalClasses: number;
  totalStudents: number;
  totalAssignments: number;
  pendingGrading: number;
  recentSubmissions: Submission[];
  upcomingDeadlines: Assignment[];
};

export type StudentDashboard = {
  role: UserRole;
  joinedClasses: number;
  activeAssignments: number;
  upcomingDeadlines: Assignment[];
  recentSubmissions: Submission[];
};

export type AdminDashboard = {
  role: "ADMIN";
  totalSchools: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  totalAssignments: number;
  pendingGrading: number;
  schools: Array<{
    id: string;
    name: string;
    code: string;
    email: string;
    city: string;
    province: string;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    _count: { users: number; classes: number };
  }>;
  recentTeachers: Array<{
    id: string;
    employeeNumber: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      school: { name: string } | null;
    };
  }>;
  recentSubmissions: Submission[];
  upcomingDeadlines: Assignment[];
};

export type SchoolAdminDashboard = {
  role: "SCHOOL_ADMIN";
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  school: School | null;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  totalAssignments: number;
  pendingGrading: number;
  recentTeachers: Array<{
    id: string;
    employeeNumber: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  recentStudents: Array<{
    id: string;
    studentNumber: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  upcomingDeadlines: Assignment[];
};

export type Dashboard =
  | AdminDashboard
  | SchoolAdminDashboard
  | TeacherDashboard
  | StudentDashboard;

export type ApiError = {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};
