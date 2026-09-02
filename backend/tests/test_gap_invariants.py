"""PBT INV-2 (no satisfied skill in gaps) and INV-3 (prioritise preserves set)."""
from hypothesis import given
from hypothesis import strategies as st

from app.data.models import CareerPreferences, Opportunity, Skill, YouthCase
from app.services import gap_service

skill_names = st.text(alphabet="abcdefghijklmnop", min_size=1, max_size=6)


@given(
    have=st.lists(skill_names, max_size=8, unique=True),
    required=st.lists(skill_names, min_size=1, max_size=10, unique=True),
)
def test_no_satisfied_skill_in_gaps(have, required):
    case = YouthCase(
        userId="u",
        profileId="p",
        skills=[Skill(name=h, level="ADVANCED", years=3) for h in have],
    )
    gaps = gap_service.analyze_gaps(case, required)
    have_norm = {gap_service.normalize(h) for h in have}
    for g in gaps:
        # a gap's skill must NOT be one we already hold at advanced level
        assert gap_service.normalize(g.skill) not in have_norm


@given(required=st.lists(skill_names, min_size=1, max_size=10, unique=True))
def test_prioritize_preserves_set(required):
    case = YouthCase(userId="u", profileId="p", careerPreferences=CareerPreferences())
    gaps = gap_service.analyze_gaps(case, required)
    opps = [Opportunity(id=1, requiredSkills=required[:3])]
    ranked = gap_service.prioritize(list(gaps), opps)
    assert {g.skill for g in ranked} == {g.skill for g in gaps}
    assert len(ranked) == len(gaps)
    assert sorted(g.rank for g in ranked) == list(range(1, len(ranked) + 1))
