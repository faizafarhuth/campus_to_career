import { Internship, ParsedResume } from '../types';

export interface MatchResult {
  percentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  fitLabel: 'High Fit' | 'Good Fit' | 'Potential Fit';
}

export function calculateSkillCompatibility(
  internship: Internship,
  userResume?: ParsedResume | null
): MatchResult {
  if (!userResume || !userResume.hard_skills || userResume.hard_skills.length === 0) {
    // Default baseline if no resume parsed yet
    return {
      percentage: 75,
      matchedSkills: internship.requiredSkills.slice(0, 2),
      missingSkills: internship.requiredSkills.slice(2),
      fitLabel: 'Good Fit',
    };
  }

  const userSkillsLower = userResume.hard_skills.map((s) => s.toLowerCase().trim());
  const requiredLower = internship.requiredSkills.map((s) => s.toLowerCase().trim());

  const matched: string[] = [];
  const missing: string[] = [];

  internship.requiredSkills.forEach((reqSkill) => {
    const isDirectMatch = userSkillsLower.some(
      (u) => u.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(u)
    );
    if (isDirectMatch) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  const baseRatio = matched.length / Math.max(internship.requiredSkills.length, 1);
  let percentage = Math.round(baseRatio * 100);

  // If readiness score is High, bonus +10%, if Developing, -5%
  if (userResume.readiness_score === 'High') {
    percentage = Math.min(98, percentage + 12);
  } else if (userResume.readiness_score === 'Developing') {
    percentage = Math.max(45, percentage - 8);
  }

  // Ensure minimum realistic boundary
  percentage = Math.max(35, Math.min(99, percentage));

  let fitLabel: 'High Fit' | 'Good Fit' | 'Potential Fit' = 'Good Fit';
  if (percentage >= 80) fitLabel = 'High Fit';
  else if (percentage < 60) fitLabel = 'Potential Fit';

  return {
    percentage,
    matchedSkills: matched,
    missingSkills: missing,
    fitLabel,
  };
}

export interface CandidateMatchResult {
  percentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  fitLabel: 'High Fit' | 'Good Fit' | 'Potential Fit';
  targetRole: string;
  targetCompany: string;
}

export function calculateCandidateCompatibility(
  candidate: { hard_skills: string[]; readiness_score: 'High' | 'Medium' | 'Developing'; appliedRole: string; appliedCompany: string; appliedInternshipId?: string },
  targetInternship?: Internship | null
): CandidateMatchResult {
  const requiredSkills = targetInternship?.requiredSkills ?? [];
  const candidateSkillsLower = (candidate.hard_skills || []).map((s) => s.toLowerCase().trim());

  const matched: string[] = [];
  const missing: string[] = [];

  if (requiredSkills.length === 0) {
    const base = candidate.readiness_score === 'High' ? 88 : candidate.readiness_score === 'Medium' ? 76 : 60;
    return {
      percentage: base,
      matchedSkills: candidate.hard_skills.slice(0, 3),
      missingSkills: [],
      fitLabel: base >= 80 ? 'High Fit' : 'Good Fit',
      targetRole: candidate.appliedRole,
      targetCompany: candidate.appliedCompany,
    };
  }

  requiredSkills.forEach((reqSkill) => {
    const isDirectMatch = candidateSkillsLower.some(
      (u) => u.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(u)
    );
    if (isDirectMatch) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  const baseRatio = matched.length / Math.max(requiredSkills.length, 1);
  let percentage = Math.round(baseRatio * 100);

  if (candidate.readiness_score === 'High') {
    percentage = Math.min(98, percentage + 12);
  } else if (candidate.readiness_score === 'Developing') {
    percentage = Math.max(35, percentage - 8);
  }

  percentage = Math.max(35, Math.min(98, percentage));

  let fitLabel: 'High Fit' | 'Good Fit' | 'Potential Fit' = 'Good Fit';
  if (percentage >= 80) fitLabel = 'High Fit';
  else if (percentage < 60) fitLabel = 'Potential Fit';

  return {
    percentage,
    matchedSkills: matched,
    missingSkills: missing,
    fitLabel,
    targetRole: targetInternship?.role || candidate.appliedRole,
    targetCompany: targetInternship?.company || candidate.appliedCompany,
  };
}

