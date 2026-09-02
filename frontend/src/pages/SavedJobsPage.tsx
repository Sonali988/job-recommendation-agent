import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { YouthProfile } from '../types/youth'
import { JobCard } from '../components/jobs/JobCard'
import { SkillTierBadge } from '../components/ui/Badges'
import { tierCardClass } from '../services/profileMetrics'

interface SavedJobsPageProps {
  data: YouthProfile
  onToggleSave: (id: string) => void
  onApply: (id: string) => void
}

export function SavedJobsPage({ data, onToggleSave, onApply }: SavedJobsPageProps) {
  const { t } = useTranslation()
  const saved = useMemo(() => data.opportunities.filter((o) => o.saved), [data.opportunities])

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bookmark size={20} className="text-primary-600" />
            <h1 className="text-[22px] font-bold text-gray-900">{t('pages.saved.title')}</h1>
          </div>
          <p className="text-gray-500 text-sm">{t('pages.saved.subtitle', { count: saved.length })}</p>
        </div>
        <SkillTierBadge tier={data.skillTier} />
      </div>

      {saved.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${tierCardClass(data.skillTier)}`}>
          <Bookmark size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">{t('pages.saved.empty')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('pages.saved.emptyHint')}</p>
          <Link
            to="/matches"
            className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700"
          >
            {t('pages.saved.browseMatches')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((opp) => (
            <div key={opp.id} className={tierCardClass(data.skillTier)}>
              <JobCard opp={opp} onToggleSave={onToggleSave} onApply={onApply} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
