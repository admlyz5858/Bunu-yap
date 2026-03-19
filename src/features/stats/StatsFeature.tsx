import { useSessionStore } from '@/store/session-store'
import { useGameStore } from '@/store/game-store'
import { GlassCard } from '@/components/ui/GlassCard'
import type { HeatmapEntry } from '@/core/types'

function HeatmapCell({ entry }: { entry: HeatmapEntry }) {
  const intensity = Math.min(entry.count / 5, 1) // max 5 sessions = full color
  const bg =
    entry.count === 0
      ? 'bg-white/5'
      : intensity < 0.4
      ? 'bg-violet-700/50'
      : intensity < 0.7
      ? 'bg-violet-500/70'
      : 'bg-violet-400'

  return (
    <div
      className={`w-3 h-3 rounded-sm ${bg} transition-colors`}
      title={`${entry.date}: ${entry.count} oturum`}
    />
  )
}

export function StatsFeature() {
  const today = useSessionStore((s) => s.getStatsToday())
  const week = useSessionStore((s) => s.getStatsWeek())
  const allTime = useSessionStore((s) => s.getStatsAllTime())
  const minutes = useSessionStore((s) => s.getTotalMinutes())
  const heatmap = useSessionStore((s) => s.getHeatmap())
  const streak = useGameStore((s) => s.streak)

  const weeks: HeatmapEntry[][] = []
  for (let i = 0; i < heatmap.length; i += 7) {
    weeks.push(heatmap.slice(i, i + 7))
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-white">{today}</p>
          <p className="text-white/40 text-xs mt-1">Bugün</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-white">{week}</p>
          <p className="text-white/40 text-xs mt-1">Bu Hafta</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-white">{allTime}</p>
          <p className="text-white/40 text-xs mt-1">Toplam Oturum</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">🔥{streak}</p>
          <p className="text-white/40 text-xs mt-1">Günlük Seri</p>
        </GlassCard>
      </div>

      {/* Total Minutes */}
      <GlassCard className="p-4 text-center">
        <p className="text-4xl font-bold text-violet-400">{Math.floor(minutes / 60)}s {minutes % 60}dk</p>
        <p className="text-white/40 text-xs mt-1">Toplam odaklanma süresi</p>
      </GlassCard>

      {/* Heatmap */}
      <GlassCard className="p-4">
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-4">Aktivite (12 Hafta)</h3>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((entry, di) => (
                <HeatmapCell key={di} entry={entry} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-white/30 text-xs">Az</span>
          <div className="flex gap-1">
            {['bg-white/5', 'bg-violet-700/50', 'bg-violet-500/70', 'bg-violet-400'].map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
          </div>
          <span className="text-white/30 text-xs">Çok</span>
        </div>
      </GlassCard>
    </div>
  )
}
