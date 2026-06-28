import { useTheme } from './ThemeProvider'
import { XIcon, DownloadIcon, SunIcon, MoonIcon, PaletteIcon, GitHubIcon, HeartIcon, StarIcon } from './Icons'
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
    { id: 'oled', label: 'OLED Black', Icon: MoonIcon, desc: 'Pure black for AMOLED screens' },
    { id: 'light', label: 'Light', Icon: SunIcon, desc: 'Clean white interface' },
    { id: 'dynamic', label: 'Dynamic', Icon: PaletteIcon, desc: 'Changes with time of day' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full sm:max-w-md max-h-[85vh] overflow-y-auto ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-semibold ${textPrimary}`}>Settings</h2>
          <button onClick={onClose} className={textMuted}><XIcon size={20} /></button>
        </div>

        {/* Theme */}
        <div className="mb-6">
          <label className={`text-xs font-medium ${textMuted} block mb-3 uppercase tracking-wider`}>Theme</label>
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
          <label className={`text-xs font-medium ${textMuted} block mb-3 uppercase tracking-wider`}>Display</label>
          <div className="space-y-3">
            <Toggle label="24-Hour Format" desc="Use 24-hour time display" value={use24Hour} onChange={setUse24Hour} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} border={border} />
            <Toggle label="Analog Clock" desc="Show analog clock face on main view" value={showAnalog} onChange={setShowAnalog} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} border={border} />
            <Toggle label="Show Seconds" desc="Display seconds on world clock cards" value={showSeconds} onChange={setShowSeconds} isDark={isDark} textPrimary={textPrimary} textMuted={textMuted} border={border} />
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mb-6">
          <label className={`text-xs font-medium ${textMuted} block mb-3 uppercase tracking-wider`}>Keyboard Shortcuts</label>
          <div className={`space-y-1.5 text-sm ${textSecondary}`}>
            {[
              ['1', 'Clock'], ['2', 'Alarm'], ['3', 'Timer'], ['4', 'Stopwatch'],
              ['F', 'Fullscreen'], ['T', 'Cycle theme'],
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
          <label className={`text-xs font-medium ${textMuted} block mb-3 uppercase tracking-wider`}>Data</label>
          <div className="flex gap-2">
            <button
              onClick={exportData}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border ${border} ${textSecondary} hover:text-indigo-500 transition-all flex items-center justify-center gap-2`}
            >
              <DownloadIcon size={16} />
              Export Backup
            </button>
            <button
              onClick={importData}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium border ${border} ${textSecondary} hover:text-indigo-500 transition-all flex items-center justify-center gap-2`}
            >
              Import Backup
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
            Star on GitHub
            <StarIcon size={14} />
          </a>
          <p className={`text-[10px] ${textMuted} mt-3 flex items-center justify-center gap-1`}>
            Interval v1.0 — Built with <HeartIcon size={10} className="text-red-400" /> by
            <a href="https://github.com/achrafthedev" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">achrafthedev</a>
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
          value ? 'left-6' : 'left-1'
        }`} />
      </button>
    </div>
  )
}
