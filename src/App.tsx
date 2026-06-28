import { useCallback, useEffect, useState, lazy, Suspense } from 'react'
import { ThemeProvider, useTheme } from './components/ThemeProvider'
import { Navigation } from './components/Navigation'
import { ClockView } from './components/ClockView'
import { AlarmView } from './components/AlarmView'
import { TimerView } from './components/TimerView'
import { StopwatchView } from './components/StopwatchView'
import { SettingsPanel } from './components/SettingsPanel'
import { SeoContent } from './components/SeoContent'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useDocumentTitle } from './hooks/useDocumentTitle'

// Lazy-loaded tool views (code-split for performance)
const DateCalcView = lazy(() => import('./components/tools/DateCalcView').then(m => ({ default: m.DateCalcView })))
const AgeCalcView = lazy(() => import('./components/tools/AgeCalcView').then(m => ({ default: m.AgeCalcView })))
const HoursCalcView = lazy(() => import('./components/tools/HoursCalcView').then(m => ({ default: m.HoursCalcView })))
const WeekNumberView = lazy(() => import('./components/tools/WeekNumberView').then(m => ({ default: m.WeekNumberView })))
const TzConverterView = lazy(() => import('./components/tools/TzConverterView').then(m => ({ default: m.TzConverterView })))
const UnixTimeView = lazy(() => import('./components/tools/UnixTimeView').then(m => ({ default: m.UnixTimeView })))
const CounterView = lazy(() => import('./components/tools/CounterView').then(m => ({ default: m.CounterView })))
const PomodoroView = lazy(() => import('./components/tools/PomodoroView').then(m => ({ default: m.PomodoroView })))
const MoonPhaseView = lazy(() => import('./components/tools/MoonPhaseView').then(m => ({ default: m.MoonPhaseView })))
const LegalView = lazy(() => import('./components/tools/LegalView').then(m => ({ default: m.LegalView })))
import { requestNotificationPermission } from './utils/notifications'
import { requestWakeLock } from './utils/wakelock'
import type { View, Theme, WorldClockZone, Alarm, TimerInstance, StopwatchState } from './types'

const DEFAULT_STOPWATCH: StopwatchState = {
  running: false,
  elapsedMs: 0,
  laps: [],
  startTimestamp: null,
  lapStartMs: 0,
}

export function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('interval-theme', 'oled')
  const [view, setView] = useLocalStorage<View>('interval-view', 'clock')
  const [use24Hour, setUse24Hour] = useLocalStorage('interval-24h', false)
  const [ttsEnabled, setTtsEnabled] = useLocalStorage('interval-tts', false)
  const [showAnalog, setShowAnalog] = useLocalStorage('interval-analog', false)
  const [showSeconds, setShowSeconds] = useLocalStorage('interval-show-seconds', true)
  const [worldClocks, setWorldClocks] = useLocalStorage<WorldClockZone[]>('interval-zones', [])
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>('interval-alarms', [])
  const [timers, setTimers] = useLocalStorage<TimerInstance[]>('interval-timers', [])
  const [stopwatch, setStopwatch] = useLocalStorage<StopwatchState>('interval-stopwatch', DEFAULT_STOPWATCH)
  const [countdownTarget, setCountdownTarget] = useLocalStorage('interval-countdown-target', '')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlView = params.get('view') as View | null
    if (urlView && ['clock', 'alarm', 'timer', 'stopwatch'].includes(urlView)) {
      setView(urlView)
    }
    requestNotificationPermission()
  }, [])

  // Auto wake lock when timers or stopwatch are running
  useEffect(() => {
    const hasActive = timers.some((t) => t.running) || stopwatch.running
    if (hasActive) requestWakeLock()
  }, [timers.some((t) => t.running), stopwatch.running])

  return (
    <ThemeProvider theme={theme} setTheme={setTheme}>
      <AppShell
        view={view}
        setView={setView}
        theme={theme}
        setTheme={setTheme}
        worldClocks={worldClocks}
        setWorldClocks={setWorldClocks}
        use24Hour={use24Hour}
        setUse24Hour={setUse24Hour}
        showAnalog={showAnalog}
        setShowAnalog={setShowAnalog}
        showSeconds={showSeconds}
        setShowSeconds={setShowSeconds}
        alarms={alarms}
        setAlarms={setAlarms}
        timers={timers}
        setTimers={setTimers}
        stopwatch={stopwatch}
        setStopwatch={setStopwatch}
        ttsEnabled={ttsEnabled}
        setTtsEnabled={setTtsEnabled}
        countdownTarget={countdownTarget}
        setCountdownTarget={setCountdownTarget}
      />
    </ThemeProvider>
  )
}

interface AppShellProps {
  view: View
  setView: (v: View) => void
  theme: Theme
  setTheme: (t: Theme) => void
  worldClocks: WorldClockZone[]
  setWorldClocks: (z: WorldClockZone[]) => void
  use24Hour: boolean
  setUse24Hour: (v: boolean) => void
  showAnalog: boolean
  setShowAnalog: (v: boolean) => void
  showSeconds: boolean
  setShowSeconds: (v: boolean) => void
  alarms: Alarm[]
  setAlarms: (a: Alarm[]) => void
  timers: TimerInstance[]
  setTimers: (t: TimerInstance[]) => void
  stopwatch: StopwatchState
  setStopwatch: (s: StopwatchState) => void
  ttsEnabled: boolean
  setTtsEnabled: (v: boolean) => void
  countdownTarget: string
  setCountdownTarget: (v: string) => void
}

function AppShell({
  view, setView,
  theme, setTheme,
  worldClocks, setWorldClocks,
  use24Hour, setUse24Hour,
  showAnalog, setShowAnalog,
  showSeconds, setShowSeconds,
  alarms, setAlarms,
  timers, setTimers,
  stopwatch, setStopwatch,
  ttsEnabled, setTtsEnabled,
  countdownTarget, setCountdownTarget,
}: AppShellProps) {
  const { bgStyle } = useTheme()
  const [showSettings, setShowSettings] = useState(false)

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [])

  const cycleTheme = useCallback(() => {
    const order: Theme[] = ['oled', 'light', 'dynamic']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }, [theme, setTheme])

  useKeyboardShortcuts({ setView, onFullscreen: toggleFullscreen, onThemeCycle: cycleTheme })
  useDocumentTitle(view, timers, stopwatch)

  const renderView = useCallback(() => {
    const lazyFallback = <div className="flex items-center justify-center h-full opacity-50">Loading...</div>

    switch (view) {
      case 'clock':
        return (
          <ClockView
            zones={worldClocks}
            setZones={setWorldClocks}
            use24Hour={use24Hour}
            setUse24Hour={setUse24Hour}
            showAnalog={showAnalog}
            countdownTarget={countdownTarget}
            setCountdownTarget={setCountdownTarget}
          />
        )
      case 'alarm':
        return <AlarmView alarms={alarms} setAlarms={setAlarms} />
      case 'timer':
        return <TimerView timers={timers} setTimers={setTimers} />
      case 'stopwatch':
        return (
          <StopwatchView
            state={stopwatch}
            setState={setStopwatch}
            ttsEnabled={ttsEnabled}
            setTtsEnabled={setTtsEnabled}
          />
        )
      case 'pomodoro':
        return <Suspense fallback={lazyFallback}><PomodoroView /></Suspense>
      case 'counter':
        return <Suspense fallback={lazyFallback}><CounterView /></Suspense>
      case 'date-calc':
        return <Suspense fallback={lazyFallback}><DateCalcView /></Suspense>
      case 'age-calc':
        return <Suspense fallback={lazyFallback}><AgeCalcView /></Suspense>
      case 'hours-calc':
        return <Suspense fallback={lazyFallback}><HoursCalcView /></Suspense>
      case 'week-number':
        return <Suspense fallback={lazyFallback}><WeekNumberView /></Suspense>
      case 'tz-converter':
        return <Suspense fallback={lazyFallback}><TzConverterView /></Suspense>
      case 'unix-time':
        return <Suspense fallback={lazyFallback}><UnixTimeView /></Suspense>
      case 'moon-phase':
        return <Suspense fallback={lazyFallback}><MoonPhaseView /></Suspense>
      case 'legal':
        return <Suspense fallback={lazyFallback}><LegalView /></Suspense>
      default:
        return <Suspense fallback={lazyFallback}><DateCalcView /></Suspense>
    }
  }, [view, worldClocks, alarms, timers, stopwatch, use24Hour, ttsEnabled, showAnalog, countdownTarget])

  return (
    <div className="flex h-full w-full" style={bgStyle}>
      <Navigation
        view={view}
        setView={setView}
        onSettingsOpen={() => setShowSettings(true)}
        onFullscreen={toggleFullscreen}
      />
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {renderView()}
          <SeoContent view={view} />
        </div>
      </main>
      <SettingsPanel
        show={showSettings}
        onClose={() => setShowSettings(false)}
        use24Hour={use24Hour}
        setUse24Hour={setUse24Hour}
        showAnalog={showAnalog}
        setShowAnalog={setShowAnalog}
        showSeconds={showSeconds}
        setShowSeconds={setShowSeconds}
      />
    </div>
  )
}
