import { create } from 'zustand'
import type { Task } from '@/core/types'
import { generateId } from '@/core/types'

interface TaskStore {
  tasks: Task[]
  activeTaskId: string | null

  addTask: (title: string, estimatedPomodoros?: number) => Task
  removeTask: (id: string) => void
  toggleTask: (id: string) => void
  setActiveTask: (id: string | null) => void
  incrementPomodoro: (id?: string) => void
  updateTask: (id: string, updates: Partial<Pick<Task, 'title' | 'estimatedPomodoros'>>) => void
  hydrate: (data: { tasks: Task[]; activeTaskId: string | null }) => void
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  activeTaskId: null,

  addTask: (title, estimatedPomodoros = 1) => {
    const task: Task = {
      id: generateId(),
      title,
      estimatedPomodoros,
      completedPomodoros: 0,
      completed: false,
      createdAt: Date.now(),
    }
    set((s) => ({ tasks: [...s.tasks, task] }))
    return task
  },

  removeTask: (id) => {
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
      activeTaskId: s.activeTaskId === id ? null : s.activeTaskId,
    }))
  },

  toggleTask: (id) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }))
  },

  setActiveTask: (activeTaskId) => set({ activeTaskId }),

  incrementPomodoro: (id?: string) => {
    const targetId = id ?? get().activeTaskId
    if (!targetId) return
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === targetId
          ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
          : t
      ),
    }))
  },

  updateTask: (id, updates) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  },

  hydrate: (data) => set({ tasks: data.tasks, activeTaskId: data.activeTaskId }),
}))
