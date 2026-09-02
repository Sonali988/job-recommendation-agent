"""Goal-required skills (Q1=C) + gap analysis & prioritisation (US-4.3).

Deterministic core; Bedrock optionally refines the required-skill set. Enforces
INV-2 (no satisfied skill in gaps) and INV-3 (prioritise preserves the set).
"""
from __future__ import annotations

from collections import Counter

from app.clients.ai_client import AIClient
from app.data.models import Goal, Opportunity, PrioritizedGap, YouthCase
from app.services.skills import current_skill_map, level_value, normalize

_TARGET_LEVEL = "INTERMEDIATE"


def resolve_target_role(case: YouthCase, goal: Goal) -> str | None:
    text = (goal.text or "").lower()
    for role in case.careerPreferences.roles:
        if role.lower() in text or text in role.lower():
            return role
    if case.careerPreferences.roles:
        return case.careerPreferences.roles[0]
    return None


def _jobs_for_role(role: str | None, opportunities: list[Opportunity]) -> list[Opportunity]:
    if not role:
        return []
    r = role.lower()
    matched = [
        o
        for o in opportunities
        if r in o.jobTitle.lower() or r in o.functionalArea.lower() or r in o.functionalState.lower()
    ]
    return matched


def derive_required_skills(
    case: YouthCase,
    goal: Goal,
    opportunities: list[Opportunity],
    ai: AIClient | None = None,
    top_n: int = 10,
) -> list[str]:
    role = resolve_target_role(case, goal)
    jobs = _jobs_for_role(role, opportunities)
    counter: Counter[str] = Counter()
    for job in jobs:
        for skill in job.requiredSkills:
            counter[skill.strip()] += 1
    base = [s for s, _ in counter.most_common(top_n) if s]

    # Bedrock refinement (Q1=C) — optional, best-effort
    if ai is not None and ai.is_available():
        result = ai.generate_json(
            "Given the youth's goal and current skills, list the key skills required. "
            'Return JSON {"skills": ["..."]}.',
            {"goal": goal.text, "role": role, "currentSkills": list(current_skill_map(case).keys()), "baseSkills": base},
        )
        if result.ok and result.parsed and isinstance(result.parsed.get("skills"), list):
            for s in result.parsed["skills"]:
                if isinstance(s, str) and s.strip() and s.strip() not in base:
                    base.append(s.strip())
    return base


def analyze_gaps(case: YouthCase, required_skills: list[str]) -> list[PrioritizedGap]:
    have = current_skill_map(case)
    target = level_value(_TARGET_LEVEL)
    gaps: list[PrioritizedGap] = []
    seen: set[str] = set()
    for skill in required_skills:
        key = normalize(skill)
        if key in seen:
            continue
        seen.add(key)
        current = have.get(key)
        # INV-2: skip skills already satisfied at/above target level
        if current and level_value(current.level) >= target:
            continue
        gaps.append(
            PrioritizedGap(
                skill=skill,
                currentLevel=current.level if current else None,
                targetLevel=_TARGET_LEVEL,
            )
        )
    return gaps


def prioritize(gaps: list[PrioritizedGap], opportunities: list[Opportunity]) -> list[PrioritizedGap]:
    """Rank gaps by frequency in job requirements (INV-3: preserves the set)."""
    freq: Counter[str] = Counter()
    for o in opportunities:
        for s in o.requiredSkills:
            freq[normalize(s)] += 1
    for g in gaps:
        g.importance = float(freq.get(normalize(g.skill), 0))
    ranked = sorted(gaps, key=lambda g: g.importance, reverse=True)
    for i, g in enumerate(ranked, start=1):
        g.rank = i
    return ranked
