import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Language,
  Internship,
  Candidate,
  TnpStudentTracking,
  ParsedResume,
  UserProfile,
  JobSeekerNotification,
  RejectionFeedback,
} from '../types';
import {
  getStoredInternships,
  getStoredCandidates,
  getStoredTnpTracking,
  getStoredUserResume,
  getAppliedInternshipIds,
  getStoredActiveUser,
  saveActiveUser,
  recordUserApplication,
  saveCandidates,
  saveTnpTracking,
  saveUserResume,
  clearAllUserData,
  addInternship as persistInternship,
  getStoredNotifications,
  markNotificationAsRead as persistMarkRead,
  rejectCandidateWithFeedback,
} from '../utils/storage';

export interface ApplicationRecord {
  id: string;
  internshipId: string;
  studentName?: string;
  studentEmail?: string;
  appliedDate?: string;
  status?: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language | ((prev: Language) => Language)) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  internships: Internship[];
  applications: ApplicationRecord[];
  applyToInternship: (internshipId: string) => void;
  parsedResume: ParsedResume | null;
  setParsedResume: (resume: ParsedResume | null) => void;
  isParserOpen: boolean;
  setIsParserOpen: (open: boolean) => void;
  isPostModalOpen: boolean;
  setIsPostModalOpen: (open: boolean) => void;
  isInboxModalOpen: boolean;
  setIsInboxModalOpen: (open: boolean) => void;
  selectedCluster: string;
  setSelectedCluster: (cluster: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getSkillMatchScore: (requiredSkills: string[]) => number | null;
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  tnpRecords: TnpStudentTracking[];
  setTnpRecords: React.Dispatch<React.SetStateAction<TnpStudentTracking[]>>;
  notifications: JobSeekerNotification[];
  markNotificationAsRead: (id: string) => void;
  approveNoc: (recordId: string) => void;
  rejectCandidate: (candidateId: string, feedback: RejectionFeedback) => void;
  postInternship: (internship: Internship) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [tnpRecords, setTnpRecords] = useState<TnpStudentTracking[]>([]);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [notifications, setNotifications] = useState<JobSeekerNotification[]>([]);
  const [isParserOpen, setIsParserOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<string>('All Clusters');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const user = getStoredActiveUser();
    const storedInternships = getStoredInternships();
    const storedCandidates = getStoredCandidates();
    const storedTnp = getStoredTnpTracking();
    const storedResume = getStoredUserResume();
    const appliedIds = getAppliedInternshipIds();
    const storedNotifs = getStoredNotifications();

    setCurrentUser(user);
    setInternships(storedInternships);
    setCandidates(storedCandidates);
    setTnpRecords(storedTnp);
    setParsedResume(storedResume);
    setNotifications(storedNotifs);

    // Build initial applications list from applied IDs + tracking
    const initialApps: ApplicationRecord[] = appliedIds.map((id, index) => {
      const matchTnp = storedTnp.find((t) => t.id === `tnp-${id}`);
      return {
        id: `app-${index}-${id}`,
        internshipId: id,
        studentName: matchTnp?.studentName || user?.name || storedResume?.student_name || 'Sai Tarun',
        studentEmail: user?.email || 'saitarun.cse@gvpce.ac.in',
        status: matchTnp?.status || 'Pending Review',
      };
    });
    setApplications(initialApps);
  }, []);

  const applyToInternship = useCallback(
    (internshipId: string) => {
      const targetInternship = internships.find((i) => i.id === internshipId);
      if (!targetInternship) return;

      const { candidate, tnpRecord } = recordUserApplication(
        targetInternship,
        parsedResume,
        currentUser
      );

      setCandidates((prev) => [candidate, ...prev]);
      setTnpRecords((prev) => [tnpRecord, ...prev]);

      const newApp: ApplicationRecord = {
        id: `app-${Date.now()}-${internshipId}`,
        internshipId,
        studentName: currentUser?.name || parsedResume?.student_name || 'Sai Tarun',
        studentEmail: currentUser?.email || 'saitarun.cse@gvpce.ac.in',
        status: 'Pending Review',
        appliedDate: new Date().toISOString(),
      };

      setApplications((prev) => {
        if (prev.some((a) => a.internshipId === internshipId)) return prev;
        return [newApp, ...prev];
      });
    },
    [internships, parsedResume, currentUser]
  );

  const getSkillMatchScore = useCallback(
    (requiredSkills: string[]): number | null => {
      if (!parsedResume || !parsedResume.hard_skills || parsedResume.hard_skills.length === 0) {
        return null;
      }

      const userSkills = new Set(parsedResume.hard_skills.map((s) => s.toLowerCase().trim()));
      let matchedCount = 0;
      requiredSkills.forEach((skill) => {
        const skillLower = skill.toLowerCase().trim();
        if (userSkills.has(skillLower) || Array.from(userSkills).some((us) => us.includes(skillLower) || skillLower.includes(us))) {
          matchedCount++;
        }
      });

      const total = Math.max(requiredSkills.length, 1);
      const ratio = matchedCount / total;
      let score = Math.round(ratio * 100);

      if (parsedResume.readiness_score === 'High') score = Math.min(99, score + 12);
      else if (parsedResume.readiness_score === 'Developing') score = Math.max(35, score - 8);

      return Math.max(40, Math.min(98, score));
    },
    [parsedResume]
  );

  const postInternship = useCallback((newInternship: Internship) => {
    persistInternship(newInternship);
    setInternships((prev) => [newInternship, ...prev]);
  }, []);

  const approveNoc = useCallback((recordId: string) => {
    const certCode = `NOC-VZG-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setTnpRecords((prev) => {
      const updated = prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'NOC Approved' as const,
              nocCode: certCode,
            }
          : r
      );
      saveTnpTracking(updated);
      return updated;
    });
  }, []);

  const rejectCandidate = useCallback((candidateId: string, feedback: RejectionFeedback) => {
    const { updatedCandidates, notification } = rejectCandidateWithFeedback(candidateId, feedback);
    setCandidates(updatedCandidates);
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    const updated = persistMarkRead(id);
    setNotifications(updated);
  }, []);

  const clearAllData = useCallback(() => {
    clearAllUserData();
    setCurrentUser(null);
    setInternships(getStoredInternships());
    setCandidates(getStoredCandidates());
    setTnpRecords(getStoredTnpTracking());
    setParsedResume(null);
    setApplications([]);
    setNotifications([]);
  }, []);

  const handleSetCurrentUser = useCallback((user: UserProfile | null) => {
    setCurrentUser(user);
    saveActiveUser(user);
  }, []);

  const handleSetParsedResume = useCallback((resume: ParsedResume | null) => {
    setParsedResume(resume);
    if (resume) saveUserResume(resume);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      internships,
      applications,
      applyToInternship,
      parsedResume,
      setParsedResume: handleSetParsedResume,
      isParserOpen,
      setIsParserOpen,
      isPostModalOpen,
      setIsPostModalOpen,
      isInboxModalOpen,
      setIsInboxModalOpen,
      selectedCluster,
      setSelectedCluster,
      searchQuery,
      setSearchQuery,
      getSkillMatchScore,
      candidates,
      setCandidates,
      tnpRecords,
      setTnpRecords,
      notifications,
      markNotificationAsRead,
      approveNoc,
      rejectCandidate,
      postInternship,
      clearAllData,
    }),
    [
      language,
      currentUser,
      internships,
      applications,
      applyToInternship,
      parsedResume,
      isParserOpen,
      isPostModalOpen,
      isInboxModalOpen,
      selectedCluster,
      searchQuery,
      getSkillMatchScore,
      candidates,
      tnpRecords,
      notifications,
      markNotificationAsRead,
      approveNoc,
      rejectCandidate,
      postInternship,
      clearAllData,
      handleSetCurrentUser,
      handleSetParsedResume,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
