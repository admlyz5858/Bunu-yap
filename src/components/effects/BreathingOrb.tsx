import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 4-4-4-2 box breathing pattern
const PHASES = [
  { label: 'Nefes Al', duration: 4000, scale: 1.4 },
  { label: 'Tut', duration: 4000, scale: 1.4 },
  { label: 'Nefes Ver', duration: 4000, scale: 0.8 },
  { label: 'Tut', duration: 2000, scale: 0.8 },
] as const

interface BreathingOrbProps {
  active: boolean
}

export function BreathingOrb({ active }: BreathingOrbProps) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [countdown, setCountdown] = useState(PHASES[0].duration / 1000)

  useEffect(() => {
    if (!active) return

    setPhaseIndex(0)
    setCountdown(PHASES[0].duration / 1000)

    let phase = 0
    let seconds = PHASES[0].duration / 1000

    const interval = setInterval(() => {
      seconds -= 1
      if (seconds <= 0) {
        phase = (phase + 1) % PHASES.length
        seconds = PHASES[phase].duration / 1000
        setPhaseIndex(phase)
      }
      setCountdown(seconds)
    }, 1000)

    return () => clearInterval(interval)
  }, [active])

  if (!active) return null

  const currentPhase = PHASES[phaseIndex]

  return (
    <div className="flex flex-col items-center gap-6 pointer-events-none select-none">
      <motion.div
        className="relative"
        animate={{ scale: currentPhase.scale }}
        transition={{ duration: currentPhase.duration / 1000, ease: 'easeInOut' }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-emerald-400/20"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'blur(20px)' }}
        />
        {/* Orb */}
        <div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400/60 to-cyan-400/60 border border-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <span className="text-white/80 text-3xl font-light">{countdown}</span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.p
          key={phaseIndex}
          className="text-white/70 text-lg font-light"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          {currentPhase.label}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
