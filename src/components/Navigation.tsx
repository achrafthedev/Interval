import { useState } from 'react'
import type { View, Theme } from '../types'
import { useTheme } from './ThemeProvider'
import { ClockIcon, AlarmIcon, TimerIcon, StopwatchIcon, SunIcon, MoonIcon, PaletteIcon, SettingsIcon, MaximizeIcon, ScreenIcon, GitHubIcon, HeartIcon, GlobeIcon, ChevronRightIcon } from './Icons'
import { isWakeLockSupported, requestWakeLock, releaseWakeLock, isWakeLockActive } from '../utils/wakelock'

interface Props {
  view: View
  setView: (view: View) => void
  onSettingsOpen: () => void
  onFullscreen: () => void
}

interface NavItem { id: View; label: string; Icon: typeof ClockIcon }

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Clocks & Timers',
    items: [
      { id: 'clock', label: 'Clock', Icon: ClockIcon },
      { id: 'alarm', label: 'Alarm Clock', Icon: AlarmIcon },
      { id: 'timer', label: 'Timer', Icon: TimerIcon },
      { id: 'stopwatch', label: 'Stopwatch', Icon: StopwatchIcon },
      { id: 'pomodoro', label: 'Pomodoro', Icon: TimerIcon },
      { id: 'counter', label: 'Counter', Icon: StopwatchIcon },
    ],
  },
  {
    label: 'Calculators',
    items: [
      { id: 'date-calc', label: 'Date Calculator', Icon: ClockIcon },
      { id: 'age-calc', label: 'Age Calculator', Icon: ClockIcon },
      { id: 'hours-calc', label: 'Hours Calculator', Icon: ClockIcon },
      { id: 'week-number', label: 'Week Number', Icon: ClockIcon },
    ],
  },
  {
    label: 'Converters',
    items: [
      { id: 'tz-converter', label: 'Timezone Converter', Icon: GlobeIcon },
      { id: 'unix-time', label: 'Unix Time', Icon: ClockIcon },
    ],
  },
  {
    label: 'Sun & Moon',
    items: [
      { id: 'moon-phase', label: 'Moon Phase', Icon: MoonIcon },
    ],
  },
]

const MOBILE_MAIN: NavItem[] = [
  { id: 'clock', label: 'Clock', Icon: ClockIcon },
  { id: 'alarm', label: 'Alarm', Icon: AlarmIcon },
  { id: 'timer', label: 'Timer', Icon: TimerIcon },
  { id: 'stopwatch', label: 'Stopwatch', Icon: StopwatchIcon },
]

function ThemeButton({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const cycle = () => {
    const order: Theme[] = ['oled', 'light', 'dynamic']
    setTheme(order[(order.indexOf(theme) + 1) % order.length])
  }
  const Icon = theme === 'oled' ? MoonIcon : theme === 'light' ? SunIcon : PaletteIcon
  return (
    <button onClick={cycle} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all opacity-70 hover:opacity-100" title="Theme">
      <Icon size={18} />
      <span className="hidden lg:inline">{theme === 'oled' ? 'OLED' : theme === 'light' ? 'Light' : 'Dynamic'}</span>
    </button>
  )
}

export function Navigation({ view, setView, onSettingsOpen, onFullscreen }: Props) {
  const { theme, setTheme, textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()
  const [wakeLockOn, setWakeLockOn] = useState(isWakeLockActive())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const toggleWakeLock = async () => {
    if (wakeLockOn) { await releaseWakeLock(); setWakeLockOn(false) }
    else { const ok = await requestWakeLock(); setWakeLockOn(ok) }
  }

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  const navButton = (item: NavItem, compact = false) => {
    const active = view === item.id
    return (
      <button
        key={item.id}
        onClick={() => { setView(item.id); setMobileMenuOpen(false) }}
        className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all ${
          active
            ? isDark ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-700'
            : `${textSecondary} ${isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-100'}`
        }`}
      >
        <item.Icon size={compact ? 16 : 18} />
        {item.label}
      </button>
    )
  }

  const allViews = NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.id))
  const isToolView = !MOBILE_MAIN.some((m) => m.id === view) && allViews.includes(view)

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden md:flex flex-col h-full w-[220px] shrink-0 ${surface} border-r ${border} ${textPrimary} overflow-y-auto`}>
        <div className="flex items-center gap-3 px-6 pt-6 pb-4">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <ClockIcon size={16} className="text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Interval</span>
        </div>

        <div className="flex-1 px-2 pb-2 space-y-3">
          {NAV_SECTIONS.map((section) => {
            const collapsed = collapsedSections.has(section.label)
            return (
              <div key={section.label}>
                <button
                  onClick={() => toggleSection(section.label)}
                  className={`flex items-center justify-between w-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold ${textMuted} hover:${isDark ? 'text-white' : 'text-zinc-900'} transition-colors`}
                >
                  {section.label}
                  <ChevronRightIcon size={12} className={`transition-transform ${collapsed ? '' : 'rotate-90'}`} />
                </button>
                {!collapsed && (
                  <div className="mt-0.5 space-y-0.5">
                    {section.items.map((item) => navButton(item))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Legal */}
          <div>
            <button onClick={() => toggleSection('legal')}
              className={`flex items-center justify-between w-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold ${textMuted}`}>
              Legal
              <ChevronRightIcon size={12} className={`transition-transform ${collapsedSections.has('legal') ? '' : 'rotate-90'}`} />
            </button>
            {!collapsedSections.has('legal') && (
              <div className="mt-0.5 space-y-0.5">
                {navButton({ id: 'legal', label: 'About / Privacy / Terms', Icon: SettingsIcon })}
              </div>
            )}
          </div>
        </div>

        <div className={`px-2 py-3 border-t ${border} space-y-0.5`}>
          {isWakeLockSupported() && (
            <button onClick={toggleWakeLock} className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all ${wakeLockOn ? 'text-green-400' : `${textSecondary} opacity-70 hover:opacity-100`}`}>
              <ScreenIcon size={18} /><span className="hidden lg:inline">{wakeLockOn ? 'Screen On' : 'Keep Awake'}</span>
            </button>
          )}
          <button onClick={onFullscreen} className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all ${textSecondary} opacity-70 hover:opacity-100`}>
            <MaximizeIcon size={18} /><span className="hidden lg:inline">Fullscreen</span>
          </button>
          <ThemeButton theme={theme} setTheme={setTheme} />
          <button onClick={onSettingsOpen} className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all ${textSecondary} opacity-70 hover:opacity-100`}>
            <SettingsIcon size={18} /><span className="hidden lg:inline">Settings</span>
          </button>
        </div>

        <div className={`px-4 py-3 border-t ${border}`}>
          <a href="https://github.com/achrafthedev/Interval" target="_blank" rel="noopener noreferrer"
            className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${textMuted} hover:text-indigo-500`}>
            <GitHubIcon size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="hidden lg:flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">Open Source <HeartIcon size={12} className="text-red-400" /></span>
          </a>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${surface} glass border-t ${border} ${textPrimary}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around px-1 pt-2 pb-1">
          {MOBILE_MAIN.map((item) => {
            const active = view === item.id
            return (
              <button key={item.id} onClick={() => setView(item.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-xs font-medium transition-all ${active ? 'text-indigo-500' : `${textSecondary} opacity-60`}`}>
                <item.Icon size={20} /><span>{item.label}</span>
              </button>
            )
          })}
          <button onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-xs font-medium transition-all ${isToolView ? 'text-indigo-500' : `${textSecondary} opacity-60`}`}>
            <SettingsIcon size={20} /><span>More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Full Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className={`absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-t-3xl p-6 animate-slide-up`}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${textPrimary}`}>All Tools</h2>
              <button onClick={() => setMobileMenuOpen(false)} className={textMuted}>&times;</button>
            </div>
            <div className="space-y-4">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <p className={`text-[10px] uppercase tracking-wider font-semibold ${textMuted} px-3 mb-1`}>{section.label}</p>
                  <div className="space-y-0.5">{section.items.map((item) => navButton(item, true))}</div>
                </div>
              ))}
              <div>
                <p className={`text-[10px] uppercase tracking-wider font-semibold ${textMuted} px-3 mb-1`}>Legal</p>
                {navButton({ id: 'legal', label: 'About / Privacy / Terms', Icon: SettingsIcon }, true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
