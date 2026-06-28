import type { View, Theme } from '../types'
import { useTheme } from './ThemeProvider'
import { ClockIcon, AlarmIcon, TimerIcon, StopwatchIcon, SunIcon, MoonIcon, PaletteIcon } from './Icons'

interface Props {
  view: View
  setView: (view: View) => void
}

const NAV_ITEMS: { id: View; label: string; Icon: typeof ClockIcon }[] = [
  { id: 'clock', label: 'Clock', Icon: ClockIcon },
  { id: 'alarm', label: 'Alarm', Icon: AlarmIcon },
  { id: 'timer', label: 'Timer', Icon: TimerIcon },
  { id: 'stopwatch', label: 'Stopwatch', Icon: StopwatchIcon },
]

function ThemeButton({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const cycle = () => {
    const order: Theme[] = ['oled', 'light', 'dynamic']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  const Icon = theme === 'oled' ? MoonIcon : theme === 'light' ? SunIcon : PaletteIcon
  const label = theme === 'oled' ? 'OLED' : theme === 'light' ? 'Light' : 'Dynamic'

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all opacity-70 hover:opacity-100"
      title={`Theme: ${label}`}
    >
      <Icon size={18} />
      <span className="hidden lg:inline">{label}</span>
    </button>
  )
}

export function Navigation({ view, setView }: Props) {
  const { theme, setTheme, textPrimary, textSecondary, surface, border, isDark } = useTheme()

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden md:flex flex-col h-full w-[220px] shrink-0 ${surface} border-r ${border} ${textPrimary}`}>
        <div className="flex items-center gap-3 px-6 pt-8 pb-6">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <ClockIcon size={18} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Interval</span>
        </div>

        <div className="flex-1 flex flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = view === id
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? `${isDark ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-700'}`
                    : `${textSecondary} hover:${isDark ? 'bg-white/5' : 'bg-zinc-100'}`
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            )
          })}
        </div>

        <div className={`px-4 py-4 border-t ${border}`}>
          <ThemeButton theme={theme} setTheme={setTheme} />
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${surface} glass border-t ${border} ${textPrimary}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = view === id
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'text-indigo-500'
                    : `${textSecondary} opacity-60`
                }`}
              >
                <Icon size={22} />
                <span>{label}</span>
              </button>
            )
          })}
          <ThemeButton theme={theme} setTheme={setTheme} />
        </div>
      </nav>
    </>
  )
}
