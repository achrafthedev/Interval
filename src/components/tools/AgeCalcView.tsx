import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../ThemeProvider'

export function AgeCalcView() {
  const { t } = useTranslation()
  const { textPrimary, textMuted, surface, border, isDark } = useTheme()
  const [birthdate, setBirthdate] = useState('2000-01-01')

  const result = useMemo(() => {
    const birth = new Date(birthdate)
    const now = new Date()
    if (isNaN(birth.getTime())) return null

    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    let days = now.getDate() - birth.getDate()

    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate() }
    if (months < 0) { years--; months += 12 }

    const totalDays = Math.floor((now.getTime() - birth.getTime()) / 864e5)
    const totalWeeks = Math.floor(totalDays / 7)
    const totalMonths = years * 12 + months
    const totalHours = totalDays * 24
    const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday <= now) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1)
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / 864e5)

    return { years, months, days, totalDays, totalWeeks, totalMonths, totalHours, daysUntilBirthday }
  }, [birthdate])

  const ic = `w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`

  return (
    <div className="flex flex-col items-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-lg">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>{t('ageCalc.title')}</h1>
        <p className={`text-sm ${textMuted} mb-8`}>{t('ageCalc.subtitle')}</p>

        <div className="mb-6">
          <label className={`text-xs ${textMuted} block mb-1.5`}>{t('ageCalc.dateOfBirth')}</label>
          <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className={ic} />
        </div>

        {result && (
          <>
            <div className={`p-6 rounded-2xl border ${border} ${surface} text-center mb-6`}>
              <div className={`text-sm ${textMuted} mb-2`}>{t('ageCalc.yourAge')}</div>
              <div className={`text-3xl font-bold ${textPrimary}`}>
                {result.years} <span className="text-lg font-normal">{t('ageCalc.years')}</span>{' '}
                {result.months} <span className="text-lg font-normal">{t('ageCalc.monthsLabel')}</span>{' '}
                {result.days} <span className="text-lg font-normal">{t('ageCalc.daysLabel')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { v: result.totalDays.toLocaleString(), l: t('ageCalc.totalDays') },
                { v: result.totalWeeks.toLocaleString(), l: t('ageCalc.totalWeeks') },
                { v: result.totalMonths.toLocaleString(), l: t('ageCalc.totalMonths') },
                { v: result.totalHours.toLocaleString(), l: t('ageCalc.totalHours') },
                { v: (result.totalDays * 24 * 60).toLocaleString(), l: t('ageCalc.totalMinutes') },
                { v: result.daysUntilBirthday, l: t('ageCalc.daysToBirthday') },
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
