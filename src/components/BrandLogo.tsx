import React from 'react';
import { GraduationCap, Briefcase, ClipboardCheck, Sparkles, Compass } from 'lucide-react';

interface SectionLogoProps {
  type?: 'student' | 'sme' | 'tnp' | 'main';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SectionLogo: React.FC<SectionLogoProps> = ({
  type = 'student',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const iconSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (type === 'student') {
    return (
      <div
        className={`${sizeMap[size]} bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300/40 shrink-0 ${className}`}
        aria-hidden="true"
      >
        <GraduationCap className={iconSizeMap[size]} />
      </div>
    );
  }

  if (type === 'sme') {
    return (
      <div
        className={`${sizeMap[size]} bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30 shrink-0 ${className}`}
        aria-hidden="true"
      >
        <Briefcase className={iconSizeMap[size]} />
      </div>
    );
  }

  if (type === 'tnp') {
    return (
      <div
        className={`${sizeMap[size]} bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white font-black flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-400/30 shrink-0 ${className}`}
        aria-hidden="true"
      >
        <ClipboardCheck className={iconSizeMap[size]} />
      </div>
    );
  }

  return (
    <div
      className={`${sizeMap[size]} bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white font-black flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-emerald-400/40 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <Compass className={iconSizeMap[size]} />
    </div>
  );
};

export const BrandLogo: React.FC<{ size?: 'sm' | 'md' | 'lg'; subtitle?: boolean }> = ({
  size = 'md',
  subtitle = true,
}) => {
  return (
    <div className="flex items-center gap-2.5">
      <SectionLogo type="student" size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
            Campus <span className="text-emerald-600 font-black">to</span> Career
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            Vizag
          </span>
        </div>
        {subtitle && (
          <span className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">
            College Talent & T&P Compliance
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
