import { useSettingsStore } from '@/store/settings-store'
import { GlassCard } from '@/components/ui/GlassCard'
import { ENVIRONMENTS } from '@/core/constants'
import type { SoundType } from '@/core/types'
import { exportAllData, importAllData } from '@/services/storage'

const SOUNDS: { value: SoundType; label: string; emoji: string }[] = [
  { value: 'none', label: 'Yok', emoji: '🔇' },
  { value: 'rain', label: 'Yağmur', emoji: '🌧️' },
  { value: 'forest', label: 'Orman', emoji: '🌲' },
  { value: 'wind', label: 'Rüzgar', emoji: '💨' },
  { value: 'ocean', label: 'Okyanus', emoji: '🌊' },
  { value: 'campfire', label: 'Kamp Ateşi', emoji: '🔥' },
]

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '',
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-white/60 text-sm flex-shrink-0 w-40">{label}</label>
      <div className="flex items-center gap-3 flex-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-400 cursor-pointer"
        />
        <span className="text-white/50 text-sm w-12 text-right">
          {value}{suffix}
        </span>
      </div>
    </div>
  )
}

export function SettingsFeature() {
  const s = useSettingsStore()

  const handleExport = async () => {
    const json = await exportAllData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'focus-universe-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      await importAllData(text)
      window.location.reload()
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      {/* Timer Durations */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-white/80 font-medium">Zamanlayıcı Süreleri</h3>
        <Slider label="Odaklanma" value={s.timer.focusDuration} min={5} max={60} onChange={s.setFocusDuration} suffix=" dk" />
        <Slider label="Kısa Mola" value={s.timer.shortBreakDuration} min={1} max={30} onChange={s.setShortBreakDuration} suffix=" dk" />
        <Slider label="Uzun Mola" value={s.timer.longBreakDuration} min={5} max={60} onChange={s.setLongBreakDuration} suffix=" dk" />
        <Slider label="Uzun Mola Aralığı" value={s.timer.longBreakInterval} min={2} max={8} onChange={s.setLongBreakInterval} suffix="" />
      </GlassCard>

      {/* Sound */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-white/80 font-medium">Ses</h3>
        <div className="grid grid-cols-3 gap-2">
          {SOUNDS.map((snd) => (
            <button
              key={snd.value}
              onClick={() => s.setSound(snd.value)}
              className={`p-2 rounded-xl text-center transition-all ${
                s.sound === snd.value
                  ? 'bg-violet-500/30 border border-violet-400/50 text-white'
                  : 'bg-white/5 border border-transparent text-white/50 hover:bg-white/10'
              }`}
            >
              <div className="text-xl">{snd.emoji}</div>
              <div className="text-xs mt-0.5">{snd.label}</div>
            </button>
          ))}
        </div>
        <Slider label="Ses Düzeyi" value={Math.round(s.soundVolume * 100)} min={0} max={100} onChange={(v) => s.setSoundVolume(v / 100)} suffix="%" />
      </GlassCard>

      {/* Environment */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-white/80 font-medium">Ortam</h3>
        <div className="grid grid-cols-4 gap-2">
          {ENVIRONMENTS.map((env) => (
            <button
              key={env.id}
              onClick={() => s.setEnvironment(env.id)}
              className={`p-2 rounded-xl text-center transition-all ${
                s.environment === env.id
                  ? 'bg-violet-500/30 border border-violet-400/50 text-white'
                  : 'bg-white/5 border border-transparent text-white/50 hover:bg-white/10'
              }`}
            >
              <div className="text-xl">{env.emoji}</div>
              <div className="text-xs mt-0.5 truncate">{env.name}</div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Behavior */}
      <GlassCard className="p-5 space-y-4">
        <h3 className="text-white/80 font-medium">Davranış</h3>
        {[
          { label: 'Molayı otomatik başlat', value: s.autoStartBreaks, onChange: s.setAutoStartBreaks },
          { label: 'Odaklanmayı otomatik başlat', value: s.autoStartFocus, onChange: s.setAutoStartFocus },
          { label: 'Bildirimler', value: s.notifications, onChange: s.setNotifications },
        ].map(({ label, value, onChange }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-white/60 text-sm">{label}</span>
            <button
              onClick={() => onChange(!value)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                value ? 'bg-violet-500' : 'bg-white/15'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  value ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        ))}
      </GlassCard>

      {/* Data */}
      <GlassCard className="p-5 space-y-3">
        <h3 className="text-white/80 font-medium">Veri</h3>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm transition-colors"
          >
            Dışa Aktar
          </button>
          <button
            onClick={handleImport}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm transition-colors"
          >
            İçe Aktar
          </button>
        </div>
      </GlassCard>
    </div>
  )
}
