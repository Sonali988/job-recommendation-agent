import { useState } from "react";
import { useCase } from "../../state/CaseContext";
import { Card, Button, Badge, EmptyState } from "../../components/ui";

export function ProfileScreen() {
  const { youthCase, goalText, setGoal } = useCase();
  const [draft, setDraft] = useState(goalText);
  const trimmed = draft.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= 500;

  if (!youthCase) return <EmptyState message="No profile loaded." />;

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <h2 className="font-semibold text-slate-800 mb-2">Career goal</h2>
        <textarea
          data-testid="goal-input"
          className="w-full rounded-lg border border-slate-200 p-2 text-sm"
          rows={2}
          value={draft}
          maxLength={500}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g., Become a Data Analyst"
        />
        <div className="mt-2">
          <Button testid="goal-save" disabled={!valid} onClick={() => setGoal(trimmed)}>Save goal</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-800 mb-2">Profile</h2>
        <dl className="grid sm:grid-cols-2 gap-2 text-sm">
          <div><dt className="text-slate-400">Name</dt><dd>{youthCase.name}</dd></div>
          <div><dt className="text-slate-400">Type</dt><dd>{youthCase.youthType}</dd></div>
          <div><dt className="text-slate-400">Education</dt><dd>{youthCase.education.course} — {youthCase.education.specialization}</dd></div>
          <div><dt className="text-slate-400">Location</dt><dd>{youthCase.location.district}, {youthCase.location.state}</dd></div>
        </dl>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-800 mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {youthCase.skills.map((s) => <Badge key={s.name} tone="brand">{s.name} · {s.level}</Badge>)}
          {youthCase.skills.length === 0 && <EmptyState message="No skills listed." />}
        </div>
      </Card>
    </div>
  );
}
