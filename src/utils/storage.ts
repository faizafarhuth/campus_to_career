import {
  Internship,
  Candidate,
  TnpStudentTracking,
  ParsedResume,
  UserProfile,
  JobSeekerNotification,
  RejectionFeedback,
  GeminiVerificationReport,
} from '../types';
import { DEFAULT_INTERNSHIPS, DEFAULT_CANDIDATES, DEFAULT_TNP_TRACKING, DEFAULT_NOTIFICATIONS } from '../data/defaultData';

const STORAGE_KEYS = {
  INTERNSHIPS: 'c2c_internships_v1',
  CANDIDATES: 'c2c_candidates_v1',
  TNP_TRACKING: 'c2c_tnp_tracking_v1',
  USER_RESUME: 'c2c_user_resume_v1',
  USER_APPLICATIONS: 'c2c_user_applications_v1',
  ACTIVE_USER: 'c2c_active_user_v1',
  NOTIFICATIONS: 'c2c_notifications_v1',
};

export function getStoredActiveUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveActiveUser(user: UserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Error saving active user to localStorage', e);
  }
}


export function getStoredInternships(): Internship[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTERNSHIPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(DEFAULT_INTERNSHIPS));
      return DEFAULT_INTERNSHIPS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading internships from localStorage', e);
    return DEFAULT_INTERNSHIPS;
  }
}

export function saveInternships(internships: Internship[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(internships));
  } catch (e) {
    console.error('Error saving internships to localStorage', e);
  }
}

export function addInternship(internship: Internship): Internship[] {
  const existing = getStoredInternships();
  const updated = [internship, ...existing];
  saveInternships(updated);
  return updated;
}


export function getStoredCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(DEFAULT_CANDIDATES));
      return DEFAULT_CANDIDATES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading candidates from localStorage', e);
    return DEFAULT_CANDIDATES;
  }
}

export function saveCandidates(candidates: Candidate[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(candidates));
  } catch (e) {
    console.error('Error saving candidates to localStorage', e);
  }
}

export function getStoredTnpTracking(): TnpStudentTracking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TNP_TRACKING);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TNP_TRACKING, JSON.stringify(DEFAULT_TNP_TRACKING));
      return DEFAULT_TNP_TRACKING;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading T&P tracking from localStorage', e);
    return DEFAULT_TNP_TRACKING;
  }
}

export function saveTnpTracking(records: TnpStudentTracking[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TNP_TRACKING, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving T&P tracking to localStorage', e);
  }
}

export function getStoredUserResume(): ParsedResume | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_RESUME);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading user resume from localStorage', e);
    return null;
  }
}

export function saveUserResume(parsed: ParsedResume): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_RESUME, JSON.stringify(parsed));
  } catch (e) {
    console.error('Error saving user resume to localStorage', e);
  }
}

export function getAppliedInternshipIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_APPLICATIONS);
    if (!raw) {
      const initial = ['int-1', 'int-2', 'int-4'];
      localStorage.setItem(STORAGE_KEYS.USER_APPLICATIONS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return ['int-1', 'int-2', 'int-4'];
  }
}


export function recordUserApplication(
  internship: Internship,
  userResume?: ParsedResume | null,
  activeUser?: UserProfile | null
): { candidate: Candidate; tnpRecord: TnpStudentTracking } {
  const currentApplied = getAppliedInternshipIds();
  if (!currentApplied.includes(internship.id)) {
    localStorage.setItem(STORAGE_KEYS.USER_APPLICATIONS, JSON.stringify([...currentApplied, internship.id]));
  }

  const name = activeUser?.name || userResume?.student_name || 'Sai Tarun (You)';
  const college = activeUser?.college || userResume?.college || 'GVPCE Visakhapatnam';
  const rollNumber = activeUser?.rollNumber || `23VZG${Math.floor(1000 + Math.random() * 9000)}`;
  const branch = activeUser?.department || userResume?.branch || 'B.Tech CSE';
  const contactEmail = activeUser?.email || 'candidate.vizag@college.edu.in';
  const contactPhone = activeUser?.phone || '+91 98490 77123';
  const cgpa = userResume?.cgpa || '8.2';
  const skills = userResume?.hard_skills || ['Python', 'SQL', 'HTML', 'React'];
  const projects = userResume?.projects || [{ title: 'Inventory App', domain: 'Retail/SME' }];
  const readiness = userResume?.readiness_score || 'High';

  const newCandidate: Candidate = {
    id: `user-cand-${Date.now()}`,
    name,
    college,
    rollNumber,
    branch,
    year: '3rd Year (Pre-final)',
    cgpa,
    hard_skills: skills,
    projects,
    readiness_score: readiness,
    appliedInternshipId: internship.id,
    appliedRole: internship.role,
    appliedCompany: internship.company,
    status: 'Under Review',
    tnpVerified: true,
    nocIssued: false,
    contactEmail,
    contactPhone,
    applicationDate: new Date().toISOString().split('T')[0],
    summary: userResume?.summary || 'Candidate profile parsed via Campus to Career AI engine.',
    isUserSubmission: true,
    resumePdfName: userResume?.resumePdfName || 'sai_tarun_cse_gvpce_resume.pdf',
    resumePdfBase64: userResume?.resumePdfBase64,
    hasUploadedPdf: true,
    geminiVerified: false,
  };

  const existingCandidates = getStoredCandidates();
  const updatedCandidates = [newCandidate, ...existingCandidates];
  saveCandidates(updatedCandidates);

  const newTnp: TnpStudentTracking = {
    id: `tnp-${Date.now()}`,
    studentName: name,
    rollNumber: newCandidate.rollNumber,
    college,
    company: internship.company,
    role: internship.role,
    zone: internship.location,
    stipend: internship.stipend,
    status: 'Pending Review',
    appliedDate: newCandidate.applicationDate,
    attendanceHoursLogged: 0,
  };

  const existingTnp = getStoredTnpTracking();
  const updatedTnp = [newTnp, ...existingTnp];
  saveTnpTracking(updatedTnp);

  return { candidate: newCandidate, tnpRecord: newTnp };
}

export function getStoredNotifications(): JobSeekerNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading notifications from localStorage', e);
    return DEFAULT_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: JobSeekerNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving notifications to localStorage', e);
  }
}

export function addJobSeekerNotification(notification: JobSeekerNotification): JobSeekerNotification[] {
  const existing = getStoredNotifications();
  const updated = [notification, ...existing];
  saveNotifications(updated);
  return updated;
}

export function markNotificationAsRead(id: string): JobSeekerNotification[] {
  const existing = getStoredNotifications();
  const updated = existing.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
  return updated;
}

export function rejectCandidateWithFeedback(
  candidateId: string,
  feedback: RejectionFeedback
): { updatedCandidates: Candidate[]; notification: JobSeekerNotification } {
  const candidates = getStoredCandidates();
  let targetCandidate: Candidate | undefined;

  const updatedCandidates = candidates.map((cand) => {
    if (cand.id === candidateId) {
      targetCandidate = {
        ...cand,
        status: 'Rejected',
        rejectionFeedback: feedback,
      };
      return targetCandidate;
    }
    return cand;
  });

  saveCandidates(updatedCandidates);

  const notification: JobSeekerNotification = {
    id: `notif-${Date.now()}`,
    candidateId,
    studentEmail: targetCandidate?.contactEmail || 'student@vizagcollege.edu.in',
    studentName: targetCandidate?.name || 'Student Candidate',
    companyName: targetCandidate?.appliedCompany || 'SME Recruiter',
    roleTitle: targetCandidate?.appliedRole || 'Internship Candidate',
    internshipId: targetCandidate?.appliedInternshipId,
    type: 'rejection_with_feedback',
    subject: feedback.emailSubject,
    body: feedback.emailBody,
    skillsToImprove: feedback.skillsToImprove,
    feedbackNotes: feedback.feedbackNotes,
    sentAt: feedback.rejectedAt,
    read: false,
  };

  addJobSeekerNotification(notification);

  return { updatedCandidates, notification };
}

export function clearAllUserData(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_RESUME);
  localStorage.removeItem(STORAGE_KEYS.USER_APPLICATIONS);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
  localStorage.setItem(STORAGE_KEYS.INTERNSHIPS, JSON.stringify(DEFAULT_INTERNSHIPS));
  localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(DEFAULT_CANDIDATES));
  localStorage.setItem(STORAGE_KEYS.TNP_TRACKING, JSON.stringify(DEFAULT_TNP_TRACKING));
}

export function verifyCandidateResume(
  candidateId: string,
  report: GeminiVerificationReport
): Candidate[] {
  const candidates = getStoredCandidates();
  const updated = candidates.map((c) =>
    c.id === candidateId
      ? {
          ...c,
          geminiVerified: true,
          geminiVerificationReport: report,
        }
      : c
  );
  saveCandidates(updated);
  return updated;
}

