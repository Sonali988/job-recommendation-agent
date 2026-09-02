"""MCPToolInterface protocol + MockMCPTools (FR-5.2).

Clean, swappable interface so real MY Bharat MCP tools can replace the mock later.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from app.data.models import Opportunity


@dataclass
class EnrollResult:
    opportunity_id: str
    status: str
    message: str


class MCPToolInterface(Protocol):
    def search_opportunities(self, query: str, candidates: list[Opportunity]) -> list[Opportunity]: ...
    def enroll(self, opportunity_id: str) -> EnrollResult: ...


class MockMCPTools:
    """Deterministic mock implementation of the MY Bharat tool interface."""

    def search_opportunities(self, query: str, candidates: list[Opportunity]) -> list[Opportunity]:
        if not query:
            return candidates
        q = query.lower()
        return [
            o
            for o in candidates
            if q in o.jobTitle.lower()
            or q in o.functionalArea.lower()
            or any(q in s.lower() for s in o.requiredSkills)
        ]

    def enroll(self, opportunity_id: str) -> EnrollResult:
        return EnrollResult(
            opportunity_id=opportunity_id,
            status="ENROLLED",
            message=f"Mock enrollment recorded for opportunity {opportunity_id}.",
        )
