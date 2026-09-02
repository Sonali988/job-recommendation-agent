"""Progress metric (Q7=A) — weighted blend, clamped to [0,100] (INV-4)."""
from __future__ import annotations

from app.data.models import PrioritizedGap, SessionState, YouthCase

_W_PROFILE = 0.3
_W_SKILL = 0.4
_W_TASKS = 0.3


def _profile_completeness(case: YouthCase) -> float:
    fields = [
        bool(case.name),
        bool(case.education.course),
        bool(case.skills),
        bool(case.careerPreferences.roles),
        bool(case.goal and case.goal.text),
        bool(case.interests),
    ]
    return sum(1 for f in fields if f) / len(fields)


def compute_progress(
    case: YouthCase,
    gaps: list[PrioritizedGap],
    required_skill_count: int,
    session: SessionState,
    total_tasks: int,
) -> float:
    profile = _profile_completeness(case)

    if required_skill_count <= 0:
        skill_coverage = 1.0
    else:
        skill_coverage = max(0.0, 1.0 - (len(gaps) / required_skill_count))

    if total_tasks <= 0:
        task_completion = 0.0
    else:
        task_completion = min(1.0, len(session.completedTaskIds) / total_tasks)

    raw = _W_PROFILE * profile + _W_SKILL * skill_coverage + _W_TASKS * task_completion
    return max(0.0, min(100.0, round(raw * 100, 1)))
