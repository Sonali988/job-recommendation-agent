export type SkillTier = 'mediocre' | 'developing' | 'low-expert'

export interface ProfileSummary {
  userId: string
  profileId: string
  name: string
  youthType: string
  location: string
  profileStrength?: number
  skillTier?: SkillTier
  experienceYears?: number
  topSkills?: string[]
}

export interface YouthCase {
  userId: string
  profileId: string
  name: string
  gender: string
  dob: string
  youthType: string
  location: { state: string; district: string; pincode: string; areaType: string }
  education: {
    course: string
    specialization: string
    status: string
    institution: string
    percentage: number
  }
  interests: string[]
  languages: string[]
  skills: { name: string; level: string; years: number }[]
  certifications: string[]
  careerPreferences: {
    roles: string[]
    industries: string[]
    locations: string[]
    workMode: string
    employmentTypes: string[]
    minSalary: number
    maxSalary: number
    willingToRelocate: boolean
  }
  jobProfile: {
    status: string
    experienceYears: number
    primarySkills: string[]
    secondarySkills: string[]
  }
}

export interface JobOpportunity {
  id: number
  jobTitle: string
  organizationName: string
  functionalArea: string
  functionalState: string
  requiredSkills: string[]
  minSalary: number
  maxSalary: number
  hideSalaryRange: boolean
  minExperience?: number
  maxExperience?: number
  jobType: string
  jobLocations: string[]
  jobPostUrl: string
  jobDescription: string
  publishedAt?: string
  matchScore: number
  matchReasons: string[]
}

export interface Course {
  id: number
  parentId: number
  courseName: string
}

export interface CaseResponse {
  case: YouthCase
  opportunities: JobOpportunity[]
  courses: Course[]
}
