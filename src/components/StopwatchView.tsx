import { useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from './ThemeProvider'
import { useAnimationFrame } from '../hooks/useAnimationFrame'
import { formatMs, formatMsToSpeech } from '../utils/time'
import { speakText } from '../utils/audio'
import { isPiPSupported, startPiP, stopPiP, isPiPActive } from '../utils/pip'
import { PlayIcon, PauseIcon, ResetIcon, FlagIcon, DownloadIcon, PipIcon, SpeechIcon } from './Icons'
import type { StopwatchState, Lap } from '../types'

interface Props {
  state: StopwatchState
  setState: (state: StopwatchState) => void
  ttsEnabled: boolean
  setTtsEnabled: (v: boolean) => void
}

export function StopwatchView({ state, setState, ttsEnabled, setTtsEnabled }: Props) {
  const { t } = useTranslation()
  const { textPrimary, textSecondary, textMuted, surface, border, isDark } = useTheme()
  const stateRef = useRef(state)
  stateRef.current = state

  useAnimationFrame(() => {
    if (!state.running || !state.startTimestamp) return
    const elapsed = performance.now() - state.startTimestamp
    setState({ ...stateRef.current, elapsedMs: elapsed })
  }, state.running)

  const start = useCallback(() => {
    if (state.running) return
    const now = performance.now()
    const startTs = now - state.elapsedMs
    setState({ ...state, running: true, startTimestamp: startTs })
  }, [state, setState])

  const pause = useCallback(() => {
    setState({ ...state, running: false, startTimestamp: null })
  }, [state, setState])

  const reset = useCallback(() => {
    stopPiP()
    setState({
      running: false,
      elapsedMs: 0,
      laps: [],
      startTimestamp: null,
      lapStartMs: 0,
    })
  }, [setState])

  const lap = useCallback(() => {
    if (!state.running) return
    const lapTime = state.elapsedMs - state.lapStartMs
    const newLap: Lap = {
      number: state.laps.length + 1,
      lapTime,
      splitTime: state.elapsedMs,
    }

    if (ttsEnabled) {
      speakText(`Lap ${newLap.number}: ${formatMsToSpeech(lapTime)}`)
    }

    setState({
      ...state,
      laps: [...state.laps, newLap],
      lapStartMs: state.elapsedMs,
    })
  }, [state, setState, ttsEnabled])

  const exportLaps = useCallback(() => {
    if (state.laps.length === 0) return

    const lines = ['Lap,Lap Time,Split Time']
    state.laps.forEach((l) => {
      lines.push(`${l.number},${formatMs(l.lapTime)},${formatMs(l.splitTime)}`)
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interval-laps-${new Date().toISOString().slice(0, 19)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [state.laps])

  const handlePiP = useCallback(() => {
    if (isPiPActive()) {
      stopPiP()
    } else {
      startPiP(() => formatMs(stateRef.current.elapsedMs))
    }
  }, [])

  // Find fastest and slowest laps for highlighting
  const fastestIdx = state.laps.length > 1
    ? state.laps.reduce((min, l, i) => l.lapTime < state.laps[min].lapTime ? i : min, 0)
    : -1
  const slowestIdx = state.laps.length > 1
    ? state.laps.reduce((max, l, i) => l.lapTime > state.laps[max].lapTime ? i : max, 0)
    : -1

  return (
    <div className="flex flex-col items-center min-h-full px-4 pb-24 md:pb-8 pt-8 md:pt-12">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Main Display */}
        <div className="text-center mb-8 animate-fade-in">
          <div className={`time-display text-6xl sm:text-7xl md:text-8xl font-bold ${textPrimary} tracking-wider tabular-nums`}>
            {formatMs(state.elapsedMs)}
          </div>
          {state.running && state.laps.length > 0 && (
            <div className={`time-display text-xl mt-2 ${textSecondary}`}>
              {t('stopwatch.lap')} {state.laps.length + 1}: {formatMs(state.elapsedMs - state.lapStartMs)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-8">
          {!state.running ? (
            <button
              onClick={start}
              className="px-8 py-3.5 rounded-2xl text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all hover:scale-105 flex items-center gap-2"
            >
              <PlayIcon size={18} />
              {state.elapsedMs > 0 ? t('common.resume') : t('common.start')}
            </button>
          ) : (
            <>
              <button
                onClick={pause}
                className="px-8 py-3.5 rounded-2xl text-base font-semibold bg-amber-500 text-white hover:bg-amber-400 transition-all flex items-center gap-2"
              >
                <PauseIcon size={18} />
                {t('common.pause')}
              </button>
              <button
                onClick={lap}
                className={`px-6 py-3.5 rounded-2xl text-base font-semibold border ${border} ${textSecondary} hover:text-indigo-500 hover:border-indigo-500/50 transition-all flex items-center gap-2`}
              >
                <FlagIcon size={18} />
                {t('stopwatch.lap')}
              </button>
            </>
          )}
          {state.elapsedMs > 0 && !state.running && (
            <button
              onClick={reset}
              className={`px-6 py-3.5 rounded-2xl text-base font-semibold border ${border} ${textSecondary} hover:text-red-400 hover:border-red-400/50 transition-all flex items-center gap-2`}
            >
              <ResetIcon size={18} />
              {t('common.reset')}
            </button>
          )}
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${
              ttsEnabled ? 'border-indigo-500 text-indigo-500' : `${border} ${textMuted}`
            }`}
            title="Announce lap times"
          >
            <SpeechIcon size={16} />
            {t('stopwatch.voice')}
          </button>
          {isPiPSupported() && (
            <button
              onClick={handlePiP}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-2 ${
                isPiPActive() ? 'border-indigo-500 text-indigo-500' : `${border} ${textMuted}`
              }`}
              title="Picture-in-Picture"
            >
              <PipIcon size={16} />
              {t('stopwatch.pip')}
            </button>
          )}
          {state.laps.length > 0 && (
            <button
              onClick={exportLaps}
              className={`px-4 py-2 rounded-xl text-sm font-medium border ${border} ${textMuted} hover:text-indigo-500 transition-all flex items-center gap-2`}
              title="Export as CSV"
            >
              <DownloadIcon size={16} />
              {t('common.export')}
            </button>
          )}
        </div>

        {/* Lap History Table */}
        {state.laps.length > 0 && (
          <div className={`w-full rounded-2xl border ${border} ${surface} overflow-hidden`}>
            <div className={`grid grid-cols-4 gap-4 px-5 py-3 text-xs font-semibold ${textMuted} uppercase tracking-wider border-b ${border}`}>
              <span>{t('stopwatch.lapHeader')}</span>
              <span className="text-right">{t('stopwatch.lapTime')}</span>
              <span className="text-right">{t('stopwatch.splitTime')}</span>
              <span className="text-right">{t('stopwatch.delta')}</span>
            </div>
            <div className="max-h-[40vh] overflow-y-auto">
              {[...state.laps].reverse().map((l, revIdx) => {
                const idx = state.laps.length - 1 - revIdx
                const isFastest = idx === fastestIdx
                const isSlowest = idx === slowestIdx
                const prevLap = idx > 0 ? state.laps[idx - 1] : null
                const delta = prevLap ? l.lapTime - prevLap.lapTime : 0

                return (
                  <div
                    key={l.number}
                    className={`grid grid-cols-4 gap-4 px-5 py-3 text-sm border-b ${border} last:border-b-0 transition-colors ${
                      isFastest ? 'bg-green-500/5' : isSlowest ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <span className={`font-medium ${
                      isFastest ? 'lap-fastest' : isSlowest ? 'lap-slowest' : textPrimary
                    }`}>
                      {l.number}
                    </span>
                    <span className={`text-right time-display ${
                      isFastest ? 'lap-fastest' : isSlowest ? 'lap-slowest' : textPrimary
                    }`}>
                      {formatMs(l.lapTime)}
                    </span>
                    <span className={`text-right time-display ${textSecondary}`}>
                      {formatMs(l.splitTime)}
                    </span>
                    <span className={`text-right time-display text-xs ${
                      delta < 0 ? 'text-green-400' : delta > 0 ? 'text-red-400' : textMuted
                    }`}>
                      {prevLap ? `${delta > 0 ? '+' : ''}${formatMs(Math.abs(delta))}` : '-'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {state.laps.length === 0 && state.elapsedMs === 0 && (
          <div className={`text-center mt-8 ${textMuted}`}>
            <FlagIcon size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('stopwatch.startTip')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
