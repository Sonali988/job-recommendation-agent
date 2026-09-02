"""Sanitiser: PII stripped, spam handles/phones removed."""
from app.core.sanitiser import clean_text, sanitise_job, strip_pii_fields


def test_strip_pii_fields():
    raw = {"jobTitle": "X", "recruiterName": "HR", "recruiterMobile": "9000000000", "recruiterEmail": "a@b.com"}
    out = strip_pii_fields(raw)
    assert "recruiterName" not in out
    assert "recruiterMobile" not in out
    assert "recruiterEmail" not in out
    assert out["jobTitle"] == "X"


def test_clean_text_removes_handles_and_phones():
    text = "URGENT HIRING 6289171738 @EVERYONE @GOOGLEJOBS apply now"
    cleaned = clean_text(text)
    assert "6289171738" not in cleaned
    assert "@EVERYONE" not in cleaned
    assert "@GOOGLEJOBS" not in cleaned
    assert "apply now" in cleaned


def test_sanitise_job_end_to_end():
    raw = {
        "jobTitle": "Data Entry 6289171738 @NAUKRI",
        "jobDescription": "Call HR 6289171738 @EVERYONE " + "x" * 2000,
        "recruiterMobile": "6289171738",
    }
    out = sanitise_job(raw)
    assert "6289171738" not in out["jobTitle"]
    assert "recruiterMobile" not in out
    assert len(out["jobDescription"]) <= 810  # trimmed with ellipsis
