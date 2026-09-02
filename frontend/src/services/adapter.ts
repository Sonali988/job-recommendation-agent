import type { CaseResponse, JobOpportunity, YouthCase } from '../types/case'
import type { YouthProfile, Opportunity, TargetSkill, Application } from '../types/youth'
import type { CourseItem } from '../types/youth'
import {
  computeProfileStrength,
  computeSkillTier,
  computeStats,
  courseSkillLevel,
  deriveApplicationCount,
  jobExperienceLevel,
  syncYouthProfileStats,
} from './profileMetrics'
import { computeSkillOverlap, collectProfileSkills, deriveDisplayMatchScore, normalizeSkill } from './skillMatch'
import { companyLogoKey, resolveCompanyName } from './companyUtils'

function formatSalary(min: number, max: number, hidden: boolean): string {
  if (hidden || (min === 0 && max === 0)) return 'Not disclosed'
  const fmt = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(0)} LPA` : `₹${n.toLocaleString('en-IN')}/mo`
  if (min && max && min !== max) return `${fmt(min)} - ${fmt(max)}`
  return fmt(min || max)
}

function mapOpportunity(opp: JobOpportunity, caseData: YouthCase): Opportunity {
  const backendScore = Math.round(opp.matchScore * 100)
  const { match, total, ratio } = computeSkillOverlap(caseData, opp)
  const location = opp.jobLocations[0] || caseData.location.district || 'India'

  const company = resolveCompanyName(opp)
  const requiredSkills = (opp.requiredSkills ?? []).map((s) => s.trim()).filter(Boolean)

  return {
    id: String(opp.id),
    company,
    logo: companyLogoKey(company),
    title: opp.jobTitle || opp.functionalState || 'Job Opening',
    location,
    workType: opp.jobType?.replace(/_/g, ' ') || 'Full Time',
    experienceLevel: jobExperienceLevel(opp.minExperience ?? 0, opp.maxExperience ?? 0),
    salaryRange: formatSalary(opp.minSalary, opp.maxSalary, opp.hideSalaryRange),
    matchScore: deriveDisplayMatchScore(ratio, backendScore),
    skillsMatch: match,
    skillsTotal: total,
    requiredSkills,
    description: opp.jobDescription,
    postedDate: opp.publishedAt?.slice(0, 10) || '',
    jobPostUrl: opp.jobPostUrl,
    saved: false,
  }
}

function buildMappedSkills(c: YouthCase) {
  const seen = new Set<string>()
  const mapped: Array<{
    id: string
    name: string
    level: 'beginner' | 'intermediate' | 'advanced'
    category: string
    verified: boolean
  }> = []

  const addSkill = (name: string, level?: string, years = 0) => {
    const key = name.trim().toLowerCase()
    if (!key || seen.has(key)) return
    seen.add(key)
    const normalizedLevel = (level?.toLowerCase() || 'intermediate') as 'beginner' | 'intermediate' | 'advanced'
    mapped.push({
      id: `sk-${mapped.length}`,
      name: name.trim(),
      level: normalizedLevel,
      category: 'general',
      verified: years >= 2,
    })
  }

  for (const skill of c.skills) {
    addSkill(skill.name, skill.level, skill.years)
  }
  for (const name of c.jobProfile.primarySkills) {
    const existing = c.skills.find((s) => s.name.toLowerCase() === name.toLowerCase())
    addSkill(name, existing?.level, existing?.years ?? 1)
  }
  for (const name of c.jobProfile.secondarySkills) {
    const existing = c.skills.find((s) => s.name.toLowerCase() === name.toLowerCase())
    addSkill(name, existing?.level, existing?.years ?? 1)
  }

  return mapped
}

function deriveTargetSkills(
  caseData: YouthCase,
  opportunities: JobOpportunity[],
  max = 6,
): TargetSkill[] {
  const have = collectProfileSkills(caseData)
  const needed = new Map<string, number>()

  for (const opp of opportunities.slice(0, 15)) {
    for (const skill of opp.requiredSkills) {
      const key = skill.trim()
      if (!key || have.has(normalizeSkill(key))) continue
      needed.set(key, (needed.get(key) || 0) + 1)
    }
  }

  return Array.from(needed.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([name, count], i) => ({
      id: `tsk-${i}`,
      name,
      demand: (count >= 3 ? 'high' : count >= 2 ? 'medium' : 'low') as TargetSkill['demand'],
      priority: i + 1,
    }))
}

function deriveApplications(caseData: YouthCase, opps: Opportunity[]): Application[] {
  const count = deriveApplicationCount(caseData, opps.length)
  const statuses: Application['status'][] = ['under-review', 'assessment', 'interview', 'rejected', 'offered']
  const seed = caseData.profileId.charCodeAt(caseData.profileId.length - 1)

  return opps.slice(0, count).map((opp, i) => {
    const daysAgo = 5 + i * 7 + (seed % 5)
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return {
      id: `app-${opp.id}`,
      company: opp.company,
      logo: opp.logo,
      title: opp.title,
      status: statuses[(seed + i) % statuses.length],
      appliedDate: date.toISOString().slice(0, 10),
    }
  })
}

export function adaptCaseToDashboard(response: CaseResponse): YouthProfile {
  const { case: c, opportunities, courses } = response
  const [firstName, ...rest] = c.name.split(' ')
  const lastName = rest.join(' ')
  const profileStrength = computeProfileStrength(c)
  const skillTier = computeSkillTier(c)
  const mappedOpps = opportunities
    .map((o) => mapOpportunity(o, c))
    .sort((a, b) => b.skillsMatch - a.skillsMatch || b.matchScore - a.matchScore)
  const mappedSkills = buildMappedSkills(c)
  const courseItems: CourseItem[] = courses.slice(0, 24).map((course) => {
    const level = courseSkillLevel(course.courseName, course.id)
    const relevance = c.skills.some((s) =>
      course.courseName.toLowerCase().includes(s.name.toLowerCase())
    )
      ? 90
      : c.interests.some((i) => course.courseName.toLowerCase().includes(i.toLowerCase().split(' ')[0]))
        ? 70
        : 45 + (course.id % 30)
    return {
      id: String(course.id),
      name: course.courseName,
      level,
      duration: level === 'low-expert' ? '8-12 weeks' : level === 'developing' ? '4-8 weeks' : '2-4 weeks',
      provider: 'MY Bharat',
      relevance,
      enrolled: course.id % 5 === 0 && level !== 'mediocre',
    }
  })
  const targetSkills = deriveTargetSkills(c, opportunities)
  const gapTargetSkills = deriveTargetSkills(c, opportunities, Number.POSITIVE_INFINITY)

  const courseSkills: TargetSkill[] = courses
    .filter(
      (course) =>
        c.interests.some((i) =>
          course.courseName.toLowerCase().includes(i.toLowerCase().split(' ')[0])
        ) || c.skills.some((s) => course.courseName.toLowerCase().includes(s.name.toLowerCase()))
    )
    .slice(0, 2)
    .map((course, i) => ({
      id: `course-${course.id}`,
      name: course.courseName,
      demand: 'medium' as const,
      priority: targetSkills.length + i + 1,
    }))

  const allTargetSkills = [...targetSkills, ...courseSkills].slice(0, 6)
  const applications = deriveApplications(c, mappedOpps)
  const resolvedTargetSkills = allTargetSkills.length
    ? allTargetSkills
    : [
        { id: 'tsk-1', name: 'Communication', demand: 'high' as const, priority: 1 },
        { id: 'tsk-2', name: 'Digital Literacy', demand: 'medium' as const, priority: 2 },
      ]

  const dobYear = parseInt(c.dob?.slice(0, 4) || '2000', 10)
  const age = new Date().getFullYear() - dobYear

  const profile: YouthProfile = {
    id: c.profileId,
    skillTier,
    courses: courseItems,
    profile: {
      firstName,
      lastName,
      age,
      gender: c.gender.toLowerCase(),
      location: {
        city: c.location.district,
        state: c.location.state,
        country: 'India',
      },
      email: '',
      phone: '',
      preferredLanguage: c.languages[0]?.toLowerCase() || 'en',
      profileStrength,
      experienceYears: c.jobProfile.experienceYears,
      resumeUploaded: mappedSkills.length >= 3,
      jobPreferencesUpdated: c.careerPreferences.roles.length > 0,
      avatar: null,
    },
    education: [
      {
        id: 'edu-1',
        degree: c.education.course,
        field: c.education.specialization,
        institution: c.education.institution,
        year: new Date().getFullYear(),
        grade: `${c.education.percentage}%`,
      },
    ],
    skills: mappedSkills,
    targetSkills: resolvedTargetSkills,
    interests: c.interests,
    credentials: c.certifications.map((name, i) => ({
      id: `cred-${i}`,
      name,
      issuer: 'Certification',
      year: new Date().getFullYear(),
      verified: true,
    })),
    preferences: {
      jobTypes: c.careerPreferences.employmentTypes.map((t) => t.toLowerCase().replace(/_/g, '-')),
      locations: c.careerPreferences.locations,
      salaryRange: {
        min: c.careerPreferences.minSalary,
        max: c.careerPreferences.maxSalary,
        currency: 'INR',
      },
      industries: c.careerPreferences.industries,
    },
    goals: [
      {
        id: 'goal-1',
        title: c.careerPreferences.roles[0] || `Build a career in ${c.interests[0] || 'your field'}`,
        description: `Target roles: ${c.careerPreferences.roles.join(', ')}`,
        targetDate: '2027-01-01',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ],
    activities: [],
    milestones: [
      {
        id: 'ms-1',
        title: 'Profile created on MY Bharat',
        status: 'completed',
        date: '2025-01-01',
      },
      {
        id: 'ms-2',
        title: 'Skills inventory added',
        status: mappedSkills.length >= 3 ? 'completed' : 'in-progress',
        progress: Math.min(Math.round((mappedSkills.length / 6) * 100), 100),
      },
      {
        id: 'ms-3',
        title: 'Profile strength goal',
        status: profileStrength >= 80 ? 'completed' : 'in-progress',
        progress: profileStrength,
      },
    ],
    tasks: [
      {
        id: 'task-1',
        title: `Apply to top ${Math.min(3, mappedOpps.length)} matching jobs`,
        priority: 'high',
        status: 'pending',
        dueDate: '2025-10-01',
      },
      {
        id: 'task-2',
        title: `Improve: ${resolvedTargetSkills[0]?.name || 'key skills'}`,
        priority: 'medium',
        status: 'pending',
        dueDate: '2025-10-15',
      },
    ],
    opportunities: mappedOpps,
    applications,
    journey: [
      {
        id: 'j-1',
        stage: 'profile',
        title: 'Profile loaded',
        date: '2025-01-01',
        description: `${c.name} – ${c.youthType} (${profileStrength}% complete)`,
      },
      {
        id: 'j-2',
        stage: 'skills',
        title: 'Skills mapped',
        date: '2025-03-01',
        description: `${mappedSkills.length} skills in inventory`,
      },
      {
        id: 'j-3',
        stage: 'gap-analysis',
        title: 'Gaps identified from job data',
        date: '2025-06-01',
        description: `${resolvedTargetSkills.length} skills to develop`,
      },
      {
        id: 'j-4',
        stage: 'plan',
        title: 'Opportunities matched',
        date: '2025-09-01',
        description: `${mappedOpps.length} jobs matched from NCS dataset`,
      },
    ],
    stats: computeStats({
      opportunities: mappedOpps,
      applications,
      skills: mappedSkills,
      targetSkills: resolvedTargetSkills,
      gapSkillsCount: gapTargetSkills.length,
    }),
    notifications: mappedOpps.slice(0, 3).map((opp, i) => ({
      id: `n-${i}`,
      type: 'opportunity',
      message: `New match: ${opp.title} at ${opp.company} (${opp.matchScore}%)`,
      read: i > 0,
      date: new Date().toISOString(),
    })),
    agentMemory: {
      lastInteraction: new Date().toISOString(),
      conversationSummary: `Career focus: ${c.careerPreferences.roles.join(', ') || c.interests.join(', ')}`,
      nextBestActions: [
        `Review top match: ${mappedOpps[0]?.title || 'available jobs'}`,
        `Build skill: ${resolvedTargetSkills[0]?.name || 'in-demand skills'}`,
        profileStrength < 75 ? 'Complete your profile to improve match quality' : 'Run AI career assessment',
      ],
    },
  }

  return syncYouthProfileStats(profile)
}
