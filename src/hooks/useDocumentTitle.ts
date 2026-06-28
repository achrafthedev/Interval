import { useEffect } from 'react'
import type { View } from '../types'
import type { TimerInstance, StopwatchState } from '../types'
import { formatCountdown, formatMs } from '../utils/time'

export function useDocumentTitle(
  view: View,
  timers: TimerInstance[],
  stopwatch: StopwatchState,
) {
  useEffect(() => {
    const runningTimer = timers.find((t) => t.running)
    const baseTitle = 'Interval'

    if (view === 'timer' && runningTimer) {
      document.title = `${formatCountdown(runningTimer.remainingMs)} - ${runningTimer.label} | ${baseTitle}`
      return
    }

    if (view === 'stopwatch' && stopwatch.running) {
      document.title = `${formatMs(stopwatch.elapsedMs)} | ${baseTitle}`
      return
    }

    const titles: Record<View, string> = {
      clock: baseTitle,
      alarm: `Alarms | ${baseTitle}`,
      timer: `Timer | ${baseTitle}`,
      stopwatch: `Stopwatch | ${baseTitle}`,
    }
    document.title = titles[view]
  })
}
