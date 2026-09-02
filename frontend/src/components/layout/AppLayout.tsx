import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import type { YouthProfile } from '../../types/youth'
import type { ProfileSummary } from '../../types/case'

interface AppLayoutProps {
  data: YouthProfile
  profiles: ProfileSummary[]
  selectedProfileId: string | null
  onSelectProfile: (profileId: string) => void
}

export function AppLayout({ data, profiles, selectedProfileId, onSelectProfile }: AppLayoutProps) {
  const unread = data.notifications.filter((n) => !n.read).length

  return (
    <div className="flex min-h-screen">
      <Sidebar profileStrength={data.profile.profileStrength} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          firstName={data.profile.firstName}
          unreadNotifications={unread}
          profiles={profiles}
          selectedProfileId={selectedProfileId}
          onSelectProfile={onSelectProfile}
        />
        <main className="flex-1 px-6 py-5 overflow-y-auto bg-[#f4f6fb]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
