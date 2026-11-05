import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  Briefcase,
  KeyRound,
  GraduationCap,
  ClipboardCheck,
  Lock,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import {
  Internship,
  ParsedResume,
  Language,
  UserProfile,
  UserRole,
  JobSeekerNotification,
} from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { DEMO_USERS } from '../data/defaultData';
import { StudentFeed } from './StudentFeed';

interface StudentHomeScreenProps {
  internships: Internship[];
  userResume: ParsedResume | null;
  appliedInternshipIds: string[];
  lang: Language;
  onOpenResumeModal: () => void;
  onApplyInternship: (internship: Internship) => void;
  activeUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onNavigateLogin: () => void;
  notifications?: JobSeekerNotification[];
  onOpenInbox?: () => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  internships,
  userResume,
  appliedInternshipIds,
  lang,
  onOpenResumeModal,
  onApplyInternship,
  activeUser,
  onLogin,
  onLogout,
  onNavigateLogin,
  notifications,
  onOpenInbox,
}) => {
  // Inline Quick Login State
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPassword, setQuickPassword] = useState('');
  const [quickRole, setQuickRole] = useState<UserRole>('student');
  const [quickError, setQuickError] = useState<string | null>(null);
  const [quickSuccess, setQuickSuccess] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  const handleQuickDemoLogin = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    onLogin(demo);
    setQuickSuccess(`${t.welcomeBack}, ${demo.name}!`);
    setTimeout(() => setQuickSuccess(null), 3000);
  };

  const handleInlineLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError(null);
    if (!quickEmail.trim() || !quickPassword.trim()) {
      setQuickError(
        lang === 'en'
          ? 'Please enter your email and password.'
          : 'దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.'
      );
      return;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: quickEmail.split('@')[0],
      email: quickEmail,
      role: quickRole,
      college: quickRole === 'student' ? 'GVPCE Visakhapatnam' : undefined,
      companyName: quickRole === 'sme' ? 'Vizag Tech Solutions' : undefined,
    };
    onLogin(newUser);
    setQuickSuccess(`${t.welcomeBack}, ${newUser.name}!`);
    setTimeout(() => setQuickSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
      {/* ======================================================== */}
      {/* STARTING ACCESS & INSTITUTIONAL DEMO LOGIN BAR           */}
      {/* ======================================================== */}
      <section aria-label="Portal Access Bar">
        {activeUser ? (
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                {activeUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-white">
                    {activeUser.name}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                    {activeUser.role}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold hidden sm:inline">
                    • Active Session
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeUser.college || activeUser.companyName || activeUser.email}
                  {activeUser.rollNumber ? ` • Roll: ${activeUser.rollNumber}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateLogin}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
              >
                Switch Role / Account
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-white space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'en'
                      ? 'Institutional Portal Starting Access (1-Click Switch)'
                      : 'సంస్థాగత పోర్టల్ ప్రారంభ యాక్సెస్'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'en'
                      ? 'Experience the platform as a Student, SME Recruiter, or T&P Placement Dean:'
                      : 'విద్యార్థి, SME రిక్రూటర్ లేదా T&P డీన్‌గా వేదికను అనుభవించండి:'}
                  </p>
                </div>
              </div>

              <button
                onClick={onNavigateLogin}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                <span>{lang === 'en' ? 'Full Login Page' : 'పూర్తి లాగిన్ పేజీ'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {quickSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                ✓ {quickSuccess}
              </div>
            )}

            {quickError && (
              <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                ⚠ {quickError}
              </div>
            )}

            {/* 1-Click Role Login Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 hover:bg-emerald-600/30 border border-slate-800 hover:border-emerald-500/60 transition-all text-left cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                    Student Login
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    Sai Tarun • GVPCE
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sme')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 hover:bg-blue-600/30 border border-slate-800 hover:border-blue-500/60 transition-all text-left cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-105 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-white group-hover:text-blue-300 truncate">
                    SME Recruiter
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    Vizag Tech Solutions
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('tnp')}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 hover:bg-purple-600/30 border border-slate-800 hover:border-purple-500/60 transition-all text-left cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-105 shrink-0">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-bold text-white group-hover:text-purple-300 truncate">
                    T&P Cell Dean
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    Dr. Srinivasa Rao
                  </span>
                </div>
              </button>
            </div>

            {/* Quick credentials input */}
            <form
              onSubmit={handleInlineLoginSubmit}
              className="pt-1 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative w-full sm:w-1/3">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  placeholder="student@gvpce.ac.in"
                  className="w-full text-xs pl-8 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="relative w-full sm:w-1/3">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={quickPassword}
                  onChange={(e) => setQuickPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full text-xs pl-8 pr-2.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-1/3">
                <select
                  value={quickRole}
                  onChange={(e) => setQuickRole(e.target.value as UserRole)}
                  className="text-xs px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 flex-1"
                >
                  <option value="student">Student</option>
                  <option value="sme">SME</option>
                  <option value="tnp">T&P Cell</option>
                </select>

                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap shadow-sm"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* Recruiter Feedback / Skills Guidance Notification Banner */}
      {notifications && notifications.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-xs animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  SME Application Feedback & Skill Guidance Received!
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                  {notifications.length} Update{notifications.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                <strong>{notifications[0].companyName}</strong> sent you technical skill guidance for{' '}
                <strong>{notifications[0].roleTitle}</strong>.
              </p>
            </div>
          </div>

          {onOpenInbox && (
            <button
              type="button"
              onClick={onOpenInbox}
              className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>View Skills to Improve & Email</span>
            </button>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* PRIMARY COMPONENT: STUDENT TALENT FEED (StudentFeed)     */}
      {/* ======================================================== */}
      <StudentFeed onOpenInbox={onOpenInbox} />
    </div>
  );
};

export default StudentHomeScreen;
