import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useCase } from "../../state/CaseContext";
import { Card, Spinner, Badge, EmptyState } from "../../components/ui";

export function SkillsGapScreen() {
  const { profileId, goalText, session, ai, setAI, setDegraded } = useCase();
  const [loading, setLoading] = useState(!ai.gaps);

  useEffect(() => {
    if (!profileId || ai.gaps) return;
    Promise.all([
      api.assessment({ case_id: profileId, goal_text: goalText, session }),
      api.gapAnalysis({ case_id: profileId, goal_text: goalText, session }),
    ]).then(([a, g]) => {
      if (a.data) setAI({ assessment: a.data.assessment, inventory: a.data.inventory });
      if (g.data) setAI({ gaps: g.data.gaps });
      if (a.degraded || g.degraded) setDegraded(true);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 max-w-3xl">
      {ai.assessment && (
        <Card>
          <h2 className="font-semibold text-slate-800 mb-1">Assessment</h2>
          <p className="text-sm text-slate-600">{ai.assessment.summary}</p>
          <p className="text-sm mt-2">Readiness: <b>{Math.round(ai.assessment.readinessScore)}%</b></p>
        </Card>
      )}
      <Card>
        <h2 className="font-semibold text-slate-800 mb-2">Skills inventory</h2>
        {(ai.inventory?.groups ?? []).map((grp) => (
          <div key={grp.category} className="mb-2">
            <div className="text-xs text-slate-400">{grp.category}</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {grp.skills.map((s) => <Badge key={s.name}>{s.name}</Badge>)}
            </div>
          </div>
        ))}
        {(ai.inventory?.groups ?? []).length === 0 && <EmptyState message="No inventory." />}
      </Card>
      <Card>
        <h2 className="font-semibold text-slate-800 mb-2">Priority skill gaps</h2>
        <ol className="space-y-1">
          {(ai.gaps ?? []).map((g) => (
            <li key={g.skill} className="flex items-center justify-between text-sm">
              <span>{g.rank}. {g.skill}</span>
              <Badge tone="amber">target {g.targetLevel}</Badge>
            </li>
          ))}
        </ol>
        {(ai.gaps ?? []).length === 0 && <EmptyState message="No gaps identified." />}
      </Card>
    </div>
  );
}
