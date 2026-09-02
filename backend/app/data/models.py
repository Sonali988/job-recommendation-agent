"""Pydantic domain models (Step 3) — mapped to the seed data schemas.

See aidlc-docs/construction/u2-backend/functional-design/domain-entities.md.
Models are permissive on input (extra fields ignored, sensible defaults) because
the real seed data is noisy; PII fields on jobs are intentionally NOT modelled.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class _Base(BaseModel):
    model_config = ConfigDict(extra="ignore")


# ---------------------------------------------------------------------------
# YouthCase and nested structures
# ---------------------------------------------------------------------------
class Location(_Base):
    state: str = ""
    district: str = ""
    pincode: str = ""
    areaType: str = ""


class Education(_Base):
    course: str = ""
    specialization: str = ""
    status: str = ""
    institution: str = ""
    percentage: float = 0.0


class Skill(_Base):
    name: str
    level: str = "BEGINNER"
    years: int = 0


class CareerPreferences(_Base):
    roles: list[str] = Field(default_factory=list)
    industries: list[str] = Field(default_factory=list)
    locations: list[str] = Field(default_factory=list)
    workMode: str = ""
    employmentTypes: list[str] = Field(default_factory=list)
    minSalary: int = 0
    maxSalary: int = 0
    willingToRelocate: bool = False


class JobProfile(_Base):
    status: str = ""
    experienceYears: int = 0
    primarySkills: list[str] = Field(default_factory=list)
    secondarySkills: list[str] = Field(default_factory=list)


class Goal(_Base):
    text: str = ""
    targetRole: Optional[str] = None
    requiredSkills: list[str] = Field(default_factory=list)


class YouthCase(_Base):
    userId: str
    profileId: str
    name: str = ""
    gender: str = ""
    dob: str = ""
    youthType: str = ""
    location: Location = Field(default_factory=Location)
    education: Education = Field(default_factory=Education)
    interests: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    skills: list[Skill] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    careerPreferences: CareerPreferences = Field(default_factory=CareerPreferences)
    jobProfile: JobProfile = Field(default_factory=JobProfile)
    goal: Optional[Goal] = None
    # NOTE: email/mobile (PII) intentionally omitted from the domain model.


class ProfileSummary(_Base):
    userId: str
    profileId: str
    name: str = ""
    youthType: str = ""
    goalText: str = ""


# ---------------------------------------------------------------------------
# Opportunity (sanitised job) — recruiter PII fields intentionally excluded
# ---------------------------------------------------------------------------
class Opportunity(_Base):
    id: int
    jobTitle: str = ""
    organizationName: str = ""
    functionalArea: str = ""
    functionalState: str = ""
    requiredSkills: list[str] = Field(default_factory=list)
    minSalary: int = 0
    maxSalary: int = 0
    hideSalaryRange: bool = False
    minAge: int = 0
    maxAge: int = 200
    noAgePreference: bool = True
    minExperience: int = 0
    maxExperience: int = 100
    jobType: str = ""
    jobLocations: list[str] = Field(default_factory=list)
    educationPreferences: list[str] = Field(default_factory=list)
    anyEducationPreference: bool = True
    genderPreference: str = "ANY"
    jobPostUrl: str = ""
    jobDescription: str = ""
    expiredAt: str = ""
    publishedAt: str = ""
    status: str = ""
    applicantCount: int = 0
    # derived
    matchScore: float = 0.0
    matchReasons: list[str] = Field(default_factory=list)


class Course(_Base):
    id: int
    parentId: int = 0
    courseName: str = ""


class CourseRef(_Base):
    courseId: int
    courseName: str


# ---------------------------------------------------------------------------
# AI / agent-derived entities
# ---------------------------------------------------------------------------
class Assessment(_Base):
    summary: str = ""
    readinessScore: float = 0.0
    strengths: list[str] = Field(default_factory=list)
    focusAreas: list[str] = Field(default_factory=list)


class SkillCategory(_Base):
    category: str
    skills: list[Skill] = Field(default_factory=list)


class SkillsInventory(_Base):
    groups: list[SkillCategory] = Field(default_factory=list)


class PrioritizedGap(_Base):
    skill: str
    currentLevel: Optional[str] = None
    targetLevel: str = "INTERMEDIATE"
    importance: float = 0.0
    rank: int = 0


class RoadmapStep(_Base):
    order: int
    title: str
    addressesGaps: list[str] = Field(default_factory=list)
    suggestedCourses: list[CourseRef] = Field(default_factory=list)
    estimatedEffort: str = ""


class Roadmap(_Base):
    steps: list[RoadmapStep] = Field(default_factory=list)


class NextBestAction(_Base):
    id: str
    title: str
    type: str = "LEARN"
    relatedId: Optional[str] = None
    rationale: str = ""


class Alert(_Base):
    id: str
    type: str
    message: str
    severity: str = "INFO"
    createdAt: str = ""
    read: bool = False
    dismissed: bool = False


class AgentCycleResult(_Base):
    alerts: list[Alert] = Field(default_factory=list)
    nextBestActions: list[NextBestAction] = Field(default_factory=list)
    reassessedGaps: list[PrioritizedGap] = Field(default_factory=list)
    progress: float = 0.0


class JourneyEvent(_Base):
    at: str = ""
    type: str = ""
    detail: str = ""


class SessionState(_Base):
    completedTaskIds: list[str] = Field(default_factory=list)
    lastActiveAt: Optional[str] = None
    lastCycleAt: Optional[str] = None
    dismissedAlertIds: list[str] = Field(default_factory=list)


class ChatMessage(_Base):
    role: str = "user"
    content: str = ""


class HealthStatus(_Base):
    status: str = "ok"
    bedrock: str = "unknown"
    version: str = "0.1.0"
