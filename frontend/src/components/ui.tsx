// LC-F7 Reusable presentational components (Tailwind).
import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-white shadow-sm border border-slate-100 p-4 ${className}`}>{children}</div>;
}

export function StatTile({ label, value, testid }: { label: string; value: string | number; testid?: string }) {
  return (
    <Card className="flex flex-col">
      <span className="text-2xl font-semibold text-slate-800" data-testid={testid}>{value}</span>
      <span className="text-sm text-slate-500">{label}</span>
    </Card>
  );
}

export function ProgressRing({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-16 w-16 rounded-full grid place-items-center text-sm font-semibold text-brand-dark"
        style={{ background: `conic-gradient(#6d28d9 ${clamped * 3.6}deg, #ede9fe 0deg)` }}
        role="img"
        aria-label={`${clamped}% ${label ?? "progress"}`}
      >
        <span className="h-12 w-12 rounded-full bg-white grid place-items-center">{Math.round(clamped)}%</span>
      </div>
      {label && <span className="text-sm text-slate-600">{label}</span>}
    </div>
  );
}

export function MatchScoreRing({ score }: { score: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, score)) * 100);
  return (
    <span className="inline-grid place-items-center h-11 w-11 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200"
      aria-label={`${pct}% match`}>
      {pct}%
    </span>
  );
}

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "brand" | "amber" | "green" }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    brand: "bg-brand-light text-brand-dark",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-emerald-100 text-emerald-800",
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Button({
  children, onClick, disabled, variant = "primary", testid, type = "button",
}: {
  children: ReactNode; onClick?: () => void; disabled?: boolean;
  variant?: "primary" | "ghost"; testid?: string; type?: "button" | "submit";
}) {
  const base = "rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50";
  const styles = variant === "primary"
    ? "bg-brand text-white hover:bg-brand-dark"
    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50";
  return (
    <button type={type} onClick={onClick} disabled={disabled} data-testid={testid} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return <div className="text-sm text-slate-500 py-6 text-center" role="status">{label}</div>;
}

export function EmptyState({ message }: { message: string }) {
  return <div className="text-sm text-slate-400 py-6 text-center">{message}</div>;
}
