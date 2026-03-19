import { create } from 'zustand'
import type { GameState, Plant, PlantStage, Quest, QuestType } from '@/core/types'
import { generateId, getDateKey, calculateLevel } from '@/core/types'
import {
  DAILY_QUEST_TEMPLATES,
  WEEKLY_QUEST_TEMPLATES,
  PLANT_STAGE_SESSIONS,
} from '@/core/constants'

const PLANT_STAGES: PlantStage[] = ['seed', 'sprout', 'sapling', 'tree', 'glowingTree']

function nextPlantStage(current: PlantStage): PlantStage | null {
  const idx = PLANT_STAGES.indexOf(current)
  return idx < PLANT_STAGES.length - 1 ? PLANT_STAGES[idx + 1] : null
}

function createNewPlant(): Plant {
  return {
    id: generateId(),
    stage: 'seed',
    createdAt: Date.now(),
    sessionCount: 0,
  }
}

function generateQuests(): Quest[] {
  const now = Date.now()
  const dailies: Quest[] = DAILY_QUEST_TEMPLATES.slice(0, 3).map((t) => ({
    ...t,
    id: generateId(),
    type: 'daily' as QuestType,
    progress: 0,
    status: 'active' as const,
    expiresAt: now + 24 * 60 * 60 * 1000,
  }))
  const weeklies: Quest[] = WEEKLY_QUEST_TEMPLATES.slice(0, 2).map((t) => ({
    ...t,
    id: generateId(),
    type: 'weekly' as QuestType,
    progress: 0,
    status: 'active' as const,
    expiresAt: now + 7 * 24 * 60 * 60 * 1000,
  }))
  return [...dailies, ...weeklies]
}

interface GameStore extends GameState {
  addXP: (amount: number) => boolean // returns true if leveled up
  advancePlant: () => void
  killPlant: () => void
  updateStreak: () => void
  progressQuest: (type: QuestType, amount?: number) => void
  claimQuest: (questId: string) => number // returns xp claimed
  refreshExpiredQuests: () => void
  hydrate: (data: Partial<GameState>) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  xp: 0,
  level: 1,
  streak: 0,
  lastSessionDate: null,
  currentPlant: createNewPlant(),
  garden: [],
  quests: generateQuests(),

  addXP: (amount: number) => {
    const oldLevel = get().level
    set((s) => {
      const newXp = s.xp + amount
      return { xp: newXp, level: calculateLevel(newXp) }
    })
    return calculateLevel(get().xp) > oldLevel
  },

  advancePlant: () => {
    set((s) => {
      const plant = s.currentPlant
      const newSessionCount = plant.sessionCount + 1
      const nextStage = nextPlantStage(plant.stage)

      // Check if we should advance stage
      let newStage = plant.stage
      if (nextStage && newSessionCount >= PLANT_STAGE_SESSIONS[nextStage]) {
        newStage = nextStage
      }

      const updatedPlant = { ...plant, stage: newStage, sessionCount: newSessionCount }

      // If max stage reached, harvest to garden
      if (newStage === 'glowingTree') {
        const completedPlant = { ...updatedPlant, completedAt: Date.now() }
        return {
          currentPlant: createNewPlant(),
          garden: [...s.garden, completedPlant],
        }
      }

      return { currentPlant: updatedPlant }
    })
  },

  killPlant: () => {
    set({ currentPlant: createNewPlant() })
  },

  updateStreak: () => {
    set((s) => {
      const today = getDateKey()
      const yesterday = getDateKey(Date.now() - 24 * 60 * 60 * 1000)

      if (s.lastSessionDate === today) {
        return {} // already counted today
      }

      const newStreak =
        s.lastSessionDate === yesterday ? s.streak + 1 : 1

      return { streak: newStreak, lastSessionDate: today }
    })
  },

  progressQuest: (type: QuestType, amount = 1) => {
    set((s) => ({
      quests: s.quests.map((q) => {
        if (q.type !== type || q.status !== 'active') return q
        const newProgress = Math.min(q.progress + amount, q.target)
        const newStatus = newProgress >= q.target ? 'completed' : 'active'
        return { ...q, progress: newProgress, status: newStatus }
      }),
    }))
  },

  claimQuest: (questId: string) => {
    let xpReward = 0
    set((s) => ({
      quests: s.quests.map((q) => {
        if (q.id === questId && q.status === 'completed') {
          xpReward = q.xpReward
          return { ...q, status: 'claimed' as const }
        }
        return q
      }),
    }))
    return xpReward
  },

  refreshExpiredQuests: () => {
    set((s) => {
      const now = Date.now()
      const hasExpired = s.quests.some((q) => q.expiresAt < now)
      if (!hasExpired) return {}
      return { quests: generateQuests() }
    })
  },

  hydrate: (data) => set((s) => ({ ...s, ...data })),
}))
