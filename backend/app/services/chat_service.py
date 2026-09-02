"""Chat with agent (US-7.x).

Assembles a relevant (not full) case context and calls Bedrock. Degrades to a
safe generic reply when the AI backend is unavailable (RP-4, US-10.2).
"""
from __future__ import annotations

from app.clients.ai_client import AIClient
from app.data.models import ChatMessage, PrioritizedGap, Opportunity, YouthCase

_DEGRADED = "The assistant is temporarily unavailable. Please try again shortly."


def _relevant_context(case: YouthCase, gaps: list[PrioritizedGap], matches: list[Opportunity]) -> dict:
    return {
        "name": case.name,
        "goal": case.goal.text if case.goal else "",
        "topGaps": [g.skill for g in gaps[:5]],
        "topMatches": [{"title": o.jobTitle, "org": o.organizationName} for o in matches[:3]],
    }


def chat(
    messages: list[ChatMessage],
    case: YouthCase,
    gaps: list[PrioritizedGap],
    matches: list[Opportunity],
    ai: AIClient | None,
) -> tuple[ChatMessage, bool]:
    """Return (assistant message, degraded)."""
    if ai is None or not ai.is_available():
        return ChatMessage(role="assistant", content=_DEGRADED), True

    convo = "\n".join(f"{m.role}: {m.content}" for m in messages[-10:])
    prompt = (
        "You are YuvaMitra, a supportive career assistant for Indian youth. "
        "Answer the user's latest message using only the provided context.\n\n" + convo
    )
    result = ai.generate_text(prompt, _relevant_context(case, gaps, matches))
    if not result.ok or not result.text.strip():
        return ChatMessage(role="assistant", content=_DEGRADED), True
    return ChatMessage(role="assistant", content=result.text.strip()), False
