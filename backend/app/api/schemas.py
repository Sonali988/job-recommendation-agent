"""LC-9 Request/response schemas with validation bounds (SECURITY-05)."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.data.models import (
    Assessment,
    AgentCycleResult,
    ChatMessage,
    NextBestAction,
    Opportunity,
    PrioritizedGap,
    Roadmap,
    SessionState,
    SkillsInventory,
)


class CaseRequest(BaseModel):
    case_id: str = Field(min_length=1, max_length=64)
    goal_text: str = Field(default="", max_length=500)
    session: SessionState = Field(default_factory=SessionState)


class AssessmentResponse(BaseModel):
    assessment: Assessment
    inventory: SkillsInventory
    degraded: bool = False


class GapResponse(BaseModel):
    gaps: list[PrioritizedGap]
    requiredSkills: list[str]
    degraded: bool = False


class RoadmapResponse(BaseModel):
    roadmap: Roadmap
    nextBestActions: list[NextBestAction]
    degraded: bool = False


class OpportunitiesResponse(BaseModel):
    opportunities: list[Opportunity]
    degraded: bool = False


class OpportunityActionRequest(BaseModel):
    action: str = Field(pattern="^(search|enroll)$")
    opportunity_id: str = Field(default="", max_length=32)
    query: str = Field(default="", max_length=200)
    case_id: str = Field(min_length=1, max_length=64)


class ChatRequest(BaseModel):
    case_id: str = Field(min_length=1, max_length=64)
    goal_text: str = Field(default="", max_length=500)
    messages: list[ChatMessage] = Field(min_length=1, max_length=50)


class ChatResponse(BaseModel):
    message: ChatMessage
    degraded: bool = False


class AgentCycleResponse(BaseModel):
    result: AgentCycleResult
    degraded: bool = False


class ActionResultResponse(BaseModel):
    action: str
    opportunities: Optional[list[Opportunity]] = None
    status: Optional[str] = None
    message: Optional[str] = None
