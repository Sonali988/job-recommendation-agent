"""LC-12 CaseIndex — load, sanitise, and index the seed data once at startup.

Serves reads from memory. Seed JSON is read-only (never written).
The jobs file is a concatenation of objects (not a strict JSON array) and may
contain malformed records, so it is parsed tolerantly with raw_decode.
"""
from __future__ import annotations

import json
import os
from typing import Optional

from app.core.logging import get_logger, log_event
from app.core.sanitiser import sanitise_job
from app.data.models import Course, Opportunity, ProfileSummary, YouthCase

_SEED_DIR = os.path.join(os.path.dirname(__file__), "seed")
_logger = get_logger("repository")


def _tolerant_parse_objects(raw: str) -> list[dict]:
    """Parse a stream/array of JSON objects, skipping malformed records."""
    decoder = json.JSONDecoder()
    text = raw.strip()
    if text.startswith("["):
        text = text[1:]
    if text.endswith("]"):
        text = text[:-1]
    objects: list[dict] = []
    idx = 0
    n = len(text)
    skipped = 0
    while idx < n:
        # skip whitespace and separators
        while idx < n and text[idx] in " \t\r\n,":
            idx += 1
        if idx >= n:
            break
        try:
            obj, end = decoder.raw_decode(text, idx)
            if isinstance(obj, dict):
                objects.append(obj)
            idx = end
        except json.JSONDecodeError:
            # advance to the next promising object start
            nxt = text.find("{", idx + 1)
            if nxt == -1:
                break
            skipped += 1
            idx = nxt
    if skipped:
        log_event(_logger, "jobs_parse_skipped_records", skipped=skipped)
    return objects


class CaseRepository:
    def __init__(self, seed_dir: str = _SEED_DIR):
        self._seed_dir = seed_dir
        self._cases: dict[str, YouthCase] = {}
        self._opportunities: list[Opportunity] = []
        self._courses: list[Course] = []
        self._loaded = False

    # -- loading -----------------------------------------------------------
    def load(self) -> None:
        self._load_users()
        self._load_jobs()
        self._load_courses()
        self._loaded = True
        log_event(
            _logger,
            "seed_loaded",
            cases=len(self._cases),
            opportunities=len(self._opportunities),
            courses=len(self._courses),
        )

    def _load_users(self) -> None:
        with open(os.path.join(self._seed_dir, "users.json"), encoding="utf-8") as fh:
            data = json.load(fh)
        for u in data.get("users", []):
            try:
                case = YouthCase.model_validate(u)
                self._cases[case.profileId] = case
            except Exception:  # noqa: BLE001 - skip a bad record, keep loading
                log_event(_logger, "skip_bad_user_record")

    def _load_jobs(self) -> None:
        with open(os.path.join(self._seed_dir, "jobs.json"), encoding="utf-8") as fh:
            raw = fh.read()
        for wrapper in _tolerant_parse_objects(raw):
            source = wrapper.get("_source", wrapper)
            if not isinstance(source, dict):
                continue
            try:
                opp = Opportunity.model_validate(sanitise_job(source))
                self._opportunities.append(opp)
            except Exception:  # noqa: BLE001
                continue

    def _load_courses(self) -> None:
        with open(os.path.join(self._seed_dir, "courses.json"), encoding="utf-8") as fh:
            data = json.load(fh)
        for c in data:
            try:
                self._courses.append(
                    Course(id=c["id"], parentId=c.get("parent_id", 0), courseName=c.get("course_name", ""))
                )
            except Exception:  # noqa: BLE001
                continue

    # -- accessors ---------------------------------------------------------
    def _ensure(self) -> None:
        if not self._loaded:
            self.load()

    def list_profiles(self) -> list[ProfileSummary]:
        self._ensure()
        return [
            ProfileSummary(
                userId=c.userId,
                profileId=c.profileId,
                name=c.name,
                youthType=c.youthType,
                goalText=c.goal.text if c.goal else "",
            )
            for c in self._cases.values()
        ]

    def get_case(self, profile_id: str) -> Optional[YouthCase]:
        self._ensure()
        return self._cases.get(profile_id)

    def opportunities(self) -> list[Opportunity]:
        self._ensure()
        return list(self._opportunities)

    def courses(self) -> list[Course]:
        self._ensure()
        return list(self._courses)


# module-level singleton
_repository: Optional[CaseRepository] = None


def get_repository() -> CaseRepository:
    global _repository
    if _repository is None:
        _repository = CaseRepository()
        _repository.load()
    return _repository
