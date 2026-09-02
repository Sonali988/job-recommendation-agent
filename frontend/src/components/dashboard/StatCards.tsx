import { useTranslation } from 'react-i18next'
import { TrendingUp, Briefcase, Send, CalendarDays } from 'lucide-react'
import type { Stats } from '../../types/youth'

interface StatCardsProps {
  profileStrength: number
  stats: Stats
}

export function StatCards({ profileStrength, stats }: StatCardsProps) {
  const { t } = useTranslation()

  const cards = [
    {
      label: t('dashboard.profileStrength'),
      value: `${profileStrength}%`,
      icon: TrendingUp,
      iconBg: 'bg-primary-50',
      iconColor: 'text-primary-600',
      progress: profileStrength,
    },
    {
      label: t('dashboard.matchesFound'),
      value: stats.matchesFound.toString(),
      icon: Briefcase,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: t('dashboard.applied'),
      value: stats.applied.toString(),
      icon: Send,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: t('dashboard.interviews'),
      value: stats.interviews.toString(),
      icon: CalendarDays,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-4 card-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
              <p className="text-[28px] font-bold text-gray-900 leading-none">{card.value}</p>
            </div>
            <div className={`p-2 rounded-xl ${card.iconBg}`}>
              <card.icon size={18} className={card.iconColor} />
            </div>
          </div>
          {card.progress !== undefined && (
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-700"
                style={{ width: `${card.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
