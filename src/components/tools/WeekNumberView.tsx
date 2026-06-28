import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../ThemeProvider'

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 864e5 + 1) / 7)
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 864e5)
}

export function WeekNumberView() {
  const { t } = useTranslation()
  const { textPrimary, textMuted, surface, border, isDark } = useTheme()
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10))

  const result = useMemo(() => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    const week = getISOWeek(d)
    const dayOfYear = getDayOfYear(d)
    const quarter = Math.ceil((d.getMonth() + 1) / 3)
    const isLeap = (d.getFullYear() % 4 === 0 && d.getFullYear() % 100 !== 0) || d.getFullYear() % 400 === 0
    const daysInYear = isLeap ? 366 : 365
    const daysLeft = daysInYear - dayOfYear
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })

    return { week, dayOfYear, quarter, isLeap, daysInYear, daysLeft, dayName }
  }, [dateStr])

  const ic = `w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`

  return (
    <div className="flex flex-col items-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-lg">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>{t('weekNumber.title')}</h1>
        <p className={`text-sm ${textMuted} mb-8`}>{t('weekNumber.subtitle')}</p>

        <div className="mb-6">
          <label className={`text-xs ${textMuted} block mb-1.5`}>{t('weekNumber.date')}</label>
          <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={ic} />
        </div>

        {result && (
          <>
            <div className={`p-6 rounded-2xl border ${border} ${surface} text-center mb-6`}>
              <div className={`text-sm ${textMuted} mb-2`}>{t('weekNumber.isoWeek')}</div>
              <div className={`time-display text-6xl font-bold ${textPrimary}`}>{result.week}</div>
              <div className={`text-sm ${textMuted} mt-2`}>{result.dayName}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { v: result.dayOfYear, l: t('weekNumber.dayOfYear') },
                { v: `Q${result.quarter}`, l: t('weekNumber.quarter') },
                { v: result.daysLeft, l: t('weekNumber.daysLeft') },
                { v: result.daysInYear, l: t('weekNumber.daysInYear') },
                { v: result.isLeap ? t('common.yes') : t('common.no'), l: t('weekNumber.leapYear') },
                { v: result.week, l: t('weekNumber.weekOf52') },
              ].map(({ v, l }) => (
                <div key={l} className={`p-4 rounded-2xl border ${border} ${surface} text-center`}>
                  <div className={`time-display text-xl font-bold ${textPrimary}`}>{v}</div>
                  <div className={`text-xs mt-1 ${textMuted}`}>{l}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
