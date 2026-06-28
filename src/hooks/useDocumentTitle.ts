import { useEffect } from 'react'
import type { View } from '../types'
import type { TimerInstance, StopwatchState } from '../types'
import { formatCountdown, formatMs } from '../utils/time'

const SEO_TITLES: Record<View, string> = {
  clock: 'Interval — Free Online Clock & World Clock',
  alarm: 'Online Alarm Clock — Set a Free Alarm | Interval',
  timer: 'Online Countdown Timer & Pomodoro Timer | Interval',
  stopwatch: 'Online Stopwatch with Lap Timing | Interval',
}

const SEO_DESCRIPTIONS: Record<View, string> = {
  clock: 'Free online clock with 400+ world timezones, meeting planner, sunrise/sunset times, and analog clock face. Installable PWA, works offline.',
  alarm: 'Set a free online alarm clock with 8 built-in sounds, smart wake, snooze, and recurring schedules. No ads, no sign-up, works offline.',
  timer: 'Free online countdown timer with Pomodoro presets, interval training sequences, multiple simultaneous timers, and auto-loop. Works offline.',
  stopwatch: 'Free online stopwatch with sub-centisecond precision, lap/split timing, fastest/slowest highlighting, voice announcements, and CSV export.',
}

export function useDocumentTitle(
  view: View,
  timers: TimerInstance[],
  stopwatch: StopwatchState,
) {
  useEffect(() => {
    const runningTimer = timers.find((t) => t.running)

    if (view === 'timer' && runningTimer) {
      document.title = `${formatCountdown(runningTimer.remainingMs)} — ${runningTimer.label} | Interval`
      return
    }

    if (view === 'stopwatch' && stopwatch.running) {
      document.title = `${formatMs(stopwatch.elapsedMs)} | Interval`
      return
    }

    document.title = SEO_TITLES[view]
  })

  // Update meta description per view
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', SEO_DESCRIPTIONS[view])
    }
  }, [view])
}
