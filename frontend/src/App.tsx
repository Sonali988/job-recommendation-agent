import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useYouthData } from './hooks/useYouthData'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { AgentPage } from './pages/AgentPage'
import { AssessmentPage } from './pages/AssessmentPage'
import { JourneyPage } from './pages/JourneyPage'
import { AppliedJobsPage } from './pages/AppliedJobsPage'
import { SavedJobsPage } from './pages/SavedJobsPage'
import { JobMatchesPage } from './pages/JobMatchesPage'
import { CoursesPage } from './pages/CoursesPage'
import { ProfilesPage } from './pages/ProfilesPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

function AppRoutes() {
  const {
    data,
    profiles,
    selectedProfileId,
    loading,
    error,
    selectProfile,
    toggleSaveOpportunity,
    applyToJob,
    toggleEnrollCourse,
  } = useYouthData()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Loading your career dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || 'Failed to load data'}</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<AppLayout data={data} profiles={profiles} selectedProfileId={selectedProfileId} onSelectProfile={selectProfile} />}>
        <Route index element={<DashboardPage data={data} onToggleSave={toggleSaveOpportunity} />} />
        <Route path="agent" element={<AgentPage />} />
        <Route path="assessment" element={<AssessmentPage />} />
        <Route path="journey" element={<JourneyPage data={data} />} />
        <Route
          path="matches"
          element={
            <JobMatchesPage data={data} onToggleSave={toggleSaveOpportunity} onApply={applyToJob} />
          }
        />
        <Route path="applied" element={<AppliedJobsPage data={data} />} />
        <Route path="saved" element={<SavedJobsPage data={data} onToggleSave={toggleSaveOpportunity} onApply={applyToJob} />} />
        <Route path="courses" element={<CoursesPage data={data} onToggleEnroll={toggleEnrollCourse} />} />
        <Route path="profiles" element={<ProfilesPage profiles={profiles} selectedProfileId={selectedProfileId} onSelectProfile={selectProfile} />} />
        <Route path="resume" element={<PlaceholderPage title="Resume Builder" />} />
        <Route path="interview" element={<PlaceholderPage title="Interview Prep" />} />
        <Route path="companies" element={<PlaceholderPage title="Companies" />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
