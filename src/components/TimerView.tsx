import { useState, useRef, useCallback } from 'react'
import { useTheme } from './ThemeProvider'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { formatCountdown } from '../utils/time'
import { playTimerComplete } from '../utils/audio'
import { sendNotification } from '../utils/notifications'
import { isPiPSupported, startPiP, stopPiP, isPiPActive } from '../utils/pip'
import { PlusIcon, PlayIcon, PauseIcon, ResetIcon, TrashIcon, XIcon, RepeatIcon, PipIcon } from './Icons'
import type { TimerInstance, TimerPreset, TimerSequenceStep } from '../types'

const DEFAULT_PRESETS: TimerPreset[] = [
  { id: '1', label: 'Pomodoro', seconds: 25 * 60 },
  { id: '2', label: 'Short Break', seconds: 5 * 60 },
  { id: '3', label: 'Long Break', seconds: 15 * 60 },
  { id: '4', label: 'Tea Steep', seconds: 3 * 60 },
  { id: '5', label: 'Presentation', seconds: 10 * 60 },
  { id: '6', label: '1 Minute', seconds: 60 },
]

interface Props {
  timers: TimerInstance[]
  setTimers: (timers: TimerInstance[]) => void
}

export function TimerView({ timers, setTimers }: Props) {
  const { textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()
  const [showCreate, setShowCreate] = useState(false)
  const [showSequence, setShowSequence] = useState(false)
  const [customHours, setCustomHours] = useState(0)
  const [customMinutes, setCustomMinutes] = useState(5)
  const [customSeconds, setCustomSeconds] = useState(0)
  const [customLabel, setCustomLabel] = useState('')
  const [seqSteps, setSeqSteps] = useState<TimerSequenceStep[]>([
    { label: 'Work', seconds: 25 * 60 },
    { label: 'Rest', seconds: 5 * 60 },
  ])
  const [seqRepeats, setSeqRepeats] = useState(4)
  const [seqLabel, setSeqLabel] = useState('Pomodoro Session')
  const lastTickRef = useRef<Map<string, number>>(new Map())

  const updateTimers = useCallback((updater: (timers: TimerInstance[]) => TimerInstance[]) => {
    setTimers(updater(timers))
  }, [timers, setTimers])

  useAnimationFrame(() => {
    const now = performance.now()
    let changed = false
    const updated = timers.map((timer) => {
      if (!timer.running || timer.finished) return timer

      const lastTick = lastTickRef.current.get(timer.id) || now
      const delta = now - lastTick
      lastTickRef.current.set(timer.id, now)

      const newRemaining = timer.remainingMs - delta
      changed = true

      if (newRemaining <= 0) {
        playTimerComplete()
        sendNotification('Timer Complete', timer.label || 'Your timer has finished!')

        if (timer.loop) {
          return { ...timer, remainingMs: timer.totalSeconds * 1000 }
        }
        return { ...timer, remainingMs: 0, running: false, finished: true }
      }

      return { ...timer, remainingMs: newRemaining }
    })

    if (changed) setTimers(updated)
  }, timers.some((t) => t.running))

  const addTimer = (label: string, seconds: number, loop: boolean = false) => {
    const timer: TimerInstance = {
      id: crypto.randomUUID(),
      label,
      totalSeconds: seconds,
      remainingMs: seconds * 1000,
      running: false,
      finished: false,
      loop,
    }
    setTimers([...timers, timer])
    setShowCreate(false)
    resetForm()
  }

  const addSequence = () => {
    const newTimers: TimerInstance[] = []
    for (let rep = 0; rep < seqRepeats; rep++) {
      seqSteps.forEach((step, i) => {
        newTimers.push({
          id: crypto.randomUUID(),
          label: `${seqLabel} - R${rep + 1} - ${step.label}`,
          totalSeconds: step.seconds,
          remainingMs: step.seconds * 1000,
          running: false,
          finished: false,
          loop: false,
        })
      })
    }
    setTimers([...timers, ...newTimers])
    setShowSequence(false)
  }

  const resetForm = () => {
    setCustomHours(0)
    setCustomMinutes(5)
    setCustomSeconds(0)
    setCustomLabel('')
  }

  const toggleTimer = (id: string) => {
    const now = performance.now()
    setTimers(timers.map((t) => {
      if (t.id !== id) return t
      if (t.finished) return t
      if (!t.running) lastTickRef.current.set(id, now)
      return { ...t, running: !t.running }
    }))
  }

  const resetTimer = (id: string) => {
    lastTickRef.current.delete(id)
    setTimers(timers.map((t) =>
      t.id === id ? { ...t, remainingMs: t.totalSeconds * 1000, running: false, finished: false } : t
    ))
  }

  const removeTimer = (id: string) => {
    lastTickRef.current.delete(id)
    setTimers(timers.filter((t) => t.id !== id))
  }

  const toggleLoop = (id: string) => {
    setTimers(timers.map((t) => t.id === id ? { ...t, loop: !t.loop } : t))
  }

  const addTime = (id: string, seconds: number) => {
    setTimers(timers.map((t) => {
      if (t.id !== id) return t
      const newTotal = t.totalSeconds + seconds
      return {
        ...t,
        totalSeconds: newTotal,
        remainingMs: t.remainingMs + seconds * 1000,
        finished: false,
      }
    }))
  }

  const handlePiP = (timer: TimerInstance) => {
    if (isPiPActive()) {
      stopPiP()
    } else {
      startPiP(() => {
        const t = timers.find((x) => x.id === timer.id)
        return t ? formatCountdown(t.remainingMs) : '00:00'
      })
    }
  }

  const progress = (timer: TimerInstance) => {
    if (timer.totalSeconds === 0) return 0
    return 1 - timer.remainingMs / (timer.totalSeconds * 1000)
  }

  return (
    <div className="flex flex-col items-center h-full overflow-y-auto px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Timers</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSequence(true)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border ${border} ${surface} ${textSecondary} hover:text-indigo-500 transition-all flex items-center gap-1.5`}
            >
              <RepeatIcon size={14} />
              Sequence
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-all flex items-center gap-2"
            >
              <PlusIcon size={16} />
              New Timer
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {DEFAULT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => addTimer(preset.label, preset.seconds)}
              className={`p-3 rounded-xl border ${border} ${surface} text-center transition-all hover:scale-105 hover:border-indigo-500/50`}
            >
              <div className={`text-xs font-medium ${textPrimary}`}>{preset.label}</div>
              <div className={`time-display text-xs mt-0.5 ${textMuted}`}>
                {Math.floor(preset.seconds / 60)}m
              </div>
            </button>
          ))}
        </div>

        {/* Active Timers */}
        <div className="space-y-3">
          {timers.map((timer) => (
            <div
              key={timer.id}
              className={`relative p-5 rounded-2xl border ${border} ${surface} overflow-hidden transition-all`}
            >
              {/* Progress bar background */}
              <div
                className="absolute inset-0 bg-indigo-600/10 transition-all duration-1000"
                style={{ width: `${progress(timer) * 100}%` }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${textSecondary}`}>{timer.label}</span>
                    {timer.loop && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                        Loop
                      </span>
                    )}
                    {timer.finished && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                        Done!
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeTimer(timer.id)} className={`${textMuted} hover:text-red-400 transition-colors`}>
                    <TrashIcon size={14} />
                  </button>
                </div>

                <div className={`time-display text-4xl sm:text-5xl font-bold mb-4 ${timer.finished ? 'text-green-400' : textPrimary}`}>
                  {formatCountdown(timer.remainingMs)}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => toggleTimer(timer.id)}
                    disabled={timer.finished && !timer.loop}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      timer.running
                        ? 'bg-amber-500 text-white hover:bg-amber-400'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    } disabled:opacity-40`}
                  >
                    {timer.running ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                    {timer.running ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={() => resetTimer(timer.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm border ${border} ${textSecondary} hover:text-indigo-500 transition-all flex items-center gap-1.5`}
                  >
                    <ResetIcon size={14} />
                    Reset
                  </button>
                  <button
                    onClick={() => toggleLoop(timer.id)}
                    className={`px-3 py-2.5 rounded-xl text-sm border transition-all ${
                      timer.loop ? 'border-indigo-500 text-indigo-500' : `${border} ${textMuted}`
                    }`}
                    title="Auto-restart"
                  >
                    <RepeatIcon size={14} />
                  </button>
                  {isPiPSupported() && (
                    <button
                      onClick={() => handlePiP(timer)}
                      className={`px-3 py-2.5 rounded-xl text-sm border ${border} ${textMuted} hover:text-indigo-500 transition-all`}
                      title="Picture-in-Picture"
                    >
                      <PipIcon size={14} />
                    </button>
                  )}
                  <div className={`flex gap-1 ml-auto`}>
                    {[1, 5, 10].map((m) => (
                      <button
                        key={m}
                        onClick={() => addTime(timer.id, m * 60)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border ${border} ${textMuted} hover:text-indigo-500 hover:border-indigo-500/50 transition-all`}
                      >
                        +{m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {timers.length === 0 && (
          <div className={`text-center mt-16 ${textMuted}`}>
            <div className="time-display text-5xl opacity-20 mb-4">00:00</div>
            <p className="text-sm">No active timers</p>
            <p className="text-xs mt-1">Use a preset above or create a custom timer</p>
          </div>
        )}
      </div>

      {/* Create Timer Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div
            className={`w-full sm:max-w-md ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${textPrimary}`}>Custom Timer</h2>
              <button onClick={() => setShowCreate(false)} className={textMuted}><XIcon size={20} /></button>
            </div>

            <div className="mb-5">
              <label className={`text-xs font-medium ${textMuted} block mb-1.5`}>Label</label>
              <input
                type="text"
                placeholder="Timer name..."
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Hours', value: customHours, set: setCustomHours, max: 23 },
                { label: 'Minutes', value: customMinutes, set: setCustomMinutes, max: 59 },
                { label: 'Seconds', value: customSeconds, set: setCustomSeconds, max: 59 },
              ].map(({ label, value, set, max }) => (
                <div key={label}>
                  <label className={`text-xs ${textMuted} block mb-1.5 text-center`}>{label}</label>
                  <input
                    type="number"
                    min={0}
                    max={max}
                    value={value}
                    onChange={(e) => set(Math.min(max, Math.max(0, parseInt(e.target.value) || 0)))}
                    className={`w-full text-center time-display text-3xl py-4 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const total = customHours * 3600 + customMinutes * 60 + customSeconds
                if (total > 0) addTimer(customLabel || 'Custom Timer', total)
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all"
            >
              Start Timer
            </button>
          </div>
        </div>
      )}

      {/* Sequence Builder Modal */}
      {showSequence && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSequence(false)}>
          <div
            className={`w-full sm:max-w-md max-h-[80vh] overflow-y-auto ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${textPrimary}`}>Timer Sequence</h2>
              <button onClick={() => setShowSequence(false)} className={textMuted}><XIcon size={20} /></button>
            </div>

            <div className="mb-4">
              <label className={`text-xs font-medium ${textMuted} block mb-1.5`}>Session Name</label>
              <input
                type="text"
                value={seqLabel}
                onChange={(e) => setSeqLabel(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            <div className="mb-4">
              <label className={`text-xs font-medium ${textMuted} block mb-2`}>Steps</label>
              <div className="space-y-2">
                {seqSteps.map((step, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={step.label}
                      onChange={(e) => {
                        const updated = [...seqSteps]
                        updated[i] = { ...step, label: e.target.value }
                        setSeqSteps(updated)
                      }}
                      placeholder="Step label"
                      className={`flex-1 px-3 py-2 rounded-lg border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none`}
                    />
                    <input
                      type="number"
                      min={1}
                      value={Math.floor(step.seconds / 60)}
                      onChange={(e) => {
                        const updated = [...seqSteps]
                        updated[i] = { ...step, seconds: Math.max(1, parseInt(e.target.value) || 1) * 60 }
                        setSeqSteps(updated)
                      }}
                      className={`w-20 text-center px-3 py-2 rounded-lg border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none`}
                    />
                    <span className={`text-xs ${textMuted}`}>min</span>
                    {seqSteps.length > 1 && (
                      <button
                        onClick={() => setSeqSteps(seqSteps.filter((_, j) => j !== i))}
                        className={`${textMuted} hover:text-red-400`}
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSeqSteps([...seqSteps, { label: `Step ${seqSteps.length + 1}`, seconds: 5 * 60 }])}
                className={`mt-2 text-xs ${textMuted} hover:text-indigo-500 flex items-center gap-1`}
              >
                <PlusIcon size={12} /> Add step
              </button>
            </div>

            <div className="mb-6">
              <label className={`text-xs font-medium ${textMuted} block mb-1.5`}>Repeat sequence</label>
              <input
                type="number"
                min={1}
                max={20}
                value={seqRepeats}
                onChange={(e) => setSeqRepeats(Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-24 text-center px-3 py-2 rounded-lg border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none`}
              />
              <span className={`text-xs ${textMuted} ml-2`}>times</span>
            </div>

            <button
              onClick={addSequence}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all"
            >
              Create Sequence ({seqSteps.length * seqRepeats} timers)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
