/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { StudentHomeScreen } from './components/StudentHomeScreen';
import { SmeCandidateShortlistScreen } from './components/SmeCandidateShortlistScreen';
import { TnpComplianceDashboardScreen } from './components/TnpComplianceDashboardScreen';
import { AboutScreen } from './components/AboutScreen';
import { LoginPage } from './components/LoginPage';
import { ResumeParserModal } from './components/ResumeParserModal';
import { PostInternshipModal } from './components/PostInternshipModal';
import { StudentInboxModal } from './components/StudentInboxModal';
import {
  Language,
  Internship,
  Candidate,
  ParsedResume,
  UserProfile,
  GeminiVerificationReport,
} from './types';
import {
  saveActiveUser,
  saveCandidates,
  saveUserResume,
  verifyCandidateResume,
} from './utils/storage';

import { useApp } from './context/AppContext';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'student' | 'sme' | 'tnp' | 'about' | 'login'>('student');
  
  const {
    language: lang,
    setLanguage: setLang,
    currentUser: activeUser,
    setCurrentUser: setActiveUser,
    internships,
    candidates,
    setCandidates,
    tnpRecords,
    setTnpRecords,
    parsedResume: userResume,
    setParsedResume: setUserResume,
    notifications,
    markNotificationAsRead: handleMarkNotificationAsRead,
    approveNoc: handleApproveNoc,
    rejectCandidate: handleRejectCandidate,
    postInternship: handlePostInternship,
    applyToInternship,
    clearAllData: handleClearData,
    isParserOpen: isResumeModalOpen,
    setIsParserOpen: setIsResumeModalOpen,
    isPostModalOpen,
    setIsPostModalOpen,
    isInboxModalOpen,
    setIsInboxModalOpen,
    applications,
  } = useApp();

  const appliedInternshipIds = useMemo(() => {
    return Array.from(
      new Set(
        candidates
          .filter((c) => c.isUserSubmission || c.name.toLowerCase().includes('you'))
          .map((c) => c.appliedInternshipId)
          .filter(Boolean) as string[]
      )
    );
  }, [candidates]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'te' : 'en'));
  };

  const handleLogin = (user: UserProfile) => {
    setActiveUser(user);
    saveActiveUser(user);
  };

  const handleLogout = () => {
    setActiveUser(null);
    saveActiveUser(null);
  };

  const handleSaveParsedResume = (parsed: ParsedResume) => {
    setUserResume(parsed);
    saveUserResume(parsed);
  };

  const handleApplyInternship = (internship: Internship) => {
    applyToInternship(internship.id);
  };

  const handleUpdateCandidateStatus = (candidateId: string, newStatus: Candidate['status']) => {
    const updated = candidates.map((c) =>
      c.id === candidateId ? { ...c, status: newStatus } : c
    );
    setCandidates(updated);
    saveCandidates(updated);
  };

  const handleVerifyCandidate = (candidateId: string, report: GeminiVerificationReport) => {
    const updated = verifyCandidateResume(candidateId, report);
    setCandidates(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
        onClearData={handleClearData}
        activeUser={activeUser}
        onLogout={handleLogout}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        unreadNotificationCount={notifications.filter((n) => !n.read).length}
        onOpenInbox={() => setIsInboxModalOpen(true)}
      />

      {/* Screen Render */}
      <main className="flex-1">
        {currentScreen === 'student' && (
          <StudentHomeScreen
            internships={internships}
            userResume={userResume}
            appliedInternshipIds={appliedInternshipIds}
            lang={lang}
            onOpenResumeModal={() => setIsResumeModalOpen(true)}
            onApplyInternship={handleApplyInternship}
            activeUser={activeUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onNavigateLogin={() => setCurrentScreen('login')}
            notifications={notifications}
            onOpenInbox={() => setIsInboxModalOpen(true)}
          />
        )}

        {currentScreen === 'sme' && (
          <SmeCandidateShortlistScreen
            candidates={candidates}
            internships={internships}
            lang={lang}
            onUpdateStatus={handleUpdateCandidateStatus}
            onOpenResumeModal={() => setIsResumeModalOpen(true)}
            onOpenPostModal={() => setIsPostModalOpen(true)}
            onRejectCandidate={handleRejectCandidate}
            onVerifyCandidate={handleVerifyCandidate}
            activeUser={activeUser}
          />
        )}

        {currentScreen === 'tnp' && (
          <TnpComplianceDashboardScreen
            trackingRecords={tnpRecords}
            lang={lang}
            onApproveNoc={handleApproveNoc}
            onOpenResumeModal={() => setIsResumeModalOpen(true)}
          />
        )}

        {currentScreen === 'about' && (
          <AboutScreen
            lang={lang}
            onClearData={handleClearData}
            onOpenResumeModal={() => setIsResumeModalOpen(true)}
          />
        )}

        {currentScreen === 'login' && (
          <LoginPage
            activeUser={activeUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            lang={lang}
            onNavigateScreen={setCurrentScreen}
          />
        )}
      </main>

      {/* AI Resume Skill-Parser Modal */}
      <ResumeParserModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        lang={lang}
        onSaveParsedResume={handleSaveParsedResume}
      />

      {/* SME Post Internship Availability Modal */}
      <PostInternshipModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostInternship={handlePostInternship}
        lang={lang}
        activeUser={activeUser}
      />

      {/* Job Seeker / Student Feedback Inbox Modal */}
      <StudentInboxModal
        isOpen={isInboxModalOpen}
        onClose={() => setIsInboxModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onOpenResumeModal={() => setIsResumeModalOpen(true)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Campus to Career</span>
            <span>• Visakhapatnam College-Industry Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Built by Team Fusion</span>
            <span>•</span>
            <span>Vizag, Andhra Pradesh</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
