import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPin, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Opportunity } from '../../types/youth'
import { CompanyLogo, MatchDots, MatchScoreRing, TagPill } from '../ui/Badges'

interface JobMatchesProps {
  opportunities: Opportunity[]
  onToggleSave: (id: string) => void
}

export function JobMatches({ opportunities, onToggleSave }: JobMatchesProps) {
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 card-shadow">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-bold text-gray-900">{t('dashboard.topMatches')}</h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
        {opportunities.slice(0, 6).map((opp) => (
          <div
            key={opp.id}
            className="min-w-[272px] max-w-[272px] snap-start border border-gray-100 rounded-2xl p-4 bg-white hover:border-primary-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <CompanyLogo name={opp.company} size="lg" />
              <button
                onClick={() => onToggleSave(opp.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  opp.saved ? 'text-primary-600' : 'text-gray-300 hover:text-primary-600'
                }`}
              >
                <Bookmark size={18} fill={opp.saved ? 'currentColor' : 'none'} />
              </button>
            </div>

            <h3 className="font-bold text-gray-900 text-sm leading-tight">{opp.company}</h3>
            <p className="text-xs text-gray-500 mt-0.5 mb-3 line-clamp-2">{opp.title}</p>

            <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-3">
              <MapPin size={11} className="shrink-0" />
              <span className="truncate">{opp.location}</span>
              <span className="text-gray-300 mx-0.5">•</span>
              <span className="shrink-0 capitalize">{opp.workType}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              <TagPill>Full Time</TagPill>
              <TagPill>{opp.experienceLevel}</TagPill>
            </div>

            <p className="text-sm font-bold text-gray-900 mb-4">{opp.salaryRange}</p>

            <div className="flex items-end justify-between mb-4 px-1">
              <div className="flex flex-col items-center">
                <MatchScoreRing score={opp.matchScore} size={56} />
                <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{t('dashboard.matchScore')}</p>
              </div>
              <div className="flex flex-col items-end">
                <MatchDots match={opp.skillsMatch} total={opp.skillsTotal} />
                <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{t('dashboard.skillsMatch')}</p>
              </div>
            </div>

            <button className="w-full py-2.5 border-2 border-primary-600 text-primary-600 text-sm font-bold rounded-xl hover:bg-primary-600 hover:text-white transition-colors">
              {t('dashboard.viewDetails')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
