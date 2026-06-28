import { useState, useMemo } from 'react'
import { useTheme } from './ThemeProvider'
import { useTime } from '../hooks/useTime'
import { formatTime, formatDate, formatTimeNoSeconds, getTimezoneOffsetLabel, getTimeDelta, COMMON_TIMEZONES } from '../utils/time'
import { PlusIcon, TrashIcon, GlobeIcon, XIcon, SliderIcon } from './Icons'
import type { WorldClockZone } from '../types'

interface Props {
  zones: WorldClockZone[]
  setZones: (zones: WorldClockZone[]) => void
  use24Hour: boolean
  setUse24Hour: (v: boolean) => void
}

export function ClockView({ zones, setZones, use24Hour, setUse24Hour }: Props) {
  const now = useTime()
  const { textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [showPlanner, setShowPlanner] = useState(false)
  const [sliderOffset, setSliderOffset] = useState(0)

  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const localLabel = localTimezone.split('/').pop()?.replace(/_/g, ' ') || 'Local'

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

  return (
    <div className="flex flex-col items-center justify-start h-full overflow-y-auto px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      {/* Main Clock */}
      <div className="text-center mb-2 animate-fade-in">
        <div className={`time-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold ${textPrimary} tracking-wider`}>
          {formatTime(now, use24Hour)}
        </div>
        <div className={`mt-3 text-base sm:text-lg ${textSecondary} font-light`}>
          {formatDate(now)}
        </div>
        <div className={`mt-1 text-sm ${textMuted}`}>
          {localLabel}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-6 mb-8">
        <button
          onClick={() => setUse24Hour(!use24Hour)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border ${border} ${surface} ${textSecondary} transition-all hover:scale-105`}
        >
          {use24Hour ? '24H' : '12H'}
        </button>
        <button
          onClick={() => setShowPlanner(!showPlanner)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border ${border} ${surface} ${textSecondary} transition-all hover:scale-105 flex items-center gap-2`}
        >
          <SliderIcon size={16} />
          Meeting Planner
        </button>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white transition-all hover:bg-indigo-500 hover:scale-105 flex items-center gap-2"
        >
          <PlusIcon size={16} />
          Add City
        </button>
      </div>

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
    </div>
  )
}
