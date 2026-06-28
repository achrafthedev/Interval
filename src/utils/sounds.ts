let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export interface SoundDefinition {
  id: string
  name: string
  category: 'gentle' | 'standard' | 'intense'
  play: (options?: { smartWake?: boolean; volume?: number }) => SoundHandle
}

export interface SoundHandle {
  stop: () => void
}

function createHandle(): { stop: () => void; addCleanup: (fn: () => void) => void } {
  const cleanups: (() => void)[] = []
  return {
    stop: () => cleanups.forEach((fn) => fn()),
    addCleanup: (fn) => cleanups.push(fn),
  }
}

function makeGain(ac: AudioContext, volume: number, smartWake: boolean, t: number, totalDuration: number): GainNode {
  const gain = ac.createGain()
  gain.connect(ac.destination)
  if (smartWake) {
    gain.gain.setValueAtTime(volume * Math.min(1, t / totalDuration), ac.currentTime + t)
  } else {
    gain.gain.setValueAtTime(volume, ac.currentTime + t)
  }
  return gain
}

// 1. Gentle Chime — soft bell harmonics
function gentleChime(opts?: { smartWake?: boolean; volume?: number }): SoundHandle {
  const ac = getCtx()
  const handle = createHandle()
  const vol = opts?.volume ?? 0.5
  const smart = opts?.smartWake ?? false
  const totalDuration = smart ? 30 : 6
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25]
  let stopped = false

  function playChord(startTime: number) {
    if (stopped) return
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq

      const t = startTime + i * 0.35
      const effectiveVol = smart ? vol * Math.min(1, t / totalDuration) : vol

      gain.gain.setValueAtTime(0, ac.currentTime + t)
      gain.gain.linearRampToValueAtTime(effectiveVol * 0.6, ac.currentTime + t + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 1.2)

      osc.connect(gain)
      gain.connect(ac.destination)
      osc.start(ac.currentTime + t)
      osc.stop(ac.currentTime + t + 1.3)
    })
  }

  const repeats = Math.ceil(totalDuration / 2.5)
  for (let r = 0; r < repeats; r++) {
    playChord(r * 2.5)
  }

  handle.addCleanup(() => { stopped = true })
  return handle
}

// 2. Radar Pulse — pulsing, insistent beep
function radarPulse(opts?: { smartWake?: boolean; volume?: number }): SoundHandle {
  const ac = getCtx()
  const handle = createHandle()
  const vol = opts?.volume ?? 0.5
  const smart = opts?.smartWake ?? false
  const totalDuration = smart ? 30 : 5
  let stopped = false
  const interval = 0.6

  for (let t = 0; t < totalDuration; t += interval) {
    if (stopped) break
    const effectiveVol = smart ? vol * Math.min(1, t / totalDuration) : vol

    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1000, ac.currentTime + t)
    osc.frequency.exponentialRampToValueAtTime(600, ac.currentTime + t + 0.15)

    gain.gain.setValueAtTime(0, ac.currentTime + t)
    gain.gain.linearRampToValueAtTime(effectiveVol, ac.currentTime + t + 0.01)
    gain.gain.linearRampToValueAtTime(effectiveVol * 0.7, ac.currentTime + t + 0.1)
    gain.gain.linearRampToValueAtTime(0, ac.currentTime + t + 0.25)

    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(ac.currentTime + t)
    osc.stop(ac.currentTime + t + 0.3)
  }

  handle.addCleanup(() => { stopped = true })
  return handle
}

// 3. Morning Birds — ascending melodic pattern
function morningBirds(opts?: { smartWake?: boolean; volume?: number }): SoundHandle {
  const ac = getCtx()
  const handle = createHandle()
  const vol = opts?.volume ?? 0.4
  const smart = opts?.smartWake ?? false
  const totalDuration = smart ? 30 : 6
  let stopped = false

  const melody = [
    { f: 1200, d: 0.08 }, { f: 1600, d: 0.06 }, { f: 1400, d: 0.1 },
    { f: 1800, d: 0.05 }, { f: 1500, d: 0.12 }, { f: 2000, d: 0.07 },
    { f: 1700, d: 0.09 }, { f: 2200, d: 0.06 },
  ]

  function playBirdCall(startTime: number) {
    if (stopped) return
    let offset = 0
    melody.forEach(({ f, d }) => {
      const effectiveVol = smart ? vol * Math.min(1, (startTime + offset) / totalDuration) : vol
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, ac.currentTime + startTime + offset)
      osc.frequency.exponentialRampToValueAtTime(f * 1.1, ac.currentTime + startTime + offset + d)

      gain.gain.setValueAtTime(0, ac.currentTime + startTime + offset)
      gain.gain.linearRampToValueAtTime(effectiveVol * 0.5, ac.currentTime + startTime + offset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startTime + offset + d + 0.05)

      osc.connect(gain)
      gain.connect(ac.destination)
      osc.start(ac.currentTime + startTime + offset)
      osc.stop(ac.currentTime + startTime + offset + d + 0.1)
      offset += d + 0.04
    })
  }

  const repeats = Math.ceil(totalDuration / 1.5)
  for (let r = 0; r < repeats; r++) {
    playBirdCall(r * 1.5)
  }

  handle.addCleanup(() => { stopped = true })
  return handle
}

// 4. Digital Alarm — classic double beep pattern
function digitalAlarm(opts?: { smartWake?: boolean; volume?: number }): SoundHandle {
  const ac = getCtx()
  const handle = createHandle()
  const vol = opts?.volume ?? 0.5
  const smart = opts?.smartWake ?? false
  const totalDuration = smart ? 30 : 5
  let stopped = false

  for (let t = 0; t < totalDuration; t += 1.0) {
    if (stopped) break
    const effectiveVol = smart ? vol * Math.min(1, t / totalDuration) : vol

    // Double beep pattern
    for (const beepOffset of [0, 0.15]) {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'square'
      osc.frequency.value = 880

      gain.gain.setValueAtTime(0, ac.currentTime + t + beepOffset)
      gain.gain.linearRampToValueAtTime(effectiveVol * 0.3, ac.currentTime + t + beepOffset + 0.005)
      gain.gain.setValueAtTime(effectiveVol * 0.3, ac.currentTime + t + beepOffset + 0.08)
      gain.gain.linearRampToValueAtTime(0, ac.currentTime + t + beepOffset + 0.1)

      osc.connect(gain)
      gain.connect(ac.destination)
      osc.start(ac.currentTime + t + beepOffset)
      osc.stop(ac.currentTime + t + beepOffset + 0.12)
    }
  }

  handle.addCleanup(() => { stopped = true })
  return handle
}

// 5. Zen Bowl — deep resonant singing bowl
function zenBowl(opts?: { smartWake?: boolean; volume?: number }): SoundHandle {
  const ac = getCtx()
  const handle = createHandle()
  const vol = opts?.volume ?? 0.5
  const smart = opts?.smartWake ?? false
  const totalDuration = smart ? 30 : 8
  let stopped = false

  function playBowl(startTime: number) {
    if (stopped) return
    const effectiveVol = smart ? vol * Math.min(1, startTime / totalDuration) : vol

    const fundamentals = [220, 330, 440]
    fundamentals.forEach((f) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'sine'
      osc.frequency.value = f

      gain.gain.setValueAtTime(0, ac.currentTime + startTime)
      gain.gain.linearRampToValueAtTime(effectiveVol * 0.35, ac.currentTime + startTime + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startTime + 3.5)

      osc.connect(gain)
      gain.connect(ac.destination)
      osc.start(ac.currentTime + startTime)
      osc.stop(ac.currentTime + startTime + 3.8)
    })
  }

  const repeats = Math.ceil(totalDuration / 4)
  for (let r = 0; r < repeats; r++) {
    playBowl(r * 4)
  }

  handle.addCleanup(() => { stopped = true })
  return handle
}

// 6. Urgent Siren — ascending/descending for heavy sleepers
function urgentSiren(opts?: { smartWake?: boolean; volume?: number }): SoundHandle {
  const ac = getCtx()
  const handle = createHandle()
  const vol = opts?.volume ?? 0.5
  const smart = opts?.smartWake ?? false
  const totalDuration = smart ? 30 : 5
  let stopped = false

  for (let t = 0; t < totalDuration; t += 0.8) {
    if (stopped) break
    const effectiveVol = smart ? vol * Math.min(1, t / totalDuration) : vol

    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(400, ac.currentTime + t)
    osc.frequency.linearRampToValueAtTime(900, ac.currentTime + t + 0.35)
    osc.frequency.linearRampToValueAtTime(400, ac.currentTime + t + 0.7)

    gain.gain.setValueAtTime(0, ac.currentTime + t)
    gain.gain.linearRampToValueAtTime(effectiveVol * 0.25, ac.currentTime + t + 0.02)
    gain.gain.setValueAtTime(effectiveVol * 0.25, ac.currentTime + t + 0.6)
    gain.gain.linearRampToValueAtTime(0, ac.currentTime + t + 0.75)

    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(ac.currentTime + t)
    osc.stop(ac.currentTime + t + 0.78)
  }

  handle.addCleanup(() => { stopped = true })
  return handle
}

// 7. Marimba — warm wooden mallet tones
function marimba(opts?: { smartWake?: boolean; volume?: number }): SoundHandle {
  const ac = getCtx()
  const handle = createHandle()
  const vol = opts?.volume ?? 0.5
  const smart = opts?.smartWake ?? false
  const totalDuration = smart ? 30 : 6
  let stopped = false

  const notes = [262, 330, 392, 523, 392, 330, 262, 330]

  function playPattern(startTime: number) {
    if (stopped) return
    notes.forEach((freq, i) => {
      const t = startTime + i * 0.2
      const effectiveVol = smart ? vol * Math.min(1, t / totalDuration) : vol

      const osc = ac.createOscillator()
      const osc2 = ac.createOscillator()
      const gain = ac.createGain()

      osc.type = 'sine'
      osc.frequency.value = freq
      osc2.type = 'triangle'
      osc2.frequency.value = freq * 4

      gain.gain.setValueAtTime(0, ac.currentTime + t)
      gain.gain.linearRampToValueAtTime(effectiveVol * 0.5, ac.currentTime + t + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.5)

      osc.connect(gain)
      osc2.connect(gain)
      gain.connect(ac.destination)
      osc.start(ac.currentTime + t)
      osc2.start(ac.currentTime + t)
      osc.stop(ac.currentTime + t + 0.55)
      osc2.stop(ac.currentTime + t + 0.55)
    })
  }

  const repeats = Math.ceil(totalDuration / 2)
  for (let r = 0; r < repeats; r++) {
    playPattern(r * 2)
  }

  handle.addCleanup(() => { stopped = true })
  return handle
}

// 8. Heartbeat — rhythmic pulse
function heartbeat(opts?: { smartWake?: boolean; volume?: number }): SoundHandle {
  const ac = getCtx()
  const handle = createHandle()
  const vol = opts?.volume ?? 0.5
  const smart = opts?.smartWake ?? false
  const totalDuration = smart ? 30 : 6
  let stopped = false

  for (let t = 0; t < totalDuration; t += 0.85) {
    if (stopped) break
    const effectiveVol = smart ? vol * Math.min(1, t / totalDuration) : vol

    // lub-dub pattern
    for (const [offset, freq, dur] of [[0, 60, 0.12], [0.18, 80, 0.08]] as const) {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq

      gain.gain.setValueAtTime(0, ac.currentTime + t + offset)
      gain.gain.linearRampToValueAtTime(effectiveVol * 0.8, ac.currentTime + t + offset + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + offset + dur)

      osc.connect(gain)
      gain.connect(ac.destination)
      osc.start(ac.currentTime + t + offset)
      osc.stop(ac.currentTime + t + offset + dur + 0.02)
    }
  }

  handle.addCleanup(() => { stopped = true })
  return handle
}

// Timer completion sound — ascending arpeggio
export function playTimerCompletionSound(): SoundHandle {
  const ac = getCtx()
  const handle = createHandle()
  const notes = [523.25, 659.25, 783.99, 1046.5]

  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq

    gain.gain.setValueAtTime(0, ac.currentTime + i * 0.15)
    gain.gain.linearRampToValueAtTime(0.4, ac.currentTime + i * 0.15 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.15 + 0.5)

    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(ac.currentTime + i * 0.15)
    osc.stop(ac.currentTime + i * 0.15 + 0.55)
  })

  return handle
}

export const SOUND_LIBRARY: SoundDefinition[] = [
  { id: 'gentle-chime', name: 'Gentle Chime', category: 'gentle', play: gentleChime },
  { id: 'zen-bowl', name: 'Zen Bowl', category: 'gentle', play: zenBowl },
  { id: 'morning-birds', name: 'Morning Birds', category: 'gentle', play: morningBirds },
  { id: 'marimba', name: 'Marimba', category: 'standard', play: marimba },
  { id: 'digital-alarm', name: 'Digital Alarm', category: 'standard', play: digitalAlarm },
  { id: 'radar-pulse', name: 'Radar Pulse', category: 'standard', play: radarPulse },
  { id: 'heartbeat', name: 'Heartbeat', category: 'standard', play: heartbeat },
  { id: 'urgent-siren', name: 'Urgent Siren', category: 'intense', play: urgentSiren },
]

export function getSoundById(id: string): SoundDefinition | undefined {
  return SOUND_LIBRARY.find((s) => s.id === id)
}

export function previewSound(id: string): SoundHandle | null {
  const sound = getSoundById(id)
  if (!sound) return null
  return sound.play({ volume: 0.5 })
}
