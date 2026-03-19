interface CircularProgressProps {
  progress: number // 0-1
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  children?: React.ReactNode
}

export function CircularProgress({
  progress,
  size = 280,
  strokeWidth = 6,
  color = '#8b5cf6',
  trackColor = 'rgba(255,255,255,0.1)',
  children,
}: CircularProgressProps) {
  const r = (size - strokeWidth * 2) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)))

  // 60 tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const angle = (i / 60) * 360 - 90
    const rad = (angle * Math.PI) / 180
    const inner = r - 10
    const outer = r - 4
    const x1 = cx + inner * Math.cos(rad)
    const y1 = cy + inner * Math.sin(rad)
    const x2 = cx + outer * Math.cos(rad)
    const y2 = cy + outer * Math.sin(rad)
    return { x1, y1, x2, y2, isMajor: i % 5 === 0 }
  })

  // Leading dot position
  const dotAngle = progress * 360 - 90
  const dotRad = (dotAngle * Math.PI) / 180
  const dotX = cx + r * Math.cos(dotRad)
  const dotY = cy + r * Math.sin(dotRad)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={t.isMajor ? 2 : 1}
          />
        ))}

        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />

        {/* Leading dot */}
        {progress > 0 && (
          <circle
            cx={dotX} cy={dotY} r={strokeWidth * 0.8}
            fill="white"
            filter="url(#glow)"
            className="rotate-90 origin-center"
            style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px` }}
          />
        )}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
