import { useState, useEffect, useCallback } from 'react'
import type { YouthProfile } from '../types/youth'
import type { CaseResponse, ProfileSummary, YouthCase } from '../types/case'
import {
  fetchYouthData,
  fetchProfiles,
  getSelectedProfileId,
  setSelectedProfileId,
} from '../services/api'
import { loadYouthFromStorage, saveYouthToStorage } from '../services/storage'
import usersSeed from '../data/users.json'
import { adaptCaseToDashboard } from '../services/adapter'
import { computeProfileStrength, computeSkillTier, syncYouthProfileStats } from '../services/profileMetrics'

function enrichProfileSummary(u: YouthCase): ProfileSummary {
  return {
    userId: u.userId,
    profileId: u.profileId,
    name: u.name,
    youthType: u.youthType,
    location: [u.location.district, u.location.state].filter(Boolean).join(', '),
    profileStrength: computeProfileStrength(u),
    skillTier: computeSkillTier(u),
    experienceYears: u.jobProfile.experienceYears,
    topSkills: u.skills.slice(0, 4).map((s) => s.name),
  }
}

function fallbackFromSeed(profileId?: string): YouthProfile | null {
  const users = (usersSeed as { users: CaseResponse['case'][] }).users
  const user = profileId
    ? users.find((u) => u.profileId === profileId)
    : users[0]
  if (!user) return null
  return adaptCaseToDashboard({ case: user, opportunities: [], courses: [] })
}

function seedProfiles(): ProfileSummary[] {
  const users = (usersSeed as { users: YouthCase[] }).users
  return users.map(enrichProfileSummary)
}

export function useYouthData() {
  const [data, setData] = useState<YouthProfile | null>(null)
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [selectedProfileId, setSelectedProfileIdState] = useState<string | null>(getSelectedProfileId())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async (profileId?: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const [profileList, youthData] = await Promise.all([
        fetchProfiles().catch(() => seedProfiles()),
        fetchYouthData(profileId || undefined).catch(() => null),
      ])

      if (profileList.length) {
        const users = (usersSeed as { users: YouthCase[] }).users
        setProfiles(
          profileList.map((p) => {
            const seedUser = users.find((u) => u.profileId === p.profileId)
            return seedUser ? enrichProfileSummary(seedUser) : { ...p, skillTier: 'developing' as const }
          })
        )
      }

      if (youthData) {
        const synced = syncYouthProfileStats(youthData)
        setData(synced)
        saveYouthToStorage(synced)
        if (profileId) setSelectedProfileId(profileId)
        return
      }

      const stored = loadYouthFromStorage(profileId || undefined)
      if (stored && stored.id === (profileId || stored.id)) {
        const synced = syncYouthProfileStats({
          ...stored,
          skillTier: stored.skillTier || 'developing',
          courses: stored.courses || [],
        })
        setData(synced)
        saveYouthToStorage(synced)
        return
      }

      const fallback = fallbackFromSeed(profileId || undefined)
      if (fallback) {
        const synced = syncYouthProfileStats(fallback)
        setData(synced)
        saveYouthToStorage(synced)
        if (profileId) setSelectedProfileId(profileId)
      } else {
        setError('Failed to load youth data')
      }
    } catch (e) {
      const fallback = fallbackFromSeed(profileId || undefined)
      if (fallback) {
        const synced = syncYouthProfileStats(fallback)
        setData(synced)
        saveYouthToStorage(synced)
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load data')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile(selectedProfileId)
  }, [loadProfile, selectedProfileId])

  const selectProfile = useCallback((profileId: string) => {
    setSelectedProfileIdState(profileId)
    setSelectedProfileId(profileId)
  }, [])

  const updateData = useCallback((updater: (prev: YouthProfile) => YouthProfile) => {
    setData((prev) => {
      if (!prev) return prev
      const next = updater(prev)
      saveYouthToStorage(next)
      return next
    })
  }, [])

  const toggleSaveOpportunity = useCallback((oppId: string) => {
    updateData((prev) => ({
      ...prev,
      opportunities: prev.opportunities.map((o) =>
        o.id === oppId ? { ...o, saved: !o.saved } : o
      ),
    }))
  }, [updateData])

  const applyToJob = useCallback((oppId: string) => {
    updateData((prev) => {
      const opp = prev.opportunities.find((o) => o.id === oppId)
      if (!opp) return prev
      const appId = `app-${oppId}`
      if (prev.applications.some((a) => a.id === appId)) return prev
      return syncYouthProfileStats({
        ...prev,
        applications: [
          {
            id: appId,
            company: opp.company,
            logo: opp.logo,
            title: opp.title,
            status: 'under-review',
            appliedDate: new Date().toISOString().slice(0, 10),
          },
          ...prev.applications,
        ],
      })
    })
  }, [updateData])

  const toggleEnrollCourse = useCallback((courseId: string) => {
    updateData((prev) => ({
      ...prev,
      courses: prev.courses.map((c) =>
        c.id === courseId ? { ...c, enrolled: !c.enrolled } : c
      ),
    }))
  }, [updateData])

  return {
    data,
    profiles,
    selectedProfileId,
    loading,
    error,
    selectProfile,
    updateData,
    toggleSaveOpportunity,
    applyToJob,
    toggleEnrollCourse,
    reload: () => loadProfile(selectedProfileId),
  }
}
