import { useTranslation } from 'react-i18next'
import { Upload, Bell, FileText } from 'lucide-react'
import type { YouthProfile } from '../../types/youth'

export function UploadResumeCard() {
  const { t } = useTranslation()
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 card-shadow text-center">
      <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Upload size={28} className="text-primary-600" />
      </div>
      <h3 className="font-bold text-gray-900 text-sm mb-1">{t('dashboard.uploadResume')}</h3>
      <p className="text-xs text-gray-400 mb-4">PDF, DOC up to 5MB</p>
      <button className="w-full py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors">
        {t('dashboard.uploadBtn')}
      </button>
    </div>
  )
}

export function ProfileSummary({ data }: { data: YouthProfile }) {
  const { t } = useTranslation()
  const { profile, education, stats } = data
  const fieldShort = education[0]?.field?.replace(/Computer Science.*/i, 'CSE').split(' ')[0] || ''

  const rows = [
    { label: t('dashboard.experience'), value: `${profile.experienceYears} ${t('dashboard.years')}` },
    { label: t('dashboard.skills'), value: `${stats.skillsAdded}/${stats.skillsTotal} ${t('dashboard.added')}` },
    { label: t('dashboard.education'), value: `${education[0]?.degree} (${fieldShort})` },
    { label: t('dashboard.resume'), value: profile.resumeUploaded ? t('dashboard.uploaded') : '—' },
    { label: t('dashboard.jobPreferences'), value: profile.jobPreferencesUpdated ? t('dashboard.updated') : '—' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 card-shadow">
      <h3 className="font-bold text-gray-900 text-sm mb-4">{t('dashboard.profileSummary')}</h3>
      <div className="space-y-3.5">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className="text-gray-500">{row.label}</span>
            <span className="font-semibold text-gray-900">{row.value}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 text-xs text-primary-600 font-bold hover:text-primary-700">
        {t('dashboard.editProfile')} →
      </button>
    </div>
  )
}

export function JobAlertsCard() {
  const { t } = useTranslation()
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 card-shadow h-full">
      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
        <Bell size={18} className="text-amber-500" />
      </div>
      <p className="text-sm font-bold text-gray-900">{t('dashboard.jobAlerts')}</p>
      <p className="text-[11px] text-gray-400 mt-1 mb-3 leading-relaxed">Get notified when new jobs match your skills</p>
      <button className="text-xs text-primary-600 font-bold hover:text-primary-700">{t('dashboard.createAlert')}</button>
    </div>
  )
}

export function ResumeTipsCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 card-shadow h-full">
      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
        <FileText size={18} className="text-blue-600" />
      </div>
      <p className="text-sm font-bold text-gray-900">Resume Tips</p>
      <p className="text-[11px] text-gray-400 mt-1 mb-3 leading-relaxed">AI-powered suggestions to improve your resume</p>
      <button className="text-xs text-primary-600 font-bold hover:text-primary-700">Improve Resume</button>
    </div>
  )
}
