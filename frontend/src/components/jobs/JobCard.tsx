import { MapPin, Bookmark, Check } from 'lucide-react'
import type { Opportunity } from '../../types/youth'
import { CompanyLogo, MatchScoreRing, TagPill } from '../ui/Badges'
import { normalizeSkill } from '../../services/skillMatch'

interface JobCardProps {
  opp: Opportunity
  onToggleSave?: (id: string) => void
  onApply?: (id: string) => void
  compact?: boolean
  /** Normalized set of skills the youth already has, to highlight matches. */
  profileSkills?: Set<string>
}

function hasSkill(profileSkills: Set<string> | undefined, skill: string): boolean {
  if (!profileSkills || profileSkills.size === 0) return false
  const s = normalizeSkill(skill)
  if (!s) return false
  for (const h of profileSkills) {
    if (h === s || h.includes(s) || s.includes(h)) return true
  }
  return false
}

export function JobCard({ opp, onToggleSave, onApply, compact, profileSkills }: JobCardProps) {
  const required = opp.requiredSkills ?? []
  const matchColor = opp.matchScore >= 80 ? 'text-emerald-600' : opp.matchScore >= 60 ? 'text-primary-600' : 'text-amber-600'

  return (
    <div
      className={`border border-gray-100 rounded-2xl p-4 bg-white hover:border-primary-200 hover:shadow-md transition-all ${compact ? '' : 'h-full flex flex-col'
        }`}
    >
      <div className="flex items-start justify-between mb-3">
        <CompanyLogo name={opp.company} size="lg" />
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(opp.id)}
            className={`p-1.5 rounded-lg transition-colors ${opp.saved ? 'text-primary-600' : 'text-gray-300 hover:text-primary-600'
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

      {/* Match summary */}
      <div className="flex items-center gap-3 mb-3">
        <MatchScoreRing score={opp.matchScore} size={48} />
        <div>
          <p className={`text-sm font-bold ${matchColor}`}>{opp.matchScore}% match</p>
          <p className="text-[11px] text-gray-500">{opp.skillsMatch}/{opp.skillsTotal} skills match</p>
        </div>
      </div>

      {/* Required skills with matched/missing highlighting */}
      {required.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Required skills</p>
          <div className="flex flex-wrap gap-1.5">
            {required.slice(0, 8).map((skill) => {
              const have = hasSkill(profileSkills, skill)
              return (
                <span
                  key={skill}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${have
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}
                  title={have ? 'You have this skill' : 'Skill to develop'}
                >
                  {have && <Check size={10} />}
                  {skill}
                </span>
              )
            })}
            {required.length > 8 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                +{required.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

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
