let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

export function playTone(frequency: number = 880, durationMs: number = 500, volume: number = 0.5) {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05)
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + durationMs / 1000)

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + durationMs / 1000)
}

export function playAlarmPattern(smartWake: boolean = false) {
  const ctx = getAudioContext()
  const totalDuration = smartWake ? 30 : 3
  const beepInterval = smartWake ? 0.8 : 0.4
  const maxVolume = 0.6

  for (let t = 0; t < totalDuration; t += beepInterval) {
    const volume = smartWake
      ? maxVolume * (t / totalDuration)
      : maxVolume

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime + t)
    osc.frequency.setValueAtTime(660, ctx.currentTime + t + 0.1)

    gain.gain.setValueAtTime(0, ctx.currentTime + t)
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + t + 0.02)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + t + beepInterval * 0.8)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime + t)
    osc.stop(ctx.currentTime + t + beepInterval * 0.9)
  }
}

let customAudioElement: HTMLAudioElement | null = null

export function playCustomAudio(url: string, smartWake: boolean = false): HTMLAudioElement {
  stopCustomAudio()
  customAudioElement = new Audio(url)
  customAudioElement.loop = true

  if (smartWake) {
    customAudioElement.volume = 0
    const fadeIn = setInterval(() => {
      if (customAudioElement && customAudioElement.volume < 0.95) {
        customAudioElement.volume = Math.min(1, customAudioElement.volume + 0.033)
      } else {
        clearInterval(fadeIn)
      }
    }, 1000)
  } else {
    customAudioElement.volume = 0.7
  }

  customAudioElement.play().catch(() => {})
  return customAudioElement
}

export function stopCustomAudio() {
  if (customAudioElement) {
    customAudioElement.pause()
    customAudioElement.currentTime = 0
    customAudioElement = null
  }
}

export function playTimerComplete() {
  const ctx = getAudioContext()
  const notes = [523.25, 659.25, 783.99, 1046.5]

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.15)
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + i * 0.15 + 0.02)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.15 + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime + i * 0.15)
    osc.stop(ctx.currentTime + i * 0.15 + 0.35)
  })
}

export function speakText(text: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    speechSynthesis.speak(utterance)
  }
}
