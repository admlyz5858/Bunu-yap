import { useBackground } from '@/hooks/use-background'
import { useTimerStore } from '@/store/timer-store'
import { ParticleCanvas } from './ParticleCanvas'

export function AnimatedBackground() {
  const { currentUrl, nextUrl, transitioning, env, mouseX, mouseY } = useBackground()
  const mode = useTimerStore((s) => s.mode)

  const overlayColor =
    mode === 'focus'
      ? 'rgba(109,40,217,0.35)' // violet
      : 'rgba(4,120,87,0.35)' // emerald

  return (
    <>
      {/* Base gradient (always visible) */}
      <div
        className={`fixed inset-0 bg-gradient-to-br ${env.gradient} -z-30`}
      />

      {/* Unsplash background image */}
      {currentUrl && (
        <div
          className="fixed inset-0 -z-20 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${currentUrl})`,
            opacity: transitioning ? 0 : 1,
            transform: `translate(${mouseX * 0.5}px, ${mouseY * 0.5}px) scale(1.08)`,
            transition: 'transform 0.1s ease-out, opacity 1s ease',
          }}
        />
      )}

      {/* Crossfade next image */}
      {nextUrl && (
        <div
          className="fixed inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage: `url(${nextUrl})`,
            opacity: transitioning ? 1 : 0,
            transform: `translate(${mouseX * 0.5}px, ${mouseY * 0.5}px) scale(1.08)`,
            transition: 'opacity 1s ease',
          }}
        />
      )}

      {/* Color overlay */}
      <div
        className="fixed inset-0 -z-10 transition-colors duration-1000"
        style={{ background: overlayColor }}
      />

      {/* Fog layer */}
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none"
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Particles */}
      <ParticleCanvas />
    </>
  )
}
