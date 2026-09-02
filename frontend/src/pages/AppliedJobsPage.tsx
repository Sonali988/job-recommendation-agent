import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Filter } from 'lucide-react'
import type { Application, YouthProfile } from '../types/youth'
import { CompanyLogo, StatusBadge, SkillTierBadge } from '../components/ui/Badges'
import { tierCardClass } from '../services/profileMetrics'

interface AppliedJobsPageProps {
  data: YouthProfile
}

const STATUS_FILTERS: Application['status'][] = ['under-review', 'assessment', 'interview', 'offered', 'rejected']

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function AppliedJobsPage({ data }: AppliedJobsPageProps) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<Application['status'] | 'all'>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return data.applications
    return data.applications.filter((a) => a.status === filter)
  }, [data.applications, filter])

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Send size={20} className="text-primary-600" />
            <h1 className="text-[22px] font-bold text-gray-900">{t('pages.applied.title')}</h1>
          </div>
          <p className="text-gray-500 text-sm">{t('pages.applied.subtitle', { count: data.applications.length })}</p>
        </div>
        <SkillTierBadge tier={data.skillTier} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('pages.applied.all')} ({data.applications.length})
        </button>
        {STATUS_FILTERS.map((status) => {
          const count = data.applications.filter((a) => a.status === status).length
          if (!count) return null
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === status ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(`status.${status}`)} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${tierCardClass(data.skillTier)}`}>
          <Filter size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">{t('pages.applied.empty')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('pages.applied.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className={`rounded-2xl border p-4 bg-white transition-all ${tierCardClass(data.skillTier)}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <CompanyLogo name={app.company} size="md" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{app.company}</p>
                    <p className="text-sm text-gray-500 truncate">{app.title}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{t('pages.applied.appliedOn', { date: formatDate(app.appliedDate) })}</p>
                  </div>
                </div>
                <StatusBadge status={app.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
