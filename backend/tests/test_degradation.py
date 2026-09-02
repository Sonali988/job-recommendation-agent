"""Resiliency (RESILIENCY-14): AI unavailable -> graceful degradation."""
from app.data.models import ChatMessage, Goal, Opportunity, YouthCase
from app.services import chat_service, opportunity_service


class _UnavailableAI:
    def is_available(self):
        return False

    def generate_json(self, prompt, context):
        raise AssertionError("should not be called when unavailable")

    def generate_text(self, prompt, context):
        raise AssertionError("should not be called when unavailable")


def test_chat_degrades_when_ai_unavailable():
    case = YouthCase(userId="u", profileId="p")
    message, degraded = chat_service.chat(
        [ChatMessage(role="user", content="hi")], case, [], [], _UnavailableAI()
    )
    assert degraded is True
    assert "unavailable" in message.content.lower()


def test_matching_works_without_ai():
    case = YouthCase(userId="u", profileId="p", dob="2000-01-01")
    opp = Opportunity(id=1, jobTitle="Analyst", status="PUBLISHED")
    results = opportunity_service.list_opportunities(case, Goal(text="Analyst"), [opp], ai=None)
    # deterministic path still returns results with a valid score
    assert all(0.0 <= o.matchScore <= 1.0 for o in results)
