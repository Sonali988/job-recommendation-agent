"""PBT INV-4: progress always in [0,100]."""
from hypothesis import given
from hypothesis import strategies as st

from app.data.models import PrioritizedGap, SessionState, Skill, YouthCase
from app.services import progress_service


@given(
    n_gaps=st.integers(min_value=0, max_value=20),
    required=st.integers(min_value=0, max_value=20),
    completed=st.integers(min_value=0, max_value=30),
    total=st.integers(min_value=0, max_value=30),
    n_skills=st.integers(min_value=0, max_value=10),
)
def test_progress_in_range(n_gaps, required, completed, total, n_skills):
    case = YouthCase(
        userId="u",
        profileId="p",
        name="Test",
        skills=[Skill(name=f"s{i}") for i in range(n_skills)],
    )
    gaps = [PrioritizedGap(skill=f"g{i}") for i in range(n_gaps)]
    session = SessionState(completedTaskIds=[f"t{i}" for i in range(completed)])
    value = progress_service.compute_progress(case, gaps, required, session, total)
    assert 0.0 <= value <= 100.0
