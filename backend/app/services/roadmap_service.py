"""Learning roadmap (Q3=A) + next-best actions (US-5.x).

Maps gaps -> courses from the taxonomy; Bedrock orders steps with a fallback.
"""
from __future__ import annotations

from app.clients.ai_client import AIClient
from app.data.models import (
    Course,
    CourseRef,
    NextBestAction,
    Opportunity,
    PrioritizedGap,
    Roadmap,
    RoadmapStep,
    YouthCase,
)


def _match_courses(skill: str, courses: list[Course], limit: int = 3) -> list[CourseRef]:
    s = skill.lower()
    tokens = [t for t in s.replace("/", " ").split() if len(t) > 2]
    matches: list[CourseRef] = []
    for c in courses:
        name = c.courseName.lower()
        if s in name or any(t in name for t in tokens):
            matches.append(CourseRef(courseId=c.id, courseName=c.courseName))
        if len(matches) >= limit:
            break
    return matches


def build_roadmap(gaps: list[PrioritizedGap], courses: list[Course], ai: AIClient | None) -> Roadmap:
    steps: list[RoadmapStep] = []
    for order, gap in enumerate(gaps, start=1):
        steps.append(
            RoadmapStep(
                order=order,
                title=f"Build {gap.skill} skills",
                addressesGaps=[gap.skill],
                suggestedCourses=_match_courses(gap.skill, courses),
                estimatedEffort="2-4 weeks",
            )
        )

    if ai is not None and ai.is_available() and steps:
        result = ai.generate_json(
            'Order these learning steps into a sensible sequence. Return JSON '
            '{"order": [<stepOrderNumbers>]}.',
            {"steps": [{"order": s.order, "title": s.title} for s in steps]},
        )
        if result.ok and result.parsed and isinstance(result.parsed.get("order"), list):
            index = {s.order: s for s in steps}
            reordered = [index[o] for o in result.parsed["order"] if o in index]
            if len(reordered) == len(steps):
                for i, s in enumerate(reordered, start=1):
                    s.order = i
                steps = reordered
    return Roadmap(steps=steps)


def next_best_actions(
    case: YouthCase,
    roadmap: Roadmap,
    top_opportunity: Opportunity | None,
) -> list[NextBestAction]:
    actions: list[NextBestAction] = []
    if roadmap.steps:
        first = roadmap.steps[0]
        actions.append(
            NextBestAction(
                id=f"learn-{first.order}",
                title=first.title,
                type="LEARN",
                rationale="Closes your highest-priority skill gap.",
            )
        )
    if top_opportunity is not None:
        actions.append(
            NextBestAction(
                id=f"apply-{top_opportunity.id}",
                title=f"Apply: {top_opportunity.jobTitle}",
                type="APPLY",
                relatedId=str(top_opportunity.id),
                rationale=f"Strong match ({top_opportunity.matchScore:.0%}).",
            )
        )
    if not (case.goal and case.goal.text):
        actions.append(
            NextBestAction(id="profile-goal", title="Set a clear career goal", type="PROFILE",
                           rationale="A defined goal improves recommendations.")
        )
    return actions
