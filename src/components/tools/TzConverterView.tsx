import { useState, useMemo } from 'react'
import { useTheme } from '../ThemeProvider'
import { ALL_TIMEZONES, formatTimeNoSeconds, getTimezoneOffsetLabel } from '../../utils/time'

export function TzConverterView() {
  const { textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const [fromTz, setFromTz] = useState(localTz)
  const [toTz, setToTz] = useState('America/New_York')
  const [inputTime, setInputTime] = useState(() => { const n = new Date(); return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}` })
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().slice(0, 10))

  const converted = useMemo(() => {
    const [h, m] = inputTime.split(':').map(Number)
    const base = new Date(`${inputDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)

    const fromStr = base.toLocaleString('en-US', { timeZone: fromTz })
    const fromDate = new Date(fromStr)
    const utcStr = base.toLocaleString('en-US', { timeZone: 'UTC' })
    const utcDate = new Date(utcStr)
    const offset = fromDate.getTime() - utcDate.getTime()
    const utcTime = new Date(base.getTime() - offset)

    const resultStr = utcTime.toLocaleString('en-US', { timeZone: toTz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    const resultDate = utcTime.toLocaleDateString('en-US', { timeZone: toTz, weekday: 'short', month: 'short', day: 'numeric' })

    return { time: resultStr, date: resultDate }
  }, [fromTz, toTz, inputTime, inputDate])

  const ic = `w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`
  const tzOptions = ALL_TIMEZONES.map((tz) => tz.timezone)

  return (
    <div className="flex flex-col items-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-lg">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>Time Zone Converter</h1>
        <p className={`text-sm ${textMuted} mb-8`}>Convert time between any two timezones worldwide.</p>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={`text-xs ${textMuted} block mb-1.5`}>Time</label><input type="time" value={inputTime} onChange={(e) => setInputTime(e.target.value)} className={ic} /></div>
            <div><label className={`text-xs ${textMuted} block mb-1.5`}>Date</label><input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} className={ic} /></div>
          </div>

          <div>
            <label className={`text-xs ${textMuted} block mb-1.5`}>From <span className="opacity-50">({getTimezoneOffsetLabel(fromTz)})</span></label>
            <select value={fromTz} onChange={(e) => setFromTz(e.target.value)} className={ic}>
              {tzOptions.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <div className="flex justify-center">
            <button onClick={() => { setFromTz(toTz); setToTz(fromTz) }} className={`p-2 rounded-xl border ${border} ${textMuted} hover:text-indigo-500 transition-all text-xs`}>⇅ Swap</button>
          </div>

          <div>
            <label className={`text-xs ${textMuted} block mb-1.5`}>To <span className="opacity-50">({getTimezoneOffsetLabel(toTz)})</span></label>
            <select value={toTz} onChange={(e) => setToTz(e.target.value)} className={ic}>
              {tzOptions.map((tz) => <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border ${border} ${surface} text-center`}>
          <div className={`text-xs ${textMuted} mb-2`}>Converted Time</div>
          <div className={`time-display text-4xl font-bold ${textPrimary}`}>{converted.time}</div>
          <div className={`text-sm ${textMuted} mt-2`}>{converted.date}</div>
        </div>
      </div>
    </div>
  )
}
