"""PBT INV-5 (matchScore in [0,1]) + eligibility behavior."""
from hypothesis import given
from hypothesis import strategies as st

from app.data.models import CareerPreferences, Goal, Opportunity, Skill, YouthCase
from app.services import opportunity_service


def _case():
    return YouthCase(
        userId="u",
        profileId="p",
        dob="2000-01-01",
        gender="Male",
        skills=[Skill(name="Python", level="ADVANCED"), Skill(name="SQL", level="INTERMEDIATE")],
        careerPreferences=CareerPreferences(roles=["Data Analyst"], locations=["Pune"]),
    )


@given(
    skills=st.lists(st.text(min_size=1, max_size=10), max_size=6),
    min_age=st.integers(min_value=16, max_value=30),
)
def test_match_score_bounds(skills, min_age):
    case = _case()
    opp = Opportunity(
        id=1, jobTitle="Data Analyst", requiredSkills=skills, minAge=min_age, maxAge=45,
        noAgePreference=False, status="PUBLISHED",
    )
    results = opportunity_service.list_opportunities(case, Goal(text="Data Analyst"), [opp], ai=None)
    for o in results:
        assert 0.0 <= o.matchScore <= 1.0


def test_expired_job_excluded():
    case = _case()
    expired = Opportunity(id=2, jobTitle="Data Analyst", expiredAt="2000-01-01T00:00:00", status="PUBLISHED")
    results = opportunity_service.list_opportunities(case, Goal(text="Data Analyst"), [expired], ai=None)
    assert all(o.id != 2 for o in results)
