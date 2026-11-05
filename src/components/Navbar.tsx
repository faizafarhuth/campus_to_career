import React, { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  ClipboardCheck,
  Info,
  Sparkles,
  RotateCcw,
  Menu,
  X,
  Globe,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Mail,
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface NavbarProps {
  currentScreen: 'student' | 'sme' | 'tnp' | 'about' | 'login';
  onNavigate: (screen: 'student' | 'sme' | 'tnp' | 'about' | 'login') => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenResumeModal: () => void;
  onClearData: () => void;
  activeUser: UserProfile | null;
  onLogout: () => void;
  onOpenPostModal?: () => void;
  unreadNotificationCount?: number;
  onOpenInbox?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  lang,
  onToggleLang,
  onOpenResumeModal,
  onClearData,
  activeUser,
  onLogout,
  onOpenPostModal,
  unreadNotificationCount,
  onOpenInbox,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleNav = (screen: 'student' | 'sme' | 'tnp' | 'about' | 'login') => {
    onNavigate(screen);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'student':
        return { label: 'Student', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'sme':
        return { label: 'SME', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'tnp':
        return { label: 'T&P Dean', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      default:
        return { label: 'Member', bg: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Platform Name */}
          <div
            onClick={() => handleNav('student')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  Campus to Career
                </span>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  VIZAG
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNav('student')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentScreen === 'student'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              {t.navStudentHome}
            </button>

            <button
              onClick={() => handleNav('sme')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentScreen === 'sme'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              {t.navSmeShortlist}
            </button>

            <button
              onClick={() => handleNav('tnp')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentScreen === 'tnp'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              {t.navTnpDashboard}
            </button>

            <button
              onClick={() => handleNav('about')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                currentScreen === 'about'
                  ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Info className="w-4 h-4" />
              {t.navAbout}
            </button>
          </nav>

          {/* Right actions: Language toggle, User Profile / Login, Upload Resume CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Language switch */}
            <button
              onClick={onToggleLang}
              aria-label="Toggle Language"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Inbox & Skill Feedback */}
            {onOpenInbox && (
              <button
                onClick={onOpenInbox}
                title="Student Inbox & Recruiter Feedback"
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>Inbox</span>
                {typeof unreadNotificationCount === 'number' && unreadNotificationCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Clear Data */}
            <button
              onClick={onClearData}
              title={t.clearDataBtn}
              className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden xl:inline text-xs">{t.clearDataBtn}</span>
            </button>

            {/* Login / User Profile Dropdown */}
            {activeUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    currentScreen === 'login'
                      ? 'bg-slate-800 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {activeUser.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block leading-none">
                      {activeUser.name.split(' ')[0]}
                    </span>
                    <span className={`text-[9px] font-bold px-1 py-0.2 rounded border ${getRoleBadge(activeUser.role).bg}`}>
                      {getRoleBadge(activeUser.role).label}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{activeUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{activeUser.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav('login')}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.navProfile}</span>
                    </button>

                    {onOpenPostModal && currentScreen !== 'student' && activeUser.role === 'sme' && (
                      <button
                        onClick={() => {
                          onOpenPostModal();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-emerald-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Post Internship Availability</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.logoutBtn}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentScreen === 'login'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.navLogin}</span>
              </button>
            )}

            {/* Main AI Resume CTA */}
            <button
              onClick={onOpenResumeModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>AI Resume Parser</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => handleNav('login')}
              className="px-2 py-1 rounded border border-slate-700 text-xs font-bold text-slate-200 bg-slate-800"
            >
              {activeUser ? activeUser.name.split(' ')[0] : t.navLogin}
            </button>

            <button
              onClick={onToggleLang}
              className="px-2 py-1 rounded border border-slate-700 text-xs font-bold text-slate-200 bg-slate-800"
            >
              {lang === 'en' ? 'తె' : 'EN'}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-2">
          
          {/* Active user strip on mobile if logged in */}
          {activeUser && (
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {activeUser.name.charAt(0)}
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{activeUser.name}</span>
                  <span className="text-[10px] text-slate-400">{activeUser.email}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                {t.logoutBtn}
              </button>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => handleNav('student')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
                currentScreen === 'student'
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
              {t.navStudentHome}
            </button>

            <button
              onClick={() => handleNav('sme')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
                currentScreen === 'sme'
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              {t.navSmeShortlist}
            </button>

            <button
              onClick={() => handleNav('tnp')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
                currentScreen === 'tnp'
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ClipboardCheck className="w-5 h-5" />
              {t.navTnpDashboard}
            </button>

            <button
              onClick={() => handleNav('about')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
                currentScreen === 'about'
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Info className="w-5 h-5" />
              {t.navAbout}
            </button>

            <button
              onClick={() => handleNav('login')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
                currentScreen === 'login'
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <User className="w-5 h-5" />
              {activeUser ? t.navProfile : t.navLogin}
            </button>

            {onOpenInbox && (
              <button
                onClick={() => {
                  onOpenInbox();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-left text-slate-300 hover:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <span>Student Inbox & Feedback</span>
                </div>
                {typeof unreadNotificationCount === 'number' && unreadNotificationCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                    {unreadNotificationCount} new
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenResumeModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-emerald-600 text-white font-semibold text-sm shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Resume Parser & Match</span>
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={onToggleLang}
                className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'en' ? 'తెలుగులోకి మార్చండి' : 'Switch to English'}</span>
              </button>

              <button
                onClick={() => {
                  onClearData();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.clearDataBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
