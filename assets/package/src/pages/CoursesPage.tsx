import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GraduationCap, Clock, Building2 } from 'lucide-react'
import type { CourseItem, SkillTier, YouthProfile } from '../types/youth'
import { SkillTierBadge } from '../components/ui/Badges'
import { tierCardClass } from '../services/profileMetrics'

interface CoursesPageProps {
  data: YouthProfile
  onToggleEnroll: (courseId: string) => void
}

const TIER_FILTERS: (SkillTier | 'all')[] = ['all', 'mediocre', 'developing', 'low-expert']

export function CoursesPage({ data, onToggleEnroll }: CoursesPageProps) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<SkillTier | 'all'>('all')

  const filtered = useMemo(() => {
    const sorted = [...data.courses].sort((a, b) => b.relevance - a.relevance)
    if (filter === 'all') return sorted
    return sorted.filter((c) => c.level === filter)
  }, [data.courses, filter])

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={20} className="text-primary-600" />
            <h1 className="text-[22px] font-bold text-gray-900">{t('pages.courses.title')}</h1>
          </div>
          <p className="text-gray-500 text-sm">{t('pages.courses.subtitle')}</p>
        </div>
        <SkillTierBadge tier={data.skillTier} />
      </div>

      <div className="flex flex-wrap gap-2">
        {TIER_FILTERS.map((tier) => (
          <button
            key={tier}
            onClick={() => setFilter(tier)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === tier ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tier === 'all' ? t('pages.courses.allLevels') : t(`pages.tiers.${tier}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} onToggleEnroll={onToggleEnroll} />
        ))}
      </div>
    </div>
  )
}

function CourseCard({ course, onToggleEnroll }: { course: CourseItem; onToggleEnroll: (id: string) => void }) {
  const { t } = useTranslation()

  return (
    <div className={`rounded-2xl border p-4 bg-white ${tierCardClass(course.level)}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <SkillTierBadge tier={course.level} />
        {course.enrolled && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600">
            {t('pages.courses.enrolled')}
          </span>
        )}
      </div>

      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{course.name}</h3>

      <div className="space-y-1.5 text-[11px] text-gray-500 mb-4">
        <div className="flex items-center gap-1.5">
          <Building2 size={12} />
          <span>{course.provider}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>{course.duration}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary-600">{course.relevance}% {t('pages.courses.relevance')}</span>
        <button
          onClick={() => onToggleEnroll(course.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            course.enrolled
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {course.enrolled ? t('pages.courses.unenroll') : t('pages.courses.enroll')}
        </button>
      </div>
    </div>
  )
}
