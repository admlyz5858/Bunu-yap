// ─── Timer Types ────────────────────────────────────────────────────────────
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerState {
  mode: TimerMode
  status: TimerStatus
  timeLeft: number // seconds
  startedAt: number | null // timestamp
  duration: number // total seconds for current mode
}

export interface TimerSnapshot extends TimerState {
  savedAt: number
}

// ─── Settings Types ──────────────────────────────────────────────────────────
export interface TimerSettings {
  focusDuration: number // minutes
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number // number of focus sessions before long break
}

export type SoundType = 'none' | 'rain' | 'forest' | 'wind' | 'ocean' | 'campfire'
export type EnvironmentId = 'forest' | 'ocean' | 'mountain' | 'city' | 'space' | 'desert' | 'arctic'

export interface Settings {
  timer: TimerSettings
  sound: SoundType
  soundVolume: number // 0-1
  environment: EnvironmentId
  notifications: boolean
  autoStartBreaks: boolean
  autoStartFocus: boolean
}

// ─── Session Types ───────────────────────────────────────────────────────────
export interface Session {
  id: string
  mode: TimerMode
  duration: number // seconds
  completedAt: number // timestamp
  taskId?: string
}

export interface SessionStats {
  today: number
  thisWeek: number
  allTime: number
  totalMinutes: number
}

export interface HeatmapEntry {
  date: string // YYYY-MM-DD
  count: number
}

// ─── Game Types ──────────────────────────────────────────────────────────────
export type PlantStage = 'seed' | 'sprout' | 'sapling' | 'tree' | 'glowingTree'

export interface Plant {
  id: string
  stage: PlantStage
  createdAt: number
  completedAt?: number
  sessionCount: number
}

export type QuestType = 'daily' | 'weekly'
export type QuestStatus = 'active' | 'completed' | 'claimed'

export interface Quest {
  id: string
  type: QuestType
  title: string
  description: string
  target: number
  progress: number
  xpReward: number
  status: QuestStatus
  expiresAt: number
}

export interface GameState {
  xp: number
  level: number
  streak: number
  lastSessionDate: string | null
  currentPlant: Plant
  garden: Plant[]
  quests: Quest[]
}

// ─── Task Types ──────────────────────────────────────────────────────────────
export interface Task {
  id: string
  title: string
  estimatedPomodoros: number
  completedPomodoros: number
  completed: boolean
  createdAt: number
}

// ─── Utility Functions ───────────────────────────────────────────────────────
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function getDateKey(timestamp: number = Date.now()): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

export function xpForNextLevel(xp: number): number {
  const current = Math.floor(xp / 100) * 100
  return current + 100
}

export function xpProgress(xp: number): number {
  return xp % 100
}
