import { useState, useMemo } from 'react'
import { useTheme } from '../ThemeProvider'

export function HoursCalcView() {
  const { textPrimary, textMuted, surface, border, isDark } = useTheme()
  const [timeA, setTimeA] = useState('09:00')
  const [timeB, setTimeB] = useState('17:30')
  const [crossesMidnight, setCrossesMidnight] = useState(false)

  const result = useMemo(() => {
    const [h1, m1] = timeA.split(':').map(Number)
    const [h2, m2] = timeB.split(':').map(Number)
    let totalMinA = h1 * 60 + m1
    let totalMinB = h2 * 60 + m2

    if (crossesMidnight && totalMinB <= totalMinA) totalMinB += 1440

    let diff = totalMinB - totalMinA
    if (diff < 0) diff += 1440

    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    const decimal = (diff / 60).toFixed(2)

    return { hours, minutes, totalMinutes: diff, decimal }
  }, [timeA, timeB, crossesMidnight])

  const ic = `w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`

  return (
    <div className="flex flex-col items-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-lg">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>Hours Calculator</h1>
        <p className={`text-sm ${textMuted} mb-8`}>Calculate the time duration between two times.</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div><label className={`text-xs ${textMuted} block mb-1.5`}>Start Time</label><input type="time" value={timeA} onChange={(e) => setTimeA(e.target.value)} className={ic} /></div>
          <div><label className={`text-xs ${textMuted} block mb-1.5`}>End Time</label><input type="time" value={timeB} onChange={(e) => setTimeB(e.target.value)} className={ic} /></div>
        </div>

        <label className={`flex items-center gap-2 text-sm ${textMuted} mb-6 cursor-pointer`}>
          <input type="checkbox" checked={crossesMidnight} onChange={(e) => setCrossesMidnight(e.target.checked)} className="accent-indigo-600 w-4 h-4" />
          Crosses midnight (overnight shift)
        </label>

        <div className={`p-6 rounded-2xl border ${border} ${surface} text-center mb-6`}>
          <div className={`text-sm ${textMuted} mb-2`}>Duration</div>
          <div className={`time-display text-4xl font-bold ${textPrimary}`}>{result.hours}h {String(result.minutes).padStart(2, '0')}m</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { v: result.decimal, l: 'Decimal Hours' },
            { v: result.totalMinutes, l: 'Total Minutes' },
            { v: result.totalMinutes * 60, l: 'Total Seconds' },
          ].map(({ v, l }) => (
            <div key={l} className={`p-4 rounded-2xl border ${border} ${surface} text-center`}>
              <div className={`time-display text-xl font-bold ${textPrimary}`}>{v}</div>
              <div className={`text-xs mt-1 ${textMuted}`}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
