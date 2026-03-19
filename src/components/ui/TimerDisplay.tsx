import { formatTime } from '@/core/types'

interface TimerDisplayProps {
  seconds: number
  className?: string
}

export function TimerDisplay({ seconds, className = '' }: TimerDisplayProps) {
  const text = formatTime(seconds)
  return (
    <span
      className={`font-mono font-bold tracking-wider tabular-nums ${className}`}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {text}
    </span>
  )
}
