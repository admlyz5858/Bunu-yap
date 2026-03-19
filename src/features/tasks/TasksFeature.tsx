import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskStore } from '@/store/task-store'
import { GlassCard } from '@/components/ui/GlassCard'
import { splitTasks } from '@/services/ai-tasks'
import type { Task } from '@/core/types'

function TaskItem({ task, isActive }: { task: Task; isActive: boolean }) {
  const { removeTask, toggleTask, setActiveTask, activeTaskId } = useTaskStore()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <GlassCard
        className={`p-3 ${isActive ? 'ring-1 ring-violet-400/50' : ''}`}
        onClick={() => setActiveTask(isActive ? null : task.id)}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); toggleTask(task.id) }}
            className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-violet-500 border-violet-500 text-white'
                : 'border-white/30 hover:border-white/60'
            }`}
          >
            {task.completed && '✓'}
          </button>

          <div className="flex-1 min-w-0">
            <p className={`text-sm ${task.completed ? 'line-through text-white/30' : 'text-white/80'}`}>
              {task.title}
            </p>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: task.estimatedPomodoros }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < task.completedPomodoros ? 'bg-violet-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {isActive && (
            <span className="text-violet-400 text-xs flex-shrink-0">▶ Aktif</span>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); removeTask(task.id) }}
            className="text-white/20 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

export function TasksFeature() {
  const { tasks, activeTaskId, addTask } = useTaskStore()
  const [input, setInput] = useState('')
  const [isAi, setIsAi] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setLoading(true)

    if (isAi) {
      const aiTasks = await splitTasks(trimmed)
      aiTasks.forEach((t) => addTask(t.title, Math.ceil(t.duration / 25)))
    } else {
      addTask(trimmed)
    }

    setInput('')
    setLoading(false)
  }

  const incompleteTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  return (
    <div className="space-y-4">
      {/* Input */}
      <GlassCard className="p-3">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={isAi ? 'Fizik çalış 3 saat...' : 'Görev ekle...'}
            className="flex-1 bg-transparent text-white placeholder-white/30 text-sm outline-none"
          />
          <button
            onClick={() => setIsAi(!isAi)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              isAi ? 'text-violet-400 bg-violet-500/20' : 'text-white/40 hover:text-white/60'
            }`}
            title="AI ile böl"
          >
            🤖
          </button>
          <button
            onClick={handleAdd}
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-violet-500/30 hover:bg-violet-500/50 text-white transition-colors disabled:opacity-40 flex items-center justify-center"
          >
            {loading ? '⟳' : '+'}
          </button>
        </div>
        {isAi && (
          <p className="text-white/30 text-xs mt-2">
            AI görev bölme aktif — doğal dil girin
          </p>
        )}
      </GlassCard>

      {/* Active / Incomplete Tasks */}
      <AnimatePresence>
        {incompleteTasks.map((t) => (
          <TaskItem key={t.id} task={t} isActive={t.id === activeTaskId} />
        ))}
      </AnimatePresence>

      {incompleteTasks.length === 0 && completedTasks.length === 0 && (
        <p className="text-center text-white/30 text-sm py-8">
          Görev listesi boş. Hadi başlayalım! 📝
        </p>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <p className="text-white/30 text-xs uppercase tracking-wider mb-2">
            Tamamlanan ({completedTasks.length})
          </p>
          <AnimatePresence>
            {completedTasks.map((t) => (
              <TaskItem key={t.id} task={t} isActive={false} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
