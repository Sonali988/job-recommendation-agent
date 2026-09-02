import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useCase } from "../../state/CaseContext";
import { Card, Spinner, Button, Badge, EmptyState } from "../../components/ui";

export function RoadmapScreen() {
  const { profileId, goalText, session, ai, setAI, setDegraded, markTaskDone } = useCase();
  const [loading, setLoading] = useState(!ai.roadmap);

  useEffect(() => {
    if (!profileId || ai.roadmap) return;
    api.roadmap({ case_id: profileId, goal_text: goalText, session }).then((res) => {
      if (res.data) setAI({ roadmap: res.data.roadmap, nextBestActions: res.data.nextBestActions });
      if (res.degraded) setDegraded(true);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <h2 className="font-semibold text-slate-800 mb-2">Next best actions</h2>
        {(ai.nextBestActions ?? []).map((a) => (
          <div key={a.id} className="flex items-center justify-between text-sm py-1">
            <span>{a.title} <Badge>{a.type}</Badge></span>
            <Button variant="ghost" testid={`action-done-${a.id}`} onClick={() => markTaskDone(a.id)}>Done</Button>
          </div>
        ))}
        {(ai.nextBestActions ?? []).length === 0 && <EmptyState message="No actions yet." />}
      </Card>
      <Card>
        <h2 className="font-semibold text-slate-800 mb-2">Learning roadmap</h2>
        <ol className="space-y-2">
          {(ai.roadmap?.steps ?? []).map((s) => (
            <li key={s.order} className="rounded-lg border border-slate-100 p-3">
              <div className="text-sm font-medium">{s.order}. {s.title}</div>
              <div className="text-xs text-slate-500">Effort: {s.estimatedEffort}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {s.suggestedCourses.map((c) => <Badge key={c.courseId} tone="green">{c.courseName}</Badge>)}
              </div>
            </li>
          ))}
        </ol>
        {(ai.roadmap?.steps ?? []).length === 0 && <EmptyState message="No roadmap yet." />}
      </Card>
    </div>
  );
}
