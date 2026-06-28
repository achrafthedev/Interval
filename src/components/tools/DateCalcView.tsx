import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../ThemeProvider'

export function DateCalcView() {
  const { t } = useTranslation()
  const { textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()
  const [mode, setMode] = useState<'between' | 'add'>('between')
  const [dateA, setDateA] = useState(() => new Date().toISOString().slice(0, 10))
  const [dateB, setDateB] = useState(() => new Date().toISOString().slice(0, 10))
  const [addDays, setAddDays] = useState(30)
  const [addDir, setAddDir] = useState<'add' | 'subtract'>('add')

  const between = useMemo(() => {
    const a = new Date(dateA), b = new Date(dateB)
    const ms = Math.abs(b.getTime() - a.getTime())
    const days = Math.floor(ms / 864e5)
    return { days, weeks: Math.floor(days / 7), months: Math.abs((b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth()), hours: Math.floor(ms / 36e5), minutes: Math.floor(ms / 6e4) }
  }, [dateA, dateB])

  const addResult = useMemo(() => {
    const d = new Date(dateA)
    d.setDate(d.getDate() + (addDir === 'add' ? addDays : -addDays))
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }, [dateA, addDays, addDir])

  const ic = `w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`

  return (
    <div className="flex flex-col items-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-lg">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>{t('dateCalc.title')}</h1>
        <p className={`text-sm ${textMuted} mb-8`}>{t('dateCalc.subtitle')}</p>

        <div className={`flex rounded-xl border ${border} p-1 mb-6`}>
          {(['between', 'add'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-indigo-600 text-white' : textSecondary}`}>
              {m === 'between' ? t('dateCalc.daysBetween') : t('dateCalc.addSubtract')}
            </button>
          ))}
        </div>

        {mode === 'between' ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div><label className={`text-xs ${textMuted} block mb-1.5`}>{t('dateCalc.startDate')}</label><input type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} className={ic} /></div>
              <div><label className={`text-xs ${textMuted} block mb-1.5`}>{t('dateCalc.endDate')}</label><input type="date" value={dateB} onChange={(e) => setDateB(e.target.value)} className={ic} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ v: between.days, l: t('dateCalc.days') }, { v: between.weeks, l: t('dateCalc.weeks') }, { v: between.months, l: t('dateCalc.months') }, { v: between.hours.toLocaleString(), l: t('dateCalc.hours') }, { v: between.minutes.toLocaleString(), l: t('dateCalc.minutes') }, { v: (between.days * 24 * 3600).toLocaleString(), l: t('dateCalc.seconds') }].map(({ v, l }) => (
                <div key={l} className={`p-4 rounded-2xl border ${border} ${surface} text-center`}>
                  <div className={`time-display text-xl font-bold ${textPrimary}`}>{v}</div>
                  <div className={`text-xs mt-1 ${textMuted}`}>{l}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <div><label className={`text-xs ${textMuted} block mb-1.5`}>{t('dateCalc.startDate')}</label><input type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} className={ic} /></div>
              <div className="flex gap-3">
                <div className="flex-1"><label className={`text-xs ${textMuted} block mb-1.5`}>{t('dateCalc.days')}</label><input type="number" min={0} value={addDays} onChange={(e) => setAddDays(parseInt(e.target.value) || 0)} className={ic} /></div>
                <div><label className={`text-xs ${textMuted} block mb-1.5`}>{t('dateCalc.direction')}</label>
                  <select value={addDir} onChange={(e) => setAddDir(e.target.value as any)} className={ic}><option value="add">{t('dateCalc.addPlus')}</option><option value="subtract">{t('dateCalc.subtractMinus')}</option></select>
                </div>
              </div>
            </div>
            <div className={`p-6 rounded-2xl border ${border} ${surface} text-center`}>
              <div className={`text-xs ${textMuted} mb-2`}>{t('common.result')}</div>
              <div className={`text-lg font-semibold ${textPrimary}`}>{addResult}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
