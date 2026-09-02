"""Shared skill helpers used across services."""
from __future__ import annotations

from app.data.models import Skill, YouthCase

_LEVEL_ORDER = {"BEGINNER": 1, "INTERMEDIATE": 2, "ADVANCED": 3}
_ALIASES = {"js": "javascript", "reactjs": "react", "node": "node.js", "nodejs": "node.js"}


def normalize(name: str) -> str:
    n = name.strip().lower()
    return _ALIASES.get(n, n)


def level_value(level: str | None) -> int:
    return _LEVEL_ORDER.get((level or "").upper(), 0)


def current_skill_map(case: YouthCase) -> dict[str, Skill]:
    """Map of normalized skill name -> Skill (merging primary/secondary as beginner)."""
    out: dict[str, Skill] = {}
    for s in case.skills:
        out[normalize(s.name)] = s
    for name in case.jobProfile.primarySkills:
        out.setdefault(normalize(name), Skill(name=name, level="INTERMEDIATE"))
    for name in case.jobProfile.secondarySkills:
        out.setdefault(normalize(name), Skill(name=name, level="BEGINNER"))
    return out
