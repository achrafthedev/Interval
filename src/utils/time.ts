export function formatTime(date: Date, use24Hour: boolean, timezone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: !use24Hour,
    ...(timezone ? { timeZone: timezone } : {}),
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export function formatTimeNoSeconds(date: Date, use24Hour: boolean, timezone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour,
    ...(timezone ? { timeZone: timezone } : {}),
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export function formatDate(date: Date, timezone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(timezone ? { timeZone: timezone } : {}),
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const centiseconds = Math.floor((ms % 1000) / 10)

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`
}

export function formatMsToSpeech(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const parts: string[] = []
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`)
  if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`)

  return parts.join(', ') || '0 seconds'
}

export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export function getTimezoneOffset(timezone: string): number {
  const now = new Date()
  const localStr = now.toLocaleString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })
  const targetStr = now.toLocaleString('en-US', { timeZone: timezone })
  const localDate = new Date(localStr)
  const targetDate = new Date(targetStr)
  return (targetDate.getTime() - localDate.getTime()) / (1000 * 60 * 60)
}

export function getTimezoneOffsetLabel(timezone: string): string {
  const offset = getTimezoneOffset(timezone)
  const sign = offset >= 0 ? '+' : ''
  const hours = Math.floor(Math.abs(offset))
  const minutes = Math.round((Math.abs(offset) % 1) * 60)

  if (minutes > 0) {
    return `${sign}${offset < 0 ? '-' : ''}${hours}:${pad(minutes)}`
  }
  return `${sign}${Math.round(offset)}h`
}

export function getTimeDelta(tz1: string, tz2: string): string {
  const offset1 = getTimezoneOffset(tz1)
  const offset2 = getTimezoneOffset(tz2)
  const delta = offset2 - offset1
  const absDelta = Math.abs(delta)
  const hours = Math.floor(absDelta)
  const minutes = Math.round((absDelta % 1) * 60)

  const timeStr = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`

  if (delta === 0) return 'same time'
  return delta > 0 ? `${timeStr} ahead` : `${timeStr} behind`
}

export const COMMON_TIMEZONES = [
  { label: 'New York', timezone: 'America/New_York' },
  { label: 'Los Angeles', timezone: 'America/Los_Angeles' },
  { label: 'Chicago', timezone: 'America/Chicago' },
  { label: 'London', timezone: 'Europe/London' },
  { label: 'Paris', timezone: 'Europe/Paris' },
  { label: 'Berlin', timezone: 'Europe/Berlin' },
  { label: 'Moscow', timezone: 'Europe/Moscow' },
  { label: 'Dubai', timezone: 'Asia/Dubai' },
  { label: 'Mumbai', timezone: 'Asia/Kolkata' },
  { label: 'Shanghai', timezone: 'Asia/Shanghai' },
  { label: 'Tokyo', timezone: 'Asia/Tokyo' },
  { label: 'Sydney', timezone: 'Australia/Sydney' },
  { label: 'Auckland', timezone: 'Pacific/Auckland' },
  { label: 'Casablanca', timezone: 'Africa/Casablanca' },
  { label: 'Cairo', timezone: 'Africa/Cairo' },
  { label: 'São Paulo', timezone: 'America/Sao_Paulo' },
  { label: 'Toronto', timezone: 'America/Toronto' },
  { label: 'Singapore', timezone: 'Asia/Singapore' },
  { label: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  { label: 'Seoul', timezone: 'Asia/Seoul' },
]

export function getDynamicGradient(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const progress = (hours * 60 + minutes) / 1440 // 0-1 over 24h

  if (progress < 0.2) {
    return 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #24243e 100%)'
  } else if (progress < 0.3) {
    return 'linear-gradient(135deg, #1a1040 0%, #c94b4b 50%, #e8a87c 100%)'
  } else if (progress < 0.45) {
    return 'linear-gradient(135deg, #e8a87c 0%, #fad0c4 30%, #a1c4fd 100%)'
  } else if (progress < 0.55) {
    return 'linear-gradient(135deg, #89CFF0 0%, #a1c4fd 50%, #c2e9fb 100%)'
  } else if (progress < 0.7) {
    return 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 50%, #fbc2eb 100%)'
  } else if (progress < 0.8) {
    return 'linear-gradient(135deg, #e8a87c 0%, #c94b4b 50%, #4a1942 100%)'
  } else {
    return 'linear-gradient(135deg, #1a1040 0%, #0f0c29 50%, #1a0a2e 100%)'
  }
}
