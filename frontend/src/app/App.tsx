import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { I18nProvider } from "../i18n";
import { CaseProvider, useCase } from "../state/CaseContext";
import { ErrorBoundary } from "./ErrorBoundary";
import { AppLayout } from "./AppLayout";
import { LoginScreen } from "../features/login/LoginScreen";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { ProfileScreen } from "../features/profile/ProfileScreen";
import { SkillsGapScreen } from "../features/skills/SkillsGapScreen";
import { RoadmapScreen } from "../features/roadmap/RoadmapScreen";
import { OpportunitiesScreen } from "../features/opportunities/OpportunitiesScreen";
import { ChatScreen } from "../features/chat/ChatScreen";
import { NotificationsScreen } from "../features/notifications/NotificationsScreen";

function Protected({ children }: { children: JSX.Element }) {
  const { profileId } = useCase();
  return profileId ? children : <Navigate to="/" replace />;
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route element={<Protected><AppLayout /></Protected>}>
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/skills" element={<SkillsGapScreen />} />
          <Route path="/roadmap" element={<RoadmapScreen />} />
          <Route path="/opportunities" element={<OpportunitiesScreen />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="/notifications" element={<NotificationsScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <CaseProvider>
          <Router />
        </CaseProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
