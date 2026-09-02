import { useTranslation } from 'react-i18next'
import type { TargetSkill, Application } from '../../types/youth'
import { CompanyLogo, DemandBadge, StatusBadge } from '../ui/Badges'

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function RecommendedSkills({ skills }: { skills: TargetSkill[] }) {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 card-shadow h-full">
      <h2 className="text-[15px] font-bold text-gray-900 mb-4">{t('dashboard.recommendedSkills')}</h2>
      <div className="divide-y divide-gray-50">
        {skills.slice(0, 4).map((skill) => (
          <div key={skill.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-gray-800 truncate">{skill.name}</span>
              <DemandBadge demand={skill.demand} />
            </div>
            <button className="text-xs text-primary-600 font-bold hover:text-primary-700 shrink-0 ml-2">
              {t('dashboard.learnNow')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ApplicationTracker({ applications }: { applications: Application[] }) {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 card-shadow h-full">
      <h2 className="text-[15px] font-bold text-gray-900 mb-4">{t('dashboard.applicationTracker')}</h2>
      <div className="divide-y divide-gray-50">
        {applications.map((app) => (
          <div key={app.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CompanyLogo name={app.company} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{app.company}</p>
                <p className="text-[11px] text-gray-400 truncate">{app.title}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <StatusBadge status={app.status} />
              <p className="text-[10px] text-gray-400 mt-1">{formatDate(app.appliedDate)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
