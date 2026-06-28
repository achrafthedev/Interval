export type Theme = 'oled' | 'light' | 'dynamic'
export type View = 'clock' | 'alarm' | 'timer' | 'stopwatch'

export interface WorldClockZone {
  id: string
  label: string
  timezone: string
}

export interface Alarm {
  id: string
  time: string // HH:MM format
  label: string
  enabled: boolean
  repeat: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[]
  smartWake: boolean
  soundUrl: string
  soundName: string
  soundId: string
}

export interface TimerPreset {
  id: string
  label: string
  seconds: number
}

export interface TimerInstance {
  id: string
  label: string
  totalSeconds: number
  remainingMs: number
  running: boolean
  finished: boolean
  loop: boolean
  nextTimerId?: string // for sequence chaining — auto-starts this timer when current finishes
}

export interface TimerSequenceStep {
  label: string
  seconds: number
}

export interface TimerSequence {
  id: string
  label: string
  steps: TimerSequenceStep[]
  repeats: number
  currentStep: number
  currentRepeat: number
  running: boolean
}

export interface Lap {
  number: number
  lapTime: number   // ms since last lap
  splitTime: number // ms since start
}

export interface StopwatchState {
  running: boolean
  elapsedMs: number
  laps: Lap[]
  startTimestamp: number | null
  lapStartMs: number
}

export interface AppState {
  theme: Theme
  view: View
  worldClocks: WorldClockZone[]
  alarms: Alarm[]
  timerPresets: TimerPreset[]
  timers: TimerInstance[]
  stopwatch: StopwatchState
  use24Hour: boolean
  ttsEnabled: boolean
}
