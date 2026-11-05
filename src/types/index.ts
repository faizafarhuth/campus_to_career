export type Language = 'en' | 'te';

export type ReadinessScore = 'High' | 'Medium' | 'Developing';

export type VizagZone =
  | 'All Zones'
  | 'IT Corridor / Rushikonda'
  | 'Industrial Belt / Gajuwaka & Duvvada'
  | 'City Center / Siripuram & Dwaraka'
  | 'Port & Maritime / Harbor Park'
  | 'Steel Plant & Autonagar';

export interface Project {
  title: string;
  domain: string;
  description?: string;
}

export interface ParsedResume {
  hard_skills: string[];
  projects: Project[];
  readiness_score: ReadinessScore;
  student_name?: string;
  college?: string;
  college_and_degree?: string;
  branch?: string;
  cgpa?: string;
  summary?: string;
  recommended_vizag_roles?: string[];
  resumePdfName?: string;
  resumePdfBase64?: string;
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  location: string;
  zone: VizagZone;
  stipend: string;
  status: 'Active' | 'Closed';
  isSample: boolean;
  requiredSkills: string[];
  description: string;
  departmentTarget: string[];
  openings: number;
  postedDate: string;
  postedBy?: string;
  featured?: boolean;
  duration?: string;
  mode?: 'In-office' | 'Hybrid' | 'Remote' | string;
  aicteCode?: string;
}

export type CandidateStatus = 'Under Review' | 'Shortlisted' | 'Offer Extended' | 'Rejected';

export interface RejectionFeedback {
  rejectedAt: string;
  skillsToImprove: string[];
  feedbackNotes: string;
  emailSubject: string;
  emailBody: string;
  sentBy: string;
}

export interface JobSeekerNotification {
  id: string;
  candidateId: string;
  studentEmail: string;
  studentName: string;
  companyName: string;
  roleTitle: string;
  internshipId?: string;
  type: 'rejection_with_feedback' | 'interview_invite';
  subject: string;
  body: string;
  skillsToImprove: string[];
  feedbackNotes: string;
  sentAt: string;
  read: boolean;
}

export interface GeminiVerificationReport {
  verifiedAt: string;
  verifiedBy: string;
  confidenceScore: number;
  verdict: 'Verified Match' | 'Verified with Minor Gaps' | 'Flagged for Review';
  skillsVerified: string[];
  skillsUnverified: string[];
  experienceAuthenticity: string;
  academicValidation: string;
  suggestedInterviewQuestions: string[];
  summary: string;
  modelUsed: string;
}

export interface Candidate {
  id: string;
  name: string;
  college: string;
  rollNumber: string;
  branch: string;
  year: string;
  cgpa: string;
  hard_skills: string[];
  projects: Project[];
  readiness_score: ReadinessScore;
  appliedInternshipId?: string;
  appliedRole: string;
  appliedCompany: string;
  status: CandidateStatus;
  tnpVerified: boolean;
  nocIssued: boolean;
  contactEmail: string;
  contactPhone: string;
  applicationDate: string;
  summary?: string;
  isUserSubmission?: boolean;
  rejectionFeedback?: RejectionFeedback;
  resumePdfName?: string;
  resumePdfBase64?: string;
  hasUploadedPdf?: boolean;
  geminiVerified?: boolean;
  geminiVerificationReport?: GeminiVerificationReport;
}

export interface TnpStudentTracking {
  id: string;
  studentName: string;
  rollNumber: string;
  college: string;
  company: string;
  role: string;
  zone: string;
  stipend: string;
  status: 'NOC Approved' | 'Pending Review' | 'Under Evaluation' | 'Active Internship';
  appliedDate: string;
  nocCode?: string;
  attendanceHoursLogged: number;
}

export type UserRole = 'student' | 'sme' | 'tnp';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  college?: string;
  rollNumber?: string;
  companyName?: string;
  phone?: string;
  department?: string;
  designation?: string;
}

