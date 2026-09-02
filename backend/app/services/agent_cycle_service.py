"""Proactive agent cycle (US-9.x, Q4=A).

Deterministic detection of progress / opportunities / deadlines / inactivity,
then composes the other services to reassess gaps and refresh actions.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

from app.clients.ai_client import AIClient
from app.core.config import Settings
from app.data.models import (
    AgentCycleResult,
    Alert,
    Opportunity,
    PrioritizedGap,
    SessionState,
    YouthCase,
)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _new_alert(alert_type: str, message: str, severity: str = "INFO") -> Alert:
    return Alert(
        id=uuid.uuid4().hex[:10],
        type=alert_type,
        message=message,
        severity=severity,
        createdAt=_now().isoformat(),
    )


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def run_cycle(
    case: YouthCase,
    gaps: list[PrioritizedGap],
    matches: list[Opportunity],
    progress: float,
    session: SessionState,
    settings: Settings,
    prior_progress: float | None,
    ai: AIClient | None = None,
) -> AgentCycleResult:
    alerts: list[Alert] = []

    # Progress detection
    if prior_progress is not None and (progress - prior_progress) >= settings.progress_delta_threshold:
        alerts.append(_new_alert("PROGRESS", f"Your progress improved to {progress:.0f}%. Keep it up!"))

    # Deadline detection (jobs expiring within the window)
    window = _now() + timedelta(days=settings.deadline_window_days)
    for opp in matches[:10]:
        exp = _parse_dt(opp.expiredAt)
        if exp is not None and _now() < exp <= window:
            alerts.append(
                _new_alert("DEADLINE", f"'{opp.jobTitle}' closes soon. Apply before it expires.", "WARN")
            )
            break

    # New match detection
    if matches:
        top = matches[0]
        alerts.append(
            _new_alert("MATCH", f"New strong match: {top.jobTitle} ({top.matchScore:.0%}).")
        )

    # Inactivity detection
    last_active = _parse_dt(session.lastActiveAt)
    if last_active is not None:
        if (_now() - last_active) >= timedelta(days=settings.inactivity_window_days):
            alerts.append(
                _new_alert("INACTIVITY", "It's been a while — check your recommended next steps.")
            )

    # drop alerts the user already dismissed by type/message is out of scope;
    # dismissed ids are handled client-side.
    return AgentCycleResult(
        alerts=alerts,
        nextBestActions=[],  # populated by the route which has roadmap context
        reassessedGaps=gaps,
        progress=progress,
    )
