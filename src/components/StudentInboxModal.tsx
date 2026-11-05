import React, { useState } from 'react';
import {
  X,
  Mail,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  Layers,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';
import { JobSeekerNotification } from '../types';

interface StudentInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: JobSeekerNotification[];
  onMarkAsRead: (id: string) => void;
  onOpenResumeModal: () => void;
}

export const StudentInboxModal: React.FC<StudentInboxModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onOpenResumeModal,
}) => {
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(
    notifications.length > 0 ? notifications[0].id : null
  );

  if (!isOpen) return null;

  const activeNotification = notifications.find((n) => n.id === selectedNotificationId) || notifications[0] || null;

  const handleSelectNotification = (notif: JobSeekerNotification) => {
    setSelectedNotificationId(notif.id);
    if (!notif.read) {
      onMarkAsRead(notif.id);
    }
  };

  const handleActionReScan = () => {
    onClose();
    onOpenResumeModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Student Inbox & Recruiter Feedback
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  {notifications.filter((n) => !n.read).length} Unread
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official decision updates and actionable skill improvement advice from Visakhapatnam employers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Your Inbox is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When local SMEs review your application, official status updates and constructive skill improvement emails will appear right here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            
            {/* Left: Message List */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto max-h-56 md:max-h-[550px] bg-slate-50 divide-y divide-slate-100">
              {notifications.map((notif) => {
                const isSelected = activeNotification?.id === notif.id;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleSelectNotification(notif)}
                    className={`p-3.5 cursor-pointer transition-colors text-left ${
                      isSelected
                        ? 'bg-white border-l-4 border-l-emerald-600 shadow-xs'
                        : notif.read
                        ? 'hover:bg-slate-100/80 bg-slate-50/50'
                        : 'bg-emerald-50/40 hover:bg-emerald-50/70 border-l-4 border-l-amber-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {notif.companyName}
                      </span>
                      {!notif.read && (
                        <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-700 font-medium truncate mb-1">
                      {notif.roleTitle}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-rose-600 font-semibold text-[10px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                        Application Update
                      </span>
                      <span>
                        {new Date(notif.sentAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Message Detail */}
            {activeNotification && (
              <div className="flex-1 p-5 sm:p-6 overflow-y-auto max-h-[550px] space-y-5 bg-white">
                
                {/* Meta Header */}
                <div className="border-b border-slate-100 pb-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Decision: Application Closed (Feedback Included)</span>
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(activeNotification.sentAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {activeNotification.subject}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <Building className="w-4 h-4 text-slate-500" />
                    <span>
                      From: <strong>{activeNotification.companyName} Hiring Team</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Role: <strong>{activeNotification.roleTitle}</strong></span>
                  </div>
                </div>

                {/* HIGHLIGHTED SECTION: Skills to Improve */}
                {activeNotification.skillsToImprove && activeNotification.skillsToImprove.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 rounded-xl border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Specific Skills You Need to Improve:</span>
                    </div>

                    <p className="text-xs text-amber-900/90 leading-relaxed">
                      The engineering recruiters at <strong>{activeNotification.companyName}</strong> specifically highlighted these technical areas where building more project experience will qualify you for upcoming hiring drives:
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {activeNotification.skillsToImprove.map((skill, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 shadow-2xs text-amber-950 font-bold text-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recruiter Feedback Note */}
                {activeNotification.feedbackNotes && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <span>Recruiter Feedback & Notes:</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{activeNotification.feedbackNotes}"
                    </p>
                  </div>
                )}

                {/* Complete Email Body Content */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Official Email Dispatch:
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {activeNotification.body}
                  </div>
                </div>

                {/* Next Steps for Student */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    💡 Tip: Build a mini-project with these skills, then re-upload your resume.
                  </div>

                  <button
                    type="button"
                    onClick={handleActionReScan}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Update Resume & Re-Scan with AI</span>
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
