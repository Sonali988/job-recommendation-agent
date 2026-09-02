"""PBT INV-1: domain model (de)serialisation round-trips."""
from hypothesis import given
from hypothesis import strategies as st

from app.data.models import Opportunity, Skill, YouthCase

skill_strat = st.builds(
    Skill,
    name=st.text(min_size=1, max_size=20),
    level=st.sampled_from(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    years=st.integers(min_value=0, max_value=40),
)


@given(
    user_id=st.text(min_size=1, max_size=12),
    profile_id=st.text(min_size=1, max_size=12),
    name=st.text(max_size=30),
    skills=st.lists(skill_strat, max_size=8),
)
def test_youthcase_roundtrip(user_id, profile_id, name, skills):
    case = YouthCase(userId=user_id, profileId=profile_id, name=name, skills=skills)
    restored = YouthCase.model_validate(case.model_dump())
    assert restored == case


@given(
    oid=st.integers(min_value=1, max_value=10_000_000),
    title=st.text(max_size=40),
    skills=st.lists(st.text(min_size=1, max_size=20), max_size=6),
)
def test_opportunity_roundtrip(oid, title, skills):
    opp = Opportunity(id=oid, jobTitle=title, requiredSkills=skills)
    restored = Opportunity.model_validate(opp.model_dump())
    assert restored == opp
