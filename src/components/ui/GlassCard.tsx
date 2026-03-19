import { type ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function GlassCard({ children, className = '', onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl
        shadow-xl shadow-black/20
        ${onClick ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
