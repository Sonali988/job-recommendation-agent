import { useEffect, useRef } from "react";
import { api } from "../../api/client";
import { useCase, useProgress, useAlerts } from "../../state/CaseContext";
import { Card, StatTile, ProgressRing, MatchScoreRing, Button } from "../../components/ui";

export function DashboardScreen() {
  const { youthCase, goalText, profileId, session, ai, setAI, runAgentCycle, setDegraded } = useCase();
  const progress = useProgress();
  const alerts = useAlerts();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !profileId) return;
    started.current = true;
    void runAgentCycle();
    api.assessment({ case_id: profileId, goal_text: goalText, session }).then((res) => {
      if (res.data) setAI({ assessment: res.data.assessment, inventory: res.data.inventory });
      if (res.degraded) setDegraded(true);
    });
    api.opportunities(profileId).then((res) => {
      if (res.data) setAI({ opportunities: res.data.opportunities });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const topMatches = (ai.opportunities ?? []).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Your goal</h1>
          <p className="text-slate-500">{goalText || "No goal set yet — add one in Profile."}</p>
        </div>
        <Button onClick={() => runAgentCycle()} testid="run-agent-cycle">Run agent cycle</Button>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <Card><ProgressRing value={progress} label="Profile strength" /></Card>
        <StatTile label="Matches" value={(ai.opportunities ?? []).length} testid="stat-matches" />
        <StatTile label="Tasks done" value={session.completedTaskIds.length} />
        <StatTile label="Alerts" value={alerts.length} />
      </div>

      <Card>
        <h2 className="font-semibold text-slate-800 mb-3">Top matches for you</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {topMatches.map((o) => (
            <div key={o.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">{o.organizationName || "Employer"}</span>
                <MatchScoreRing score={o.matchScore} />
              </div>
              <div className="text-sm text-slate-600 mt-1 line-clamp-2">{o.jobTitle}</div>
            </div>
          ))}
          {topMatches.length === 0 && <span className="text-sm text-slate-400">No matches yet.</span>}
        </div>
      </Card>

      {youthCase && (
        <Card>
          <h2 className="font-semibold text-slate-800 mb-2">Recommended skills to improve</h2>
          <div className="flex flex-wrap gap-2">
            {(ai.agent?.reassessedGaps ?? []).slice(0, 6).map((g) => (
              <span key={g.skill} className="rounded-full bg-brand-light text-brand-dark text-xs px-2 py-1">{g.skill}</span>
            ))}
            {(ai.agent?.reassessedGaps ?? []).length === 0 && <span className="text-sm text-slate-400">Run the agent cycle to see gaps.</span>}
          </div>
        </Card>
      )}
    </div>
  );
}
