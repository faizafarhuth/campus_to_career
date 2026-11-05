import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { VIZAG_CLUSTERS } from '../data/sampleData';
import { SectionLogo } from './BrandLogo';

// Import image directly so bundlers (Vite/Webpack) include it in production builds.
// Fallback to path if not using Vite module resolution.
import heroImage from '../assets/images/vizag_tech_campus_hero_1793887561382.jpg';

import {
  Sparkles,
  MapPin,
  Building2,
  Banknote,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Check,
  TrendingUp,
  FileCheck,
  GraduationCap,
  ArrowUpRight,
} from 'lucide-react';
import { StudentApplicationsTracker } from './StudentApplicationsTracker';

interface StudentFeedProps {
  onOpenInbox?: () => void;
}

export const StudentFeed: React.FC<StudentFeedProps> = ({ onOpenInbox }) => {
  const {
    language,
    internships,
    applications,
    currentUser,
    applyToInternship,
    parsedResume,
    setIsParserOpen,
    getSkillMatchScore,
    selectedCluster,
    setSelectedCluster,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const t = translations[language];
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Set of applied internship IDs for O(1) lookup
  const appliedInternshipIds = useMemo(() => {
    const applied = new Set<string>();
    const userEmail = currentUser?.email?.toLowerCase();
    const userName = currentUser?.name?.toLowerCase();

    for (const app of applications) {
      const matchEmail = userEmail && app.studentEmail?.toLowerCase() === userEmail;
      const matchName = userName && app.studentName?.toLowerCase() === userName;
      if (matchEmail || matchName) {
        applied.add(app.internshipId);
      }
    }
    return applied;
  }, [applications, currentUser]);

  // Set of normalized user skills for O(1) badge lookup
  const userSkillsSet = useMemo(() => {
    return new Set(parsedResume?.hard_skills.map((s) => s.toLowerCase().trim()) ?? []);
  }, [parsedResume]);

  // Memoized filter for performance
  const filteredList = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const isAllClusters = selectedCluster === 'All Clusters';
    const clusterLower = selectedCluster.toLowerCase();

    return internships.filter((item) => {
      const matchesCluster =
        isAllClusters || item.location.toLowerCase().includes(clusterLower);

      if (!matchesCluster) return false;
      if (!normalizedQuery) return true;

      return (
        item.company.toLowerCase().includes(normalizedQuery) ||
        item.role.toLowerCase().includes(normalizedQuery) ||
        item.requiredSkills.some((s) => s.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [internships, selectedCluster, searchQuery]);

  const handleApply = (internshipId: string) => {
    setApplyingId(internshipId);
    setTimeout(() => {
      applyToInternship(internshipId);
      if (isMountedRef.current) {
        setApplyingId(null);
      }
    }, 300);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl text-white">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Visakhapatnam Rushikonda IT Park and Coastal Engineering Campus"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-900/40" />
        </div>

        <div className="relative z-10 max-w-4xl px-6 py-10 sm:py-14 sm:px-10">
          {/* Logo & Pitch Tag Header */}
          <div className="flex items-center gap-3.5 mb-4">
            <SectionLogo type="student" size="md" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus to Career · Vizag Student Talent Feed</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
            {t.tagline}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Campus to Career is a B2B2C platform connecting Vizag college students with local SMEs using AI matching while giving colleges automated compliance dashboards.
          </p>

          {/* Primary Action Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setIsParserOpen(true)}
              className="px-6 py-3.5 text-sm sm:text-base font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2.5 group cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <Sparkles className="w-5 h-5 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>{t.heroUploadCta}</span>
            </button>
          </div>

          {/* Differentiator claim */}
          <p className="mt-4 text-xs sm:text-sm text-slate-400 font-medium">
            <span className="text-emerald-400 font-semibold">What makes us different: </span>
            {t.pitchHighlight}
          </p>
        </div>
      </section>

      {/* Regional Employability Stat Cards */}
      <section aria-labelledby="facts-heading">
        <h2 id="facts-heading" className="sr-only">Regional Employability Facts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stat 1 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.statUnemploymentTitle}
              </span>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
              {t.statUnemploymentValue}
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-snug">
              {t.statUnemploymentDesc}{' '}
              <a
                href="https://www.newindianexpress.com/states/andhra-pradesh/2026/Sep/22/jobs-elude-41-of-andhra-pradesh-says-report"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline inline-flex items-center gap-0.5 font-semibold"
              >
                Source <ArrowUpRight className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Stat 2 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.statEmployabilityTitle}
              </span>
              <GraduationCap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
              {t.statEmployabilityValue}
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-snug">
              {t.statEmployabilityDesc}{' '}
              <a
                href="https://www.raysolute.com/india-employability-gap-2026.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline inline-flex items-center gap-0.5 font-semibold"
              >
                Source <ArrowUpRight className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Stat 3 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.statYouthTitle}
              </span>
              <FileCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900 tabular-nums">
              {t.statYouthValue}
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-snug">
              {t.statYouthDesc}{' '}
              <a
                href="https://youthpower.in/youth-in-andhra-pradesh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline inline-flex items-center gap-0.5 font-semibold"
              >
                Source <ArrowUpRight className="w-3 h-3" />
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* User Parsed Profile Banner */}
      {parsedResume && (
        <section className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-950">
                  Active Parsed Profile: {parsedResume.college_and_degree || parsedResume.college || 'Verified Vizag Student'}
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  {parsedResume.readiness_score} Readiness
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-emerald-800">
                {parsedResume.resumePdfName && (
                  <span className="bg-white text-slate-800 font-bold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                    📄 {parsedResume.resumePdfName}
                  </span>
                )}
                <span className="font-semibold">Extracted Skills:</span>
                {parsedResume.hard_skills.map((s, idx) => (
                  <span key={idx} className="bg-white px-2 py-0.5 rounded border border-emerald-300 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsParserOpen(true)}
            className="text-xs font-bold text-emerald-900 hover:text-emerald-950 px-3 py-1.5 bg-emerald-200/60 hover:bg-emerald-200 rounded-lg whitespace-nowrap self-start sm:self-center transition-colors cursor-pointer"
          >
            Update Resume
          </button>
        </section>
      )}

      {/* Student Application Status & Metrics Tracker */}
      <StudentApplicationsTracker
        onOpenInbox={onOpenInbox}
        onOpenResumeModal={() => setIsParserOpen(true)}
      />

      {/* Feed Controls: Search & Hyper-Local Cluster Filter */}
      <section className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search internships by company, role, or skill"
              placeholder="Search by company, role, or skill (e.g., React, IoT, Python, Siripuram)..."
              className="w-full text-sm pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-colors text-slate-900 placeholder:text-slate-400 shadow-2xs"
            />
          </div>

          {/* Quick count */}
          <div className="text-xs font-semibold text-slate-600 flex items-center gap-2 shrink-0 self-end md:self-center">
            <span>Showing {filteredList.length} of {internships.length} Verified Vizag Internships</span>
          </div>
        </div>

        {/* Hyper-Local Cluster Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Clusters:
          </span>
          {VIZAG_CLUSTERS.map((cluster) => {
            const isSelected = selectedCluster === cluster;
            return (
              <button
                type="button"
                key={cluster}
                onClick={() => setSelectedCluster(cluster)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cluster}
              </button>
            );
          })}
        </div>
      </section>

      {/* Internship Cards Feed */}
      <section aria-labelledby="feed-heading" className="space-y-4">
        <h2 id="feed-heading" className="sr-only">Verified Local Internship Feed</h2>

        {filteredList.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No internships matched your filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try switching clusters or clearing your search term to view all opportunities.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCluster('All Clusters');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((job) => {
              const isApplied = appliedInternshipIds.has(job.id);
              const isApplying = applyingId === job.id;
              const matchScore = getSkillMatchScore(job.requiredSkills);

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Kicker: Company + Cluster */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                            {job.company}
                          </span>
                          {job.isSample && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
                              Sample
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                          {job.role}
                        </h3>
                      </div>

                      {/* Compatibility Badge if parsed */}
                      {matchScore !== null ? (
                        <div
                          className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 ${
                            matchScore >= 80
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{matchScore}% Match</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {job.status}
                        </span>
                      )}
                    </div>

                    {/* Metadata line: Location, Stipend, Duration */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 mb-3 font-medium">
                      <span className="inline-flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {job.location}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 text-slate-900 font-bold tabular-nums">
                        <Banknote className="w-3.5 h-3.5 text-slate-500" />
                        {job.stipend}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {job.duration || '3 Months'} ({job.mode || 'In-office'})
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {job.description}
                    </p>

                    {/* Required Skills Badges */}
                    <div className="mb-4">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Required Skills:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills.map((skill, sIdx) => {
                          const hasSkill = userSkillsSet.has(skill.toLowerCase().trim());
                          return (
                            <span
                              key={sIdx}
                              className={`text-xs px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                                hasSkill
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {skill} {hasSkill && '✓'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {job.aicteCode || `AICTE-VZG-${job.id.toUpperCase()}`}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleApply(job.id)}
                      disabled={isApplied || isApplying}
                      className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                        isApplied
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>{t.appliedStatus}</span>
                        </>
                      ) : isApplying ? (
                        <span>Submitting...</span>
                      ) : (
                        <span>{t.oneClickApply}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentFeed;
