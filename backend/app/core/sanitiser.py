"""LC-7 Sanitiser — strip recruiter PII and promotional spam from job data.

Applied at data load and before any Bedrock/UI output (PII-1..3, SECURITY-11).
"""
from __future__ import annotations

import re

# Fields on raw job records that carry recruiter/employer PII — dropped entirely.
PII_FIELDS = {
    "recruiterName",
    "recruiterMobile",
    "recruiterEmail",
    "employerId",
    "shareEmailWithJobseeker",
    "shareMobileWithJobseeker",
}

_PHONE_RE = re.compile(r"\b\d{10,}\b")
_HANDLE_RE = re.compile(r"@[A-Za-z0-9_]+")
_MULTISPACE_RE = re.compile(r"\s{2,}")
_MAX_DESC = 800


def strip_pii_fields(raw: dict) -> dict:
    """Return a copy of a raw job _source dict without PII fields."""
    return {k: v for k, v in raw.items() if k not in PII_FIELDS}


def clean_text(text: str, max_len: int = _MAX_DESC) -> str:
    """Remove phone numbers, social handles, and collapse whitespace; trim length."""
    if not text:
        return ""
    cleaned = _PHONE_RE.sub("", text)
    cleaned = _HANDLE_RE.sub("", cleaned)
    cleaned = _MULTISPACE_RE.sub(" ", cleaned).strip()
    if len(cleaned) > max_len:
        cleaned = cleaned[:max_len].rstrip() + "..."
    return cleaned


def sanitise_job(raw: dict) -> dict:
    """Produce a sanitised job dict safe for the domain model / Bedrock / UI."""
    data = strip_pii_fields(raw)
    data["jobTitle"] = clean_text(data.get("jobTitle", ""), max_len=160)
    data["jobDescription"] = clean_text(data.get("jobDescription", ""))
    return data
