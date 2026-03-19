import { useEffect } from 'react'
import { loadState, saveState } from '@/services/storage'
import { useTimerStore } from '@/store/timer-store'
import { useSettingsStore } from '@/store/settings-store'
import { useSessionStore } from '@/store/session-store'
import { useGameStore } from '@/store/game-store'
import { useTaskStore } from '@/store/task-store'

export function usePersistence() {
  const hydrateTimer = useTimerStore((s) => s.hydrate)
  const hydrateSettings = useSettingsStore((s) => s.hydrate)
  const hydrateSession = useSessionStore((s) => s.hydrate)
  const hydrateGame = useGameStore((s) => s.hydrate)
  const hydrateTask = useTaskStore((s) => s.hydrate)

  // Load from IndexedDB on mount
  useEffect(() => {
    ;(async () => {
      const [timer, settings, session, game, task] = await Promise.all([
        loadState('TIMER'),
        loadState('SETTINGS'),
        loadState('SESSION'),
        loadState('GAME'),
        loadState('TASK'),
      ])
      if (timer) hydrateTimer(timer as Parameters<typeof hydrateTimer>[0])
      if (settings) hydrateSettings(settings as Parameters<typeof hydrateSettings>[0])
      if (session) hydrateSession(session as Parameters<typeof hydrateSession>[0])
      if (game) hydrateGame(game as Parameters<typeof hydrateGame>[0])
      if (task) hydrateTask(task as Parameters<typeof hydrateTask>[0])
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to store changes and save
  useEffect(() => {
    const unsubs = [
      useTimerStore.subscribe((s) => {
        saveState('TIMER', {
          mode: s.mode,
          status: s.status,
          timeLeft: s.timeLeft,
          duration: s.duration,
          startedAt: s.startedAt,
          sessionCount: s.sessionCount,
          savedAt: Date.now(),
        })
      }),
      useSettingsStore.subscribe((s) => {
        saveState('SETTINGS', {
          timer: s.timer,
          sound: s.sound,
          soundVolume: s.soundVolume,
          environment: s.environment,
          notifications: s.notifications,
          autoStartBreaks: s.autoStartBreaks,
          autoStartFocus: s.autoStartFocus,
        })
      }),
      useSessionStore.subscribe((s) => saveState('SESSION', { sessions: s.sessions })),
      useGameStore.subscribe((s) =>
        saveState('GAME', {
          xp: s.xp,
          level: s.level,
          streak: s.streak,
          lastSessionDate: s.lastSessionDate,
          currentPlant: s.currentPlant,
          garden: s.garden,
          quests: s.quests,
        })
      ),
      useTaskStore.subscribe((s) =>
        saveState('TASK', { tasks: s.tasks, activeTaskId: s.activeTaskId })
      ),
    ]
    return () => unsubs.forEach((u) => u())
  }, [])
}
