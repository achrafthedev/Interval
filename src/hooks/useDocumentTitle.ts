import { useEffect } from 'react'
import type { View } from '../types'
import type { TimerInstance, StopwatchState } from '../types'
import { formatCountdown, formatMs } from '../utils/time'

const SEO_TITLES: Record<View, string> = {
  clock: 'Interval — Free Online Clock & World Clock',
  alarm: 'Online Alarm Clock — Set a Free Alarm | Interval',
  timer: 'Online Countdown Timer | Interval',
  stopwatch: 'Online Stopwatch with Lap Timing | Interval',
  pomodoro: 'Pomodoro Timer — Focus in 25-Minute Sessions | Interval',
  counter: 'Online Counter — Count Up or Down | Interval',
  'date-calc': 'Date Calculator — Days Between Dates | Interval',
  'age-calc': 'Age Calculator — How Old Am I? | Interval',
  'hours-calc': 'Hours Calculator — Time Between Two Times | Interval',
  'week-number': 'Week Number — ISO Week of Any Date | Interval',
  'tz-converter': 'Time Zone Converter | Interval',
  'unix-time': 'Unix Timestamp Converter | Interval',
  'moon-phase': 'Moon Phase — Current Lunar Phase | Interval',
  countdown: 'Countdown Timer | Interval',
  legal: 'About, Privacy Policy & Terms | Interval',
}

const SEO_DESCRIPTIONS: Record<View, string> = {
  clock: 'Free online clock with 400+ world timezones, meeting planner, sunrise/sunset times, and analog clock face. Installable PWA, works offline.',
  alarm: 'Set a free online alarm clock with 8 built-in sounds, smart wake, snooze, and recurring schedules. No ads, no sign-up, works offline.',
  timer: 'Free online countdown timer with Pomodoro presets, interval training sequences, multiple simultaneous timers, and auto-loop. Works offline.',
  stopwatch: 'Free online stopwatch with sub-centisecond precision, lap/split timing, fastest/slowest highlighting, voice announcements, and CSV export.',
  pomodoro: 'Free Pomodoro timer with 25-minute focus sessions, automatic breaks, session tracking, and sound notifications. Works offline.',
  counter: 'Free online counter to count up or down by any increment. Track people, items, reps, or anything. Saved in your browser.',
  'date-calc': 'Calculate the number of days, weeks, months, or hours between two dates, or add and subtract days from any date.',
  'age-calc': 'Calculate your exact age in years, months, days, hours, and minutes from your date of birth. Find days until your next birthday.',
  'hours-calc': 'Calculate the time duration between two times. Supports overnight shifts crossing midnight. Shows hours, minutes, and decimal hours.',
  'week-number': 'Find the ISO week number, day of the year, quarter, and leap year status for any date.',
  'tz-converter': 'Convert time between any two timezones worldwide. Supports all 400+ IANA timezones with automatic offset calculation.',
  'unix-time': 'Convert between Unix timestamps and human-readable dates. View the current Unix epoch time in seconds and milliseconds.',
  'moon-phase': 'View the current moon phase, illumination percentage, moon age, and dates of the next new moon and full moon.',
  countdown: 'Create a custom countdown to any date and time.',
  legal: 'About Interval, Privacy Policy, and Terms of Service.',
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

    document.title = SEO_TITLES[view] || 'Interval'
  })

  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', SEO_DESCRIPTIONS[view] || '')
    }
  }, [view])
}
