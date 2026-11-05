import React, { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  ClipboardCheck,
  Lock,
  Mail,
  User,
  Building,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  LogOut,
  MapPin,
} from 'lucide-react';
import { UserProfile, UserRole, Language } from '../types';
import { VIZAG_COLLEGES } from '../data/defaultData';
import { TRANSLATIONS } from '../utils/translations';

interface LoginPageProps {
  activeUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  lang: Language;
  onNavigateScreen: (screen: 'student' | 'sme' | 'tnp' | 'about') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  activeUser,
  onLogin,
  onLogout,
  lang,
  onNavigateScreen,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState(VIZAG_COLLEGES[0]);
  const [rollNumber, setRollNumber] = useState('');
  const [companyName, setCompanyName] = useState('Vizag Tech Solutions');
  const [department, setDepartment] = useState('B.Tech Computer Science');
  const [rememberMe, setRememberMe] = useState(true);

  const t = TRANSLATIONS[lang];

  // Quick Demo Accounts
  const handleQuickLogin = (role: UserRole) => {
    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      let demoUser: UserProfile;

      if (role === 'student') {
        demoUser = {
          id: 'user-student-demo',
          name: 'Sai Tarun',
          email: 'saitarun.cse@gvpce.ac.in',
          role: 'student',
          college: 'Gayatri Vidya Parishad College of Engineering (GVPCE)',
          rollNumber: '22GVP05A42',
          department: 'B.Tech CSE',
          phone: '+91 98490 23114',
        };
      } else if (role === 'sme') {
        demoUser = {
          id: 'user-sme-demo',
          name: 'P. Venkat Rao',
          email: 'hr@vizagtechsolutions.com',
          role: 'sme',
          companyName: 'Vizag Tech Solutions',
          department: 'Technical Talent Acquisition',
          phone: '+91 98480 11223',
        };
      } else {
        demoUser = {
          id: 'user-tnp-demo',
          name: 'Dr. M. Srinivasa Rao',
          email: 'tnp.dean@gvpce.ac.in',
          role: 'tnp',
          college: 'Gayatri Vidya Parishad College of Engineering (GVPCE)',
          designation: 'Dean, Training & Placements',
          phone: '+91 94401 99887',
        };
      }

      onLogin(demoUser);
      setLoading(false);
      setSuccessMessage(`${t.welcomeBack}, ${demoUser.name}!`);

      // Automatically redirect to role's main screen
      setTimeout(() => {
        if (role === 'student') onNavigateScreen('student');
        else if (role === 'sme') onNavigateScreen('sme');
        else onNavigateScreen('tnp');
      }, 700);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage(lang === 'en' ? 'Please fill in both email and password.' : 'దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ రెండింటినీ పూరించండి.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage(lang === 'en' ? 'Please enter a valid email address.' : 'దయచేసి సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(lang === 'en' ? 'Password must be at least 6 characters.' : 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim() || (selectedRole === 'student' ? 'Student Candidate' : selectedRole === 'sme' ? 'SME Recruiter' : 'T&P Coordinator'),
        email: email.trim(),
        role: selectedRole,
        college: selectedRole !== 'sme' ? college : undefined,
        rollNumber: selectedRole === 'student' ? (rollNumber.trim() || `23VZG${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
        companyName: selectedRole === 'sme' ? (companyName.trim() || 'Vizag Enterprise') : undefined,
        department: selectedRole === 'student' ? department : undefined,
      };

      onLogin(newUser);
      setLoading(false);
      setSuccessMessage(`${t.welcomeBack}, ${newUser.name}!`);

      setTimeout(() => {
        if (selectedRole === 'student') onNavigateScreen('student');
        else if (selectedRole === 'sme') onNavigateScreen('sme');
        else onNavigateScreen('tnp');
      }, 700);
    }, 500);
  };

  // If user is already logged in, show their active account card with options
  if (activeUser) {
    const roleColor = {
      student: 'bg-emerald-500/10 text-emerald-800 border-emerald-300',
      sme: 'bg-blue-500/10 text-blue-800 border-blue-300',
      tnp: 'bg-purple-500/10 text-purple-800 border-purple-300',
    }[activeUser.role];

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                {activeUser.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {activeUser.name}
                  </h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${roleColor}`}>
                    {activeUser.role.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeUser.email}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.logoutBtn}</span>
            </button>
          </div>

          {/* User Profile Details */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeUser.college && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Affiliated College</span>
                  <strong className="text-slate-800 font-semibold">{activeUser.college}</strong>
                </div>
              )}

              {activeUser.rollNumber && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Roll / Reg Number</span>
                  <strong className="text-slate-800 font-mono font-semibold">{activeUser.rollNumber}</strong>
                </div>
              )}

              {activeUser.companyName && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Enterprise / Organization</span>
                  <strong className="text-slate-800 font-semibold">{activeUser.companyName}</strong>
                </div>
              )}

              {activeUser.department && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Department</span>
                  <strong className="text-slate-800 font-semibold">{activeUser.department}</strong>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2 text-emerald-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Active session verified with institutional placement registry</span>
            </div>
          </div>

          {/* Direct Navigation shortcuts */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Quick Screen Access:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => onNavigateScreen('student')}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-colors cursor-pointer group"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-700">
                    Student Home
                  </span>
                  <span className="text-[11px] text-slate-500">Vizag Feed</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateScreen('sme')}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-colors cursor-pointer group"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-700">
                    SME Shortlist
                  </span>
                  <span className="text-[11px] text-slate-500">Candidate Cards</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateScreen('tnp')}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-colors cursor-pointer group"
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-700">
                    T&P Compliance
                  </span>
                  <span className="text-[11px] text-slate-500">NOC Reports</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-20">
      
      {/* Top Banner */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Visakhapatnam District Institutional Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.loginTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t.loginSubtitle}
        </p>
      </div>

      {/* Instant 1-Click Demo Accounts Strip */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>{t.demoAccountsHeader}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => handleQuickLogin('student')}
            disabled={loading}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800 hover:bg-emerald-600/80 border border-slate-700 hover:border-emerald-500 transition-all text-left text-xs font-semibold cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-white group-hover:text-emerald-700 shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-white font-bold">{t.demoStudentBtn}</span>
              <span className="text-[11px] text-slate-400 group-hover:text-slate-200">GVPCE • CSE Talent</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('sme')}
            disabled={loading}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800 hover:bg-emerald-600/80 border border-slate-700 hover:border-emerald-500 transition-all text-left text-xs font-semibold cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-white group-hover:text-blue-700 shrink-0">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-white font-bold">{t.demoSmeBtn}</span>
              <span className="text-[11px] text-slate-400 group-hover:text-slate-200">Rushikonda IT Park HR</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('tnp')}
            disabled={loading}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800 hover:bg-emerald-600/80 border border-slate-700 hover:border-emerald-500 transition-all text-left text-xs font-semibold cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-white group-hover:text-purple-700 shrink-0">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-white font-bold">{t.demoTnpBtn}</span>
              <span className="text-[11px] text-slate-400 group-hover:text-slate-200">College Placement Cell</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Login / Register Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-xl mx-auto">
        
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('student');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'student'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{t.roleStudent}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('sme');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'sme'
                ? 'bg-white text-blue-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{t.roleSme}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('tnp');
              setErrorMessage(null);
            }}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'tnp'
                ? 'bg-white text-purple-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>{t.roleTnp}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Subtitle describing selected role */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {selectedRole === 'student' && t.roleStudentDesc}
              {selectedRole === 'sme' && t.roleSmeDesc}
              {selectedRole === 'tnp' && t.roleTnpDesc}
            </span>
          </div>

          {/* Form Notification Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* If Sign Up, ask for Name */}
            {isSignUp && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === 'student' ? 'e.g. Sai Tarun' : 'e.g. Venkat Rao'}
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Email / ID */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'student'
                      ? 'student@gvpce.ac.in'
                      : selectedRole === 'sme'
                      ? 'recruiter@vizagtech.com'
                      : 'placement.dean@gvpce.ac.in'
                  }
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                />
              </div>
            </div>

            {/* Role-Specific fields on Sign Up */}
            {isSignUp && selectedRole === 'student' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Visakhapatnam Institution
                  </label>
                  <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800"
                  >
                    {VIZAG_COLLEGES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="e.g. 22GVP05A42"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="B.Tech CSE"
                      className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>
              </>
            )}

            {isSignUp && selectedRole === 'sme' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  SME Company / Enterprise Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Vizag Tech Solutions, Rushikonda"
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
              </div>
            )}

            {isSignUp && selectedRole === 'tnp' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  College Institution
                </label>
                <select
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  {VIZAG_COLLEGES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  {t.passwordLabel}
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(selectedRole)}
                    className="text-[11px] text-emerald-700 hover:underline font-semibold"
                  >
                    Use 1-Click Demo Login
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>{t.rememberMe}</span>
              </label>
              <span className="text-[11px] text-slate-400">Vizag T&P SSL Secure</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSignUp ? t.signUpBtn : t.signInBtn}</span>
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(null);
              }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
