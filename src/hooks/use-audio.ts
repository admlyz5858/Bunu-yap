import { useEffect, useRef } from 'react'
import { audioEngine } from '@/core/audio-engine'
import { useTimerStore } from '@/store/timer-store'
import { useSettingsStore } from '@/store/settings-store'

export function useAudio() {
  const status = useTimerStore((s) => s.status)
  const timeLeft = useTimerStore((s) => s.timeLeft)
  const sound = useSettingsStore((s) => s.sound)
  const soundVolume = useSettingsStore((s) => s.soundVolume)
  const prevTimeLeft = useRef<number>(timeLeft)
  const tickIndex = useRef(0)

  // Start/stop ambient based on status
  useEffect(() => {
    if (status === 'running') {
      audioEngine.startAmbient(sound, soundVolume)
    } else {
      audioEngine.stopAmbient()
    }
  }, [status, sound, soundVolume])

  // Crescendo ticks in last 10 seconds
  useEffect(() => {
    if (status !== 'running') return
    if (timeLeft <= 10 && timeLeft > 0) {
      const idx = 10 - timeLeft
      if (timeLeft !== prevTimeLeft.current) {
        audioEngine.playTick(idx)
        tickIndex.current = idx
      }
    }
    if (timeLeft === 0 && prevTimeLeft.current > 0) {
      audioEngine.playBell()
    }
    prevTimeLeft.current = timeLeft
  }, [timeLeft, status])

  // Volume sync
  useEffect(() => {
    audioEngine.setVolume(soundVolume)
  }, [soundVolume])
}
