import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePersistence } from '@/hooks/use-persistence'
import { useAudio } from '@/hooks/use-audio'
import { AnimatedBackground } from '@/components/effects/AnimatedBackground'
import { TimerFeature } from '@/features/timer/TimerFeature'
import { GardenFeature } from '@/features/garden/GardenFeature'
import { StatsFeature } from '@/features/stats/StatsFeature'
import { TasksFeature } from '@/features/tasks/TasksFeature'
import { QuestsFeature } from '@/features/quests/QuestsFeature'
import { SettingsFeature } from '@/features/settings/SettingsFeature'
import { Modal } from '@/components/ui/Modal'

type Tab = 'tasks' | 'garden' | 'stats' | 'quests'
type PanelType = 'settings' | null

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'tasks', label: 'Görevler', emoji: '📝' },
  { id: 'garden', label: 'Bahçe', emoji: '🌱' },
  { id: 'stats', label: 'İstatistik', emoji: '📊' },
  { id: 'quests', label: 'Görevler', emoji: '⚔️' },
]

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('tasks')
  const [panel, setPanel] = useState<PanelType>(null)

  useAudio()

  const tabContent: Record<Tab, React.ReactNode> = {
    tasks: <TasksFeature />,
    garden: <GardenFeature />,
    stats: <StatsFeature />,
    quests: <QuestsFeature />,
  }

  return (
    <div className="min-h-screen w-full text-white overflow-x-hidden">
      <AnimatedBackground />

      {/* Main Layout */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <h1 className="text-white/80 font-light tracking-widest text-sm uppercase">
            Focus Universe
          </h1>
          <button
            onClick={() => setPanel(panel === 'settings' ? null : 'settings')}
            className="text-white/50 hover:text-white transition-colors text-xl"
          >
            ⚙️
          </button>
        </header>

        {/* Timer - Center Stage */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-4">
          <TimerFeature />
        </main>

        {/* Bottom Panel */}
        <div className="px-4 pb-4">
          {/* Tab Bar */}
          <div className="flex bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-1 mb-3 gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                <span className="text-base">{tab.emoji}</span>
                <span className="text-xs mt-0.5">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-h-72 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal
        open={panel === 'settings'}
        onClose={() => setPanel(null)}
        title="Ayarlar"
      >
        <SettingsFeature />
      </Modal>
    </div>
  )
}

export default function App() {
  usePersistence()
  return <AppContent />
}
