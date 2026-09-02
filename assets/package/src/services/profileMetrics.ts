import type { YouthCase } from '../types/case'
import type { Application, Opportunity, Skill, SkillTier, Stats, TargetSkill, YouthProfile } from '../types/youth'
import { countSkillGaps, recomputeProfileOpportunities } from './skillMatch'

export { countSkillOverlap } from './skillMatch'

/** Maps youth skill inventory to mediocre → developing → low-expert tiers. */
export function computeSkillTier(c: YouthCase): SkillTier {
  if (!c.skills.length) return 'mediocre'

  const advanced = c.skills.filter((s) => s.level === 'ADVANCED').length
  const intermediate = c.skills.filter((s) => s.level === 'INTERMEDIATE').length
  const avgYears = c.skills.reduce((sum, s) => sum + s.years, 0) / c.skills.length
  const expBonus = c.jobProfile.experienceYears >= 2 ? 1 : 0

  if (advanced >= 2 || (advanced >= 1 && avgYears >= 2 && expBonus)) return 'low-expert'
  if (intermediate >= 2 || advanced >= 1 || c.skills.length >= 4) return 'developing'
  return 'mediocre'
}

export function courseSkillLevel(courseName: string, id: number): SkillTier {
  const hash = (id * 7 + courseName.length) % 3
  return (['mediocre', 'developing', 'low-expert'] as SkillTier[])[hash]
}

export function tierLabel(tier: SkillTier): string {
  return { mediocre: 'Mediocre', developing: 'Developing', 'low-expert': 'Low Expert' }[tier]
}

export function tierCardClass(tier: SkillTier): string {
  return {
    mediocre: 'border-gray-100 bg-gray-50/30 shadow-none',
    developing: 'border-amber-100 bg-amber-50/20 shadow-sm',
    'low-expert': 'border-violet-100 bg-violet-50/20 shadow-md',
  }[tier]
}

/** Weighted, per-profile completeness score (not a flat 90% for everyone). */
export function computeProfileStrength(c: YouthCase): number {
  const edu =
    (c.education.course ? 4 : 0) +
    (c.education.specialization ? 4 : 0) +
    (c.education.institution ? 4 : 0) +
    (c.education.percentage > 0 ? Math.min(c.education.percentage / 20, 5) : 0) +
    (c.education.status === 'COMPLETED' ? 4 : c.education.status === 'PURSUING' ? 2 : 0)

  const advanced = c.skills.filter((s) => s.level === 'ADVANCED').length
  const experienced = c.skills.filter((s) => s.years >= 2).length
  const skills = Math.min(
    c.skills.length * 2.5 + advanced * 3 + experienced * 2 + c.jobProfile.primarySkills.length * 2,
    28
  )

  const prefs =
    (c.careerPreferences.roles.length > 0 ? 6 : 0) +
    Math.min(c.careerPreferences.roles.length * 2, 4) +
    (c.careerPreferences.locations.length > 0 ? 5 : 0) +
    (c.careerPreferences.industries.length > 0 ? 4 : 0) +
    (c.careerPreferences.workMode ? 3 : 0) +
    (c.careerPreferences.minSalary > 0 ? 4 : 0)

  const extras =
    (c.certifications.length > 0 ? 7 : 0) +
    (c.interests.length > 0 ? 4 : 0) +
    (c.languages.length >= 2 ? 5 : c.languages.length === 1 ? 2 : 0) +
    Math.min(c.jobProfile.experienceYears * 4, 12) +
    (c.jobProfile.secondarySkills.length > 0 ? 4 : 0) +
    (c.jobProfile.status ? 3 : 0)

  const youthBonus = c.youthType === 'JOB_SEEKER' ? 4 : c.youthType === 'STUDENT' ? 2 : 0

  return Math.round(Math.min(edu + skills + prefs + extras + youthBonus, 100))
}

export function jobExperienceLevel(minExp: number, maxExp: number): string {
  const level = maxExp || minExp
  if (level <= 0) return 'Entry Level'
  if (level <= 2) return 'Junior Level'
  if (level <= 5) return 'Mid Level'
  return 'Senior Level'
}

export function deriveApplicationCount(c: YouthCase, matchCount: number): number {
  const base =
    c.youthType === 'JOB_SEEKER'
      ? Math.max(2, Math.floor(matchCount * 0.2) + c.jobProfile.experienceYears)
      : Math.max(0, Math.floor(matchCount * 0.08))
  return Math.min(base, matchCount, 20)
}

export function computeStats(input: {
  opportunities: Opportunity[]
  applications: Application[]
  skills: Skill[]
  targetSkills: TargetSkill[]
  gapSkillsCount?: number
}): Stats {
  const gaps = input.gapSkillsCount ?? countSkillGaps({
    skills: input.skills,
    opportunities: input.opportunities,
  })

  return {
    matchesFound: input.opportunities.length,
    applied: input.applications.length,
    interviews: input.applications.filter(
      (a) => a.status === 'interview' || a.status === 'offered',
    ).length,
    skillsAdded: input.skills.length,
    skillsTotal: input.skills.length + gaps,
  }
}

export function syncYouthProfileStats(profile: YouthProfile): YouthProfile {
  const withOpportunities = recomputeProfileOpportunities(profile)
  return {
    ...withOpportunities,
    stats: computeStats(withOpportunities),
  }
}
