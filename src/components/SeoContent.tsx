import { useTheme } from './ThemeProvider'
import type { View } from '../types'

interface Props {
  view: View
}

export function SeoContent({ view }: Props) {
  const { textPrimary, textSecondary, textMuted, border, isDark } = useTheme()

  const hasContent = ['clock', 'alarm', 'timer', 'stopwatch'].includes(view)
  if (!hasContent) return null

  return (
    <footer className={`w-full max-w-3xl mx-auto px-6 pt-12 pb-20 md:pb-12 ${textSecondary}`}>
      <div className={`border-t ${border} pt-10 space-y-8`}>
        {view === 'clock' && <ClockContent isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} />}
        {view === 'alarm' && <AlarmContent isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} />}
        {view === 'timer' && <TimerContent isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} />}
        {view === 'stopwatch' && <StopwatchContent isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} />}
      </div>
    </footer>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return <section className="space-y-4 text-sm leading-relaxed">{children}</section>
}

function FaqItem({ q, a, isDark }: { q: string; a: string; isDark: boolean }) {
  return (
    <details className={`group rounded-xl border ${isDark ? 'border-white/10' : 'border-zinc-200'} overflow-hidden`}>
      <summary className={`cursor-pointer px-5 py-4 text-sm font-medium ${isDark ? 'text-white hover:bg-white/5' : 'text-zinc-900 hover:bg-zinc-50'} transition-colors list-none flex items-center justify-between`}>
        {q}
        <span className="text-xs opacity-40 group-open:rotate-180 transition-transform">&#9660;</span>
      </summary>
      <p className={`px-5 pb-4 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'} leading-relaxed`}>{a}</p>
    </details>
  )
}

function ClockContent({ isDark, textPrimary, textMuted }: { isDark: boolean; textPrimary: string; textMuted: string }) {
  return (
    <Section>
      <h2 className={`text-xl font-semibold ${textPrimary}`}>Free Online Clock & World Clock</h2>
      <p>
        Interval provides a precise, real-time online clock displaying the current time for your local timezone — updated every frame using high-resolution browser timing. Unlike basic web clocks, Interval supports a beautiful analog clock face, automatic geolocation detection, and sunrise and sunset times calculated from your coordinates.
      </p>
      <h3 className={`text-base font-medium ${textPrimary} pt-2`}>World Clock with 400+ Timezones</h3>
      <p>
        Add any city worldwide from over 400 IANA timezones. Each city card displays the live time, UTC offset, and the exact time difference relative to your location. Whether you're coordinating a meeting between New York and Tokyo or checking the time in Casablanca, Interval shows precise deltas between all your selected zones.
      </p>
      <h3 className={`text-base font-medium ${textPrimary} pt-2`}>Interactive Meeting Planner</h3>
      <p>
        Use the time slider to scrub forward or backward up to 12 hours and instantly see what time it will be in every city you've added. Perfect for scheduling international calls, planning travel, or coordinating across distributed teams without mental timezone math.
      </p>

      <h3 className={`text-base font-medium ${textPrimary} pt-4`}>Frequently Asked Questions</h3>
      <div className="space-y-2">
        <FaqItem isDark={isDark} q="Is this online clock accurate?" a="Yes. Interval uses your device's system clock and renders updates via requestAnimationFrame for real-time accuracy. The displayed time is always synchronized with your operating system clock." />
        <FaqItem isDark={isDark} q="How do I compare time across different cities?" a="Tap 'Add City' and search from 400+ cities worldwide. Each city card shows the live time, UTC offset, and exact hour difference. Use the Meeting Planner slider to see future/past times across all zones simultaneously." />
        <FaqItem isDark={isDark} q="Can I use the world clock offline?" a="Yes. Interval is a Progressive Web App — once loaded, the clock, world clock, and all other features work completely offline. Install it to your home screen for a native experience." />
      </div>
    </Section>
  )
}

function AlarmContent({ isDark, textPrimary, textMuted }: { isDark: boolean; textPrimary: string; textMuted: string }) {
  return (
    <Section>
      <h2 className={`text-xl font-semibold ${textPrimary}`}>Free Online Alarm Clock — Set an Alarm in Seconds</h2>
      <p>
        Set an alarm online in seconds with Interval's advanced alarm system. Choose from 8 built-in alarm sounds across three intensity categories — from a gentle zen bowl for light sleepers to an urgent siren for heavy sleepers. Every tone is synthesized using the Web Audio API, so alarms work offline without downloading any audio files.
      </p>
      <h3 className={`text-base font-medium ${textPrimary} pt-2`}>Smart Wake Technology</h3>
      <p>
        Enable Smart Wake on any alarm to gradually increase the volume over 30 seconds, easing you awake instead of startling you. Combined with the 5-minute snooze button, Interval gives you the gentlest possible wake-up experience from any browser.
      </p>
      <h3 className={`text-base font-medium ${textPrimary} pt-2`}>Recurring Alarms & Custom Sounds</h3>
      <p>
        Set alarms to repeat on specific days — weekdays only, weekends, or any custom combination. Label each alarm for quick identification. For personal preference, paste any audio URL to use your own custom alarm sound.
      </p>

      <h3 className={`text-base font-medium ${textPrimary} pt-4`}>Frequently Asked Questions</h3>
      <div className="space-y-2">
        <FaqItem isDark={isDark} q="Will my online alarm work if my computer goes to sleep?" a="Interval uses the Web Audio API and Web Notifications to trigger alarms. For best results, enable the built-in 'Keep Awake' feature in the sidebar, which uses the Screen Wake Lock API to prevent your device from sleeping." />
        <FaqItem isDark={isDark} q="Can I set multiple alarms at the same time?" a="Yes. Create unlimited alarms, each with its own time, label, recurrence schedule, and sound choice. All alarms run independently and will trigger even if you switch to a different tab within Interval." />
        <FaqItem isDark={isDark} q="What alarm sounds are available?" a="Interval includes 8 synthesized tones: Gentle Chime, Zen Bowl, Morning Birds (gentle category), Marimba, Digital Alarm, Radar Pulse, Heartbeat (standard), and Urgent Siren (intense). You can also use any custom audio URL." />
        <FaqItem isDark={isDark} q="Do alarms work offline?" a="Yes. Since all alarm sounds are generated via the Web Audio API (not downloaded files), your alarms will ring even without an internet connection, as long as the Interval tab is open in your browser." />
      </div>
    </Section>
  )
}

function TimerContent({ isDark, textPrimary, textMuted }: { isDark: boolean; textPrimary: string; textMuted: string }) {
  return (
    <Section>
      <h2 className={`text-xl font-semibold ${textPrimary}`}>Free Online Countdown Timer & Pomodoro Timer</h2>
      <p>
        Start a countdown timer instantly with Interval's quick presets — Pomodoro (25 min), Short Break (5 min), Long Break (15 min), Tea Steep (3 min), and more. Or create a fully custom timer with hours, minutes, and seconds. Run multiple timers simultaneously, each with its own progress bar and controls.
      </p>
      <h3 className={`text-base font-medium ${textPrimary} pt-2`}>Interval Training & Sequence Timers</h3>
      <p>
        Build chained timer sequences for interval training, HIIT workouts, or structured Pomodoro sessions. Define steps like "Work 25 min → Rest 5 min", set the number of repeats, and hit start — each timer auto-advances to the next when it finishes. No manual intervention needed.
      </p>
      <h3 className={`text-base font-medium ${textPrimary} pt-2`}>Quick Extend & Auto-Loop</h3>
      <p>
        Need more time? Tap +1m, +5m, or +10m to instantly extend any running timer without pausing or resetting. Toggle auto-loop on any timer to make it restart automatically when it reaches zero — perfect for repeating intervals.
      </p>

      <h3 className={`text-base font-medium ${textPrimary} pt-4`}>Frequently Asked Questions</h3>
      <div className="space-y-2">
        <FaqItem isDark={isDark} q="Can I run multiple timers at the same time?" a="Yes. Interval supports unlimited simultaneous timers. Each timer runs independently with its own controls, progress bar, and completion notification." />
        <FaqItem isDark={isDark} q="What is the Pomodoro timer and how do I use it?" a="The Pomodoro Technique uses 25-minute focused work intervals followed by 5-minute breaks. Tap the 'Pomodoro' preset to start, or use the Sequence Builder to create a full session with automatic work-rest-repeat cycles." />
        <FaqItem isDark={isDark} q="Can I use the timer completely offline?" a="Yes. Interval is a PWA — timers run using a Web Worker for background reliability, and completion sounds are generated via the Web Audio API. No internet connection is needed." />
        <FaqItem isDark={isDark} q="Will the timer notify me if I'm in another tab?" a="Yes. When a timer completes, Interval sends a native OS notification (with your permission) and plays an audio chime, even if the tab is in the background." />
      </div>
    </Section>
  )
}

function StopwatchContent({ isDark, textPrimary, textMuted }: { isDark: boolean; textPrimary: string; textMuted: string }) {
  return (
    <Section>
      <h2 className={`text-xl font-semibold ${textPrimary}`}>Free Online Stopwatch with Lap Timing</h2>
      <p>
        Interval's stopwatch delivers sub-centisecond precision using the browser's high-resolution performance timer. Track both lap times (time since last lap) and split times (total elapsed) side-by-side in a scrolling history table with automatic delta calculations.
      </p>
      <h3 className={`text-base font-medium ${textPrimary} pt-2`}>Fastest & Slowest Lap Highlighting</h3>
      <p>
        The lap history table automatically identifies your fastest lap (highlighted in green) and slowest lap (highlighted in red) across the entire session. Delta values between consecutive laps show exactly where you gained or lost time.
      </p>
      <h3 className={`text-base font-medium ${textPrimary} pt-2`}>Voice Announcements & CSV Export</h3>
      <p>
        Enable the Voice toggle to hear lap times read aloud via the Web Speech API — perfect for hands-free timing during workouts or coaching sessions. When you're done, export all lap data as a CSV file for analysis in spreadsheets.
      </p>

      <h3 className={`text-base font-medium ${textPrimary} pt-4`}>Frequently Asked Questions</h3>
      <div className="space-y-2">
        <FaqItem isDark={isDark} q="How accurate is the online stopwatch?" a="Interval uses performance.now() and requestAnimationFrame for sub-millisecond precision — the highest accuracy available in a web browser. Display resolution is centiseconds (1/100th of a second)." />
        <FaqItem isDark={isDark} q="Can I export my lap times?" a="Yes. Tap the 'Export' button to download all lap data as a CSV file containing lap number, lap time, split time, and delta values — ready for analysis in Excel, Google Sheets, or any spreadsheet app." />
        <FaqItem isDark={isDark} q="What is the difference between lap time and split time?" a="Lap time is the duration since the last lap button press. Split time is the total cumulative time elapsed since you pressed Start. Both are displayed side-by-side for every lap." />
        <FaqItem isDark={isDark} q="Can I use Picture-in-Picture with the stopwatch?" a="Yes. Tap the PiP button to pop the running stopwatch into a floating always-on-top window. This lets you monitor the timer while using other apps or browsing other tabs." />
      </div>
    </Section>
  )
}
