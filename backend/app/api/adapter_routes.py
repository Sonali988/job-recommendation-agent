"""Adapter endpoints for the SkillMatch-style frontend package.

The adopted frontend expects a specific API surface (/api/youth, /api/chat with
{message,language,profile_id}, /api/assessment, /api/gap-analysis, /api/next-actions,
/api/mcp/*). These adapters reuse the existing services and return the shapes the
frontend consumes. The original REST routes in routes.py remain available too.
"""
from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, Query

from app.clients.ai_client import AIClient
from app.clients.mcp_tools import EnrollResult, MCPToolInterface
from app.core.di import get_ai_client, get_mcp_tools, get_repo
from app.core.errors import NotFoundError
from app.data.case_repository import CaseRepository
from app.data.models import ChatMessage, Goal, YouthCase
from app.services import (
    assessment_service,
    gap_service,
    opportunity_service,
    roadmap_service,
)
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api")


def _resolve_case(repo: CaseRepository, profile_id: Optional[str]) -> YouthCase:
    if profile_id:
        case = repo.get_case(profile_id)
        if case is None:
            raise NotFoundError(f"Unknown profile: {profile_id}")
        return case
    profiles = repo.list_profiles()
    if not profiles:
        raise NotFoundError("No profiles available")
    first = repo.get_case(profiles[0].profileId)
    assert first is not None
    return first


def _goal_for(case: YouthCase) -> Goal:
    text = case.goal.text if case.goal else (case.careerPreferences.roles[0] if case.careerPreferences.roles else "")
    goal = Goal(text=text)
    case.goal = goal
    return goal


def _source(ai: AIClient) -> str:
    return "bedrock" if ai.is_available() else "fallback"


# ---------------------------------------------------------------------------
@router.get("/youth")
def youth(
    profile_id: Optional[str] = Query(default=None),
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
) -> dict[str, Any]:
    """Return { case, opportunities, courses } for the dashboard."""
    case = _resolve_case(repo, profile_id)
    goal = _goal_for(case)
    matches = opportunity_service.list_opportunities(case, goal, repo.opportunities(), ai, top_k=50)
    courses = repo.courses()
    return {
        "case": case.model_dump(),
        "opportunities": [o.model_dump() for o in matches],
        "courses": [{"id": c.id, "parentId": c.parentId, "courseName": c.courseName} for c in courses],
    }


class ChatBody(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    language: str = "en"
    profile_id: Optional[str] = None


@router.post("/chat")
def chat_adapter(
    body: ChatBody,
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
) -> dict[str, str]:
    from app.services import chat_service

    case = _resolve_case(repo, body.profile_id)
    goal = _goal_for(case)
    required = gap_service.derive_required_skills(case, goal, repo.opportunities(), ai)
    gaps = gap_service.prioritize(gap_service.analyze_gaps(case, required), repo.opportunities())
    matches = opportunity_service.list_opportunities(case, goal, repo.opportunities(), ai)
    reply, degraded = chat_service.chat([ChatMessage(role="user", content=body.message)], case, gaps, matches, ai)
    return {"response": reply.content, "model": "bedrock", "source": "fallback" if degraded else "bedrock"}


@router.post("/assessment")
def assessment_adapter(
    body: dict[str, Any] | None = None,
    profile_id: Optional[str] = Query(default=None),
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
) -> dict[str, str]:
    pid = (body or {}).get("profile_id") or profile_id
    case = _resolve_case(repo, pid)
    goal = _goal_for(case)
    required = gap_service.derive_required_skills(case, goal, repo.opportunities(), ai)
    gaps = gap_service.prioritize(gap_service.analyze_gaps(case, required), repo.opportunities())
    result = assessment_service.assess(case, gaps, len(required), ai)
    text = (
        f"{result.summary}\n\n"
        f"Readiness: {result.readinessScore:.0f}%\n"
        f"Strengths: {', '.join(result.strengths) or 'developing'}\n"
        f"Focus areas: {', '.join(result.focusAreas) or 'none identified'}"
    )
    return {"assessment": text, "model": "bedrock", "source": _source(ai)}


@router.post("/gap-analysis")
def gap_adapter(
    profile_id: Optional[str] = Query(default=None),
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
) -> dict[str, Any]:
    case = _resolve_case(repo, profile_id)
    goal = _goal_for(case)
    required = gap_service.derive_required_skills(case, goal, repo.opportunities(), ai)
    gaps = gap_service.prioritize(gap_service.analyze_gaps(case, required), repo.opportunities())
    gap_names = [g.skill for g in gaps]
    analysis = (
        "Based on your target role and current skills, focus on: "
        + (", ".join(gap_names[:8]) if gap_names else "no significant gaps identified.")
    )
    return {"gaps": gap_names, "analysis": analysis, "model": "bedrock", "source": _source(ai)}


@router.post("/next-actions")
def next_actions_adapter(
    profile_id: Optional[str] = Query(default=None),
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
) -> dict[str, str]:
    case = _resolve_case(repo, profile_id)
    goal = _goal_for(case)
    required = gap_service.derive_required_skills(case, goal, repo.opportunities(), ai)
    gaps = gap_service.prioritize(gap_service.analyze_gaps(case, required), repo.opportunities())
    matches = opportunity_service.list_opportunities(case, goal, repo.opportunities(), ai)
    plan = roadmap_service.build_roadmap(gaps, repo.courses(), ai)
    top = matches[0] if matches else None
    actions = roadmap_service.next_best_actions(case, plan, top)
    text = "\n".join(f"- {a.title}: {a.rationale}" for a in actions) or "- Complete your profile to improve match quality."
    return {"actions": text, "model": "bedrock", "source": _source(ai)}


@router.get("/mcp/tools")
def mcp_tools() -> dict[str, list[dict[str, str]]]:
    return {
        "tools": [
            {"name": "search_opportunities", "description": "Search MY Bharat opportunities by query."},
            {"name": "enroll", "description": "Enroll in an opportunity (mock)."},
        ]
    }


class McpInvokeBody(BaseModel):
    tool_name: str
    params: dict[str, Any] = Field(default_factory=dict)


@router.post("/mcp/invoke")
def mcp_invoke(
    body: McpInvokeBody,
    repo: CaseRepository = Depends(get_repo),
    mcp: MCPToolInterface = Depends(get_mcp_tools),
) -> dict[str, Any]:
    if body.tool_name == "search_opportunities":
        query = str(body.params.get("query", ""))
        results = mcp.search_opportunities(query, repo.opportunities())
        return {"tool": body.tool_name, "results": [o.model_dump() for o in results[:20]]}
    if body.tool_name == "enroll":
        res: EnrollResult = mcp.enroll(str(body.params.get("opportunity_id", "")))
        return {"tool": body.tool_name, "status": res.status, "message": res.message}
    return {"tool": body.tool_name, "error": "unknown_tool"}
