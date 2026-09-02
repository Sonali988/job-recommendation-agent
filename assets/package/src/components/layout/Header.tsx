import { useState, useRef, useEffect } from 'react'
import { Search, Bell, MapPin, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ProfileSummary } from '../../types/case'

interface HeaderProps {
  firstName: string
  unreadNotifications: number
  profiles: ProfileSummary[]
  selectedProfileId: string | null
  onSelectProfile: (profileId: string) => void
}

export function Header({
  firstName,
  unreadNotifications,
  profiles,
  selectedProfileId,
  onSelectProfile,
}: HeaderProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const current = profiles.find((p) => p.profileId === selectedProfileId) || profiles[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200/80 px-6 py-3.5 flex items-center gap-6 sticky top-0 z-10">
      <div className="flex-1 flex justify-center max-w-3xl mx-auto">
        <div className="flex w-full items-center bg-white border border-gray-200 rounded-xl overflow-hidden card-shadow">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent focus:outline-none"
            />
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="relative w-44 hidden sm:block">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('search.location')}
              className="w-full pl-10 pr-3 py-2.5 text-sm bg-transparent focus:outline-none"
            />
          </div>
          <button className="m-1.5 px-5 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap">
            {t('search.button')}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          <Bell size={20} className="text-gray-600" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadNotifications}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
              <span className="text-white text-sm font-bold">{firstName.charAt(0)}</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 hidden md:block">Hi, {firstName}</span>
            <ChevronDown size={16} className="text-gray-400 hidden md:block" />
          </button>

          {open && profiles.length > 0 && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 card-shadow py-1 z-50">
              <p className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Switch Profile
              </p>
              {profiles.map((p) => (
                <button
                  key={p.profileId}
                  onClick={() => {
                    onSelectProfile(p.profileId)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-primary-50 transition-colors ${
                    p.profileId === (selectedProfileId || current?.profileId)
                      ? 'text-primary-700 font-semibold bg-primary-50/50'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="block">{p.name}</span>
                  <span className="text-[11px] text-gray-400">{p.location}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
