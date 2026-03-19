import type { Settings, EnvironmentId, Quest } from './types'

// ─── Default Settings ────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS: Settings = {
  timer: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  },
  sound: 'forest',
  soundVolume: 0.4,
  environment: 'forest',
  notifications: true,
  autoStartBreaks: false,
  autoStartFocus: false,
}

// ─── Environments ────────────────────────────────────────────────────────────
export interface Environment {
  id: EnvironmentId
  name: string
  emoji: string
  gradient: string
  overlayColor: string
  unsplashQuery: string
}

export const ENVIRONMENTS: Environment[] = [
  {
    id: 'forest',
    name: 'Orman',
    emoji: '🌲',
    gradient: 'from-green-900 via-emerald-800 to-teal-900',
    overlayColor: 'rgba(6,78,59,0.4)',
    unsplashQuery: 'forest nature green',
  },
  {
    id: 'ocean',
    name: 'Okyanus',
    emoji: '🌊',
    gradient: 'from-blue-900 via-cyan-800 to-blue-900',
    overlayColor: 'rgba(8,47,73,0.4)',
    unsplashQuery: 'ocean waves blue',
  },
  {
    id: 'mountain',
    name: 'Dağ',
    emoji: '⛰️',
    gradient: 'from-slate-800 via-gray-700 to-stone-800',
    overlayColor: 'rgba(30,27,75,0.4)',
    unsplashQuery: 'mountain peak snowy',
  },
  {
    id: 'city',
    name: 'Şehir',
    emoji: '🏙️',
    gradient: 'from-indigo-900 via-purple-900 to-slate-900',
    overlayColor: 'rgba(49,10,101,0.4)',
    unsplashQuery: 'city night lights',
  },
  {
    id: 'space',
    name: 'Uzay',
    emoji: '🌌',
    gradient: 'from-slate-950 via-indigo-950 to-purple-950',
    overlayColor: 'rgba(15,10,40,0.5)',
    unsplashQuery: 'galaxy nebula space',
  },
  {
    id: 'desert',
    name: 'Çöl',
    emoji: '🏜️',
    gradient: 'from-amber-900 via-orange-800 to-yellow-900',
    overlayColor: 'rgba(120,53,15,0.4)',
    unsplashQuery: 'desert sand dunes sunset',
  },
  {
    id: 'arctic',
    name: 'Kutup',
    emoji: '❄️',
    gradient: 'from-sky-900 via-blue-800 to-indigo-900',
    overlayColor: 'rgba(14,116,144,0.3)',
    unsplashQuery: 'arctic ice northern lights',
  },
]

// ─── Motivational Messages ───────────────────────────────────────────────────
export const FOCUS_MESSAGES = [
  'Derin odaklanma modunda. Harika gidiyorsun!',
  'Her saniye seni hedefe yaklaştırıyor.',
  'Zihnini sabitle. Sadece bu an önemli.',
  'Büyük işler küçük adımlarla başlar.',
  'Konsantrasyonun doruk noktasındasın!',
  'Akışta kal. Başarı yakın.',
  'Bu oturum seni bir adım öne taşıyor.',
]

export const BREAK_MESSAGES = [
  'Harika iş! Biraz nefes al.',
  'Zihninizi dinlendirin, güç topluyorsunuz.',
  'Kısa bir mola, büyük bir fark yaratır.',
  'Gözlerinizi kapatın ve derin nefes alın.',
  'Bu molayı hak ettiniz!',
]

export const LAST_10_MESSAGES = [
  'Son 10 saniye! Dayanın!',
  'Neredeyse bitti! Güçlü bitirin!',
  'Az kaldı, bırakmayın!',
]

// ─── Quest Templates ─────────────────────────────────────────────────────────
export const DAILY_QUEST_TEMPLATES = [
  { title: 'Sabah Odağı', description: '3 focus oturumu tamamla', target: 3, xpReward: 50 },
  { title: 'Maratoncı', description: '5 focus oturumu tamamla', target: 5, xpReward: 80 },
  { title: 'Kararlı Başlangıç', description: '1 focus oturumu tamamla', target: 1, xpReward: 20 },
  { title: 'Görev Ustası', description: '2 görevi tamamla', target: 2, xpReward: 40 },
]

export const WEEKLY_QUEST_TEMPLATES = [
  { title: 'Haftalık Şampiyon', description: '20 focus oturumu tamamla', target: 20, xpReward: 200 },
  { title: 'Bahçıvan', description: '5 bitki yetiştir', target: 5, xpReward: 150 },
  { title: 'Düzenli Çalışan', description: '5 gün arka arkaya oturum yap', target: 5, xpReward: 180 },
]

// ─── Plant Stage XP Requirements ─────────────────────────────────────────────
export const PLANT_STAGE_SESSIONS: Record<string, number> = {
  seed: 0,
  sprout: 1,
  sapling: 3,
  tree: 6,
  glowingTree: 10,
}

// ─── XP Awards ───────────────────────────────────────────────────────────────
export const XP_REWARDS = {
  focusSession: 100,
  shortBreak: 10,
  longBreak: 20,
  streakBonus: 25, // per streak day
  questComplete: 0, // defined per quest
}

// ─── Audio Config ─────────────────────────────────────────────────────────────
export const TICK_FREQUENCIES = [880, 1100, 1320, 1540, 1760, 1980, 2200, 2420, 2640, 2860]
export const BELL_CHORD = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
export const LEVEL_UP_ARPEGGIO = [523.25, 659.25, 783.99, 1046.5, 1318.51]
