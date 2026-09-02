import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Briefcase,
  Send,
  Bookmark,
  FileText,
  Brain,
  GraduationCap,
  Users,
} from 'lucide-react'
import { ProgressRing } from '../ui/Badges'

const navItems = [
  { to: '/', icon: LayoutDashboard, key: 'dashboard' },
  { to: '/matches', icon: Briefcase, key: 'jobMatches' },
  { to: '/applied', icon: Send, key: 'appliedJobs' },
  { to: '/saved', icon: Bookmark, key: 'savedJobs' },
  { to: '/resume', icon: FileText, key: 'resumeBuilder' },
  { to: '/assessment', icon: Brain, key: 'skillAssessment' },
  { to: '/courses', icon: GraduationCap, key: 'courses' },
  { to: '/profiles', icon: Users, key: 'profiles' },
]

interface SidebarProps {
  profileStrength: number
}

export function Sidebar({ profileStrength }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className="w-[248px] bg-white border-r border-gray-200/80 flex flex-col h-screen sticky top-0 shrink-0 z-20">
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <img
            src="/yuvamitra.png"
            alt="YuvaMitra logo"
            className="w-10 h-10 rounded-xl object-contain shrink-0"
          />
          <div>
            <h1 className="font-bold text-gray-900 text-[15px] leading-tight">{t('app.name')}</h1>
            <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{t('app.tagline')}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={key}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] transition-all ${isActive
                ? 'bg-primary-600 text-white font-semibold shadow-sm shadow-primary-200'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 card-shadow">
          <div className="flex items-center gap-3">
            <ProgressRing percent={profileStrength} size={54} />
            <div>
              <p className="text-xs text-gray-700 font-semibold leading-snug">{t('dashboard.completeProfile')}</p>
              <button className="mt-2 px-3 py-1.5 bg-primary-600 text-white text-[11px] font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                {t('dashboard.completeNow')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
