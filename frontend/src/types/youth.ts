export type SkillTier = 'mediocre' | 'developing' | 'low-expert'

export interface YouthProfile {
  id: string
  skillTier: SkillTier
  courses: CourseItem[]
  profile: {
    firstName: string
    lastName: string
    age: number
    gender: string
    location: { city: string; state: string; country: string }
    email: string
    phone: string
    preferredLanguage: string
    profileStrength: number
    experienceYears: number
    resumeUploaded: boolean
    jobPreferencesUpdated: boolean
    avatar: string | null
  }
  education: Education[]
  skills: Skill[]
  targetSkills: TargetSkill[]
  interests: string[]
  credentials: Credential[]
  preferences: JobPreferences
  goals: Goal[]
  activities: Activity[]
  milestones: Milestone[]
  tasks: Task[]
  opportunities: Opportunity[]
  applications: Application[]
  journey: JourneyEntry[]
  stats: Stats
  notifications: Notification[]
  agentMemory: AgentMemory
}

export interface Education {
  id: string
  degree: string
  field: string
  institution: string
  year: number
  grade: string
}

export interface Skill {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  verified: boolean
}

export interface TargetSkill {
  id: string
  name: string
  demand: 'high' | 'medium' | 'low'
  priority: number
}

export interface Credential {
  id: string
  name: string
  issuer: string
  year: number
  verified: boolean
}

export interface JobPreferences {
  jobTypes: string[]
  locations: string[]
  salaryRange: { min: number; max: number; currency: string }
  industries: string[]
}

export interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  status: string
  createdAt: string
}

export interface Activity {
  id: string
  type: string
  title: string
  status: string
  date: string
}

export interface Milestone {
  id: string
  title: string
  status: string
  date?: string
  progress?: number
}

export interface Task {
  id: string
  title: string
  priority: string
  status: string
  dueDate: string
}

export interface Opportunity {
  id: string
  company: string
  logo: string
  title: string
  location: string
  workType: string
  experienceLevel: string
  salaryRange: string
  matchScore: number
  skillsMatch: number
  skillsTotal: number
  description: string
  postedDate: string
  jobPostUrl?: string
  saved: boolean
  requiredSkills?: string[]
}

export interface Application {
  id: string
  company: string
  logo: string
  title: string
  status: 'under-review' | 'assessment' | 'interview' | 'rejected' | 'offered'
  appliedDate: string
}

export interface JourneyEntry {
  id: string
  stage: string
  title: string
  date: string
  description: string
}

export interface Stats {
  matchesFound: number
  applied: number
  interviews: number
  skillsAdded: number
  skillsTotal: number
}

export interface Notification {
  id: string
  type: string
  message: string
  read: boolean
  date: string
}

export interface AgentMemory {
  lastInteraction: string
  conversationSummary: string
  nextBestActions: string[]
}

export interface CourseItem {
  id: string
  name: string
  level: SkillTier
  duration: string
  provider: string
  relevance: number
  enrolled: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  source?: string
}
