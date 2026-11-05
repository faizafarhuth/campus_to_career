import React, { useState, useMemo } from 'react';
import {
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  MapPin,
  Banknote,
  Building2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Award,
  Filter,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { Candidate, Internship } from '../types';

interface StudentApplicationsTrackerProps {
  onOpenInbox?: () => void;
  onOpenResumeModal?: () => void;
}

type FilterStatus = 'all' | 'Under Review' | 'Shortlisted' | 'Rejected';

export const StudentApplicationsTracker: React.FC<StudentApplicationsTrackerProps> = ({
  onOpenInbox,
  onOpenResumeModal,
}) => {
  const {
    candidates,
    internships,
    currentUser,
    language,
    setIsInboxModalOpen,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const t = translations[language];

  // Resolve all applications belonging to the active student
  const studentApplications = useMemo(() => {
    const userEmail = (currentUser?.email || 'candidate.vizag@college.edu.in').toLowerCase();
    const userName = (currentUser?.name || 'Sai Tarun').toLowerCase();

    return candidates.filter((c) => {
      const matchEmail = c.contactEmail && c.contactEmail.toLowerCase() === userEmail;
      const matchName = c.name && (c.name.toLowerCase().includes(userName) || c.name.toLowerCase().includes('you'));
      const isSubmission = Boolean(c.isUserSubmission);
      return matchEmail || matchName || isSubmission;
    });
  }, [candidates, currentUser]);

  // Status Counts
  const totalCount = studentApplications.length;
  const underReviewCount = studentApplications.filter(
    (a) => a.status === 'Under Review'
  ).length;
  const shortlistedCount = studentApplications.filter(
    (a) => a.status === 'Shortlisted' || a.status === 'Offer Extended'
  ).length;
  const rejectedCount = studentApplications.filter(
    (a) => a.status === 'Rejected'
  ).length;

  // Filtered list based on active tab
  const filteredApplications = useMemo(() => {
    if (activeFilter === 'all') return studentApplications;
    if (activeFilter === 'Shortlisted') {
      return studentApplications.filter(
        (a) => a.status === 'Shortlisted' || a.status === 'Offer Extended'
      );
    }
    return studentApplications.filter((a) => a.status === activeFilter);
  }, [studentApplications, activeFilter]);

  const handleOpenInboxModal = () => {
    if (onOpenInbox) {
      onOpenInbox();
    } else {
      setIsInboxModalOpen(true);
    }
  };

  const getStatusBadge = (status: Candidate['status']) => {
    switch (status) {
      case 'Shortlisted':
        return {
          label: language === 'en' ? 'Shortlisted' : 'షార్ట్‌లిస్ట్ చేయబడింది',
          sublabel: language === 'en' ? 'Recruiter Selected • Next: Interview' : 'రిక్యూటర్ ఎంపిక చేసారు',
          bg: 'bg-emerald-500/15 text-emerald-900 border-emerald-300',
          dotBg: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'Offer Extended':
        return {
          label: language === 'en' ? 'Offer Extended' : 'ఆఫర్ జారీ చేయబడింది',
          sublabel: language === 'en' ? 'Offer Extended • College NOC Ready' : 'ఆఫర్ జారీ చేయబడింది',
          bg: 'bg-blue-500/15 text-blue-900 border-blue-300',
          dotBg: 'bg-blue-600',
          icon: Award,
        };
      case 'Rejected':
        return {
          label: language === 'en' ? 'Rejected' : 'తిరస్కరించబడింది',
          sublabel: language === 'en' ? 'Skill Guidance Available' : 'నైపుణ్యాల సలహా అందుబాటులో ఉంది',
          bg: 'bg-rose-500/15 text-rose-900 border-rose-300',
          dotBg: 'bg-rose-500',
          icon: XCircle,
        };
      case 'Under Review':
      default:
        return {
          label: language === 'en' ? 'In Under Review' : 'పరిశీలనలో ఉంది',
          sublabel: language === 'en' ? 'T&P Clearance & SME Screen' : 'T&P మరియు SME పరిశీలన',
          bg: 'bg-amber-500/15 text-amber-900 border-amber-300',
          dotBg: 'bg-amber-500 animate-pulse',
          icon: Clock,
        };
    }
  };

  return (
    <section aria-labelledby="applications-tracker-heading" className="space-y-4">
      {/* Tracker Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all p-5 sm:p-6 space-y-6">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-xs">
              <Send className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="applications-tracker-heading" className="text-base sm:text-lg font-extrabold text-slate-900">
                  {language === 'en' ? 'My Application Status & Live Tracker' : 'నా దరఖాస్తుల స్థితి & పురోగతి'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {totalCount} Total
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'en'
                  ? 'Real-time visibility into your submitted internship roles, screening status, and recruiter outcomes.'
                  : 'మీరు దరఖాస్తు చేసుకున్న ఇంటర్న్‌షిప్‌ల ప్రత్యక్ష స్థితి మరియు రిక్రూటర్ ఫలితాలు.'}
              </p>
            </div>
          </div>

          {rejectedCount > 0 && (
            <button
              type="button"
              onClick={handleOpenInboxModal}
              className="text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{language === 'en' ? 'View Skill Improvement Advice' : 'నైపుణ్యాల సలహాను చూడండి'}</span>
            </button>
          )}
        </div>

        {/* 4 Interactive Summary Counter Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Total Applied */}
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer group ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20'
                : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {language === 'en' ? 'Total Applied' : 'మొత్తం దరఖాస్తులు'}
              </span>
              <Send className={`w-4 h-4 ${activeFilter === 'all' ? 'text-emerald-400' : 'text-slate-500'}`} />
            </div>
            <div className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${
              activeFilter === 'all' ? 'text-white' : 'text-slate-900'
            }`}>
              {totalCount}
            </div>
            <p className={`text-[11px] mt-1 truncate ${
              activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'
            }`}>
              {language === 'en' ? 'Roles Applied' : 'దరఖాస్తు చేసిన ఉద్యోగాలు'}
            </p>
          </button>

          {/* Card 2: In Under Review */}
          <button
            type="button"
            onClick={() => setActiveFilter('Under Review')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer group ${
              activeFilter === 'Under Review'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20'
                : 'bg-amber-50/60 hover:bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                activeFilter === 'Under Review' ? 'text-amber-100' : 'text-amber-700'
              }`}>
                {language === 'en' ? 'Under Review' : 'పరిశీలనలో ఉన్నాయి'}
              </span>
              <Clock className={`w-4 h-4 ${activeFilter === 'Under Review' ? 'text-white' : 'text-amber-600'}`} />
            </div>
            <div className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${
              activeFilter === 'Under Review' ? 'text-white' : 'text-amber-950'
            }`}>
              {underReviewCount}
            </div>
            <p className={`text-[11px] mt-1 truncate ${
              activeFilter === 'Under Review' ? 'text-amber-100' : 'text-amber-700'
            }`}>
              {language === 'en' ? 'T&P & SME Screening' : 'T&P పరిశీలనలో ఉన్నాయి'}
            </p>
          </button>

          {/* Card 3: Shortlisted */}
          <button
            type="button"
            onClick={() => setActiveFilter('Shortlisted')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer group ${
              activeFilter === 'Shortlisted'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                activeFilter === 'Shortlisted' ? 'text-emerald-100' : 'text-emerald-700'
              }`}>
                {language === 'en' ? 'Shortlisted' : 'షార్ట్‌లిస్ట్ అయ్యాయి'}
              </span>
              <CheckCircle2 className={`w-4 h-4 ${activeFilter === 'Shortlisted' ? 'text-white' : 'text-emerald-600'}`} />
            </div>
            <div className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${
              activeFilter === 'Shortlisted' ? 'text-white' : 'text-emerald-950'
            }`}>
              {shortlistedCount}
            </div>
            <p className={`text-[11px] mt-1 truncate ${
              activeFilter === 'Shortlisted' ? 'text-emerald-100' : 'text-emerald-700'
            }`}>
              {language === 'en' ? 'Interview Ready' : 'ఇంటర్వ్యూకు ఎంపికయ్యారు'}
            </p>
          </button>

          {/* Card 4: Rejected */}
          <button
            type="button"
            onClick={() => setActiveFilter('Rejected')}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer group ${
              activeFilter === 'Rejected'
                ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/20'
                : 'bg-rose-50/60 hover:bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                activeFilter === 'Rejected' ? 'text-rose-100' : 'text-rose-700'
              }`}>
                {language === 'en' ? 'Got Rejected' : 'తిరస్కరించబడ్డాయి'}
              </span>
              <XCircle className={`w-4 h-4 ${activeFilter === 'Rejected' ? 'text-white' : 'text-rose-600'}`} />
            </div>
            <div className={`text-3xl sm:text-4xl font-extrabold tabular-nums ${
              activeFilter === 'Rejected' ? 'text-white' : 'text-rose-950'
            }`}>
              {rejectedCount}
            </div>
            <p className={`text-[11px] mt-1 truncate ${
              activeFilter === 'Rejected' ? 'text-rose-100' : 'text-rose-700'
            }`}>
              {language === 'en' ? 'Skill Guidance Sent' : 'నైపుణ్యాల సలహా ఇవ్వబడింది'}
            </p>
          </button>

        </div>

        {/* Filter Pills Tab Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Applied ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('Under Review')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'Under Review'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>Under Review ({underReviewCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('Shortlisted')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'Shortlisted'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>Shortlisted ({shortlistedCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('Rejected')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'Rejected'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span>Rejected ({rejectedCount})</span>
          </button>
        </div>

        {/* List of Applied Job Roles */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50/60 rounded-xl border border-slate-200">
            <Send className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900">
              {language === 'en' ? 'No applications match this filter' : 'ఈ విభాగంలో దరఖాస్తులు లేవు'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {language === 'en'
                ? 'Explore the verified Vizag SME internships below and apply with 1 click.'
                : 'క్రింద ఉన్న వైజాగ్ ఇంటర్న్‌షిప్‌లను చూసి దరఖాస్తు చేసుకోండి.'}
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="mt-3 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => {
              const badge = getStatusBadge(app.status);
              const BadgeIcon = badge.icon;
              const isExpanded = expandedId === app.id;

              // Find matching internship metadata if available
              const matchedJob = internships.find(
                (i) => i.id === app.appliedInternshipId || i.role === app.appliedRole
              );

              return (
                <div
                  key={app.id}
                  className={`rounded-xl border transition-all p-4 ${
                    app.status === 'Shortlisted'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : app.status === 'Rejected'
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {app.appliedCompany}
                        </span>
                        {matchedJob?.location && (
                          <span className="text-xs text-slate-400 flex items-center gap-0.5">
                            • <MapPin className="w-3 h-3 text-emerald-600" /> {matchedJob.location}
                          </span>
                        )}
                        {matchedJob?.stipend && (
                          <span className="text-xs font-bold text-slate-800">
                            • {matchedJob.stipend}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                        {app.appliedRole}
                      </h3>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Applied on: {app.applicationDate || 'Nov 2026'}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <ShieldCheck className="w-3 h-3" />
                          <span>T&P Registered</span>
                        </span>
                        {app.hasUploadedPdf && (
                          <>
                            <span>•</span>
                            <span className="text-slate-700 font-medium flex items-center gap-1">
                              📄 {app.resumePdfName || 'student_resume.pdf'}
                            </span>
                          </>
                        )}
                        {app.geminiVerified && (
                          <>
                            <span>•</span>
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Gemini Verified ({app.geminiVerificationReport?.confidenceScore || 94}%)</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Pill & Action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${badge.bg}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${badge.dotBg}`} />
                        <BadgeIcon className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </div>

                      <span className="text-[11px] text-slate-500 font-medium">
                        {badge.sublabel}
                      </span>
                    </div>
                  </div>

                  {/* Visual 4-Step Application Progress Stepper */}
                  <div className="mt-3.5 pt-3 border-t border-slate-200/70">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                      
                      {/* Step 1: Applied */}
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] mb-1">
                          ✓
                        </div>
                        <span className="text-emerald-800">1. Applied</span>
                      </div>

                      {/* Step 2: T&P Clearance */}
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 ${
                          app.tnpVerified || app.status !== 'Under Review'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white animate-pulse'
                        }`}>
                          {app.tnpVerified || app.status !== 'Under Review' ? '✓' : '•'}
                        </div>
                        <span className={app.tnpVerified ? 'text-emerald-800' : 'text-amber-800'}>
                          2. T&P Cleared
                        </span>
                      </div>

                      {/* Step 3: SME Screening */}
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 ${
                          app.status === 'Shortlisted' || app.status === 'Offer Extended'
                            ? 'bg-emerald-600 text-white'
                            : app.status === 'Rejected'
                            ? 'bg-slate-300 text-slate-600'
                            : 'bg-amber-500 text-white animate-pulse'
                        }`}>
                          {app.status === 'Shortlisted' || app.status === 'Offer Extended' ? '✓' : '3'}
                        </div>
                        <span className={
                          app.status === 'Shortlisted' || app.status === 'Offer Extended'
                            ? 'text-emerald-800'
                            : 'text-slate-600'
                        }>
                          3. SME Review
                        </span>
                      </div>

                      {/* Step 4: Outcome */}
                      <div className="flex flex-col items-center">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] mb-1 ${
                          app.status === 'Shortlisted' || app.status === 'Offer Extended'
                            ? 'bg-emerald-600 text-white'
                            : app.status === 'Rejected'
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-400'
                        }`}>
                          {app.status === 'Shortlisted' ? '★' : app.status === 'Rejected' ? '✕' : '4'}
                        </div>
                        <span className={
                          app.status === 'Shortlisted'
                            ? 'text-emerald-800 font-extrabold'
                            : app.status === 'Rejected'
                            ? 'text-rose-800 font-extrabold'
                            : 'text-slate-400'
                        }>
                          {app.status === 'Shortlisted'
                            ? 'Shortlisted'
                            : app.status === 'Rejected'
                            ? 'Feedback'
                            : '4. Decision'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contextual Action Strip if Rejected or Shortlisted */}
                  {app.status === 'Rejected' && (
                    <div className="mt-3 pt-3 border-t border-rose-200/80 bg-rose-100/50 -mx-4 -mb-4 p-3 rounded-b-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-rose-900 font-medium">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          <strong>{app.appliedCompany}</strong> shared specific technical skills to improve for this role.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenInboxModal}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>View Skills & Next Steps</span>
                      </button>
                    </div>
                  )}

                  {app.status === 'Shortlisted' && (
                    <div className="mt-3 pt-3 border-t border-emerald-200/80 bg-emerald-100/50 -mx-4 -mb-4 p-3 rounded-b-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-emerald-900 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Congratulations! Your profile was shortlisted by <strong>{app.appliedCompany}</strong>. Institutional NOC is pre-approved.
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 px-2 py-1 rounded bg-white border border-emerald-300">
                        Interview Ready
                      </span>
                    </div>
                  )}

                  {app.status === 'Under Review' && (
                    <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Status: Application queued for Dean T&P verification & SME screening.</span>
                      <span className="font-semibold text-amber-700">Estimated turnaround: 2-3 days</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default StudentApplicationsTracker;
