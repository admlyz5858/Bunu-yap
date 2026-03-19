import { motion } from 'framer-motion'
import { useGameStore } from '@/store/game-store'
import { GlassCard } from '@/components/ui/GlassCard'
import type { Plant, PlantStage } from '@/core/types'
import { xpProgress, xpForNextLevel } from '@/core/types'

const STAGE_EMOJI: Record<PlantStage, string> = {
  seed: '🌱',
  sprout: '🌿',
  sapling: '🌳',
  tree: '🌲',
  glowingTree: '✨🌲✨',
}

const STAGE_NAME: Record<PlantStage, string> = {
  seed: 'Tohum',
  sprout: 'Filiz',
  sapling: 'Fidan',
  tree: 'Ağaç',
  glowingTree: 'Parlayan Ağaç',
}

function PlantCard({ plant, isCurrent = false }: { plant: Plant; isCurrent?: boolean }) {
  return (
    <GlassCard className={`p-4 text-center ${isCurrent ? 'ring-1 ring-violet-400/50' : ''}`}>
      <motion.div
        className="text-4xl mb-2"
        animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      >
        {STAGE_EMOJI[plant.stage]}
      </motion.div>
      <p className="text-white/80 text-sm">{STAGE_NAME[plant.stage]}</p>
      <p className="text-white/40 text-xs mt-1">{plant.sessionCount} oturum</p>
      {isCurrent && (
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(plant.sessionCount / 10) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </GlassCard>
  )
}

export function GardenFeature() {
  const { currentPlant, garden, xp, level } = useGameStore()
  const xpPct = (xpProgress(xp) / 100) * 100
  const nextXp = xpForNextLevel(xp)

  return (
    <div className="space-y-6">
      {/* Level & XP */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider">Seviye</p>
            <p className="text-white font-bold text-3xl">{level}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-xs">{xp} XP</p>
            <p className="text-white/30 text-xs">Sonraki: {nextXp} XP</p>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-amber-400 rounded-full"
            style={{ width: `${xpPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </GlassCard>

      {/* Current Plant */}
      <div>
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Mevcut Bitki</h3>
        <PlantCard plant={currentPlant} isCurrent />
      </div>

      {/* Garden Collection */}
      {garden.length > 0 && (
        <div>
          <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">
            Bahçe ({garden.length})
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {garden.map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        </div>
      )}

      {garden.length === 0 && (
        <p className="text-center text-white/30 text-sm py-8">
          İlk bitkini yetiştirmek için odaklanma oturumlarını tamamla! 🌱
        </p>
      )}
    </div>
  )
}
