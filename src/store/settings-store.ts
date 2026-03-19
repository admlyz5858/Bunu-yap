import { create } from 'zustand'
import type { Settings, SoundType, EnvironmentId } from '@/core/types'
import { DEFAULT_SETTINGS } from '@/core/constants'

interface SettingsStore extends Settings {
  setFocusDuration: (m: number) => void
  setShortBreakDuration: (m: number) => void
  setLongBreakDuration: (m: number) => void
  setLongBreakInterval: (n: number) => void
  setSound: (s: SoundType) => void
  setSoundVolume: (v: number) => void
  setEnvironment: (e: EnvironmentId) => void
  setNotifications: (v: boolean) => void
  setAutoStartBreaks: (v: boolean) => void
  setAutoStartFocus: (v: boolean) => void
  hydrate: (data: Partial<Settings>) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...DEFAULT_SETTINGS,

  setFocusDuration: (m) => set((s) => ({ timer: { ...s.timer, focusDuration: m } })),
  setShortBreakDuration: (m) => set((s) => ({ timer: { ...s.timer, shortBreakDuration: m } })),
  setLongBreakDuration: (m) => set((s) => ({ timer: { ...s.timer, longBreakDuration: m } })),
  setLongBreakInterval: (n) => set((s) => ({ timer: { ...s.timer, longBreakInterval: n } })),
  setSound: (sound) => set({ sound }),
  setSoundVolume: (soundVolume) => set({ soundVolume }),
  setEnvironment: (environment) => set({ environment }),
  setNotifications: (notifications) => set({ notifications }),
  setAutoStartBreaks: (autoStartBreaks) => set({ autoStartBreaks }),
  setAutoStartFocus: (autoStartFocus) => set({ autoStartFocus }),

  hydrate: (data) => set((s) => ({ ...s, ...data })),
}))
