import { useTranslation } from 'react-i18next'
import { StatCards } from '../components/dashboard/StatCards'
import { JobMatches } from '../components/dashboard/JobMatches'
import { RecommendedSkills, ApplicationTracker } from '../components/dashboard/SkillsAndTracker'
import { UploadResumeCard, ProfileSummary, JobAlertsCard, ResumeTipsCard } from '../components/dashboard/SideWidgets'
import type { YouthProfile } from '../types/youth'

interface DashboardPageProps {
  data: YouthProfile
  onToggleSave: (id: string) => void
}

export function DashboardPage({ data, onToggleSave }: DashboardPageProps) {
  const { t } = useTranslation()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900">
          {greeting}, {data.profile.firstName}! <span className="inline-block">👋</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <StatCards profileStrength={data.profile.profileStrength} stats={data.stats} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="space-y-5 min-w-0">
          <JobMatches opportunities={data.opportunities} onToggleSave={onToggleSave} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RecommendedSkills skills={data.targetSkills} />
            <ApplicationTracker applications={data.applications} />
          </div>
        </div>

        <div className="space-y-4">
          <UploadResumeCard />
          <ProfileSummary data={data} />
          <div className="grid grid-cols-2 gap-3">
            <JobAlertsCard />
            <ResumeTipsCard />
          </div>
        </div>
      </div>
    </div>
  )
}
