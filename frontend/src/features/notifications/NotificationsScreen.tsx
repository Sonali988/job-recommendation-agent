import { useCase, useAlerts } from "../../state/CaseContext";
import { Card, Button, Badge, EmptyState } from "../../components/ui";

export function NotificationsScreen() {
  const { markAlertRead, dismissAlert } = useCase();
  const alerts = useAlerts();

  return (
    <div className="space-y-2 max-w-3xl">
      {alerts.map((a) => (
        <Card key={a.id} className={a.read ? "opacity-70" : ""}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge tone={a.severity === "WARN" ? "amber" : "slate"}>{a.type}</Badge>
              <p className="text-sm text-slate-700 mt-1">{a.message}</p>
            </div>
            <div className="flex gap-2">
              {!a.read && <Button variant="ghost" testid={`alert-read-${a.id}`} onClick={() => markAlertRead(a.id)}>Read</Button>}
              <Button variant="ghost" testid={`alert-dismiss-${a.id}`} onClick={() => dismissAlert(a.id)}>Dismiss</Button>
            </div>
          </div>
        </Card>
      ))}
      {alerts.length === 0 && <EmptyState message="No notifications. Run the agent cycle from the dashboard." />}
    </div>
  );
}
