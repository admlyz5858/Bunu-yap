import type { SoundType } from './types'
import { BELL_CHORD, LEVEL_UP_ARPEGGIO, TICK_FREQUENCIES } from './constants'

export class AudioEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private ambientNodes: AudioNode[] = []
  private ambientGain: GainNode | null = null
  private uiGain: GainNode | null = null

  private _ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 1
      this.masterGain.connect(this.ctx.destination)

      this.ambientGain = this.ctx.createGain()
      this.ambientGain.connect(this.masterGain)

      this.uiGain = this.ctx.createGain()
      this.uiGain.gain.value = 0.5
      this.uiGain.connect(this.masterGain)
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  setVolume(volume: number): void {
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(volume, this.ambientGain.context.currentTime, 0.1)
    }
  }

  async startAmbient(type: SoundType, volume: number = 0.4): Promise<void> {
    this.stopAmbient()
    if (type === 'none') return

    const ctx = this._ensureContext()
    const gain = this.ambientGain!
    gain.gain.value = 0

    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    let finalNode: AudioNode = source

    if (type === 'rain') {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 2000
      lp.Q.value = 0.5
      source.connect(lp)
      finalNode = lp
    } else if (type === 'forest') {
      const bp = ctx.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 800
      bp.Q.value = 0.3
      source.connect(bp)
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 200
      bp.connect(hp)
      finalNode = hp
    } else if (type === 'wind') {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 600
      lp.Q.value = 0.8
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(0.3, ctx.currentTime)
      const oscGain = ctx.createGain()
      oscGain.gain.value = 0.02
      osc.connect(oscGain)
      source.connect(lp)
      const merger = ctx.createChannelMerger()
      lp.connect(merger, 0, 0)
      finalNode = lp
      osc.start()
      this.ambientNodes.push(osc)
    } else if (type === 'ocean') {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 800
      lp.Q.value = 1
      const lp2 = ctx.createBiquadFilter()
      lp2.type = 'lowpass'
      lp2.frequency.value = 400
      source.connect(lp)
      lp.connect(lp2)
      finalNode = lp2
    } else if (type === 'campfire') {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 3000
      lp.Q.value = 0.4
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 500
      source.connect(lp)
      lp.connect(hp)
      finalNode = hp
    }

    finalNode.connect(gain)
    source.start()

    // Fade in
    gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.5)

    this.ambientNodes = [source, ...this.ambientNodes]
  }

  stopAmbient(): void {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5)
      setTimeout(() => {
        this.ambientNodes.forEach(n => {
          try { (n as AudioScheduledSourceNode).stop() } catch { /* already stopped */ }
          try { n.disconnect() } catch { /* already disconnected */ }
        })
        this.ambientNodes = []
      }, 1500)
    }
  }

  playTick(index: number = 0): void {
    const ctx = this._ensureContext()
    const freq = TICK_FREQUENCIES[Math.min(index, TICK_FREQUENCIES.length - 1)]
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.connect(gain)
    gain.connect(this.uiGain!)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.1)
  }

  playBell(): void {
    const ctx = this._ensureContext()
    const now = ctx.currentTime
    BELL_CHORD.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + i * 0.08)
      gain.gain.linearRampToValueAtTime(0.4, now + i * 0.08 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 2)
      osc.connect(gain)
      gain.connect(this.uiGain!)
      osc.start(now + i * 0.08)
      osc.stop(now + i * 0.08 + 2)
    })
  }

  playLevelUp(): void {
    const ctx = this._ensureContext()
    const now = ctx.currentTime
    LEVEL_UP_ARPEGGIO.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + i * 0.1)
      gain.gain.linearRampToValueAtTime(0.5, now + i * 0.1 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4)
      osc.connect(gain)
      gain.connect(this.uiGain!)
      osc.start(now + i * 0.1)
      osc.stop(now + i * 0.1 + 0.4)
    })
  }

  playClick(): void {
    const ctx = this._ensureContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 440
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
    osc.connect(gain)
    gain.connect(this.uiGain!)
    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  }

  destroy(): void {
    this.stopAmbient()
    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
  }
}

// Singleton
export const audioEngine = new AudioEngine()
