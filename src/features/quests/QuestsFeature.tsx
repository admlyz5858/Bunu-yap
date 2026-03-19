import { motion } from 'framer-motion'
import { useGameStore } from '@/store/game-store'
import { GlassCard } from '@/components/ui/GlassCard'
import type { Quest } from '@/core/types'

function QuestCard({ quest }: { quest: Quest }) {
  const { claimQuest, addXP } = useGameStore()
  const progress = Math.min(quest.progress / quest.target, 1)
  const isCompleted = quest.status === 'completed'
  const isClaimed = quest.status === 'claimed'

  const timeLeft = quest.expiresAt - Date.now()
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)))

  const handleClaim = () => {
    const xp = claimQuest(quest.id)
    addXP(xp)
  }

  return (
    <GlassCard className={`p-4 ${isClaimed ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              quest.type === 'daily' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'
            }`}>
              {quest.type === 'daily' ? 'Günlük' : 'Haftalık'}
            </span>
            {isClaimed && <span className="text-xs text-green-400">✓ Alındı</span>}
          </div>
          <p className="text-white/80 text-sm font-medium">{quest.title}</p>
          <p className="text-white/40 text-xs mt-0.5">{quest.description}</p>

          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-white/30 text-xs mt-1">
            {quest.progress}/{quest.target} • {hoursLeft}s kaldı
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="text-amber-400 text-sm font-semibold">+{quest.xpReward} XP</span>
          {isCompleted && (
            <button
              onClick={handleClaim}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs font-medium transition-colors"
            >
              Al!
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

export function QuestsFeature() {
  const { quests, refreshExpiredQuests } = useGameStore()

  // Refresh expired quests
  refreshExpiredQuests()

  const dailies = quests.filter((q) => q.type === 'daily')
  const weeklies = quests.filter((q) => q.type === 'weekly')

  return (
    <div className="space-y-6">
      {/* Daily Quests */}
      <div>
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">
          Günlük Görevler
        </h3>
        <div className="space-y-2">
          {dailies.map((q) => (
            <QuestCard key={q.id} quest={q} />
          ))}
        </div>
      </div>

      {/* Weekly Quests */}
      <div>
        <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">
          Haftalık Görevler
        </h3>
        <div className="space-y-2">
          {weeklies.map((q) => (
            <QuestCard key={q.id} quest={q} />
          ))}
        </div>
      </div>
    </div>
  )
}
