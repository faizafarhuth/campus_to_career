import React, { useState } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  MapPin,
  CheckCircle,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Target,
  DollarSign,
  Activity,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface AboutScreenProps {
  lang: Language;
  onClearData: () => void;
  onOpenResumeModal: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({
  lang,
  onClearData,
  onOpenResumeModal,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedMessage, setClearedMessage] = useState(false);

  const t = TRANSLATIONS[lang];

  const handleConfirmClear = () => {
    onClearData();
    setShowClearConfirm(false);
    setClearedMessage(true);
    setTimeout(() => setClearedMessage(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-20 text-slate-800">
      
      {/* Hero Intro Pitch */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          <span>Visakhapatnam, Andhra Pradesh, India</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          Campus to Career
        </h1>

        <p className="text-emerald-400 font-semibold text-base sm:text-lg">
          Team Fusion • B2B2C Institutional Platform
        </p>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
          <strong>Our Pitch:</strong> Campus to Career is a B2B2C platform connecting Vizag college students with local SMEs using AI matching while giving colleges automated compliance dashboards.
        </p>

        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={onOpenResumeModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Try AI Resume Parser & Match Engine</span>
          </button>
        </div>
      </section>

      {/* Live Stats Strip */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t.statsStripTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">1,480+</div>
              <div className="text-xs text-slate-500 font-medium">{t.wasStat}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">42</div>
              <div className="text-xs text-slate-500 font-medium">{t.activeSmeStat}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">68.4%</div>
              <div className="text-xs text-slate-500 font-medium">{t.shortlistRateStat}</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Our Solution Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {t.problemTitle}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t.problemText}
          </p>
          <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-500 border border-slate-100">
            <strong>Target Users:</strong> Final and pre-final year college students across engineering, degree, and polytechnic colleges in Visakhapatnam.
          </div>
        </div>

        {/* Solution Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {t.solutionTitle}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {t.solutionText}
          </p>
          <div className="bg-emerald-50/60 p-3.5 rounded-xl text-xs text-emerald-900 border border-emerald-200/60">
            <strong>Key Benefit:</strong> Solves compliance friction for T&P coordinators while providing zero-barrier candidate shortlists for local business owners.
          </div>
        </div>
      </section>

      {/* Why It Matters: Ground Facts */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Verified Research Citations
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Why It Matters (Labor Market Realities)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-2xl font-black text-rose-600">41%</span>
            <p className="font-bold text-slate-900">
              Graduates in Andhra Pradesh face unemployment
            </p>
            <p className="text-slate-500">
              YouthPOWER 2026 Handbook
            </p>
            <a
              href="https://www.newindianexpress.com/states/andhra-pradesh/2026/Sep/22/jobs-elude-41-of-android-pradesh-says-report"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              Indian Express Article <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-2xl font-black text-emerald-600">56.35%</span>
            <p className="font-bold text-slate-900">
              Overall India graduate employability
            </p>
            <p className="text-slate-500">
              India Skills Report 2026
            </p>
            <a
              href="https://www.raysolute.com/india-employability-gap-2026.html"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              Employability Gap Report <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-2xl font-black text-amber-600">16.2%</span>
            <p className="font-bold text-slate-900">
              Andhra Pradesh youth unemployment
            </p>
            <p className="text-slate-500">
              YouthPOWER 2026 Index
            </p>
            <a
              href="https://youthpower.in/youth-in-andhra-pradesh"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
            >
              Youth in Andhra Pradesh <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* What makes us different */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-emerald-300">
              What Makes Us Different:
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "None of them combine hyper-local geo-matching with an integrated college compliance and monitoring dashboard."
            </p>
          </div>
        </div>
      </section>

      {/* Business Model & Who Pays Later */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">
            {t.businessModelTitle}
          </h2>
        </div>

        <p className="text-sm text-slate-600">
          Campus to Career operates on an institutional B2B2C business model that aligns institutional compliance incentives with local commercial hiring needs:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Colleges */}
          <div className="p-5 rounded-xl border-2 border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Colleges (Institutional SaaS)</span>
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                ₹50,000 / yr
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Annual institutional college subscription covers automated resume ingestion, student application pipelines, AICTE & APSCHE audit compliance reports, bulk NOC generation, and placement officer dashboards.
            </p>
          </div>

          {/* Local SMEs */}
          <div className="p-5 rounded-xl border-2 border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Local SMEs (Featured Postings)</span>
              <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                ₹999 / listing
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Paid listing tier gives local enterprises in Rushikonda, Gajuwaka, Duvvada, Autonagar, and Siripuram targeted talent matching, AI candidate scoring, and verified direct college applicant channels without headhunter markups.
            </p>
          </div>
        </div>
      </section>

      {/* Clear My Data Section */}
      <section className="p-6 rounded-2xl bg-rose-50/60 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-rose-900 text-base">
            Reset Application State
          </h3>
          <p className="text-xs text-rose-700 mt-0.5">
            Clear all user-entered resumes, applications, and reset back to pre-loaded sample records.
          </p>
        </div>

        {clearedMessage ? (
          <span className="text-xs font-bold text-emerald-700 bg-white px-4 py-2 rounded-xl border border-emerald-300">
            ✓ Data reset successfully!
          </span>
        ) : showClearConfirm ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClear}
              className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 cursor-pointer shadow-xs"
            >
              Confirm Clear
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-rose-700 border border-rose-300 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clearDataBtn}</span>
          </button>
        )}
      </section>

    </div>
  );
};
