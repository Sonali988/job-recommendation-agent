"""REST endpoints per capability (Q3=A). Routers -> services -> clients/data."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.api import schemas
from app.clients.ai_client import AIClient
from app.clients.mcp_tools import EnrollResult, MCPToolInterface
from app.core.config import Settings, get_settings
from app.core.di import get_ai_client, get_mcp_tools, get_rate_limiter, get_repo
from app.core.errors import NotFoundError
from app.core.health import HealthProvider
from app.core.rate_limit import RateLimiter
from app.data.case_repository import CaseRepository
from app.data.models import Goal, HealthStatus, Opportunity, YouthCase
from app.services import (
    assessment_service,
    agent_cycle_service,
    chat_service,
    gap_service,
    opportunity_service,
    progress_service,
    roadmap_service,
)

router = APIRouter(prefix="/api")

_health_provider: HealthProvider | None = None


def _health(ai: AIClient = Depends(get_ai_client)) -> HealthProvider:
    global _health_provider
    if _health_provider is None:
        _health_provider = HealthProvider(ai)
    return _health_provider


def _require_case(repo: CaseRepository, case_id: str) -> YouthCase:
    case = repo.get_case(case_id)
    if case is None:
        raise NotFoundError(f"Unknown profile: {case_id}")
    return case


def _apply_goal(case: YouthCase, goal_text: str) -> Goal:
    goal = Goal(text=goal_text or (case.goal.text if case.goal else ""))
    case.goal = goal
    return goal


def _rate_limit(limiter: RateLimiter) -> None:
    if not limiter.allow():
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again shortly.")


# ---------------------------------------------------------------------------
@router.get("/health", response_model=HealthStatus)
def health(hp: HealthProvider = Depends(_health)) -> HealthStatus:
    return hp.status()


@router.get("/profiles")
def profiles(repo: CaseRepository = Depends(get_repo)):
    return repo.list_profiles()


@router.get("/case/{profile_id}", response_model=YouthCase)
def get_case(profile_id: str, repo: CaseRepository = Depends(get_repo)) -> YouthCase:
    return _require_case(repo, profile_id)


@router.post("/assessment", response_model=schemas.AssessmentResponse)
def assessment(
    req: schemas.CaseRequest,
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
    limiter: RateLimiter = Depends(get_rate_limiter),
) -> schemas.AssessmentResponse:
    _rate_limit(limiter)
    case = _require_case(repo, req.case_id)
    goal = _apply_goal(case, req.goal_text)
    required = gap_service.derive_required_skills(case, goal, repo.opportunities(), ai)
    gaps = gap_service.prioritize(gap_service.analyze_gaps(case, required), repo.opportunities())
    result = assessment_service.assess(case, gaps, len(required), ai)
    inventory = assessment_service.skills_inventory(case)
    return schemas.AssessmentResponse(assessment=result, inventory=inventory, degraded=not ai.is_available())


@router.post("/gap-analysis", response_model=schemas.GapResponse)
def gap_analysis(
    req: schemas.CaseRequest,
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
    limiter: RateLimiter = Depends(get_rate_limiter),
) -> schemas.GapResponse:
    _rate_limit(limiter)
    case = _require_case(repo, req.case_id)
    goal = _apply_goal(case, req.goal_text)
    required = gap_service.derive_required_skills(case, goal, repo.opportunities(), ai)
    gaps = gap_service.prioritize(gap_service.analyze_gaps(case, required), repo.opportunities())
    return schemas.GapResponse(gaps=gaps, requiredSkills=required, degraded=not ai.is_available())


@router.post("/roadmap", response_model=schemas.RoadmapResponse)
def roadmap(
    req: schemas.CaseRequest,
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
    limiter: RateLimiter = Depends(get_rate_limiter),
) -> schemas.RoadmapResponse:
    _rate_limit(limiter)
    case = _require_case(repo, req.case_id)
    goal = _apply_goal(case, req.goal_text)
    required = gap_service.derive_required_skills(case, goal, repo.opportunities(), ai)
    gaps = gap_service.prioritize(gap_service.analyze_gaps(case, required), repo.opportunities())
    plan = roadmap_service.build_roadmap(gaps, repo.courses(), ai)
    matches = opportunity_service.list_opportunities(case, goal, repo.opportunities(), ai)
    top = matches[0] if matches else None
    actions = roadmap_service.next_best_actions(case, plan, top)
    return schemas.RoadmapResponse(roadmap=plan, nextBestActions=actions, degraded=not ai.is_available())


@router.get("/opportunities", response_model=schemas.OpportunitiesResponse)
def opportunities(
    case_id: str,
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
) -> schemas.OpportunitiesResponse:
    case = _require_case(repo, case_id)
    goal = _apply_goal(case, "")
    matches = opportunity_service.list_opportunities(case, goal, repo.opportunities(), ai)
    return schemas.OpportunitiesResponse(opportunities=matches, degraded=not ai.is_available())


@router.post("/opportunities/act", response_model=schemas.ActionResultResponse)
def opportunities_act(
    req: schemas.OpportunityActionRequest,
    repo: CaseRepository = Depends(get_repo),
    mcp: MCPToolInterface = Depends(get_mcp_tools),
) -> schemas.ActionResultResponse:
    _require_case(repo, req.case_id)
    outcome = opportunity_service.act_on_opportunity(
        mcp, req.action, req.opportunity_id, req.query, repo.opportunities()
    )
    if isinstance(outcome, list):
        return schemas.ActionResultResponse(action=req.action, opportunities=outcome)
    assert isinstance(outcome, EnrollResult)
    return schemas.ActionResultResponse(action=req.action, status=outcome.status, message=outcome.message)


@router.post("/chat", response_model=schemas.ChatResponse)
def chat(
    req: schemas.ChatRequest,
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
    limiter: RateLimiter = Depends(get_rate_limiter),
) -> schemas.ChatResponse:
    _rate_limit(limiter)
    case = _require_case(repo, req.case_id)
    goal = _apply_goal(case, req.goal_text)
    required = gap_service.derive_required_skills(case, goal, repo.opportunities(), ai)
    gaps = gap_service.prioritize(gap_service.analyze_gaps(case, required), repo.opportunities())
    matches = opportunity_service.list_opportunities(case, goal, repo.opportunities(), ai)
    message, degraded = chat_service.chat(req.messages, case, gaps, matches, ai)
    return schemas.ChatResponse(message=message, degraded=degraded)


@router.post("/agent-cycle", response_model=schemas.AgentCycleResponse)
def agent_cycle(
    req: schemas.CaseRequest,
    repo: CaseRepository = Depends(get_repo),
    ai: AIClient = Depends(get_ai_client),
    settings: Settings = Depends(get_settings),
    limiter: RateLimiter = Depends(get_rate_limiter),
) -> schemas.AgentCycleResponse:
    _rate_limit(limiter)
    case = _require_case(repo, req.case_id)
    goal = _apply_goal(case, req.goal_text)
    required = gap_service.derive_required_skills(case, goal, repo.opportunities(), ai)
    gaps = gap_service.prioritize(gap_service.analyze_gaps(case, required), repo.opportunities())
    matches = opportunity_service.list_opportunities(case, goal, repo.opportunities(), ai)
    plan = roadmap_service.build_roadmap(gaps, repo.courses(), ai)
    progress = progress_service.compute_progress(
        case, gaps, len(required), req.session, total_tasks=len(plan.steps)
    )
    result = agent_cycle_service.run_cycle(
        case, gaps, matches, progress, req.session, settings, prior_progress=None, ai=ai
    )
    top = matches[0] if matches else None
    result.nextBestActions = roadmap_service.next_best_actions(case, plan, top)
    return schemas.AgentCycleResponse(result=result, degraded=not ai.is_available())
