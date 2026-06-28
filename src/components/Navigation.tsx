import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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

interface NavItem { id: View; tKey: string; Icon: typeof ClockIcon }

const NAV_SECTIONS: { tKey: string; items: NavItem[] }[] = [
  {
    tKey: 'nav.clocksTimers',
    items: [
      { id: 'clock', tKey: 'nav.clock', Icon: ClockIcon },
      { id: 'alarm', tKey: 'nav.alarmClock', Icon: AlarmIcon },
      { id: 'timer', tKey: 'nav.timer', Icon: TimerIcon },
      { id: 'stopwatch', tKey: 'nav.stopwatch', Icon: StopwatchIcon },
      { id: 'pomodoro', tKey: 'nav.pomodoro', Icon: TimerIcon },
      { id: 'counter', tKey: 'nav.counter', Icon: StopwatchIcon },
    ],
  },
  {
    tKey: 'nav.calculators',
    items: [
      { id: 'date-calc', tKey: 'nav.dateCalc', Icon: ClockIcon },
      { id: 'age-calc', tKey: 'nav.ageCalc', Icon: ClockIcon },
      { id: 'hours-calc', tKey: 'nav.hoursCalc', Icon: ClockIcon },
      { id: 'week-number', tKey: 'nav.weekNumber', Icon: ClockIcon },
    ],
  },
  {
    tKey: 'nav.converters',
    items: [
      { id: 'tz-converter', tKey: 'nav.tzConverter', Icon: GlobeIcon },
      { id: 'unix-time', tKey: 'nav.unixTime', Icon: ClockIcon },
    ],
  },
  {
    tKey: 'nav.sunMoon',
    items: [
      { id: 'moon-phase', tKey: 'nav.moonPhase', Icon: MoonIcon },
    ],
  },
]

const MOBILE_MAIN: NavItem[] = [
  { id: 'clock', tKey: 'nav.clock', Icon: ClockIcon },
  { id: 'alarm', tKey: 'nav.alarmClock', Icon: AlarmIcon },
  { id: 'timer', tKey: 'nav.timer', Icon: TimerIcon },
  { id: 'stopwatch', tKey: 'nav.stopwatch', Icon: StopwatchIcon },
]

function ThemeButton({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const { t } = useTranslation()
  const cycle = () => {
    const order: Theme[] = ['oled', 'light', 'dynamic']
    setTheme(order[(order.indexOf(theme) + 1) % order.length])
  }
  const Icon = theme === 'oled' ? MoonIcon : theme === 'light' ? SunIcon : PaletteIcon
  return (
    <button onClick={cycle} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all opacity-70 hover:opacity-100" title="Theme">
      <Icon size={18} />
      <span className="hidden lg:inline">{t(`themes.${theme}`)}</span>
    </button>
  )
}

export function Navigation({ view, setView, onSettingsOpen, onFullscreen }: Props) {
  const { t } = useTranslation()
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
        {t(item.tKey)}
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
            const collapsed = collapsedSections.has(section.tKey)
            return (
              <div key={section.tKey}>
                <button
                  onClick={() => toggleSection(section.tKey)}
                  className={`flex items-center justify-between w-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold ${textMuted} hover:${isDark ? 'text-white' : 'text-zinc-900'} transition-colors`}
                >
                  {t(section.tKey)}
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
              {t('nav.legal')}
              <ChevronRightIcon size={12} className={`transition-transform ${collapsedSections.has('legal') ? '' : 'rotate-90'}`} />
            </button>
            {!collapsedSections.has('legal') && (
              <div className="mt-0.5 space-y-0.5">
                {navButton({ id: 'legal', tKey: 'nav.legalPage', Icon: SettingsIcon })}
              </div>
            )}
          </div>
        </div>

        <div className={`px-2 py-3 border-t ${border} space-y-0.5`}>
          {isWakeLockSupported() && (
            <button onClick={toggleWakeLock} className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all ${wakeLockOn ? 'text-green-400' : `${textSecondary} opacity-70 hover:opacity-100`}`}>
              <ScreenIcon size={18} /><span className="hidden lg:inline">{wakeLockOn ? t('common.screenOn') : t('common.keepAwake')}</span>
            </button>
          )}
          <button onClick={onFullscreen} className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all ${textSecondary} opacity-70 hover:opacity-100`}>
            <MaximizeIcon size={18} /><span className="hidden lg:inline">{t('common.fullscreen')}</span>
          </button>
          <ThemeButton theme={theme} setTheme={setTheme} />
          <button onClick={onSettingsOpen} className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all ${textSecondary} opacity-70 hover:opacity-100`}>
            <SettingsIcon size={18} /><span className="hidden lg:inline">{t('common.settings')}</span>
          </button>
        </div>

        <div className={`px-4 py-3 border-t ${border}`}>
          <a href="https://github.com/achrafthedev/Interval" target="_blank" rel="noopener noreferrer"
            className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${textMuted} hover:text-indigo-500`}>
            <GitHubIcon size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="hidden lg:flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">{t('common.openSource')} <HeartIcon size={12} className="text-red-400" /></span>
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
                <item.Icon size={20} /><span>{t(item.tKey)}</span>
              </button>
            )
          })}
          <button onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-xs font-medium transition-all ${isToolView ? 'text-indigo-500' : `${textSecondary} opacity-60`}`}>
            <SettingsIcon size={20} /><span>{t('common.more')}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Full Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className={`absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-t-3xl p-6 animate-slide-up`}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${textPrimary}`}>{t('nav.allTools')}</h2>
              <button onClick={() => setMobileMenuOpen(false)} className={textMuted}>&times;</button>
            </div>
            <div className="space-y-4">
              {NAV_SECTIONS.map((section) => (
                <div key={section.tKey}>
                  <p className={`text-[10px] uppercase tracking-wider font-semibold ${textMuted} px-3 mb-1`}>{t(section.tKey)}</p>
                  <div className="space-y-0.5">{section.items.map((item) => navButton(item, true))}</div>
                </div>
              ))}
              <div>
                <p className={`text-[10px] uppercase tracking-wider font-semibold ${textMuted} px-3 mb-1`}>{t('nav.legal')}</p>
                {navButton({ id: 'legal', tKey: 'nav.legalPage', Icon: SettingsIcon }, true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
