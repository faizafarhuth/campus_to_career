import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  Mail,
  Phone,
  Sparkles,
  ShieldCheck,
  Award,
  GraduationCap,
  Calendar,
  Clock,
  Send,
  X,
  CheckCircle,
  Copy,
  ChevronDown,
  UserX,
  XCircle,
  AlertCircle,
  CheckCircle2,
  Trophy,
  ArrowRight,
  TrendingUp,
  Percent,
  Star,
  Check,
  Plus,
  Briefcase,
  Building,
  FileText,
} from 'lucide-react';
import {
  Candidate,
  Language,
  ReadinessScore,
  Internship,
  UserProfile,
  RejectionFeedback,
  GeminiVerificationReport,
} from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { calculateCandidateCompatibility, CandidateMatchResult } from '../utils/matching';
import { RejectionFeedbackModal } from './RejectionFeedbackModal';
import { GeminiResumeVerificationModal } from './GeminiResumeVerificationModal';

interface SmeCandidateShortlistScreenProps {
  candidates: Candidate[];
  internships: Internship[];
  lang: Language;
  onUpdateStatus: (candidateId: string, newStatus: Candidate['status']) => void;
  onOpenResumeModal: () => void;
  onOpenPostModal: () => void;
  onRejectCandidate?: (candidateId: string, feedback: RejectionFeedback) => void;
  onVerifyCandidate?: (candidateId: string, report: GeminiVerificationReport) => void;
  activeUser: UserProfile | null;
}

type SortOption = 'match_desc' | 'readiness' | 'cgpa_desc' | 'name_asc';

interface CandidateWithMatch extends Candidate {
  match: CandidateMatchResult;
}

export const SmeCandidateShortlistScreen: React.FC<SmeCandidateShortlistScreenProps> = ({
  candidates,
  internships,
  lang,
  onUpdateStatus,
  onOpenResumeModal,
  onOpenPostModal,
  onRejectCandidate,
  onVerifyCandidate,
  activeUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReadiness, setFilterReadiness] = useState<string>('All');
  const [filterCollege, setFilterCollege] = useState<string>('All');
  const [filterInternshipRole, setFilterInternshipRole] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('match_desc');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [activeContactCandidate, setActiveContactCandidate] = useState<Candidate | null>(null);
  const [rejectionCandidate, setRejectionCandidate] = useState<Candidate | null>(null);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [verifyingCandidate, setVerifyingCandidate] = useState<Candidate | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const candidateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const showToast = (message: string) => {
    setActionToast(message);
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleOpenVerification = (candidate: Candidate) => {
    setVerifyingCandidate(candidate);
    setIsVerificationModalOpen(true);
  };

  const handleSaveVerification = (candidateId: string, report: GeminiVerificationReport) => {
    if (onVerifyCandidate) {
      onVerifyCandidate(candidateId, report);
    }
    showToast(`Gemini verification audit completed for ${verifyingCandidate?.name || 'candidate'}!`);
  };

  const handleShortlistFromVerification = (candidateId: string) => {
    onUpdateStatus(candidateId, 'Shortlisted');
    showToast(`Candidate shortlisted!`);
  };

  const handleStatusChange = (candidate: Candidate, newStatus: Candidate['status']) => {
    if (newStatus === 'Rejected') {
      setRejectionCandidate(candidate);
      setIsRejectionModalOpen(true);
    } else {
      onUpdateStatus(candidate.id, newStatus);
      showToast(`Status for ${candidate.name} updated to "${newStatus}"!`);
    }
  };

  const handleOpenRejection = (candidate: Candidate) => {
    setRejectionCandidate(candidate);
    setIsRejectionModalOpen(true);
  };

  const handleConfirmRejection = (candidateId: string, feedback: RejectionFeedback) => {
    if (onRejectCandidate) {
      onRejectCandidate(candidateId, feedback);
    } else {
      onUpdateStatus(candidateId, 'Rejected');
    }
    showToast('Rejection email with skills improvement sent to candidate.');
  };

  const t = TRANSLATIONS[lang];

  // Unique posted roles
  const availableRoles = useMemo(() => {
    const list = Array.from(new Set(internships.map((i) => `${i.role} (${i.company})`)));
    return ['All', ...list];
  }, [internships]);

  // Selected target internship object if a role is filtered
  const targetInternshipForRole = useMemo(() => {
    if (filterInternshipRole === 'All') return null;
    return (
      internships.find((i) => `${i.role} (${i.company})` === filterInternshipRole) ||
      internships.find((i) => filterInternshipRole.includes(i.role)) ||
      null
    );
  }, [internships, filterInternshipRole]);

  // Colleges list
  const collegeOptions = useMemo(() => {
    const list = Array.from(new Set(candidates.map((c) => c.college)));
    return ['All', ...list];
  }, [candidates]);

  // Calculate skill match percentage for ALL candidates and attach to candidate object
  const candidatesWithMatch = useMemo<CandidateWithMatch[]>(() => {
    return candidates.map((cand) => {
      // If a specific role is selected in the filter, compare candidate against that role's required skills
      // Otherwise, match against the internship they applied to
      let targetJob = targetInternshipForRole;
      if (!targetJob) {
        targetJob =
          internships.find((i) => i.id === cand.appliedInternshipId) ||
          internships.find((i) => i.role.toLowerCase() === cand.appliedRole.toLowerCase()) ||
          null;
      }

      const match = calculateCandidateCompatibility(cand, targetJob);
      return {
        ...cand,
        match,
      };
    });
  }, [candidates, internships, targetInternshipForRole]);

  // Filter & Sort Candidates
  const filteredCandidates = useMemo(() => {
    return candidatesWithMatch
      .filter((c) => {
        const matchReadiness = filterReadiness === 'All' || c.readiness_score === filterReadiness;
        const matchCollege = filterCollege === 'All' || c.college === filterCollege;
        const matchRole =
          filterInternshipRole === 'All' ||
          filterInternshipRole.includes(c.appliedRole) ||
          (targetInternshipForRole && c.appliedInternshipId === targetInternshipForRole.id);
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.appliedRole.toLowerCase().includes(q) ||
          c.appliedCompany.toLowerCase().includes(q) ||
          c.college.toLowerCase().includes(q) ||
          c.hard_skills.some((s) => s.toLowerCase().includes(q));
        return matchReadiness && matchCollege && matchRole && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'match_desc') {
          // Highest percentage first!
          if (b.match.percentage !== a.match.percentage) {
            return b.match.percentage - a.match.percentage;
          }
          // Secondary: Readiness score weight
          const scoreWeight = { High: 3, Medium: 2, Developing: 1 };
          return scoreWeight[b.readiness_score] - scoreWeight[a.readiness_score];
        }
        if (sortBy === 'readiness') {
          const scoreWeight = { High: 3, Medium: 2, Developing: 1 };
          return scoreWeight[b.readiness_score] - scoreWeight[a.readiness_score];
        }
        if (sortBy === 'cgpa_desc') {
          return parseFloat(b.cgpa || '0') - parseFloat(a.cgpa || '0');
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [candidatesWithMatch, filterReadiness, filterCollege, filterInternshipRole, targetInternshipForRole, searchQuery, sortBy]);

  // Identify the candidate with the highest percentage match among current filtered candidates
  const highestMatchCandidate = useMemo(() => {
    if (filteredCandidates.length === 0) return null;
    return filteredCandidates.reduce((prev, curr) => {
      return curr.match.percentage > prev.match.percentage ? curr : prev;
    }, filteredCandidates[0]);
  }, [filteredCandidates]);

  // Selected candidate object (if any is active)
  const activeSelectedCandidate = useMemo(() => {
    if (!selectedCandidateId) return null;
    return candidatesWithMatch.find((c) => c.id === selectedCandidateId) || null;
  }, [candidatesWithMatch, selectedCandidateId]);

  // Action: SME selects the candidate with the highest percentage based on skills
  const handleSelectHighestMatchCandidate = () => {
    if (!highestMatchCandidate) return;
    setSelectedCandidateId(highestMatchCandidate.id);
    showToast(`Selected #${highestMatchCandidate.name} as highest skill match (${highestMatchCandidate.match.percentage}%)!`);

    // Smooth scroll to card
    const elem = candidateRefs.current[highestMatchCandidate.id];
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // 1-Click Shortlist the Highest Match
  const handleShortlistHighestMatch = () => {
    if (!highestMatchCandidate) return;
    onUpdateStatus(highestMatchCandidate.id, 'Shortlisted');
    setSelectedCandidateId(highestMatchCandidate.id);
    showToast(`✓ ${highestMatchCandidate.name} has been Shortlisted as the top candidate (${highestMatchCandidate.match.percentage}% match)!`);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSendInterviewInvite = () => {
    setInvitationSent(true);
    setTimeout(() => {
      setInvitationSent(false);
      setActiveContactCandidate(null);
      showToast('Interview invitation dispatched and T&P cell notified.');
    }, 2000);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (percentage >= 70) return 'text-teal-700 bg-teal-50 border-teal-300';
    if (percentage >= 50) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-emerald-500';
    if (percentage >= 70) return 'bg-teal-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-rose-400';
  };

  const readinessBadge = (score: ReadinessScore) => {
    switch (score) {
      case 'High':
        return 'bg-emerald-500/10 text-emerald-800 border-emerald-300';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-500/10 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{actionToast}</span>
          <button onClick={() => setActionToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Title and CTAs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.shortlistTitle}
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Skill Match Enabled</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t.shortlistSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Direct Button: Select Highest Match */}
          {highestMatchCandidate && (
            <button
              type="button"
              onClick={handleSelectHighestMatchCandidate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer group"
            >
              <Trophy className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>Select Highest Match ({highestMatchCandidate.match.percentage}%)</span>
            </button>
          )}

          {/* Post New Internship Button */}
          <button
            onClick={onOpenPostModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Post Internship</span>
          </button>

          <button
            onClick={onOpenResumeModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Screen Candidate</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* HIGHEST SKILL MATCH SPOTLIGHT BANNER                    */}
      {/* ======================================================== */}
      {highestMatchCandidate && (
        <section aria-label="Highest Skill Match Candidate" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 text-white border-2 border-emerald-500/40 p-5 sm:p-6 shadow-xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs uppercase tracking-wide">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>#1 Highest Skill Match for Role</span>
                </span>
                <span className="text-xs text-emerald-300 font-semibold">
                  Role: <strong>{highestMatchCandidate.match.targetRole}</strong>
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>{highestMatchCandidate.name}</span>
                  <span className="text-sm font-semibold text-slate-300">
                    ({highestMatchCandidate.college})
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  Matched <strong>{highestMatchCandidate.match.matchedSkills.length}</strong> of{' '}
                  {highestMatchCandidate.match.matchedSkills.length + highestMatchCandidate.match.missingSkills.length} required skills with{' '}
                  <strong className="text-emerald-400">{highestMatchCandidate.readiness_score} Institutional Readiness</strong>.
                </p>
              </div>

              {/* Skill Match badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-slate-400 font-semibold mr-1">Matched Skills:</span>
                {highestMatchCandidate.match.matchedSkills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    {skill}
                  </span>
                ))}
                {highestMatchCandidate.match.missingSkills.length > 0 && (
                  <span className="text-xs text-slate-400 ml-1">
                    (+{highestMatchCandidate.match.missingSkills.length} skills to strengthen)
                  </span>
                )}
              </div>
            </div>

            {/* Score & Direct Selection Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
              <div className="text-center sm:text-right">
                <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                  Skill Match Score
                </div>
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 tabular-nums flex items-baseline justify-end gap-1 mt-0.5">
                  <span>{highestMatchCandidate.match.percentage}</span>
                  <span className="text-2xl text-emerald-300 font-bold">%</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {highestMatchCandidate.match.fitLabel}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {highestMatchCandidate.geminiVerified ? (
                  <button
                    type="button"
                    onClick={() => handleOpenVerification(highestMatchCandidate)}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gemini Verified ({highestMatchCandidate.geminiVerificationReport?.confidenceScore || 94}%)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenVerification(highestMatchCandidate)}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Verify with Gemini</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSelectHighestMatchCandidate}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Select Top Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={handleShortlistHighestMatch}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1-Click Shortlist</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SME Openings & Applicant Stats Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white">
                {activeUser?.companyName || 'Visakhapatnam Local Enterprises'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold uppercase">
                Active Hiring Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Candidate skill percentages are calculated against required technology competencies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-center border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
          <div>
            <span className="text-2xl font-black text-white">{internships.length}</span>
            <span className="text-[11px] text-slate-400 block font-medium">Active Openings</span>
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-400">{candidates.length}</span>
            <span className="text-[11px] text-slate-400 block font-medium">Applicants Ranked</span>
          </div>
          <div>
            <span className="text-2xl font-black text-amber-400">
              {highestMatchCandidate ? `${highestMatchCandidate.match.percentage}%` : '—'}
            </span>
            <span className="text-[11px] text-slate-400 block font-medium">Top Skill Match</span>
          </div>
          <div>
            <span className="text-2xl font-black text-blue-400">
              {candidates.filter((c) => c.status === 'Shortlisted' || c.status === 'Offer Extended').length}
            </span>
            <span className="text-[11px] text-slate-400 block font-medium">Shortlisted</span>
          </div>
        </div>
      </div>

      {/* Search, Role Selection & Skill Sort Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate or tech skill..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
            />
          </div>

          {/* Filter by Specific Posted Internship */}
          <div>
            <label className="sr-only">Target Job Role</label>
            <select
              value={filterInternshipRole}
              onChange={(e) => setFilterInternshipRole(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white text-slate-800 truncate font-semibold"
            >
              <option value="All">All Posted Openings ({internships.length})</option>
              {availableRoles
                .filter((r) => r !== 'All')
                .map((roleStr) => (
                  <option key={roleStr} value={roleStr}>
                    {roleStr.length > 28 ? roleStr.slice(0, 28) + '...' : roleStr}
                  </option>
                ))}
            </select>
          </div>

          {/* Sort By Dropdown (Featuring Skill Match % First!) */}
          <div>
            <label className="sr-only">Sort Candidates</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-emerald-400 bg-emerald-50/50 font-bold text-emerald-950 focus:bg-white"
            >
              <option value="match_desc">⚡ Highest Skill Match % (Top First)</option>
              <option value="readiness">★ Readiness Score (High to Low)</option>
              <option value="cgpa_desc">📊 CGPA (High to Low)</option>
              <option value="name_asc">🔤 Candidate Name (A to Z)</option>
            </select>
          </div>

          {/* Readiness Filter */}
          <div>
            <label className="sr-only">Filter Readiness</label>
            <select
              value={filterReadiness}
              onChange={(e) => setFilterReadiness(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white text-slate-800"
            >
              <option value="All">{t.allReadiness}</option>
              <option value="High">{t.highReadiness}</option>
              <option value="Medium">{t.mediumReadiness}</option>
              <option value="Developing">{t.developingReadiness}</option>
            </select>
          </div>

          {/* College Filter */}
          <div>
            <label className="sr-only">Filter College</label>
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-300 bg-slate-50/50 focus:bg-white text-slate-800 truncate"
            >
              <option value="All">All Vizag Institutions</option>
              {collegeOptions
                .filter((c) => c !== 'All')
                .map((college) => (
                  <option key={college} value={college}>
                    {college.length > 24 ? college.slice(0, 24) + '...' : college}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Action Row with Select Highest Match Quick Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong>{filteredCandidates.length}</strong> applicants with skill match percentages.
            </span>
            {targetInternshipForRole && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Target: {targetInternshipForRole.role}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {highestMatchCandidate && (
              <button
                type="button"
                onClick={handleSelectHighestMatchCandidate}
                className="text-xs font-bold text-slate-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-700" />
                <span>Select {highestMatchCandidate.name} ({highestMatchCandidate.match.percentage}%)</span>
              </button>
            )}

            <button
              onClick={onOpenPostModal}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Opening</span>
            </button>
          </div>
        </div>
      </div>

      {/* Candidates List with Prominent Skill Match Percentage on Every Card */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {t.emptyCandidates}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your readiness score filter, or click "AI Screen New Candidate" to parse a resume and add it directly.
          </p>
          <button
            onClick={() => {
              setFilterReadiness('All');
              setFilterCollege('All');
              setFilterInternshipRole('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCandidates.map((candidate, idx) => {
            const isHighest = highestMatchCandidate?.id === candidate.id;
            const isSelected = selectedCandidateId === candidate.id;
            const match = candidate.match;

            return (
              <div
                key={candidate.id}
                ref={(el) => { candidateRefs.current[candidate.id] = el; }}
                className={`bg-white rounded-2xl p-5 sm:p-6 transition-all flex flex-col justify-between space-y-4 relative ${
                  isSelected
                    ? 'border-2 border-emerald-500 shadow-xl ring-2 ring-emerald-200'
                    : isHighest
                    ? 'border-2 border-amber-400/90 shadow-md hover:shadow-lg'
                    : 'border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Top Badge for #1 Highest Match or Selected */}
                {isHighest && (
                  <div className="absolute -top-3 left-6 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[11px] font-black px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span>#1 HIGHEST SKILL MATCH ({match.percentage}%)</span>
                  </div>
                )}

                {isSelected && !isHighest && (
                  <div className="absolute -top-3 left-6 bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>SELECTED CANDIDATE</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Header: Candidate Info & Skill Match Percentage */}
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl font-extrabold flex items-center justify-center text-sm shadow-xs ${
                        isHighest ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-white'
                      }`}>
                        {candidate.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                            {candidate.name}
                          </h3>
                          {candidate.isUserSubmission && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {candidate.college} • {candidate.branch} ({candidate.year})
                        </p>
                      </div>
                    </div>

                    {/* Prominent Skill Match Percentage Badge */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div
                        className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-black border flex items-center gap-1.5 shadow-2xs ${getMatchColor(
                          match.percentage
                        )}`}
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-current" />
                        <span className="tabular-nums text-sm sm:text-base font-extrabold">
                          {match.percentage}%
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Match
                        </span>
                      </div>
                      
                      <span className="text-[10px] font-bold text-slate-500">
                        {match.fitLabel}
                      </span>
                    </div>
                  </div>

                  {/* Skill Match Progress Bar Indicator */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Skill Compatibility with {match.targetRole}</span>
                      <span className="text-slate-900 font-bold tabular-nums">
                        {match.matchedSkills.length} of {match.matchedSkills.length + match.missingSkills.length} skills matched
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                          match.percentage
                        )}`}
                        style={{ width: `${match.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Target Role & Verification Strip */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        Applied Position:
                      </span>
                      <strong className="text-slate-800 font-bold">
                        {candidate.appliedRole}
                      </strong>{' '}
                      <span className="text-slate-500">at {candidate.appliedCompany}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border ${readinessBadge(
                          candidate.readiness_score
                        )}`}
                      >
                        ★ {candidate.readiness_score}
                      </span>

                      <span className="text-slate-700 font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                        CGPA: {candidate.cgpa}
                      </span>
                    </div>
                  </div>

                  {/* Student Uploaded PDF Resume & Gemini Verification Strip */}
                  <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                        PDF
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 truncate text-xs">
                            {candidate.resumePdfName || 'student_resume.pdf'}
                          </span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded border border-emerald-300 shrink-0">
                            Uploaded by Student
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {candidate.hasUploadedPdf
                            ? 'Student document attached • Ready for Gemini Verification Audit'
                            : 'Standardized student resume profile'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {candidate.geminiVerified && candidate.geminiVerificationReport ? (
                        <button
                          type="button"
                          onClick={() => handleOpenVerification(candidate)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 text-xs font-black transition-colors cursor-pointer shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                          <span>Gemini Verified ({candidate.geminiVerificationReport.confidenceScore}%)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenVerification(candidate)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-extrabold shadow-2xs transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Verify with Gemini</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rejection Feedback Summary if Rejected */}
                  {candidate.status === 'Rejected' && candidate.rejectionFeedback && (
                    <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Skill Improvement Guidance Sent to Student
                        </span>
                        <span className="text-[10px] text-rose-700 bg-rose-100/90 px-2 py-0.5 rounded font-mono">
                          {new Date(candidate.rejectionFeedback.rejectedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {candidate.rejectionFeedback.skillsToImprove && candidate.rejectionFeedback.skillsToImprove.length > 0 && (
                        <div className="text-[11px] text-slate-700">
                          <strong className="text-rose-900">Skills advised to improve:</strong>{' '}
                          <span className="font-semibold text-rose-950">
                            {candidate.rejectionFeedback.skillsToImprove.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills Breakdown: Matched vs Missing */}
                  <div className="space-y-2">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                        <span>Matched Requirements ({match.matchedSkills.length}):</span>
                        <span className="text-emerald-700 font-extrabold text-[10px]">VERIFIED MATCH</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {match.matchedSkills.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No direct required skill overlap</span>
                        ) : (
                          match.matchedSkills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold flex items-center gap-1 shadow-2xs"
                            >
                              <Check className="w-3 h-3 text-emerald-600" />
                              {skill}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Missing Skills from the role requirements */}
                    {match.missingSkills.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Skills Still Needed ({match.missingSkills.length}):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {match.missingSkills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-xs px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Featured Project */}
                  {candidate.projects && candidate.projects.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Featured Project:
                      </div>
                      <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {candidate.projects[0].title}
                          </span>
                          <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {candidate.projects[0].domain}
                          </span>
                        </div>
                        {candidate.projects[0].description && (
                          <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">
                            {candidate.projects[0].description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Assessment */}
                  {candidate.summary && (
                    <p className="text-xs text-slate-600 italic border-l-2 border-emerald-500 pl-2">
                      "{candidate.summary}"
                    </p>
                  )}
                </div>

                {/* Bottom Actions: Select Candidate, Status Dropdown & Instant Contact */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Select Candidate Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCandidateId(candidate.id);
                        showToast(`Selected ${candidate.name} (${match.percentage}% match)`);
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span>Select Candidate</span>
                        </>
                      )}
                    </button>

                    {/* Status Selector */}
                    <select
                      value={candidate.status}
                      onChange={(e) =>
                        handleStatusChange(candidate, e.target.value as Candidate['status'])
                      }
                      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer ${
                        candidate.status === 'Rejected'
                          ? 'border-rose-300 bg-rose-50/60 text-rose-800'
                          : candidate.status === 'Shortlisted'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-slate-300 bg-white text-slate-800'
                      }`}
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Offer Extended">Offer Extended</option>
                      <option value="Rejected">Rejected (Send Skill Advice)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Rejection / Review Email Button */}
                    {candidate.status === 'Rejected' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenRejection(candidate)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-rose-600" />
                        <span>Rejection Advice</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenRejection(candidate)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-medium transition-colors cursor-pointer"
                        title="Reject & Send Skill Advice"
                      >
                        <XCircle className="w-3.5 h-3.5 text-slate-400 hover:text-rose-500" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* Instant Contact Action */}
                    <button
                      type="button"
                      onClick={() => setActiveContactCandidate(candidate)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{t.contactBtn}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* STICKY SELECTED CANDIDATE SPOTLIGHT BAR                  */}
      {/* ======================================================== */}
      {activeSelectedCandidate && (
        <aside aria-label="Selected Candidate Actions" className="fixed bottom-4 left-4 right-4 sm:left-8 sm:right-8 z-40 bg-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-emerald-500 animate-in slide-in-from-bottom-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-md">
                {activeSelectedCandidate.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-base sm:text-lg text-white">
                    {activeSelectedCandidate.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {activeSelectedCandidate.match.percentage}% Match
                  </span>
                  <span className="text-xs text-slate-400">
                    {activeSelectedCandidate.college}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Applied for <strong>{activeSelectedCandidate.appliedRole}</strong> • Matched Skills:{' '}
                  {activeSelectedCandidate.match.matchedSkills.join(', ')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleStatusChange(activeSelectedCandidate, 'Shortlisted')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Shortlist Candidate</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange(activeSelectedCandidate, 'Offer Extended')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Extend Offer</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveContactCandidate(activeSelectedCandidate)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                <span>Schedule Interview</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCandidateId(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                title="Deselect"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Instant Contact Action Modal */}
      {activeContactCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Contact {activeContactCandidate.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    SME Instant Outreach • {activeContactCandidate.college}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveContactCandidate(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate details strip */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email Address:</span>
                <div className="flex items-center gap-1.5">
                  <strong className="text-slate-900">{activeContactCandidate.contactEmail}</strong>
                  <button
                    onClick={() => handleCopyEmail(activeContactCandidate.contactEmail)}
                    className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                    title="Copy Email"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phone (College Registered):</span>
                <strong className="text-slate-900">{activeContactCandidate.contactPhone}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">T&P Officer Status:</span>
                <span className="font-semibold text-emerald-700">Verified & NOC Eligible</span>
              </div>
            </div>

            {copySuccess && (
              <p className="text-xs text-emerald-600 font-bold text-center">
                ✓ Email copied to clipboard!
              </p>
            )}

            {/* Simulated Invitation Dispatch */}
            {invitationSent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">
                  Interview Invitation Dispatched!
                </h4>
                <p className="text-xs text-emerald-700">
                  Notification sent to {activeContactCandidate.name} and the College T&P Cell for compliance logs.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-600">
                  <label className="font-bold text-slate-700 block mb-1">
                    Send Instant Interview / Technical Screen Slot:
                  </label>
                  <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700 font-mono text-[11px]">
                    "Hello {activeContactCandidate.name}, your application for {activeContactCandidate.appliedRole} at {activeContactCandidate.appliedCompany} has been shortlisted. We would like to schedule a 30-min technical review at our Vizag office."
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveContactCandidate(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInterviewInvite}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Interview Call & Notify T&P</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection & Skill Improvement Email Modal */}
      <RejectionFeedbackModal
        candidate={rejectionCandidate}
        internships={internships}
        isOpen={isRejectionModalOpen}
        onClose={() => {
          setIsRejectionModalOpen(false);
          setRejectionCandidate(null);
        }}
        onConfirmRejection={handleConfirmRejection}
        activeUser={activeUser}
      />

      {/* Gemini AI Resume Verification Modal */}
      <GeminiResumeVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setVerifyingCandidate(null);
        }}
        candidate={verifyingCandidate}
        onSaveVerification={handleSaveVerification}
        onShortlistCandidate={handleShortlistFromVerification}
        lang={lang}
      />

    </div>
  );
};

export default SmeCandidateShortlistScreen;
