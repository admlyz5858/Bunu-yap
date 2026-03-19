import localforage from 'localforage'

localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'FocusUniverse',
  version: 1.0,
})

const KEYS = {
  TIMER: 'timer_state',
  SETTINGS: 'settings_state',
  SESSION: 'session_state',
  GAME: 'game_state',
  TASK: 'task_state',
} as const

export async function loadState<T>(key: keyof typeof KEYS): Promise<T | null> {
  try {
    return await localforage.getItem<T>(KEYS[key])
  } catch {
    return null
  }
}

export async function saveState<T>(key: keyof typeof KEYS, data: T): Promise<void> {
  try {
    await localforage.setItem(KEYS[key], data)
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export async function clearState(key: keyof typeof KEYS): Promise<void> {
  await localforage.removeItem(KEYS[key])
}

export async function exportAllData(): Promise<string> {
  const all: Record<string, unknown> = {}
  for (const k of Object.keys(KEYS) as Array<keyof typeof KEYS>) {
    all[k] = await loadState(k)
  }
  return JSON.stringify(all, null, 2)
}

export async function importAllData(json: string): Promise<void> {
  const all = JSON.parse(json) as Record<string, unknown>
  for (const k of Object.keys(KEYS) as Array<keyof typeof KEYS>) {
    if (all[k] !== undefined) {
      await saveState(k, all[k])
    }
  }
}
