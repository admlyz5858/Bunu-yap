import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimerStore } from '@/store/timer-store'
import { useSettingsStore } from '@/store/settings-store'
import { useTimer } from '@/hooks/use-timer'
import { useGameStore } from '@/store/game-store'
import { CircularProgress } from '@/components/ui/CircularProgress'
import { TimerDisplay } from '@/components/ui/TimerDisplay'
import { BreathingOrb } from '@/components/effects/BreathingOrb'
import { FOCUS_MESSAGES, BREAK_MESSAGES, LAST_10_MESSAGES } from '@/core/constants'
import type { TimerMode } from '@/core/types'

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Odaklan',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola',
}

const MODE_COLORS: Record<TimerMode, string> = {
  focus: '#8b5cf6',
  shortBreak: '#10b981',
  longBreak: '#06b6d4',
}

function randomFrom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function TimerFeature() {
  const { mode, status, timeLeft, duration } = useTimerStore()
  const settings = useSettingsStore()
  const { start, pause, reset, switchMode } = useTimer()
  const { currentPlant, streak } = useGameStore()
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

  const progress = duration > 0 ? (duration - timeLeft) / duration : 0
  const isRunning = status === 'running'
  const isBreak = mode !== 'focus'
  const isLast10 = timeLeft <= 10 && timeLeft > 0 && isRunning

  const message = isLast10
    ? randomFrom(LAST_10_MESSAGES)
    : isBreak
    ? randomFrom(BREAK_MESSAGES)
    : randomFrom(FOCUS_MESSAGES)

  const handleQuit = () => {
    if (isRunning && mode === 'focus') {
      setShowQuitConfirm(true)
    } else {
      reset()
    }
  }

  const confirmQuit = () => {
    // kill plant
    useGameStore.getState().killPlant()
    reset()
    setShowQuitConfirm(false)
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Mode Selector */}
      <div className="flex gap-2 bg-black/20 rounded-xl p-1 backdrop-blur-sm">
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => !isRunning && switchMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? 'bg-white/15 text-white'
                : 'text-white/50 hover:text-white/70'
            } ${isRunning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Circular Timer */}
      <div className="relative flex items-center justify-center">
        <CircularProgress
          progress={progress}
          size={300}
          strokeWidth={5}
          color={MODE_COLORS[mode]}
        >
          <div className="flex flex-col items-center gap-2">
            <TimerDisplay seconds={timeLeft} className="text-6xl text-white" />
            <span className="text-white/50 text-sm capitalize">{MODE_LABELS[mode]}</span>
            {streak > 1 && (
              <span className="text-amber-400 text-xs">🔥 {streak} gün serisi</span>
            )}
          </div>
        </CircularProgress>

        {/* Plant stage indicator */}
        <div className="absolute top-4 right-4 text-2xl opacity-70">
          {
            {
              seed: '🌱',
              sprout: '🌿',
              sapling: '🌳',
              tree: '🌲',
              glowingTree: '✨',
            }[currentPlant.stage]
          }
        </div>
      </div>

      {/* Breathing Orb during breaks */}
      <BreathingOrb active={isBreak && isRunning} />

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Reset/Quit button */}
        {status !== 'idle' && (
          <button
            onClick={handleQuit}
            className="w-12 h-12 rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-all flex items-center justify-center"
          >
            ↺
          </button>
        )}

        {/* Play/Pause */}
        <motion.button
          onClick={isRunning ? pause : start}
          whileTap={{ scale: 0.95 }}
          className={`w-20 h-20 rounded-full font-semibold text-white transition-all shadow-lg ${
            isRunning
              ? 'bg-white/20 hover:bg-white/30 border border-white/20'
              : `shadow-lg`
          }`}
          style={
            !isRunning
              ? {
                  background: `linear-gradient(135deg, ${MODE_COLORS[mode]}, #06b6d4)`,
                  boxShadow: `0 0 30px ${MODE_COLORS[mode]}66`,
                }
              : undefined
          }
        >
          {isRunning ? '⏸' : '▶'}
        </motion.button>
      </div>

      {/* Motivational message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={message}
          className="text-white/40 text-sm text-center max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {isRunning ? message : ''}
        </motion.p>
      </AnimatePresence>

      {/* Quit confirm */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-slate-900/90 border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="text-4xl mb-4">🥀</div>
              <h3 className="text-white font-semibold text-xl mb-2">Bitkin Solar!</h3>
              <p className="text-white/60 mb-6 text-sm">
                Oturumu erken bitirirsen bitkini kaybedeceksin. Devam etmek istiyor musun?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQuitConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-medium transition-colors"
                >
                  Devam Et
                </button>
                <button
                  onClick={confirmQuit}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 font-medium transition-colors"
                >
                  Çık
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
