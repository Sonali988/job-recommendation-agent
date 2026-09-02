import { MapPin, Bookmark } from 'lucide-react'
import type { Opportunity } from '../../types/youth'
import { CompanyLogo, MatchScoreRing, TagPill } from '../ui/Badges'

interface JobCardProps {
  opp: Opportunity
  onToggleSave?: (id: string) => void
  onApply?: (id: string) => void
  compact?: boolean
}

export function JobCard({ opp, onToggleSave, onApply, compact }: JobCardProps) {
  return (
    <div
      className={`border border-gray-100 rounded-2xl p-4 bg-white hover:border-primary-200 hover:shadow-md transition-all ${
        compact ? '' : 'h-full flex flex-col'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <CompanyLogo name={opp.company} size="lg" />
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(opp.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              opp.saved ? 'text-primary-600' : 'text-gray-300 hover:text-primary-600'
            }`}
          >
            <Bookmark size={18} fill={opp.saved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <h3 className="font-bold text-gray-900 text-sm">{opp.company}</h3>
      <p className="text-xs text-gray-500 mt-0.5 mb-3 line-clamp-2">{opp.title}</p>

      <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-3">
        <MapPin size={11} className="shrink-0" />
        <span className="truncate">{opp.location}</span>
        <span className="text-gray-300 mx-0.5">•</span>
        <span className="shrink-0 capitalize">{opp.workType}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <TagPill>{opp.workType}</TagPill>
        <TagPill>{opp.experienceLevel}</TagPill>
      </div>

      <p className="text-sm font-bold text-gray-900 mb-3">{opp.salaryRange}</p>

      <div className="flex items-center gap-3 mb-4">
        <MatchScoreRing score={opp.matchScore} size={48} />
        <p className="text-[11px] text-gray-500">{opp.skillsMatch}/{opp.skillsTotal} skills match</p>
      </div>

      {onApply && (
        <button
          onClick={() => onApply(opp.id)}
          className="mt-auto w-full py-2.5 border-2 border-primary-600 text-primary-600 text-sm font-bold rounded-xl hover:bg-primary-600 hover:text-white transition-colors"
        >
          Apply Now
        </button>
      )}
    </div>
  )
}
