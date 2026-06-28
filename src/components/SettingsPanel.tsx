import { useTranslation } from 'react-i18next'
import { useTheme } from './ThemeProvider'
import { XIcon, DownloadIcon, SunIcon, MoonIcon, PaletteIcon, GitHubIcon, HeartIcon, StarIcon } from './Icons'
import { LANGUAGES, changeLanguage } from '../i18n'
import type { Theme } from '../types'

interface Props {
  show: boolean
  onClose: () => void
  use24Hour: boolean
  setUse24Hour: (v: boolean) => void
  showAnalog: boolean
  setShowAnalog: (v: boolean) => void
  showSeconds: boolean
  setShowSeconds: (v: boolean) => void
}

export function SettingsPanel({ show, onClose, use24Hour, setUse24Hour, showAnalog, setShowAnalog, showSeconds, setShowSeconds }: Props) {
  const { t, i18n } = useTranslation()
  const { theme, setTheme, textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()

  if (!show) return null

  const exportData = () => {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('interval-')) {
        try { data[key] = JSON.parse(localStorage.getItem(key)!) } catch { data[key] = localStorage.getItem(key) }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interval-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text) as Record<string, unknown>
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith('interval-')) {
            localStorage.setItem(key, JSON.stringify(value))
          }
        })
        window.location.reload()
      } catch { /* invalid file */ }
    }
    input.click()
  }

  const themes: { id: Theme; label: string; Icon: typeof SunIcon; desc: string }[] = [
    { id: 'oled', label: t('themes.oled'), Icon: MoonIcon, desc: t('themes.oledDesc') },
    { id: 'light', label: t('themes.light'), Icon: SunIcon, desc: t('themes.lightDesc') },
    { id: 'dynamic', label: t('themes.dynamic'), Icon: PaletteIcon, desc: t('themes.dynamicDesc') },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full sm:max-w-md max-h-[85vh] overflow-y-auto ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-semibold ${textPrimary}`}>{t('settings.title')}</h2>
          <button onClick={onClose} className={textMuted}><XIcon size={20} /></button>
        </div>

        {/* Language */}
        <div className="mb-6">
          <label className={`text-xs font-medium ${textMuted} block mb-3 uppercase tracking-wider`}>{t('settings.language')}</label>
          <div className="grid grid-cols-2 gap-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  i18n.language === lang.code
                    ? 'bg-indigo-600 text-white'
                    : `${isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'} ${textPrimary}`
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span className="font-medium truncate">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <label className={`text-xs font-medium ${textMuted} block mb-3 uppercase tracking-wider`}>{t('settings.theme')}</label>
          <div className="space-y-2">
            {themes.map(({ id, label, Icon, desc }) => (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  theme === id
                    ? 'bg-indigo-600 text-white'
                    : `${isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'} ${textPrimary}`
                }`}
              >
                <Icon size={18} />
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className={`text-xs ${theme === id ? 'text-white/70' : textMuted}`}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Display */}
        <div className="mb-6">
          <label className={`text-xs font-medium ${textMuted} block mb-3 uppercase tracking-wider`}>{t('settings.display')}</label>
          <div className="space-y-3">
            <Toggle label={t('settings.format24h')} desc={t('settings.format24hDesc')} value={use24Hour} onChange={setUse24Hour} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} border={border} />
            <Toggle label={t('settings.analogClock')} desc={t('settings.analogClockDesc')} value={showAnalog} onChange={setShowAnalog} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} border={border} />
            <Toggle label={t('settings.showSeconds')} desc={t('settings.showSecondsDesc')} value={showSeconds} onChange={setShowSeconds} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} border={border} />
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mb-6">
          <label className={`text-xs font-medium ${textMuted} block mb-3 uppercase tracking-wider`}>{t('settings.shortcuts')}</label>
          <div className={`space-y-1.5 text-sm ${textSecondary}`}>
            {[
              ['1', t('settings.clockView')], ['2', t('settings.alarmView')], ['3', t('settings.timerView')], ['4', t('settings.stopwatchView')],
              ['F', t('settings.toggleFullscreen')], ['T', t('settings.cycleTheme')],
            ].map(([key, action]) => (
              <div key={key} className="flex items-center justify-between px-3 py-1.5">
                <span>{action}</span>
                <kbd className={`px-2 py-0.5 rounded text-xs font-mono border ${border} ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>{key}</kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="mb-4">
          <label className={`text-xs font-medium ${textMuted} block mb-3 uppercase tracking-wider`}>{t('settings.data')}</label>
          <div className="flex gap-2">
            <button
              onClick={exportData}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border ${border} ${textSecondary} hover:text-indigo-500 transition-all flex items-center justify-center gap-2`}
            >
              <DownloadIcon size={16} />
              {t('settings.exportBackup')}
            </button>
            <button
              onClick={importData}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border ${border} ${textSecondary} hover:text-indigo-500 transition-all flex items-center justify-center gap-2`}
            >
              {t('settings.importBackup')}
            </button>
          </div>
        </div>

        {/* About */}
        <div className={`mt-6 pt-4 border-t ${border} text-center`}>
          <a
            href="https://github.com/achrafthedev/Interval"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border ${border} ${textSecondary} hover:text-indigo-500 hover:border-indigo-500/50 transition-all`}
          >
            <GitHubIcon size={18} />
            {t('settings.starOnGithub')}
            <StarIcon size={14} />
          </a>
          <p className={`text-[10px] ${textMuted} mt-3 flex items-center justify-center gap-1`}>
            {t('settings.version')}
          </p>
        </div>
      </div>
    </div>
  )
}

function Toggle({ label, desc, value, onChange, isDark, textPrimary, textMuted, border }: {
  label: string; desc: string; value: boolean; onChange: (v: boolean) => void
  isDark: boolean; textPrimary: string; textMuted: string; border: string
}) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${border}`}>
      <div>
        <p className={`text-sm font-medium ${textPrimary}`}>{label}</p>
        <p className={`text-xs ${textMuted}`}>{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition-all ${
          value ? 'bg-indigo-600' : isDark ? 'bg-zinc-700' : 'bg-zinc-300'
        }`}
      >
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow ${
          value ? 'ltr:left-6 rtl:right-6' : 'ltr:left-1 rtl:right-1'
        }`} />
      </button>
    </div>
  )
}
