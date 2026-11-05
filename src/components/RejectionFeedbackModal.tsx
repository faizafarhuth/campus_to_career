import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Mail,
  Send,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Plus,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Candidate, Internship, RejectionFeedback, UserProfile } from '../types';

interface RejectionFeedbackModalProps {
  candidate: Candidate | null;
  internships: Internship[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmRejection: (candidateId: string, feedback: RejectionFeedback) => void;
  activeUser: UserProfile | null;
}

export const RejectionFeedbackModal: React.FC<RejectionFeedbackModalProps> = ({
  candidate,
  internships,
  isOpen,
  onClose,
  onConfirmRejection,
  activeUser,
}) => {
  if (!isOpen || !candidate) return null;

  // Find the internship applied for to extract required skills
  const matchingInternship = useMemo(() => {
    if (candidate.appliedInternshipId) {
      const found = internships.find((i) => i.id === candidate.appliedInternshipId);
      if (found) return found;
    }
    return internships.find(
      (i) =>
        i.role.toLowerCase() === candidate.appliedRole.toLowerCase() ||
        i.company.toLowerCase() === candidate.appliedCompany.toLowerCase()
    );
  }, [candidate, internships]);

  // Identify skill gaps: required by role but not yet on candidate profile
  const suggestedSkillGaps = useMemo(() => {
    const candidateSkillsLower = (candidate.hard_skills || []).map((s) => s.toLowerCase());
    const required = matchingInternship?.requiredSkills || ['React', 'TypeScript', 'REST APIs', 'Git', 'System Design'];
    
    // Skills required by role that candidate lacks
    const gaps = required.filter((req) => !candidateSkillsLower.some((cand) => cand.includes(req.toLowerCase()) || req.toLowerCase().includes(cand)));
    
    if (gaps.length > 0) return gaps;
    return ['Advanced State Management', 'Unit Testing', 'Production Deployment'];
  }, [candidate, matchingInternship]);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Initialize skills and defaults when candidate changes
  useEffect(() => {
    setSelectedSkills(suggestedSkillGaps);
    
    const senderName = activeUser?.name || `${candidate.appliedCompany} Talent Acquisition`;
    setEmailSubject(`Application Update: ${candidate.appliedRole} at ${candidate.appliedCompany} - Skill Development Feedback`);
    
    setFeedbackNotes(
      `Thank you for taking the time to apply for the ${candidate.appliedRole} position with ${candidate.appliedCompany} through Campus to Career. While your profile showed commendable strengths in ${candidate.hard_skills.slice(0, 2).join(' & ')}, we received a significant volume of applications from Visakhapatnam colleges and have chosen to proceed with candidates whose immediate technical skillsets align closer to our current project sprints.`
    );
  }, [candidate, suggestedSkillGaps, activeUser]);

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillToRemove));
  };

  // Generate complete email text for preview and delivery
  const emailBodyText = useMemo(() => {
    const company = candidate.appliedCompany;
    const role = candidate.appliedRole;
    const skillsList = selectedSkills.length > 0 
      ? selectedSkills.map((s) => `• ${s}`).join('\n')
      : '• Core hands-on domain frameworks';

    return `Dear ${candidate.name},

${feedbackNotes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RECOMMENDED SKILLS TO STRENGTHEN FOR THIS ROLE:
${skillsList}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 NEXT STEPS & CAREER GUIDANCE:
We strongly encourage you to:
1. Build a functional, deployable project in Visakhapatnam focusing on the skills listed above.
2. Update your resume and re-upload it on Campus to Career for AI re-parsing.
3. Keep an eye on our subsequent semester hiring drives—we prioritize re-applicants who demonstrate skill growth!

We wish you the very best in your academic studies at ${candidate.college} and your engineering career.

Warm regards,
${activeUser?.name || 'Recruitment Team'}
${candidate.appliedCompany} (Visakhapatnam, AP)
Powered by Campus to Career`;
  }, [candidate, feedbackNotes, selectedSkills, activeUser]);

  const handleSendRejection = () => {
    setIsSending(true);
    
    const feedback: RejectionFeedback = {
      rejectedAt: new Date().toISOString(),
      skillsToImprove: selectedSkills,
      feedbackNotes: feedbackNotes.trim(),
      emailSubject: emailSubject.trim(),
      emailBody: emailBodyText,
      sentBy: activeUser?.name || `${candidate.appliedCompany} Hiring Team`,
    };

    setTimeout(() => {
      onConfirmRejection(candidate.id, feedback);
      setIsSending(false);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        onClose();
      }, 1800);
    }, 900);
  };

  const handleOpenMailto = () => {
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailBodyText);
    window.location.href = `mailto:${candidate.contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-7 space-y-6 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Reject Candidate & Send Skill Improvement Guidance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide constructive career feedback so the student knows exactly which skills to improve.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Candidate Profile Summary */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-bold text-slate-900 text-sm">{candidate.name}</div>
            <div className="text-slate-500">
              {candidate.college} • {candidate.branch} ({candidate.rollNumber})
            </div>
            <div className="text-emerald-700 font-semibold mt-0.5">
              Role: {candidate.appliedRole} at {candidate.appliedCompany}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-mono text-[11px]">
              {candidate.contactEmail}
            </span>
          </div>
        </div>

        {/* Step 1: Select or Add Skills Candidate Needs to Improve */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>1. Skills the Candidate Needs to Improve:</span>
            </label>
            <span className="text-[11px] text-slate-500">
              {selectedSkills.length} selected for feedback email
            </span>
          </div>

          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/80 space-y-2">
            <p className="text-[11px] text-amber-900">
              Select key technical skills the student was missing for <strong>{candidate.appliedRole}</strong>:
            </p>
            
            <div className="flex flex-wrap gap-1.5">
              {suggestedSkillGaps.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-amber-400'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 opacity-60" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <form onSubmit={handleAddCustomSkill} className="flex gap-2 pt-1">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                placeholder="Add other skill (e.g. Next.js, Docker, DSA)..."
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Add Skill
              </button>
            </form>

            {/* Selected Skills Pills */}
            {selectedSkills.length > 0 && (
              <div className="pt-2 border-t border-amber-200/50 flex flex-wrap gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 self-center mr-1">
                  Will include in email:
                </span>
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-semibold"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Personalized Feedback Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>2. Recruiter Notes & Encouragement:</span>
            </span>
            <span className="text-[11px] text-slate-400 normal-case">Included in email body</span>
          </label>
          <textarea
            rows={3}
            value={feedbackNotes}
            onChange={(e) => setFeedbackNotes(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
            placeholder="Write constructive notes for the student..."
          />
        </div>

        {/* Step 3: Email Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Formal Rejection & Improvement Email Preview:</span>
            </label>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
              Delivered to Job Seeker Inbox
            </span>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-[11px] space-y-2 border border-slate-800 max-h-44 overflow-y-auto">
            <div className="text-slate-400 border-b border-slate-800 pb-1.5 flex flex-col gap-0.5">
              <div><strong className="text-slate-300">To:</strong> {candidate.contactEmail}</div>
              <div><strong className="text-slate-300">From:</strong> {candidate.appliedCompany} Talent Team &lt;careers@{candidate.appliedCompany.toLowerCase().replace(/[^a-z0-9]/g, '')}.in&gt;</div>
              <div><strong className="text-slate-300">Subject:</strong> {emailSubject}</div>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
              {emailBodyText}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleOpenMailto}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Desktop Mail App (mailto)</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSendRejection}
              disabled={isSending || sendSuccess}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all cursor-pointer ${
                sendSuccess
                  ? 'bg-emerald-600'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {sendSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rejection & Skills Email Sent!</span>
                </>
              ) : isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending Feedback Email...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Rejection Email & Skill Advice</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
