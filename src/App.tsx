import { useCallback, useEffect } from 'react'
import { ThemeProvider, useTheme } from './components/ThemeProvider'
import { Navigation } from './components/Navigation'
import { ClockView } from './components/ClockView'
import { AlarmView } from './components/AlarmView'
import { TimerView } from './components/TimerView'
import { StopwatchView } from './components/StopwatchView'
import { useLocalStorage } from './hooks/useLocalStorage'
import { requestNotificationPermission } from './utils/notifications'
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
  const [worldClocks, setWorldClocks] = useLocalStorage<WorldClockZone[]>('interval-zones', [])
  const [alarms, setAlarms] = useLocalStorage<Alarm[]>('interval-alarms', [])
  const [timers, setTimers] = useLocalStorage<TimerInstance[]>('interval-timers', [])
  const [stopwatch, setStopwatch] = useLocalStorage<StopwatchState>('interval-stopwatch', DEFAULT_STOPWATCH)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlView = params.get('view') as View | null
    if (urlView && ['clock', 'alarm', 'timer', 'stopwatch'].includes(urlView)) {
      setView(urlView)
    }
    requestNotificationPermission()
  }, [])

  return (
    <ThemeProvider theme={theme} setTheme={setTheme}>
      <AppShell
        view={view}
        setView={setView}
        worldClocks={worldClocks}
        setWorldClocks={setWorldClocks}
        use24Hour={use24Hour}
        setUse24Hour={setUse24Hour}
        alarms={alarms}
        setAlarms={setAlarms}
        timers={timers}
        setTimers={setTimers}
        stopwatch={stopwatch}
        setStopwatch={setStopwatch}
        ttsEnabled={ttsEnabled}
        setTtsEnabled={setTtsEnabled}
      />
    </ThemeProvider>
  )
}

interface AppShellProps {
  view: View
  setView: (v: View) => void
  worldClocks: WorldClockZone[]
  setWorldClocks: (z: WorldClockZone[]) => void
  use24Hour: boolean
  setUse24Hour: (v: boolean) => void
  alarms: Alarm[]
  setAlarms: (a: Alarm[]) => void
  timers: TimerInstance[]
  setTimers: (t: TimerInstance[]) => void
  stopwatch: StopwatchState
  setStopwatch: (s: StopwatchState) => void
  ttsEnabled: boolean
  setTtsEnabled: (v: boolean) => void
}

function AppShell({
  view, setView,
  worldClocks, setWorldClocks,
  use24Hour, setUse24Hour,
  alarms, setAlarms,
  timers, setTimers,
  stopwatch, setStopwatch,
  ttsEnabled, setTtsEnabled,
}: AppShellProps) {
  const { bgStyle } = useTheme()

  const renderView = useCallback(() => {
    switch (view) {
      case 'clock':
        return (
          <ClockView
            zones={worldClocks}
            setZones={setWorldClocks}
            use24Hour={use24Hour}
            setUse24Hour={setUse24Hour}
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
    }
  }, [view, worldClocks, alarms, timers, stopwatch, use24Hour, ttsEnabled])

  return (
    <div className="flex h-full w-full" style={bgStyle}>
      <Navigation view={view} setView={setView} />
      <main className="flex-1 min-w-0 overflow-hidden">
        {renderView()}
      </main>
    </div>
  )
}
