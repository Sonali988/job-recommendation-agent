"""Profile assessment (US-4.1) + skills inventory (US-4.2).

Deterministic readiness + strengths/focus; Bedrock phrases the narrative with a
safe fallback (RP-3).
"""
from __future__ import annotations

from app.clients.ai_client import AIClient
from app.data.models import Assessment, PrioritizedGap, SkillCategory, SkillsInventory, YouthCase
from app.services.skills import level_value

_CATEGORY_KEYWORDS = {
    "Software & IT": ["javascript", "react", "node", "python", "java", "git", "typescript", "sql", "html", "css"],
    "Data": ["sql", "power bi", "excel", "python", "statistics", "analytics", "data"],
    "Soft Skills": ["communication", "leadership", "teamwork"],
}


def _readiness(case: YouthCase, gaps: list[PrioritizedGap], required_count: int) -> float:
    if required_count <= 0:
        return 100.0
    covered = max(0, required_count - len(gaps))
    return round(100.0 * covered / required_count, 1)


def assess(case: YouthCase, gaps: list[PrioritizedGap], required_count: int, ai: AIClient | None) -> Assessment:
    readiness = _readiness(case, gaps, required_count)
    strengths = [s.name for s in case.skills if level_value(s.level) >= 3][:5]
    focus = [g.skill for g in gaps[:5]]
    summary = (
        f"{case.name or 'The youth'} is {readiness:.0f}% ready for the target goal. "
        f"Strengths: {', '.join(strengths) or 'developing'}. "
        f"Focus areas: {', '.join(focus) or 'none identified'}."
    )
    fallback = Assessment(summary=summary, readinessScore=readiness, strengths=strengths, focusAreas=focus)

    if ai is not None and ai.is_available():
        result = ai.generate_json(
            'Summarise the youth profile readiness for the goal. Return JSON '
            '{"summary": "...", "strengths": ["..."], "focusAreas": ["..."]}.',
            {"name": case.name, "education": case.education.model_dump(), "skills": strengths, "gaps": focus},
        )
        if result.ok and result.parsed:
            return Assessment(
                summary=str(result.parsed.get("summary", summary)),
                readinessScore=readiness,
                strengths=[str(s) for s in result.parsed.get("strengths", strengths)][:5] or strengths,
                focusAreas=[str(s) for s in result.parsed.get("focusAreas", focus)][:5] or focus,
            )
    return fallback


def skills_inventory(case: YouthCase) -> SkillsInventory:
    groups: list[SkillCategory] = []
    used: set[str] = set()
    for category, keywords in _CATEGORY_KEYWORDS.items():
        matched = [s for s in case.skills if any(k in s.name.lower() for k in keywords)]
        if matched:
            groups.append(SkillCategory(category=category, skills=matched))
            used.update(s.name for s in matched)
    other = [s for s in case.skills if s.name not in used]
    if other:
        groups.append(SkillCategory(category="Other", skills=other))
    return SkillsInventory(groups=groups)
