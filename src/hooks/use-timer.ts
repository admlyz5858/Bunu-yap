import { useEffect, useRef, useCallback } from 'react'
import { TimerEngine } from '@/core/timer-engine'
import { useTimerStore } from '@/store/timer-store'
import { useSettingsStore } from '@/store/settings-store'
import { useSessionStore } from '@/store/session-store'
import { useGameStore } from '@/store/game-store'
import { useTaskStore } from '@/store/task-store'
import type { TimerMode } from '@/core/types'
import { XP_REWARDS } from '@/core/constants'

export function useTimer() {
  const engineRef = useRef<TimerEngine | null>(null)
  const tickCountRef = useRef(0)

  const timer = useTimerStore()
  const settings = useSettingsStore()
  const addSession = useSessionStore((s) => s.addSession)
  const { addXP, advancePlant, updateStreak, progressQuest } = useGameStore()
  const { incrementPomodoro, activeTaskId } = useTaskStore()

  const getDuration = useCallback(
    (mode: TimerMode) => {
      const t = settings.timer
      const map: Record<TimerMode, number> = {
        focus: t.focusDuration * 60,
        shortBreak: t.shortBreakDuration * 60,
        longBreak: t.longBreakDuration * 60,
      }
      return map[mode]
    },
    [settings.timer]
  )

  // Initialize engine
  useEffect(() => {
    const engine = new TimerEngine(
      {
        mode: timer.mode,
        status: timer.status,
        timeLeft: timer.timeLeft,
        duration: timer.duration,
        startedAt: timer.startedAt,
      },
      {
        onTick: (timeLeft) => {
          timer.setTimeLeft(timeLeft)

          // Crescendo ticks in last 10 seconds
          if (timeLeft <= 10 && timeLeft > 0) {
            tickCountRef.current = 10 - timeLeft
          }
        },
        onComplete: () => {
          const mode = useTimerStore.getState().mode
          const duration = useTimerStore.getState().duration

          if (mode === 'focus') {
            // Record session
            addSession({
              mode,
              duration,
              completedAt: Date.now(),
              taskId: activeTaskId ?? undefined,
            })

            // Streak
            updateStreak()

            // Game progress
            const streak = useGameStore.getState().streak
            const xpAmount = XP_REWARDS.focusSession + streak * XP_REWARDS.streakBonus
            addXP(xpAmount)
            advancePlant()

            // Task pomodoro
            if (activeTaskId) incrementPomodoro()

            // Quest progress
            progressQuest('daily')
            progressQuest('weekly')

            // Auto start break or stay idle
            const sessionCount = useTimerStore.getState().sessionCount + 1
            useTimerStore.getState().incrementSessionCount()

            const interval = useSettingsStore.getState().timer.longBreakInterval
            if (settings.autoStartBreaks) {
              const nextMode = sessionCount % interval === 0 ? 'longBreak' : 'shortBreak'
              engine.setMode(nextMode, getDuration(nextMode))
              setTimeout(() => engine.start(), 500)
            }
          } else {
            if (settings.autoStartFocus) {
              engine.setMode('focus', getDuration('focus'))
              setTimeout(() => engine.start(), 500)
            }
          }

          timer.setStatus('idle')
        },
        onStateChange: (state) => {
          timer.setStatus(state.status)
          timer.setTimeLeft(state.timeLeft)
          timer.setDuration(state.duration)
          timer.setMode(state.mode)
          timer.setStartedAt(state.startedAt)
        },
      }
    )

    engineRef.current = engine

    return () => {
      engine.destroy()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(() => {
    if (!engineRef.current) return
    if (timer.status === 'paused') {
      engineRef.current.resume()
    } else {
      engineRef.current.start()
    }
  }, [timer.status])

  const pause = useCallback(() => {
    engineRef.current?.pause()
  }, [])

  const reset = useCallback(() => {
    engineRef.current?.reset()
  }, [])

  const switchMode = useCallback(
    (mode: TimerMode) => {
      engineRef.current?.setMode(mode, getDuration(mode))
    },
    [getDuration]
  )

  return { start, pause, reset, switchMode }
}
