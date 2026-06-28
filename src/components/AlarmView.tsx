import { useState, useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'
import { useTime } from '../hooks/useTime'
import { PlusIcon, TrashIcon, VolumeIcon, XIcon, PlayIcon, PauseIcon } from './Icons'
import { SOUND_LIBRARY, getSoundById, type SoundHandle } from '../utils/sounds'
import { playCustomAudio, stopCustomAudio } from '../utils/audio'
import { sendNotification, requestNotificationPermission } from '../utils/notifications'
import type { Alarm } from '../types'

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const DAY_LABELS: Record<string, string> = {
  mon: 'M', tue: 'T', wed: 'W', thu: 'T', fri: 'F', sat: 'S', sun: 'S',
}

const SNOOZE_MINUTES = 5

interface Props {
  alarms: Alarm[]
  setAlarms: (alarms: Alarm[]) => void
}

export function AlarmView({ alarms, setAlarms }: Props) {
  const now = useTime()
  const { textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()
  const [showAdd, setShowAdd] = useState(false)
  const [editAlarm, setEditAlarm] = useState<Alarm | null>(null)
  const [ringingAlarmId, setRingingAlarmId] = useState<string | null>(null)
  const [previewHandle, setPreviewHandle] = useState<SoundHandle | null>(null)
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const firedRef = useRef<Set<string>>(new Set())
  const activeHandleRef = useRef<SoundHandle | null>(null)
  const snoozeTimers = useRef<Map<string, number>>(new Map())

  const checkAlarms = useRef(() => {})
  checkAlarms.current = () => {
    const d = new Date()
    const currentTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    const dayIndex = (d.getDay() + 6) % 7
    const dayKey = DAYS[dayIndex]

    alarms.forEach((alarm) => {
      if (!alarm.enabled) return
      if (alarm.time !== currentTime) {
        firedRef.current.delete(alarm.id)
        return
      }
      if (firedRef.current.has(alarm.id)) return
      if (alarm.repeat.length > 0 && !alarm.repeat.includes(dayKey)) return

      firedRef.current.add(alarm.id)
      triggerAlarm(alarm)
    })
  }

  function triggerAlarm(alarm: Alarm) {
    setRingingAlarmId(alarm.id)

    if (alarm.soundUrl) {
      playCustomAudio(alarm.soundUrl, alarm.smartWake)
    } else {
      const sound = getSoundById(alarm.soundId || 'gentle-chime')
      if (sound) {
        activeHandleRef.current = sound.play({ smartWake: alarm.smartWake, volume: 0.7 })
      }
    }

    // Vibrate on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400])
    }

    sendNotification('Interval Alarm', alarm.label || `Alarm - ${alarm.time}`)
  }

  useEffect(() => {
    checkAlarms.current()
  }, [now.getMinutes(), alarms])

  useEffect(() => {
    const id = setInterval(() => checkAlarms.current(), 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  const dismissAlarm = () => {
    stopCustomAudio()
    activeHandleRef.current?.stop()
    activeHandleRef.current = null
    if ('vibrate' in navigator) navigator.vibrate(0)
    setRingingAlarmId(null)
  }

  const snoozeAlarm = () => {
    const alarmId = ringingAlarmId
    dismissAlarm()

    if (alarmId) {
      const timeout = window.setTimeout(() => {
        const alarm = alarms.find((a) => a.id === alarmId)
        if (alarm) triggerAlarm(alarm)
        snoozeTimers.current.delete(alarmId)
      }, SNOOZE_MINUTES * 60 * 1000)
      snoozeTimers.current.set(alarmId, timeout)
    }
  }

  useEffect(() => {
    return () => {
      snoozeTimers.current.forEach((t) => clearTimeout(t))
    }
  }, [])

  const previewSound = (soundId: string) => {
    if (previewingId === soundId) {
      previewHandle?.stop()
      setPreviewHandle(null)
      setPreviewingId(null)
      return
    }

    previewHandle?.stop()
    const sound = getSoundById(soundId)
    if (sound) {
      const handle = sound.play({ volume: 0.4 })
      setPreviewHandle(handle)
      setPreviewingId(soundId)
      setTimeout(() => {
        handle.stop()
        setPreviewingId((cur) => cur === soundId ? null : cur)
      }, 3000)
    }
  }

  const createAlarm = (): Alarm => ({
    id: crypto.randomUUID(),
    time: '07:00',
    label: '',
    enabled: true,
    repeat: [],
    smartWake: false,
    soundUrl: '',
    soundName: 'Gentle Chime',
    soundId: 'gentle-chime',
  })

  const saveAlarm = (alarm: Alarm) => {
    previewHandle?.stop()
    setPreviewingId(null)
    const exists = alarms.find((a) => a.id === alarm.id)
    if (exists) {
      setAlarms(alarms.map((a) => (a.id === alarm.id ? alarm : a)))
    } else {
      setAlarms([...alarms, alarm])
    }
    setEditAlarm(null)
    setShowAdd(false)
  }

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter((a) => a.id !== id))
  }

  const toggleAlarm = (id: string) => {
    setAlarms(alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)))
  }

  return (
    <div className="flex flex-col items-center h-full overflow-y-auto px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Alarms</h1>
          <button
            onClick={() => { setEditAlarm(createAlarm()); setShowAdd(true) }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-all flex items-center gap-2"
          >
            <PlusIcon size={16} />
            New Alarm
          </button>
        </div>

        {/* Ringing Alert */}
        {ringingAlarmId && (
          <div className="mb-6 p-6 rounded-2xl bg-indigo-600 text-white text-center animate-pulse-soft">
            <VolumeIcon size={40} className="mx-auto mb-3" />
            <p className="text-lg font-semibold mb-1">
              {alarms.find((a) => a.id === ringingAlarmId)?.label || 'Alarm'}
            </p>
            <p className="text-sm opacity-80 mb-4">
              {alarms.find((a) => a.id === ringingAlarmId)?.time}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={snoozeAlarm}
                className="px-6 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-all"
              >
                Snooze ({SNOOZE_MINUTES}m)
              </button>
              <button
                onClick={dismissAlarm}
                className="px-8 py-3 rounded-xl bg-white text-indigo-600 font-semibold hover:bg-zinc-100 transition-all"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Alarm List */}
        <div className="space-y-3">
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`group relative flex items-center justify-between p-5 rounded-2xl border ${border} ${surface} transition-all`}
            >
              <button
                onClick={() => { setEditAlarm({ ...alarm }); setShowAdd(true) }}
                className="text-left flex-1"
              >
                <div className={`time-display text-3xl font-semibold ${alarm.enabled ? textPrimary : textMuted}`}>
                  {alarm.time}
                </div>
                {alarm.label && (
                  <div className={`text-sm mt-1 ${textSecondary}`}>{alarm.label}</div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {alarm.repeat.length > 0 ? (
                    <div className="flex gap-1">
                      {DAYS.map((d) => (
                        <span
                          key={d}
                          className={`text-[10px] w-5 h-5 rounded-full flex items-center justify-center ${
                            alarm.repeat.includes(d)
                              ? 'bg-indigo-600 text-white'
                              : `${isDark ? 'bg-white/5' : 'bg-zinc-100'} ${textMuted}`
                          }`}
                        >
                          {DAY_LABELS[d]}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={`text-xs ${textMuted}`}>Once</span>
                  )}
                  {alarm.smartWake && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Smart Wake</span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-zinc-100'} ${textMuted}`}>
                    {getSoundById(alarm.soundId || 'gentle-chime')?.name || alarm.soundName}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlarm(alarm.id)}
                  className={`relative w-12 h-7 rounded-full transition-all ${
                    alarm.enabled ? 'bg-indigo-600' : isDark ? 'bg-zinc-700' : 'bg-zinc-300'
                  }`}
                >
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow ${
                    alarm.enabled ? 'left-6' : 'left-1'
                  }`} />
                </button>
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${textMuted} hover:text-red-400`}
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {alarms.length === 0 && (
          <div className={`text-center mt-16 ${textMuted}`}>
            <VolumeIcon size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No alarms set</p>
            <p className="text-xs mt-1">Tap "New Alarm" to get started</p>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      {showAdd && editAlarm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { previewHandle?.stop(); setShowAdd(false) }}>
          <div
            className={`w-full sm:max-w-md max-h-[85vh] overflow-y-auto ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-t-3xl sm:rounded-2xl p-6 animate-slide-up`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold ${textPrimary}`}>
                {alarms.find((a) => a.id === editAlarm.id) ? 'Edit Alarm' : 'New Alarm'}
              </h2>
              <button onClick={() => { previewHandle?.stop(); setShowAdd(false) }} className={textMuted}><XIcon size={20} /></button>
            </div>

            {/* Time Picker */}
            <div className="mb-5">
              <input
                type="time"
                value={editAlarm.time}
                onChange={(e) => setEditAlarm({ ...editAlarm, time: e.target.value })}
                className={`w-full time-display text-4xl text-center py-4 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Label */}
            <div className="mb-5">
              <label className={`text-xs font-medium ${textMuted} block mb-1.5`}>Label</label>
              <input
                type="text"
                placeholder="e.g. Wake up, Meeting..."
                value={editAlarm.label}
                onChange={(e) => setEditAlarm({ ...editAlarm, label: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            {/* Repeat Days */}
            <div className="mb-5">
              <label className={`text-xs font-medium ${textMuted} block mb-2`}>Repeat</label>
              <div className="flex gap-2">
                {DAYS.map((d) => {
                  const active = editAlarm.repeat.includes(d)
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        const repeat = active
                          ? editAlarm.repeat.filter((r) => r !== d)
                          : [...editAlarm.repeat, d]
                        setEditAlarm({ ...editAlarm, repeat })
                      }}
                      className={`w-9 h-9 rounded-full text-xs font-semibold transition-all ${
                        active ? 'bg-indigo-600 text-white' : `border ${border} ${textMuted}`
                      }`}
                    >
                      {DAY_LABELS[d]}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setEditAlarm({ ...editAlarm, repeat: ['mon', 'tue', 'wed', 'thu', 'fri'] })}
                  className={`text-xs px-3 py-1 rounded-lg border ${border} ${textMuted} hover:text-indigo-500`}
                >
                  Weekdays
                </button>
                <button
                  onClick={() => setEditAlarm({ ...editAlarm, repeat: ['sat', 'sun'] })}
                  className={`text-xs px-3 py-1 rounded-lg border ${border} ${textMuted} hover:text-indigo-500`}
                >
                  Weekends
                </button>
                <button
                  onClick={() => setEditAlarm({ ...editAlarm, repeat: [...DAYS] })}
                  className={`text-xs px-3 py-1 rounded-lg border ${border} ${textMuted} hover:text-indigo-500`}
                >
                  Every Day
                </button>
              </div>
            </div>

            {/* Smart Wake */}
            <div className={`flex items-center justify-between mb-5 p-4 rounded-xl border ${border}`}>
              <div>
                <p className={`text-sm font-medium ${textPrimary}`}>Smart Wake</p>
                <p className={`text-xs ${textMuted}`}>Gradual volume fade-in over 30 seconds</p>
              </div>
              <button
                onClick={() => setEditAlarm({ ...editAlarm, smartWake: !editAlarm.smartWake })}
                className={`relative w-12 h-7 rounded-full transition-all ${
                  editAlarm.smartWake ? 'bg-green-500' : isDark ? 'bg-zinc-700' : 'bg-zinc-300'
                }`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow ${
                  editAlarm.smartWake ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>

            {/* Sound Selection */}
            <div className="mb-5">
              <label className={`text-xs font-medium ${textMuted} block mb-2`}>Alarm Sound</label>
              {(['gentle', 'standard', 'intense'] as const).map((category) => (
                <div key={category} className="mb-3">
                  <p className={`text-[10px] uppercase tracking-wider font-semibold ${textMuted} mb-1.5`}>{category}</p>
                  <div className="space-y-1">
                    {SOUND_LIBRARY.filter((s) => s.category === category).map((sound) => {
                      const selected = (editAlarm.soundId || 'gentle-chime') === sound.id && !editAlarm.soundUrl
                      return (
                        <div key={sound.id} className="flex items-center gap-2">
                          <button
                            onClick={() => setEditAlarm({ ...editAlarm, soundId: sound.id, soundName: sound.name, soundUrl: '' })}
                            className={`flex-1 text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
                              selected
                                ? 'bg-indigo-600 text-white'
                                : `${isDark ? 'hover:bg-white/5' : 'hover:bg-zinc-50'} ${textPrimary}`
                            }`}
                          >
                            {sound.name}
                          </button>
                          <button
                            onClick={() => previewSound(sound.id)}
                            className={`p-2 rounded-lg transition-all ${
                              previewingId === sound.id
                                ? 'text-indigo-500'
                                : `${textMuted} hover:text-indigo-500`
                            }`}
                            title="Preview"
                          >
                            {previewingId === sound.id ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="mt-4 pt-3 border-t border-dashed" style={{ borderColor: isDark ? '#333' : '#ddd' }}>
                <label className={`text-xs ${textMuted} block mb-1`}>Custom Audio URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/alarm.mp3"
                  value={editAlarm.soundUrl}
                  onChange={(e) => setEditAlarm({ ...editAlarm, soundUrl: e.target.value, soundName: 'Custom', soundId: '' })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${border} ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-50 text-zinc-900'} text-sm outline-none focus:ring-2 focus:ring-indigo-500`}
                />
              </div>
            </div>

            {/* Save */}
            <button
              onClick={() => saveAlarm(editAlarm)}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-all"
            >
              Save Alarm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
