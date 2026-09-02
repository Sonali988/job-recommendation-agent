// TS mirrors of the U2 domain (seed JSON contract). Kept in sync manually (Q3=A).

export interface Location { state: string; district: string; pincode: string; areaType: string; }
export interface Education { course: string; specialization: string; status: string; institution: string; percentage: number; }
export interface Skill { name: string; level: string; years: number; }
export interface CareerPreferences {
  roles: string[]; industries: string[]; locations: string[];
  workMode: string; employmentTypes: string[]; minSalary: number; maxSalary: number; willingToRelocate: boolean;
}
export interface JobProfile { status: string; experienceYears: number; primarySkills: string[]; secondarySkills: string[]; }
export interface Goal { text: string; targetRole?: string | null; requiredSkills: string[]; }

export interface YouthCase {
  userId: string; profileId: string; name: string; gender: string; dob: string; youthType: string;
  location: Location; education: Education; interests: string[]; languages: string[];
  skills: Skill[]; certifications: string[]; careerPreferences: CareerPreferences; jobProfile: JobProfile;
  goal?: Goal | null;
}

export interface ProfileSummary { userId: string; profileId: string; name: string; youthType: string; goalText: string; }

export interface Opportunity {
  id: number; jobTitle: string; organizationName: string; functionalArea: string;
  requiredSkills: string[]; minSalary: number; maxSalary: number; jobType: string;
  jobLocations: string[]; jobPostUrl: string; jobDescription: string; expiredAt: string; status: string;
  matchScore: number; matchReasons: string[];
}

export interface Course { id: number; parentId: number; courseName: string; }
export interface CourseRef { courseId: number; courseName: string; }

export interface Assessment { summary: string; readinessScore: number; strengths: string[]; focusAreas: string[]; }
export interface SkillCategory { category: string; skills: Skill[]; }
export interface SkillsInventory { groups: SkillCategory[]; }
export interface PrioritizedGap { skill: string; currentLevel?: string | null; targetLevel: string; importance: number; rank: number; }
export interface RoadmapStep { order: number; title: string; addressesGaps: string[]; suggestedCourses: CourseRef[]; estimatedEffort: string; }
export interface Roadmap { steps: RoadmapStep[]; }
export interface NextBestAction { id: string; title: string; type: string; relatedId?: string | null; rationale: string; }
export interface Alert { id: string; type: string; message: string; severity: string; createdAt: string; read: boolean; dismissed: boolean; }
export interface AgentCycleResult { alerts: Alert[]; nextBestActions: NextBestAction[]; reassessedGaps: PrioritizedGap[]; progress: number; }
export interface ChatMessage { role: "user" | "assistant"; content: string; }

export interface SessionState {
  completedTaskIds: string[];
  appliedIds: number[];
  savedIds: number[];
  dismissedAlertIds: string[];
  lastActiveAt?: string | null;
  lastCycleAt?: string | null;
}

export interface PersistedState { profileId: string; goalText: string; session: SessionState; }

export const emptySession = (): SessionState => ({
  completedTaskIds: [], appliedIds: [], savedIds: [], dismissedAlertIds: [],
  lastActiveAt: null, lastCycleAt: null,
});
