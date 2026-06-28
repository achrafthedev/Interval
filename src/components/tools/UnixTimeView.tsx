import { useState } from 'react'
import { useTheme } from '../ThemeProvider'
import { useTime } from '../../hooks/useTime'

export function UnixTimeView() {
  const now = useTime()
  const { textPrimary, textMuted, surface, border, isDark } = useTheme()
  const [inputTs, setInputTs] = useState('')
  const [inputDate, setInputDate] = useState('')

  const currentUnix = Math.floor(now.getTime() / 1000)
  const currentMs = now.getTime()

  const tsToDate = inputTs ? new Date(Number(inputTs) * (inputTs.length > 10 ? 1 : 1000)) : null
  const dateToTs = inputDate ? Math.floor(new Date(inputDate).getTime() / 1000) : null

  const ic = `w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`

  return (
    <div className="flex flex-col items-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-lg">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>Unix Time Converter</h1>
        <p className={`text-sm ${textMuted} mb-8`}>Convert between Unix timestamps and human-readable dates.</p>

        {/* Current */}
        <div className={`p-6 rounded-2xl border ${border} ${surface} text-center mb-6`}>
          <div className={`text-xs ${textMuted} mb-2`}>Current Unix Timestamp</div>
          <div className={`time-display text-4xl font-bold ${textPrimary} cursor-pointer`} onClick={() => navigator.clipboard?.writeText(String(currentUnix))} title="Click to copy">
            {currentUnix}
          </div>
          <div className={`text-xs ${textMuted} mt-2`}>{currentMs} ms &middot; Click to copy</div>
        </div>

        {/* Timestamp → Date */}
        <div className={`p-5 rounded-2xl border ${border} ${surface} mb-4`}>
          <label className={`text-xs font-medium ${textMuted} block mb-2`}>Timestamp → Date</label>
          <input type="number" placeholder="e.g. 1719561600" value={inputTs} onChange={(e) => setInputTs(e.target.value)} className={ic} />
          {tsToDate && !isNaN(tsToDate.getTime()) && (
            <div className={`mt-3 text-sm ${textPrimary}`}>
              <p>{tsToDate.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
              <p className={`text-xs ${textMuted} mt-1`}>ISO: {tsToDate.toISOString()}</p>
            </div>
          )}
        </div>

        {/* Date → Timestamp */}
        <div className={`p-5 rounded-2xl border ${border} ${surface}`}>
          <label className={`text-xs font-medium ${textMuted} block mb-2`}>Date → Timestamp</label>
          <input type="datetime-local" value={inputDate} onChange={(e) => setInputDate(e.target.value)} className={ic} />
          {dateToTs !== null && !isNaN(dateToTs) && (
            <div className={`mt-3 text-sm ${textPrimary}`}>
              <p className="time-display text-2xl font-bold cursor-pointer" onClick={() => navigator.clipboard?.writeText(String(dateToTs))} title="Click to copy">{dateToTs}</p>
              <p className={`text-xs ${textMuted} mt-1`}>{dateToTs * 1000} ms &middot; Click to copy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
