import type { TimerMode, TimerStatus, TimerSnapshot } from './types'

export interface TimerEngineState {
  mode: TimerMode
  status: TimerStatus
  timeLeft: number
  duration: number
  startedAt: number | null
}

export type TimerEngineCallback = (state: TimerEngineState) => void
export type TimerCompleteCallback = () => void
export type TimerTickCallback = (timeLeft: number) => void

export class TimerEngine {
  private state: TimerEngineState
  private rafId: number | null = null
  private intervalId: ReturnType<typeof setInterval> | null = null
  private onTick: TimerTickCallback
  private onComplete: TimerCompleteCallback
  private onStateChange: TimerEngineCallback

  constructor(
    initialState: Partial<TimerEngineState>,
    callbacks: {
      onTick: TimerTickCallback
      onComplete: TimerCompleteCallback
      onStateChange: TimerEngineCallback
    }
  ) {
    this.state = {
      mode: initialState.mode ?? 'focus',
      status: initialState.status ?? 'idle',
      timeLeft: initialState.timeLeft ?? 25 * 60,
      duration: initialState.duration ?? 25 * 60,
      startedAt: initialState.startedAt ?? null,
    }
    this.onTick = callbacks.onTick
    this.onComplete = callbacks.onComplete
    this.onStateChange = callbacks.onStateChange
  }

  getState(): TimerEngineState {
    return { ...this.state }
  }

  start(): void {
    if (this.state.status === 'running') return
    this.state.startedAt = performance.now() - (this.state.duration - this.state.timeLeft) * 1000
    this.state.status = 'running'
    this.onStateChange({ ...this.state })
    this._startLoop()
  }

  pause(): void {
    if (this.state.status !== 'running') return
    this._stopLoop()
    this.state.status = 'paused'
    this.onStateChange({ ...this.state })
  }

  resume(): void {
    if (this.state.status !== 'paused') return
    // Recalculate startedAt to account for paused time
    this.state.startedAt = performance.now() - (this.state.duration - this.state.timeLeft) * 1000
    this.state.status = 'running'
    this.onStateChange({ ...this.state })
    this._startLoop()
  }

  reset(duration?: number): void {
    this._stopLoop()
    this.state.status = 'idle'
    this.state.startedAt = null
    if (duration !== undefined) {
      this.state.duration = duration
    }
    this.state.timeLeft = this.state.duration
    this.onStateChange({ ...this.state })
  }

  setMode(mode: TimerMode, duration: number): void {
    this._stopLoop()
    this.state.mode = mode
    this.state.status = 'idle'
    this.state.startedAt = null
    this.state.duration = duration
    this.state.timeLeft = duration
    this.onStateChange({ ...this.state })
  }

  restoreFromSnapshot(snapshot: TimerSnapshot): void {
    const now = Date.now()
    const savedAt = snapshot.savedAt

    if (snapshot.status === 'running') {
      const elapsed = Math.floor((now - savedAt) / 1000)
      const newTimeLeft = Math.max(0, snapshot.timeLeft - elapsed)
      this.state = {
        mode: snapshot.mode,
        status: newTimeLeft > 0 ? 'running' : 'idle',
        timeLeft: newTimeLeft > 0 ? newTimeLeft : snapshot.duration,
        duration: snapshot.duration,
        startedAt: newTimeLeft > 0
          ? performance.now() - (snapshot.duration - newTimeLeft) * 1000
          : null,
      }
      if (this.state.status === 'running') {
        this._startLoop()
      }
    } else {
      this.state = {
        mode: snapshot.mode,
        status: snapshot.status,
        timeLeft: snapshot.timeLeft,
        duration: snapshot.duration,
        startedAt: null,
      }
    }
    this.onStateChange({ ...this.state })
  }

  destroy(): void {
    this._stopLoop()
  }

  private _startLoop(): void {
    // requestAnimationFrame for foreground accuracy
    const rafLoop = () => {
      if (this.state.status !== 'running') return
      this._tick()
      this.rafId = requestAnimationFrame(rafLoop)
    }
    this.rafId = requestAnimationFrame(rafLoop)

    // setInterval as background fallback (250ms)
    this.intervalId = setInterval(() => {
      if (this.state.status !== 'running') return
      this._tick()
    }, 250)
  }

  private _stopLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private _tick(): void {
    if (!this.state.startedAt || this.state.status !== 'running') return

    const elapsed = (performance.now() - this.state.startedAt) / 1000
    const newTimeLeft = Math.max(0, Math.round(this.state.duration - elapsed))

    if (newTimeLeft === this.state.timeLeft) return // no change

    this.state.timeLeft = newTimeLeft
    this.onTick(newTimeLeft)

    if (newTimeLeft === 0) {
      this._stopLoop()
      this.state.status = 'idle'
      this.state.startedAt = null
      this.onStateChange({ ...this.state })
      this.onComplete()
    }
  }
}
