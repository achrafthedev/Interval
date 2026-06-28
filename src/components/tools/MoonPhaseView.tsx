import { useState, useMemo } from 'react'
import { useTheme } from '../ThemeProvider'

function getMoonPhase(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  let c = 0, e = 0, jd = 0, b = 0
  if (month < 3) { c = year - 1; e = month + 12 } else { c = year; e = month }
  jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5
  b = Math.floor(jd - 2451550.1) / 29.530588853

  const phase = b - Math.floor(b)
  const age = phase * 29.53

  let name = ''
  let emoji = ''
  if (phase < 0.0625) { name = 'New Moon'; emoji = '🌑' }
  else if (phase < 0.1875) { name = 'Waxing Crescent'; emoji = '🌒' }
  else if (phase < 0.3125) { name = 'First Quarter'; emoji = '🌓' }
  else if (phase < 0.4375) { name = 'Waxing Gibbous'; emoji = '🌔' }
  else if (phase < 0.5625) { name = 'Full Moon'; emoji = '🌕' }
  else if (phase < 0.6875) { name = 'Waning Gibbous'; emoji = '🌖' }
  else if (phase < 0.8125) { name = 'Last Quarter'; emoji = '🌗' }
  else if (phase < 0.9375) { name = 'Waning Crescent'; emoji = '🌘' }
  else { name = 'New Moon'; emoji = '🌑' }

  const illumination = Math.round(((1 - Math.cos(phase * 2 * Math.PI)) / 2) * 100)

  const nextNew = Math.ceil((1 - phase) * 29.53)
  const nextFull = phase < 0.5 ? Math.ceil((0.5 - phase) * 29.53) : Math.ceil((1.5 - phase) * 29.53)

  return { name, emoji, age: Math.round(age * 10) / 10, illumination, phase: Math.round(phase * 1000) / 1000, nextNew, nextFull }
}

export function MoonPhaseView() {
  const { textPrimary, textMuted, surface, border, isDark } = useTheme()
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10))

  const moon = useMemo(() => getMoonPhase(new Date(dateStr)), [dateStr])

  const ic = `w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`

  return (
    <div className="flex flex-col items-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-lg text-center">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-1`}>Moon Phase</h1>
        <p className={`text-sm ${textMuted} mb-8`}>View the current moon phase and illumination for any date.</p>

        <div className="max-w-xs mx-auto mb-8">
          <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={ic} />
        </div>

        <div className="text-8xl mb-4">{moon.emoji}</div>
        <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>{moon.name}</h2>

        {/* Illumination bar */}
        <div className={`w-48 h-2 mx-auto rounded-full ${isDark ? 'bg-white/10' : 'bg-zinc-200'} mb-8`}>
          <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${moon.illumination}%` }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {[
            { v: `${moon.illumination}%`, l: 'Illumination' },
            { v: `${moon.age} days`, l: 'Moon Age' },
            { v: `${moon.nextNew}d`, l: 'Next New Moon' },
            { v: `${moon.nextFull}d`, l: 'Next Full Moon' },
          ].map(({ v, l }) => (
            <div key={l} className={`p-4 rounded-2xl border ${border} ${surface}`}>
              <div className={`text-lg font-bold ${textPrimary}`}>{v}</div>
              <div className={`text-xs mt-1 ${textMuted}`}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
