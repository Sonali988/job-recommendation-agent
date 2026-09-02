import type { JobOpportunity, YouthCase } from '../types/case'
import type { Opportunity, Skill, YouthProfile } from '../types/youth'

const ALIASES: Record<string, string> = {
  js: 'javascript',
  reactjs: 'react',
  node: 'node.js',
  nodejs: 'node.js',
  ts: 'typescript',
  'rest api': 'rest apis',
  'rest apis': 'rest apis',
  api: 'rest apis',
  postgres: 'sql',
  mysql: 'sql',
  mongodb: 'sql',
  springboot: 'spring boot',
  spring: 'spring boot',
  agile: 'agile',
  scrum: 'agile',
}

const TECH_SKILL_HINTS = [
  'javascript',
  'typescript',
  'react',
  'node.js',
  'java',
  'python',
  'sql',
  'git',
  'spring boot',
  'aws',
  'docker',
  'kubernetes',
  'html',
  'css',
  'angular',
  'vue',
  'rest apis',
  'microservices',
  'linux',
  'cloud',
  'devops',
  'data structures',
  'algorithms',
]

const GENERIC_REQUIREMENTS: Record<string, RegExp[]> = {
  programming: [/javascript|typescript|java|python|c\+\+|react|node|sql|git/i],
  'software development': [/javascript|typescript|java|python|react|node|developer|engineer/i],
  'problem solving': [/algorithm|data structure|problem solving|coding/i],
  collaboration: [/agile|scrum|communication|team/i],
  'artificial intelligence': [/python|machine learning|ml|ai|data/i],
  'good communication skill': [/communication|english|soft/i],
  'data entry': [/excel|computer|typing|data/i],
}

export function normalizeSkill(name: string): string {
  const trimmed = name.trim().toLowerCase()
  return ALIASES[trimmed] ?? trimmed
}

export function collectProfileSkills(caseOrSkills: YouthCase | Skill[] | Set<string>): Set<string> {
  if (caseOrSkills instanceof Set) return caseOrSkills

  const names: string[] = Array.isArray(caseOrSkills)
    ? caseOrSkills.map((s) => s.name)
    : [
        ...caseOrSkills.skills.map((s) => s.name),
        ...caseOrSkills.jobProfile.primarySkills,
        ...caseOrSkills.jobProfile.secondarySkills,
      ]

  return new Set(names.map(normalizeSkill).filter(Boolean))
}

function inferRequiredSkills(opp: Pick<JobOpportunity, 'requiredSkills' | 'jobTitle' | 'functionalState' | 'jobDescription'>): string[] {
  const listed = (opp.requiredSkills ?? []).map((s) => s.trim()).filter(Boolean)
  if (listed.length) return listed

  const text = `${opp.jobTitle} ${opp.functionalState} ${opp.jobDescription}`.toLowerCase()
  return TECH_SKILL_HINTS.filter((skill) => text.includes(skill))
}

function skillMatchesRequirement(have: Set<string>, requirement: string): boolean {
  const req = normalizeSkill(requirement)
  if (!req) return false

  if ([...have].some((h) => h === req || h.includes(req) || req.includes(h))) {
    return true
  }

  const genericRules = GENERIC_REQUIREMENTS[req]
  if (genericRules) {
    const profileText = [...have].join(' ')
    return genericRules.some((pattern) => pattern.test(profileText))
  }

  return false
}

export function computeSkillOverlap(
  haveInput: YouthCase | Skill[] | Set<string>,
  requiredInput: string[] | JobOpportunity,
  title = '',
  description = '',
): { match: number; total: number; ratio: number } {
  const have = collectProfileSkills(haveInput)

  const required =
    Array.isArray(requiredInput)
      ? requiredInput
      : inferRequiredSkills(requiredInput)

  const resolvedRequired = required.length
    ? required
    : inferRequiredSkills({ requiredSkills: [], jobTitle: title, functionalState: '', jobDescription: description })

  const total = Math.max(resolvedRequired.length, 1)
  const match = resolvedRequired.filter((req) => skillMatchesRequirement(have, req)).length
  const ratio = match / total

  return { match, total, ratio }
}

/** Display score driven primarily by real skill overlap. */
export function deriveDisplayMatchScore(skillRatio: number, backendScorePercent = 0): number {
  const skillPct = Math.round(skillRatio * 100)

  if (skillPct === 0) {
    return Math.min(Math.round(backendScorePercent * 0.4), 30)
  }

  return Math.round(skillPct * 0.8 + backendScorePercent * 0.2)
}

export function enrichOpportunityMetrics(
  opp: Opportunity,
  profileSkills: Skill[],
  backendScorePercent?: number,
): Opportunity {
  const required = opp.requiredSkills ?? inferRequiredSkills({
    requiredSkills: [],
    jobTitle: opp.title,
    functionalState: '',
    jobDescription: opp.description,
  })

  const { match, total, ratio } = computeSkillOverlap(profileSkills, required, opp.title, opp.description)
  const backend = backendScorePercent ?? opp.matchScore

  return {
    ...opp,
    requiredSkills: required,
    skillsMatch: match,
    skillsTotal: total,
    matchScore: deriveDisplayMatchScore(ratio, backend),
  }
}

export function countSkillGaps(profile: Pick<YouthProfile, 'skills' | 'opportunities'>): number {
  const have = collectProfileSkills(profile.skills)
  const needed = new Set<string>()

  for (const opp of profile.opportunities) {
    for (const skill of opp.requiredSkills ?? []) {
      const key = skill.trim()
      if (!key) continue
      const normalized = normalizeSkill(key)
      if (have.has(normalized)) continue
      needed.add(normalized)
    }
  }

  return needed.size
}

export function recomputeProfileOpportunities(profile: YouthProfile): YouthProfile {
  const opportunities = profile.opportunities
    .map((opp) => enrichOpportunityMetrics(opp, profile.skills))
    .sort((a, b) => b.skillsMatch - a.skillsMatch || b.matchScore - a.matchScore)

  return { ...profile, opportunities }
}

export function countSkillOverlap(caseData: YouthCase, opp: JobOpportunity) {
  const { match, total } = computeSkillOverlap(caseData, opp)
  return { match, total }
}
