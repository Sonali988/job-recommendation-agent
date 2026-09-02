import type { ReactNode } from 'react'
import { companyColor, companyInitial } from '../../services/companyUtils'

export function CompanyLogo({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass =
    size === 'sm' ? 'w-9 h-9 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-11 h-11 text-sm'
  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center text-white font-bold shrink-0`}
      style={{ backgroundColor: companyColor(name) }}
    >
      {companyInitial(name)}
    </div>
  )
}

export function MatchDots({ match, total }: { match: number; total: number }) {
  const dots = 4
  const filled = Math.round((match / Math.max(total, 1)) * dots)
  return (
    <div className="flex gap-1">
      {Array.from({ length: dots }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${i < filled ? 'bg-emerald-500' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

export function MatchScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#8b5cf6' : '#f59e0b'

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-900">{score}%</span>
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'under-review': 'bg-amber-50 text-amber-600',
    assessment: 'bg-sky-50 text-sky-600',
    interview: 'bg-violet-50 text-violet-600',
    rejected: 'bg-red-50 text-red-500',
    offered: 'bg-emerald-50 text-emerald-600',
  }
  const labels: Record<string, string> = {
    'under-review': 'Under Review',
    assessment: 'Assessment',
    interview: 'Interview',
    rejected: 'Rejected',
    offered: 'Offered',
  }
  return (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  )
}

export function DemandBadge({ demand }: { demand: string }) {
  const styles: Record<string, string> = {
    high: 'bg-red-50 text-red-500',
    medium: 'bg-amber-50 text-amber-600',
    low: 'bg-gray-50 text-gray-500',
  }
  const labels: Record<string, string> = {
    high: 'High Demand',
    medium: 'Medium Demand',
    low: 'Low Demand',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${styles[demand] || styles.low}`}>
      {labels[demand] || demand}
    </span>
  )
}

export function TagPill({ children }: { children: ReactNode }) {
  return (
    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-600">
      {children}
    </span>
  )
}

type SkillTier = 'mediocre' | 'developing' | 'low-expert'

const TIER_STYLES: Record<SkillTier, { badge: string; ring: string }> = {
  mediocre: { badge: 'bg-gray-100 text-gray-600 border border-gray-200', ring: '#9ca3af' },
  developing: { badge: 'bg-amber-50 text-amber-700 border border-amber-200', ring: '#f59e0b' },
  'low-expert': { badge: 'bg-violet-50 text-violet-700 border border-violet-200', ring: '#7c3aed' },
}

const TIER_LABELS: Record<SkillTier, string> = {
  mediocre: 'Mediocre',
  developing: 'Developing',
  'low-expert': 'Low Expert',
}

export function SkillTierBadge({ tier }: { tier: SkillTier }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${TIER_STYLES[tier].badge}`}>
      {TIER_LABELS[tier]}
    </span>
  )
}

export function TierProgressRing({ percent, tier, size = 64 }: { percent: number; tier: SkillTier; size?: number }) {
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference
  const color = TIER_STYLES[tier].ring

  return (
    <svg width={size} height={size} className="transform -rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-gray-800 text-[11px] font-bold"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
      >
        {percent}%
      </text>
    </svg>
  )
}

export function ProgressRing({ percent, size = 64 }: { percent: number; size?: number }) {
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#7c3aed"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-gray-800 text-[11px] font-bold"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
      >
        {percent}%
      </text>
    </svg>
  )
}
