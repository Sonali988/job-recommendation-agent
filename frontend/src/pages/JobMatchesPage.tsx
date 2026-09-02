import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Briefcase, Search } from 'lucide-react'
import type { Opportunity, YouthProfile } from '../types/youth'
import { JobCard } from '../components/jobs/JobCard'
import { SkillTierBadge } from '../components/ui/Badges'
import { tierCardClass } from '../services/profileMetrics'
import { collectProfileSkills } from '../services/skillMatch'

interface JobMatchesPageProps {
  data: YouthProfile
  onToggleSave: (id: string) => void
  onApply: (id: string) => void
}

type SortOption = 'match' | 'recent' | 'salary'
type WorkTypeFilter = 'all' | 'remote' | 'hybrid' | 'onsite'

function matchesSearch(opp: Opportunity, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    opp.title.toLowerCase().includes(q) ||
    opp.company.toLowerCase().includes(q) ||
    opp.location.toLowerCase().includes(q)
  )
}

function matchesLocation(opp: Opportunity, loc: string) {
  const l = loc.trim().toLowerCase()
  if (!l) return true
  return opp.location.toLowerCase().includes(l)
}

function matchesWorkType(opp: Opportunity, filter: WorkTypeFilter) {
  if (filter === 'all') return true
  return opp.workType.toLowerCase() === filter
}

function sortOpportunities(opps: Opportunity[], sort: SortOption) {
  const sorted = [...opps]
  switch (sort) {
    case 'match':
      return sorted.sort((a, b) => b.matchScore - a.matchScore)
    case 'recent':
      return sorted.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
    case 'salary':
      return sorted.sort((a, b) => b.matchScore - a.matchScore)
    default:
      return sorted
  }
}

export function JobMatchesPage({ data, onToggleSave, onApply }: JobMatchesPageProps) {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [workType, setWorkType] = useState<WorkTypeFilter>('all')
  const [sort, setSort] = useState<SortOption>('match')

  // Initialize / update from header search params (q, loc).
  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
    setLocationFilter(searchParams.get('loc') ?? '')
  }, [searchParams])

  const profileSkills = useMemo(() => collectProfileSkills(data.skills), [data.skills])

  const filtered = useMemo(() => {
    const matched = data.opportunities.filter(
      (opp) =>
        matchesSearch(opp, search) &&
        matchesLocation(opp, locationFilter) &&
        matchesWorkType(opp, workType),
    )
    return sortOpportunities(matched, sort)
  }, [data.opportunities, search, locationFilter, workType, sort])

  const workTypes: WorkTypeFilter[] = ['all', 'remote', 'hybrid', 'onsite']

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase size={20} className="text-primary-600" />
            <h1 className="text-[22px] font-bold text-gray-900">{t('pages.matches.title')}</h1>
          </div>
          <p className="text-gray-500 text-sm">{t('pages.matches.subtitle', { count: filtered.length })}</p>
        </div>
        <SkillTierBadge tier={data.skillTier} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="match">{t('pages.matches.sortMatch')}</option>
          <option value="recent">{t('pages.matches.sortRecent')}</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {workTypes.map((type) => {
          const count =
            type === 'all'
              ? data.opportunities.length
              : data.opportunities.filter((o) => o.workType.toLowerCase() === type).length
          return (
            <button
              key={type}
              onClick={() => setWorkType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${workType === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {type === 'all' ? t('pages.matches.all') : type} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${tierCardClass(data.skillTier)}`}>
          <Briefcase size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">{t('pages.matches.empty')}</p>
          <p className="text-sm text-gray-400 mt-1">{t('pages.matches.emptyHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((opp) => (
            <div key={opp.id} className={tierCardClass(data.skillTier)}>
              <JobCard opp={opp} onToggleSave={onToggleSave} onApply={onApply} profileSkills={profileSkills} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
