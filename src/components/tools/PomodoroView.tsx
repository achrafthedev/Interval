import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../ThemeProvider'
import { useBackgroundTimer } from '../../hooks/useBackgroundTimer'
import { playTimerCompletionSound } from '../../utils/sounds'
import { sendNotification } from '../../utils/notifications'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { PlayIcon, PauseIcon, ResetIcon } from '../Icons'

type Phase = 'work' | 'short-break' | 'long-break'

const DEFAULTS = { work: 25 * 60, shortBreak: 5 * 60, longBreak: 15 * 60, sessionsBeforeLong: 4 }

export function PomodoroView() {
  const { t } = useTranslation()
  const { textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()
  const [totalSessions, setTotalSessions] = useLocalStorage('interval-pomo-sessions', 0)
  const [phase, setPhase] = useState<Phase>('work')
  const [remainingMs, setRemainingMs] = useState(DEFAULTS.work * 1000)
  const [running, setRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const lastTickRef = useRef(0)

  const phaseSeconds = phase === 'work' ? DEFAULTS.work : phase === 'short-break' ? DEFAULTS.shortBreak : DEFAULTS.longBreak
  const progress = 1 - remainingMs / (phaseSeconds * 1000)

  useBackgroundTimer(() => {
    if (!running) return
    const now = performance.now()
    if (!lastTickRef.current) lastTickRef.current = now
    const delta = now - lastTickRef.current
    lastTickRef.current = now

    setRemainingMs((prev) => {
      const next = prev - delta
      if (next <= 0) {
        playTimerCompletionSound()
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])

        if (phase === 'work') {
          const newCount = sessionCount + 1
          setSessionCount(newCount)
          setTotalSessions((prev) => prev + 1)
          sendNotification('Pomodoro', t('pomodoro.workComplete', { n: newCount }))
          if (newCount % DEFAULTS.sessionsBeforeLong === 0) {
            setPhase('long-break')
            return DEFAULTS.longBreak * 1000
          } else {
            setPhase('short-break')
            return DEFAULTS.shortBreak * 1000
          }
        } else {
          sendNotification('Pomodoro', t('pomodoro.breakOver'))
          setPhase('work')
          return DEFAULTS.work * 1000
        }
      }
      return next
    })
  }, running)

  const toggle = useCallback(() => {
    if (!running) lastTickRef.current = performance.now()
    setRunning(!running)
  }, [running])

  const reset = useCallback(() => {
    setRunning(false)
    setPhase('work')
    setRemainingMs(DEFAULTS.work * 1000)
    setSessionCount(0)
    lastTickRef.current = 0
  }, [])

  const skipPhase = useCallback(() => {
    setRunning(false)
    lastTickRef.current = 0
    if (phase === 'work') {
      const newCount = sessionCount + 1
      setSessionCount(newCount)
      setTotalSessions((prev) => prev + 1)
      if (newCount % DEFAULTS.sessionsBeforeLong === 0) {
        setPhase('long-break')
        setRemainingMs(DEFAULTS.longBreak * 1000)
      } else {
        setPhase('short-break')
        setRemainingMs(DEFAULTS.shortBreak * 1000)
      }
    } else {
      setPhase('work')
      setRemainingMs(DEFAULTS.work * 1000)
    }
  }, [phase, sessionCount])

  const mins = Math.floor(Math.max(0, remainingMs) / 60000)
  const secs = Math.floor((Math.max(0, remainingMs) % 60000) / 1000)

  const phaseColor = phase === 'work' ? 'text-indigo-500' : phase === 'short-break' ? 'text-green-400' : 'text-amber-400'
  const phaseBg = phase === 'work' ? 'bg-indigo-600' : phase === 'short-break' ? 'bg-green-500' : 'bg-amber-500'
  const phaseLabel = phase === 'work' ? t('pomodoro.focus') : phase === 'short-break' ? t('pomodoro.shortBreak') : t('pomodoro.longBreak')

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-md text-center">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>{t('pomodoro.title')}</h1>
        <p className={`text-sm ${textMuted} mb-8`}>{t('pomodoro.subtitle')}</p>

        {/* Phase Indicator */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${phaseBg} text-white mb-6`}>
          {phaseLabel}
        </div>

        {/* Progress Ring */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="5" />
            <circle cx="50" cy="50" r="44" fill="none"
              stroke={phase === 'work' ? '#6366f1' : phase === 'short-break' ? '#22c55e' : '#f59e0b'}
              strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${progress * 276.46} 276.46`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`time-display text-5xl font-bold ${textPrimary}`}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
            <div className={`text-xs ${textMuted} mt-1`}>{t('pomodoro.session')} {sessionCount + (phase === 'work' ? 1 : 0)}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button onClick={toggle}
            className={`px-8 py-3.5 rounded-2xl text-base font-semibold transition-all flex items-center gap-2 ${running ? 'bg-amber-500 text-white' : `${phaseBg} text-white`}`}>
            {running ? <><PauseIcon size={18} /> {t('common.pause')}</> : <><PlayIcon size={18} /> {remainingMs < phaseSeconds * 1000 ? t('common.resume') : t('common.start')}</>}
          </button>
          <button onClick={skipPhase}
            className={`px-5 py-3.5 rounded-2xl text-sm font-medium border ${border} ${textSecondary} transition-all`}>
            {t('pomodoro.skip')}
          </button>
          <button onClick={reset}
            className={`px-5 py-3.5 rounded-2xl text-sm font-medium border ${border} ${textMuted} hover:text-red-400 transition-all flex items-center gap-1.5`}>
            <ResetIcon size={16} /> {t('common.reset')}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { v: sessionCount, l: t('pomodoro.thisRound') },
            { v: totalSessions, l: t('pomodoro.allTime') },
            { v: `${Math.floor(totalSessions * 25 / 60)}h ${(totalSessions * 25) % 60}m`, l: t('pomodoro.totalFocus') },
          ].map(({ v, l }) => (
            <div key={l} className={`p-4 rounded-2xl border ${border} ${surface} text-center`}>
              <div className={`time-display text-xl font-bold ${textPrimary}`}>{v}</div>
              <div className={`text-xs mt-1 ${textMuted}`}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
