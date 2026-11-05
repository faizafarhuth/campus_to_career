import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Building,
  MapPin,
  Banknote,
  Users,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Plus,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { Internship, VizagZone, Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface PostInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostInternship: (internship: Internship) => void;
  lang: Language;
  activeUser: UserProfile | null;
}

const VIZAG_ZONES: VizagZone[] = [
  'IT Corridor / Rushikonda',
  'Industrial Belt / Gajuwaka & Duvvada',
  'City Center / Siripuram & Dwaraka',
  'Port & Maritime / Harbor Park',
  'Steel Plant & Autonagar',
];

const DEPARTMENTS = ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Chemical', 'Data Science', 'Management'];

export const PostInternshipModal: React.FC<PostInternshipModalProps> = ({
  isOpen,
  onClose,
  onPostInternship,
  lang,
  activeUser,
}) => {
  const [company, setCompany] = useState(activeUser?.companyName || 'Vizag Tech Solutions');
  const [role, setRole] = useState('');
  const [zone, setZone] = useState<VizagZone>('IT Corridor / Rushikonda');
  const [location, setLocation] = useState('Rushikonda IT Park');
  const [stipend, setStipend] = useState('₹10,000/mo');
  const [openings, setOpenings] = useState(2);
  const [skillsInput, setSkillsInput] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDepts, setSelectedDepts] = useState<string[]>(['CSE', 'IT']);
  const [isFeatured, setIsFeatured] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postedSuccess, setPostedSuccess] = useState(false);

  const t = TRANSLATIONS[lang];

  if (!isOpen) return null;

  const handleToggleDept = (dept: string) => {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!role.trim()) {
      setError(lang === 'en' ? 'Please enter the internship role title.' : 'దయచేసి ఇంటర్న్‌షిప్ ఉద్యోగ పాత్రను నమోదు చేయండి.');
      return;
    }

    if (!company.trim()) {
      setError(lang === 'en' ? 'Please enter the SME company name.' : 'దయచేసి SME సంస్థ పేరును నమోదు చేయండి.');
      return;
    }

    if (!location.trim()) {
      setError(lang === 'en' ? 'Please specify the Vizag location/landmark.' : 'దయచేసి వైజాగ్ లొకేషన్‌ను పేర్కొనండి.');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (skills.length === 0) {
      setError(lang === 'en' ? 'Please enter at least one required technical skill.' : 'దయచేసి కనీసం ఒక సాంకేతిక నైపుణ్యాన్ని నమోదు చేయండి.');
      return;
    }

    const newInternship: Internship = {
      id: `int-sme-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      location: location.trim(),
      zone,
      stipend: stipend.trim() || '₹8,000/mo',
      status: 'Active',
      isSample: false,
      requiredSkills: skills,
      description: description.trim() || `Exciting internship opening at ${company} for passionate college students in Visakhapatnam. Hands-on exposure to live industrial workflows and mentor guidance.`,
      departmentTarget: selectedDepts.length > 0 ? selectedDepts : ['All Engineering Branches'],
      openings: Math.max(1, openings),
      postedDate: new Date().toISOString().split('T')[0],
      postedBy: activeUser?.name || 'Verified SME Recruiter',
      featured: isFeatured,
    };

    onPostInternship(newInternship);
    setPostedSuccess(true);

    setTimeout(() => {
      setPostedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                {lang === 'en' ? 'Post Internship Availability' : 'ఇంటర్న్‌షిప్ ఖాళీని పోస్ట్ చేయండి'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'en' ? 'Publish active positions for Vizag college students to apply' : 'వైజాగ్ విద్యార్థులు దరఖాస్తు చేసుకోవడానికి ఖాళీలను పోస్ట్ చేయండి'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 text-slate-800">
          
          {postedSuccess ? (
            <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h4 className="text-xl font-bold text-slate-900">
                Internship Successfully Posted!
              </h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your opening for <strong>{role}</strong> at <strong>{company}</strong> is now LIVE in the Visakhapatnam student feed. Students can now view compatibility and submit 1-click applications!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    SME Enterprise / Company Name *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Vizag Tech Solutions"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Internship Role / Job Title *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. React Developer Intern"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Zone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Visakhapatnam Industrial Zone *
                  </label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as VizagZone)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
                  >
                    {VIZAG_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Specific Location / Area *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Millennium Tower, Rushikonda"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Stipend & Openings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Monthly Stipend *
                  </label>
                  <div className="relative">
                    <Banknote className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      placeholder="e.g. ₹10,000/mo"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Available Openings *
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      value={openings}
                      onChange={(e) => setOpenings(parseInt(e.target.value, 10) || 1)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Required Technical Skills */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Required Skills & Tech Stack (comma separated) *
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. React, JavaScript, HTML, Tailwind, REST APIs"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Students' AI parsed resumes will be matched against these specific skills.
                </p>
              </div>

              {/* Target Academic Departments */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Target Academic Branches:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      type="button"
                      key={dept}
                      onClick={() => handleToggleDept(dept)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedDepts.includes(dept)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dept} {selectedDepts.includes(dept) && '✓'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Role Description & Expectations:
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the projects and hands-on exposure the student intern will gain..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 resize-y"
                />
              </div>

              {/* Featured Listing Tier Checkbox */}
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="featured-tier"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="featured-tier" className="text-xs text-emerald-950 cursor-pointer">
                  <strong className="block text-emerald-900 font-bold">
                    Feature on Visakhapatnam Campus Roster (₹999 SME Listing Tier)
                  </strong>
                  Priority placement at the top of the Student Home feed, verified green badge, and automated AI skill scoring across all Vizag engineering colleges.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Internship Availability</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Visakhapatnam SME Network</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
