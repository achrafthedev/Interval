import { useTranslation } from 'react-i18next'
import { useTheme } from '../ThemeProvider'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { PlusIcon, ResetIcon } from '../Icons'

export function CounterView() {
  const { t } = useTranslation()
  const { textPrimary, textMuted, surface, border, isDark } = useTheme()
  const [count, setCount] = useLocalStorage('interval-counter', 0)
  const [step, setStep] = useLocalStorage('interval-counter-step', 1)

  const ic = `px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-md text-center">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>{t('counter.title')}</h1>
        <p className={`text-sm ${textMuted} mb-10`}>{t('counter.subtitle')}</p>

        <div className={`time-display text-7xl sm:text-8xl font-bold ${textPrimary} mb-10 tabular-nums select-all`}>
          {count}
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          <button onClick={() => setCount(count - step)}
            className={`w-16 h-16 rounded-2xl text-2xl font-bold border ${border} ${surface} ${textPrimary} hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all active:scale-95`}>
            −
          </button>
          <button onClick={() => setCount(count + step)}
            className="w-20 h-20 rounded-2xl text-3xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
            +
          </button>
          <button onClick={() => setCount(0)}
            className={`w-16 h-16 rounded-2xl border ${border} ${surface} ${textMuted} hover:text-indigo-500 transition-all active:scale-95 flex items-center justify-center`}>
            <ResetIcon size={22} />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={`text-xs ${textMuted}`}>{t('counter.step')}</span>
          {[1, 5, 10, 25, 100].map((s) => (
            <button key={s} onClick={() => setStep(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${step === s ? 'bg-indigo-600 text-white' : `border ${border} ${textMuted}`}`}>
              {s}
            </button>
          ))}
          <input type="number" min={1} value={step} onChange={(e) => setStep(Math.max(1, parseInt(e.target.value) || 1))}
            className={`w-16 text-center ${ic}`} />
        </div>
      </div>
    </div>
  )
}
