import { create } from 'zustand'
import type { Session, HeatmapEntry } from '@/core/types'
import { generateId, getDateKey } from '@/core/types'

interface SessionStore {
  sessions: Session[]
  addSession: (session: Omit<Session, 'id'>) => void
  getStatsToday: () => number
  getStatsWeek: () => number
  getStatsAllTime: () => number
  getTotalMinutes: () => number
  getHeatmap: () => HeatmapEntry[]
  hydrate: (data: { sessions: Session[] }) => void
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],

  addSession: (session) => {
    const newSession: Session = { ...session, id: generateId() }
    set((s) => ({ sessions: [...s.sessions, newSession] }))
  },

  getStatsToday: () => {
    const today = getDateKey()
    return get().sessions.filter(
      (s) => s.mode === 'focus' && getDateKey(s.completedAt) === today
    ).length
  },

  getStatsWeek: () => {
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    return get().sessions.filter(
      (s) => s.mode === 'focus' && s.completedAt >= weekAgo
    ).length
  },

  getStatsAllTime: () =>
    get().sessions.filter((s) => s.mode === 'focus').length,

  getTotalMinutes: () =>
    Math.floor(
      get().sessions.filter((s) => s.mode === 'focus')
        .reduce((acc, s) => acc + s.duration, 0) / 60
    ),

  getHeatmap: (): HeatmapEntry[] => {
    const map = new Map<string, number>()
    const sessions = get().sessions.filter((s) => s.mode === 'focus')

    sessions.forEach((s) => {
      const key = getDateKey(s.completedAt)
      map.set(key, (map.get(key) ?? 0) + 1)
    })

    // Build 12 weeks of entries
    const entries: HeatmapEntry[] = []
    const now = new Date()
    for (let i = 83; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      entries.push({ date: key, count: map.get(key) ?? 0 })
    }
    return entries
  },

  hydrate: (data) => set({ sessions: data.sessions }),
}))
