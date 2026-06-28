export interface GeoLocation {
  latitude: number
  longitude: number
  city: string
  timezone: string
}

export function detectTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function getCityFromTimezone(tz: string): string {
  const parts = tz.split('/')
  return (parts[parts.length - 1] || 'Local').replace(/_/g, ' ')
}

export async function getGeolocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const timezone = detectTimezone()
        let city = getCityFromTimezone(timezone)

        // Try reverse geocoding via free API
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          )
          if (res.ok) {
            const data = await res.json()
            city = data.city || data.locality || data.principalSubdivision || city
          }
        } catch {
          // Fall back to timezone-derived city name
        }

        resolve({ latitude, longitude, city, timezone })
      },
      (error) => {
        reject(error)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  })
}

// Sun position calculations using simplified solar equations
export function getSunTimes(latitude: number, longitude: number, date: Date = new Date()) {
  const dayOfYear = getDayOfYear(date)
  const decl = 23.45 * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365)
  const declRad = (decl * Math.PI) / 180
  const latRad = (latitude * Math.PI) / 180

  const cosHourAngle = Math.max(-1, Math.min(1,
    (-Math.sin((0.833 * Math.PI) / 180) - Math.sin(latRad) * Math.sin(declRad)) /
    (Math.cos(latRad) * Math.cos(declRad))
  ))

  // Polar night/day check
  if (cosHourAngle >= 1) return { sunrise: null, sunset: null, isDaylight: false }
  if (cosHourAngle <= -1) return { sunrise: null, sunset: null, isDaylight: true }

  const hourAngle = (Math.acos(cosHourAngle) * 180) / Math.PI

  const eqOfTime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos((2 * Math.PI * dayOfYear) / 365) -
    0.032077 * Math.sin((2 * Math.PI * dayOfYear) / 365) -
    0.014615 * Math.cos((4 * Math.PI * dayOfYear) / 365) -
    0.04089 * Math.sin((4 * Math.PI * dayOfYear) / 365)
  )

  const tzOffset = -date.getTimezoneOffset() / 60
  const solarNoon = 720 - 4 * longitude - eqOfTime + tzOffset * 60

  const sunriseMin = solarNoon - hourAngle * 4
  const sunsetMin = solarNoon + hourAngle * 4

  const now = date.getHours() * 60 + date.getMinutes()
  const isDaylight = now >= sunriseMin && now <= sunsetMin

  return {
    sunrise: minutesToTimeString(sunriseMin),
    sunset: minutesToTimeString(sunsetMin),
    isDaylight,
  }
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24
  const mins = Math.round(totalMinutes % 60)
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}
