import { create } from 'zustand'
import type { TimerMode, TimerStatus, TimerSnapshot } from '@/core/types'
import { DEFAULT_SETTINGS } from '@/core/constants'

interface TimerStore {
  mode: TimerMode
  status: TimerStatus
  timeLeft: number
  duration: number
  startedAt: number | null
  sessionCount: number // focus sessions completed

  setMode: (mode: TimerMode) => void
  setStatus: (status: TimerStatus) => void
  setTimeLeft: (t: number) => void
  setDuration: (d: number) => void
  setStartedAt: (t: number | null) => void
  incrementSessionCount: () => void
  getSnapshot: () => TimerSnapshot
  hydrate: (data: Partial<TimerStore>) => void
}

const focusSecs = DEFAULT_SETTINGS.timer.focusDuration * 60

export const useTimerStore = create<TimerStore>((set, get) => ({
  mode: 'focus',
  status: 'idle',
  timeLeft: focusSecs,
  duration: focusSecs,
  startedAt: null,
  sessionCount: 0,

  setMode: (mode) => set({ mode }),
  setStatus: (status) => set({ status }),
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  setDuration: (duration) => set({ duration }),
  setStartedAt: (startedAt) => set({ startedAt }),
  incrementSessionCount: () => set((s) => ({ sessionCount: s.sessionCount + 1 })),

  getSnapshot: (): TimerSnapshot => {
    const s = get()
    return {
      mode: s.mode,
      status: s.status,
      timeLeft: s.timeLeft,
      duration: s.duration,
      startedAt: s.startedAt,
      savedAt: Date.now(),
    }
  },

  hydrate: (data) => set((s) => ({ ...s, ...data })),
}))
