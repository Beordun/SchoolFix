// app/portal/dashboard/types.ts
// Domain Types for SchoolFix Multi-Child Parent Portal

export interface SubjectAssessment {
  id: string;
  subject: string;
  caScore: number;     // max 40.00
  examScore: number;   // max 60.00
  totalScore: number;  // caScore + examScore
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  isPublished: boolean;
}

export interface PaymentTransaction {
  id: string;
  reference: string;
  amount: number;
  date: string;
  channel: 'ONLINE_CARD' | 'BANK_TRANSFER' | 'USSD';
  status: 'VERIFIED' | 'PENDING' | 'FAILED';
  receiptNumber?: string;
}

export interface ReportCardItem {
  id: string;
  term: string;
  session: string;
  isRestricted: boolean;
  outstandingBalance: number;
  overallAverage?: number;
  overallGrade?: string;
  classPosition?: string;
  attendanceDays: number;
  totalSchoolDays: number;
  teacherRemarks?: string;
}

export interface ChildProfile {
  id: string;
  admissionNum: string;
  fullName: string;
  classArm: string;
  session: string;
  term: string;
  expectedFees: number;
  verifiedPayments: number;
  outstandingBalance: number;
  attendancePercentage: number;
  academicAverage: number;
  academicGrade: string;
  recentActivity: Array<{
    id: string;
    type: 'PAYMENT' | 'ASSESSMENT' | 'ATTENDANCE';
    title: string;
    subtitle: string;
    date: string;
    badgeText?: string;
    badgeColor?: 'success' | 'warning' | 'primary';
  }>;
  subjects: SubjectAssessment[];
  transactions: PaymentTransaction[];
  reports: ReportCardItem[];
}
