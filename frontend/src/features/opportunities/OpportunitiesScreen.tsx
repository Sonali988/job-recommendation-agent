import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useCase } from "../../state/CaseContext";
import { Card, Spinner, MatchScoreRing, Button, Badge, EmptyState } from "../../components/ui";

export function OpportunitiesScreen() {
  const { profileId, ai, setAI, setDegraded, session, toggleApplied, toggleSaved } = useCase();
  const [loading, setLoading] = useState(!ai.opportunities);

  useEffect(() => {
    if (!profileId || ai.opportunities) return;
    api.opportunities(profileId).then((res) => {
      if (res.data) setAI({ opportunities: res.data.opportunities });
      if (res.degraded) setDegraded(true);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  if (loading) return <Spinner />;
  const opps = ai.opportunities ?? [];

  return (
    <div className="space-y-3 max-w-3xl">
      <div className="text-sm text-slate-500">
        Applied: {session.appliedIds.length} · Saved: {session.savedIds.length}
      </div>
      {opps.map((o) => (
        <Card key={o.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium text-slate-800">{o.jobTitle}</div>
              <div className="text-xs text-slate-500">{o.organizationName} · {o.jobType}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {o.matchReasons.slice(0, 2).map((r, i) => <Badge key={i}>{r}</Badge>)}
              </div>
            </div>
            <MatchScoreRing score={o.matchScore} />
          </div>
          <div className="flex gap-2 mt-3">
            <Button testid={`apply-${o.id}`} onClick={() => toggleApplied(o.id)}>
              {session.appliedIds.includes(o.id) ? "Applied" : "Apply"}
            </Button>
            <Button variant="ghost" testid={`save-${o.id}`} onClick={() => toggleSaved(o.id)}>
              {session.savedIds.includes(o.id) ? "Saved" : "Save"}
            </Button>
          </div>
        </Card>
      ))}
      {opps.length === 0 && <EmptyState message="No opportunities found." />}
    </div>
  );
}
