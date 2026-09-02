"""Opportunity matching & ranking (Q2=A) + MCP action (US-6.x).

Deterministic eligibility + weighted scoring; Bedrock explains top matches.
Enforces INV-5 (matchScore in [0,1]).
"""
from __future__ import annotations

from datetime import datetime, timezone

from app.clients.ai_client import AIClient
from app.clients.mcp_tools import EnrollResult, MCPToolInterface
from app.data.models import Goal, Opportunity, YouthCase
from app.services.skills import current_skill_map, normalize

_W_SKILL = 0.5
_W_ROLE = 0.2
_W_LOCATION = 0.15
_W_SALARY = 0.15


def _age(case: YouthCase) -> int | None:
    try:
        year = int(case.dob[:4])
        return datetime.now(timezone.utc).year - year
    except (ValueError, IndexError):
        return None


def _not_expired(opp: Opportunity) -> bool:
    if not opp.expiredAt:
        return True
    try:
        exp = datetime.fromisoformat(opp.expiredAt.replace("Z", "+00:00"))
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        return exp > datetime.now(timezone.utc)
    except ValueError:
        return True


def is_eligible(case: YouthCase, opp: Opportunity) -> bool:
    age = _age(case)
    if not opp.noAgePreference and age is not None and not (opp.minAge <= age <= opp.maxAge):
        return False
    exp = case.jobProfile.experienceYears
    if not (opp.minExperience <= exp <= opp.maxExperience):
        return False
    if opp.genderPreference not in ("ANY", "", case.gender.upper()):
        return False
    if not _not_expired(opp):
        return False
    if opp.status and opp.status.upper() != "PUBLISHED":
        return False
    return True


def _score(case: YouthCase, opp: Opportunity) -> tuple[float, list[str]]:
    reasons: list[str] = []
    have = set(current_skill_map(case).keys())
    req = {normalize(s) for s in opp.requiredSkills}
    skill_overlap = (len(have & req) / len(req)) if req else 0.0
    if skill_overlap:
        reasons.append(f"{int(skill_overlap * 100)}% skill match")

    roles = {r.lower() for r in case.careerPreferences.roles}
    role_match = 1.0 if any(r in opp.jobTitle.lower() or r in opp.functionalArea.lower() for r in roles) else 0.0
    if role_match:
        reasons.append("matches your target role")

    prefs = {p.lower() for p in case.careerPreferences.locations}
    loc_match = 1.0 if (case.careerPreferences.willingToRelocate or
                        any(p in l.lower() for p in prefs for l in opp.jobLocations)) else 0.0
    if loc_match and prefs:
        reasons.append("location fits")

    pref_min = case.careerPreferences.minSalary
    salary_match = 1.0 if (opp.maxSalary == 0 or opp.maxSalary >= pref_min) else 0.0

    score = _W_SKILL * skill_overlap + _W_ROLE * role_match + _W_LOCATION * loc_match + _W_SALARY * salary_match
    return max(0.0, min(1.0, round(score, 3))), reasons


def list_opportunities(
    case: YouthCase,
    goal: Goal,
    opportunities: list[Opportunity],
    ai: AIClient | None = None,
    top_k: int = 10,
) -> list[Opportunity]:
    scored: list[Opportunity] = []
    for opp in opportunities:
        if not is_eligible(case, opp):
            continue
        score, reasons = _score(case, opp)
        opp.matchScore = score
        opp.matchReasons = reasons
        scored.append(opp)
    scored.sort(key=lambda o: o.matchScore, reverse=True)
    top = scored[:top_k]

    if ai is not None and ai.is_available() and top:
        result = ai.generate_json(
            'Explain briefly why each job matches. Return JSON {"explanations": {"<id>": "..."}}.',
            {"jobs": [{"id": o.id, "title": o.jobTitle, "reasons": o.matchReasons} for o in top]},
        )
        if result.ok and result.parsed and isinstance(result.parsed.get("explanations"), dict):
            expl = result.parsed["explanations"]
            for o in top:
                text = expl.get(str(o.id))
                if isinstance(text, str) and text.strip():
                    o.matchReasons = [text.strip()]
    return top


def act_on_opportunity(mcp: MCPToolInterface, action: str, opportunity_id: str,
                       query: str, candidates: list[Opportunity]) -> object:
    if action == "search":
        return mcp.search_opportunities(query, candidates)
    if action == "enroll":
        return mcp.enroll(opportunity_id)
    return EnrollResult(opportunity_id=opportunity_id, status="ERROR", message="Unsupported action.")
