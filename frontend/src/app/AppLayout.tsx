import { NavLink, Outlet } from "react-router-dom";
import { useCase, useAlerts } from "../state/CaseContext";
import { useI18n } from "../i18n";
import { DegradedBanner } from "../components/DegradedBanner";

const NAV = [
  { to: "/dashboard", key: "nav.dashboard" },
  { to: "/profile", key: "nav.profile" },
  { to: "/skills", key: "nav.skills" },
  { to: "/roadmap", key: "nav.roadmap" },
  { to: "/opportunities", key: "nav.opportunities" },
  { to: "/chat", key: "nav.chat" },
  { to: "/notifications", key: "nav.notifications" },
];

export function AppLayout() {
  const { youthCase } = useCase();
  const { t } = useI18n();
  const alerts = useAlerts();
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen flex">
      <nav className="w-56 bg-white border-r border-slate-100 p-4 flex flex-col gap-1" aria-label="Main">
        <div className="text-lg font-bold text-brand-dark mb-4">{t("app.title")}</div>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            data-testid={`nav-${n.key.split(".")[1]}`}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-brand-light text-brand-dark font-medium" : "text-slate-600 hover:bg-slate-50"}`}
          >
            {t(n.key)}
            {n.key === "nav.notifications" && unread > 0 && (
              <span className="ml-2 inline-block rounded-full bg-brand text-white text-xs px-1.5">{unread}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-100 px-6 py-3">
          <span className="text-slate-700">
            {youthCase ? `Good day, ${youthCase.name.split(" ")[0]}` : ""}
          </span>
        </header>
        <DegradedBanner />
        <main className="flex-1 p-6" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
