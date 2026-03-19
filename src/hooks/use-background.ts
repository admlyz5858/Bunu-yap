import { useState, useEffect, useRef } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { ENVIRONMENTS } from '@/core/constants'

interface BackgroundState {
  currentUrl: string | null
  nextUrl: string | null
  transitioning: boolean
  mouseX: number
  mouseY: number
}

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY ?? ''
const CHANGE_INTERVAL = 5 * 60 * 1000 // 5 minutes

async function fetchUnsplashUrl(query: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) return null
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    )
    const data = await res.json()
    return data?.urls?.regular ?? null
  } catch {
    return null
  }
}

export function useBackground() {
  const environment = useSettingsStore((s) => s.environment)
  const [state, setState] = useState<BackgroundState>({
    currentUrl: null,
    nextUrl: null,
    transitioning: false,
    mouseX: 0,
    mouseY: 0,
  })
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const env = ENVIRONMENTS.find((e) => e.id === environment) ?? ENVIRONMENTS[0]

  const loadImage = async () => {
    const url = await fetchUnsplashUrl(env.unsplashQuery)
    if (!url) return

    setState((s) => ({ ...s, nextUrl: url, transitioning: true }))
    setTimeout(() => {
      setState((s) => ({ ...s, currentUrl: url, nextUrl: null, transitioning: false }))
    }, 1000)
  }

  useEffect(() => {
    loadImage()
    timerRef.current = setInterval(loadImage, CHANGE_INTERVAL)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [environment]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mouse parallax
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setState((s) => ({
        ...s,
        mouseX: (e.clientX / window.innerWidth - 0.5) * 20,
        mouseY: (e.clientY / window.innerHeight - 0.5) * 20,
      }))
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return { ...state, env }
}
