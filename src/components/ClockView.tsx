import { useState, useMemo, useEffect } from 'react'
import { useTheme } from './ThemeProvider'
import { useTime } from '../hooks/useTime'
import { AnalogClock } from './AnalogClock'
import { formatTime, formatDate, formatTimeNoSeconds, getTimezoneOffsetLabel, getTimeDelta, COMMON_TIMEZONES } from '../utils/time'
import { getGeolocation, getSunTimes, type GeoLocation } from '../utils/geolocation'
import { PlusIcon, TrashIcon, GlobeIcon, XIcon, SliderIcon, SunIcon, MoonIcon } from './Icons'
import type { WorldClockZone } from '../types'

interface Props {
  zones: WorldClockZone[]
  setZones: (zones: WorldClockZone[]) => void
  use24Hour: boolean
  setUse24Hour: (v: boolean) => void
  showAnalog: boolean
  countdownTarget: string
  setCountdownTarget: (v: string) => void
}

export function ClockView({ zones, setZones, use24Hour, setUse24Hour, showAnalog, countdownTarget, setCountdownTarget }: Props) {
  const now = useTime()
  const { textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [showPlanner, setShowPlanner] = useState(false)
  const [sliderOffset, setSliderOffset] = useState(0)
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [showCountdownSetup, setShowCountdownSetup] = useState(false)
  const [countdownLabel, setCountdownLabel] = useState('')
  const [countdownDateInput, setCountdownDateInput] = useState('')

  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const localLabel = geoLocation?.city || localTimezone.split('/').pop()?.replace(/_/g, ' ') || 'Local'

  const sunTimes = useMemo(() => {
    if (!geoLocation) return null
    return getSunTimes(geoLocation.latitude, geoLocation.longitude, now)
  }, [geoLocation, now.getMinutes()])

  const detectLocation = async () => {
    setGeoLoading(true)
    try {
      const loc = await getGeolocation()
      setGeoLocation(loc)
    } catch { /* permission denied or unavailable */ }
    setGeoLoading(false)
  }

  // Auto-detect location on first load
  useEffect(() => {
    const stored = localStorage.getItem('interval-geolocation')
    if (stored) {
      try { setGeoLocation(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (geoLocation) {
      localStorage.setItem('interval-geolocation', JSON.stringify(geoLocation))
    }
  }, [geoLocation])

  const filteredTimezones = useMemo(() => {
    const q = search.toLowerCase()
    return COMMON_TIMEZONES.filter(
      (tz) =>
        tz.label.toLowerCase().includes(q) ||
        tz.timezone.toLowerCase().includes(q)
    ).filter((tz) => !zones.some((z) => z.timezone === tz.timezone))
  }, [search, zones])

  const addZone = (label: string, timezone: string) => {
    setZones([...zones, { id: crypto.randomUUID(), label, timezone }])
    setShowAdd(false)
    setSearch('')
  }

  const removeZone = (id: string) => {
    setZones(zones.filter((z) => z.id !== id))
  }

  const plannerTime = useMemo(() => {
    return new Date(now.getTime() + sliderOffset * 60 * 60 * 1000)
  }, [now, sliderOffset])

  // Countdown to date
  const countdownData = useMemo(() => {
    if (!countdownTarget) return null
    try {
      const parsed = JSON.parse(countdownTarget) as { label: string; date: string }
      const target = new Date(parsed.date)
      const diff = target.getTime() - now.getTime()
      if (diff <= 0) return { ...parsed, remaining: 'Event has passed', days: 0, hours: 0, minutes: 0, seconds: 0, passed: true }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      return { ...parsed, remaining: '', days, hours, minutes, seconds, passed: false }
    } catch { return null }
  }, [countdownTarget, now.getSeconds()])

  const saveCountdown = () => {
    if (countdownDateInput) {
      setCountdownTarget(JSON.stringify({ label: countdownLabel || 'Event', date: countdownDateInput }))
    }
    setShowCountdownSetup(false)
  }

  return (
    <div className="flex flex-col items-center justify-start h-full overflow-y-auto px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      {/* Analog Clock */}
      {showAnalog && (
        <div className="mb-4 animate-fade-in">
          <AnalogClock date={now} size={240} />
        </div>
      )}

      {/* Main Digital Clock */}
      <div className="text-center mb-2 animate-fade-in">
        <div className={`time-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold ${textPrimary} tracking-wider`}>
          {formatTime(now, use24Hour)}
        </div>
        <div className={`mt-3 text-base sm:text-lg ${textSecondary} font-light`}>
          {formatDate(now)}
        </div>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className={`text-sm ${textMuted}`}>{localLabel}</span>
          {sunTimes && (
            <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
              <SunIcon size={12} /> {sunTimes.sunrise}
              <MoonIcon size={12} className="ml-1" /> {sunTimes.sunset}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-6 mb-6 flex-wrap justify-center">
        <button
          onClick={() => setUse24Hour(!use24Hour)}
          className={`px-3 py-2 rounded-xl text-sm font-medium border ${border} ${surface} ${textSecondary} transition-all hover:scale-105`}
        >
          {use24Hour ? '24H' : '12H'}
        </button>
        <button
          onClick={detectLocation}
          disabled={geoLoading}
          className={`px-3 py-2 rounded-xl text-sm font-medium border ${border} ${surface} ${textSecondary} transition-all hover:scale-105 flex items-center gap-1.5 ${geoLoading ? 'opacity-50' : ''}`}
        >
          <GlobeIcon size={14} />
          {geoLoading ? 'Detecting...' : geoLocation ? localLabel : 'Detect Location'}
        </button>
        <button
          onClick={() => setShowPlanner(!showPlanner)}
          className={`px-3 py-2 rounded-xl text-sm font-medium border ${border} ${surface} ${textSecondary} transition-all hover:scale-105 flex items-center gap-1.5`}
        >
          <SliderIcon size={14} />
          Meeting Planner
        </button>
        <button
          onClick={() => setShowCountdownSetup(true)}
          className={`px-3 py-2 rounded-xl text-sm font-medium border ${border} ${surface} ${textSecondary} transition-all hover:scale-105`}
        >
          Countdown
        </button>
        <button
          onClick={() => setShowAdd(true)}
          className="px-3 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white transition-all hover:bg-indigo-500 hover:scale-105 flex items-center gap-1.5"
        >
          <PlusIcon size={14} />
          Add City
        </button>
      </div>

      {/* Countdown to Date */}
      {countdownData && (
        <div className={`w-full max-w-2xl mb-6 p-5 rounded-2xl border ${border} ${surface} animate-slide-up`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold ${textPrimary}`}>{countdownData.label}</h3>
            <button onClick={() => setCountdownTarget('')} className={`text-xs ${textMuted} hover:text-red-400`}>Remove</button>
          </div>
          {countdownData.passed ? (
            <p className={`text-center text-sm ${textMuted}`}>This event has passed</p>
          ) : (
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { value: countdownData.days, label: 'Days' },
                { value: countdownData.hours, label: 'Hours' },
                { value: countdownData.minutes, label: 'Min' },
                { value: countdownData.seconds, label: 'Sec' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className={`time-display text-3xl sm:text-4xl font-bold ${textPrimary}`}>
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className={`text-xs mt-1 ${textMuted}`}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Meeting Planner Slider */}
      {showPlanner && zones.length > 0 && (
        <div className={`w-full max-w-2xl mb-6 p-5 rounded-2xl border ${border} ${surface} animate-slide-up`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold ${textPrimary}`}>Time Slider</h3>
            <span className={`text-xs ${textMuted}`}>
              {sliderOffset === 0 ? 'Now' : `${sliderOffset > 0 ? '+' : ''}${sliderOffset}h`}
            </span>
          </div>
          <input
            type="range"
            min={-12}
            max={12}
            step={0.5}
            value={sliderOffset}
            onChange={(e) => setSliderOffset(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 mb-4"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
              <span className={`text-sm font-medium ${textPrimary}`}>{localLabel}</span>
              <span className={`time-display text-sm ${textSecondary}`}>
                {formatTimeNoSeconds(plannerTime, use24Hour)}
              </span>
            </div>
            {zones.map((zone) => (
              <div key={zone.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                <span className={`text-sm font-medium ${textPrimary}`}>{zone.label}</span>
                <span className={`time-display text-sm ${textSecondary}`}>
                  {formatTimeNoSeconds(plannerTime, use24Hour, zone.timezone)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* World Clock Cards */}
      {zones.length > 0 && (
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`group relative flex items-center justify-between p-5 rounded-2xl border ${border} ${surface} transition-all hover:scale-[1.02]`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GlobeIcon size={14} className={textMuted} />
                  <span className={`text-sm font-medium ${textPrimary}`}>{zone.label}</span>
                </div>
                <div className={`time-display text-2xl font-semibold ${textPrimary}`}>
                  {formatTime(now, use24Hour, zone.timezone)}
                </div>
                <div className={`text-xs mt-1 ${textMuted}`}>
                  {getTimezoneOffsetLabel(zone.timezone)} &middot; {getTimeDelta(localTimezone, zone.timezone)}
                </div>
              </div>
              <button
                onClick={() => removeZone(zone.id)}
                className={`absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${textMuted} hover:text-red-400`}
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zone-to-Zone Distance Calculator */}
      {zones.length >= 2 && (
        <div className={`w-full max-w-2xl mt-6 p-5 rounded-2xl border ${border} ${surface} animate-fade-in`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3`}>Time Distances</h3>
          <div className="space-y-1.5">
            {zones.map((a, i) =>
              zones.slice(i + 1).map((b) => {
                const delta = getTimeDelta(a.timezone, b.timezone)
                return (
                  <div key={`${a.id}-${b.id}`} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                    <span className={textSecondary}>
                      <span className={`font-medium ${textPrimary}`}>{a.label}</span>
                      {' vs '}
                      <span className={`font-medium ${textPrimary}`}>{b.label}</span>
                    </span>
                    <span className={`text-xs font-medium ${textMuted}`}>{delta}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {zones.length === 0 && (
        <div className={`text-center mt-8 ${textMuted}`}>
          <GlobeIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Add cities to compare time zones</p>
        </div>
      )}

      {/* Add Timezone Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div
            className={`w-full sm:max-w-md max-h-[70vh] ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${textPrimary}`}>Add City</h2>
              <button onClick={() => setShowAdd(false)} className={`p-1 rounded-lg ${textMuted}`}>
                <XIcon size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm mb-3 outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            <div className="overflow-y-auto max-h-[45vh] space-y-1">
              {filteredTimezones.map((tz) => (
                <button
                  key={tz.timezone}
                  onClick={() => addZone(tz.label, tz.timezone)}
                  className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-zinc-100'} ${textPrimary}`}
                >
                  <span className="font-medium">{tz.label}</span>
                  <span className={`text-xs ${textMuted}`}>{tz.timezone}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Countdown Setup Modal */}
      {showCountdownSetup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCountdownSetup(false)}>
          <div
            className={`w-full sm:max-w-md ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${textPrimary}`}>Countdown to Date</h2>
              <button onClick={() => setShowCountdownSetup(false)} className={textMuted}><XIcon size={20} /></button>
            </div>
            <div className="mb-4">
              <label className={`text-xs font-medium ${textMuted} block mb-1.5`}>Event Name</label>
              <input
                type="text"
                placeholder="e.g. Birthday, New Year..."
                value={countdownLabel}
                onChange={(e) => setCountdownLabel(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <div className="mb-6">
              <label className={`text-xs font-medium ${textMuted} block mb-1.5`}>Date & Time</label>
              <input
                type="datetime-local"
                value={countdownDateInput}
                onChange={(e) => setCountdownDateInput(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
            <button
              onClick={saveCountdown}
              disabled={!countdownDateInput}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all disabled:opacity-40"
            >
              Start Countdown
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
