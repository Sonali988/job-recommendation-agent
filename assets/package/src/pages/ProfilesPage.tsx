import { useTranslation } from 'react-i18next'
import { Users, MapPin, Briefcase } from 'lucide-react'
import type { ProfileSummary } from '../types/case'
import type { SkillTier } from '../types/youth'
import { SkillTierBadge, TierProgressRing } from '../components/ui/Badges'
import { tierCardClass } from '../services/profileMetrics'

interface ProfilesPageProps {
  profiles: ProfileSummary[]
  selectedProfileId: string | null
  onSelectProfile: (profileId: string) => void
}

const TIER_ORDER: SkillTier[] = ['mediocre', 'developing', 'low-expert']

export function ProfilesPage({ profiles, selectedProfileId, onSelectProfile }: ProfilesPageProps) {
  const { t } = useTranslation()

  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    items: profiles.filter((p) => (p.skillTier || 'mediocre') === tier),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-primary-600" />
          <h1 className="text-[22px] font-bold text-gray-900">{t('pages.profiles.title')}</h1>
        </div>
        <p className="text-gray-500 text-sm">{t('pages.profiles.subtitle', { count: profiles.length })}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {TIER_ORDER.map((tier) => {
          const count = profiles.filter((p) => (p.skillTier || 'mediocre') === tier).length
          return (
            <div key={tier} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${tierCardClass(tier)}`}>
              <SkillTierBadge tier={tier} />
              <span className="text-xs font-semibold text-gray-600">{count} {t('pages.profiles.profiles')}</span>
            </div>
          )
        })}
      </div>

      {grouped.map(({ tier, items }) => (
        <section key={tier}>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <SkillTierBadge tier={tier} />
            <span>{t(`pages.tiers.${tier}`)} {t('pages.profiles.level')}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((profile) => (
              <ProfileCard
                key={profile.profileId}
                profile={profile}
                tier={tier}
                selected={profile.profileId === selectedProfileId}
                onSelect={() => onSelectProfile(profile.profileId)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function ProfileCard({
  profile,
  tier,
  selected,
  onSelect,
}: {
  profile: ProfileSummary
  tier: SkillTier
  selected: boolean
  onSelect: () => void
}) {
  const { t } = useTranslation()
  const strength = profile.profileStrength ?? 50

  return (
    <button
      onClick={onSelect}
      className={`text-left rounded-2xl border p-4 bg-white transition-all w-full ${
        tierCardClass(tier)
      } ${selected ? 'ring-2 ring-primary-500 border-primary-200' : 'hover:border-primary-200'}`}
    >
      <div className="flex items-start gap-3">
        <TierProgressRing percent={strength} tier={tier} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-gray-900 truncate">{profile.name}</p>
            {selected && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary-100 text-primary-700 shrink-0">
                {t('pages.profiles.active')}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
            <Briefcase size={11} />
            {profile.youthType.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin size={11} />
            {profile.location}
          </p>
          {profile.topSkills && profile.topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {profile.topSkills.slice(0, 3).map((skill) => (
                <span key={skill} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-100 text-gray-600">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
