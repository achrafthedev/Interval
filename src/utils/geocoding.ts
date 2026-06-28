export interface GeoSearchResult {
  city: string
  country: string
  timezone: string
  lat: number
  lon: number
}

let abortController: AbortController | null = null

export async function searchCities(query: string): Promise<GeoSearchResult[]> {
  if (query.length < 2) return []

  abortController?.abort()
  abortController = new AbortController()

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '12',
      'accept-language': 'en',
      featuretype: 'city',
    })

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        signal: abortController.signal,
        headers: { 'User-Agent': 'Interval-Clock-App/1.0' },
      }
    )

    if (!res.ok) return []
    const data = await res.json()

    const results: GeoSearchResult[] = []
    const seen = new Set<string>()

    for (const item of data) {
      const city = item.address?.city
        || item.address?.town
        || item.address?.village
        || item.address?.municipality
        || item.name
        || ''

      const country = item.address?.country || ''
      if (!city) continue

      const key = `${city.toLowerCase()}-${country.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)

      const lat = parseFloat(item.lat)
      const lon = parseFloat(item.lon)

      let timezone = ''
      try {
        const tzRes = await fetch(
          `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lon}`,
          { signal: abortController!.signal }
        )
        if (tzRes.ok) {
          const tzData = await tzRes.json()
          timezone = tzData.timeZone || ''
        }
      } catch {
        // Fallback: try BigDataCloud
        try {
          const tzRes = await fetch(
            `https://api.bigdatacloud.net/data/timezone-by-location?latitude=${lat}&longitude=${lon}&key=`,
            { signal: abortController!.signal }
          )
          if (tzRes.ok) {
            const tzData = await tzRes.json()
            timezone = tzData.iapiTimezone || tzData.ianaTimezone || ''
          }
        } catch { /* give up on timezone */ }
      }

      if (!timezone) {
        timezone = guessTimezoneFromOffset(lon)
      }

      results.push({ city, country, timezone, lat, lon })
    }

    return results
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return []
    return []
  }
}

function guessTimezoneFromOffset(longitude: number): string {
  const offsetHours = Math.round(longitude / 15)
  const common: Record<number, string> = {
    '-12': 'Etc/GMT+12', '-11': 'Pacific/Pago_Pago', '-10': 'Pacific/Honolulu',
    '-9': 'America/Anchorage', '-8': 'America/Los_Angeles', '-7': 'America/Denver',
    '-6': 'America/Chicago', '-5': 'America/New_York', '-4': 'America/Halifax',
    '-3': 'America/Sao_Paulo', '-2': 'Atlantic/South_Georgia', '-1': 'Atlantic/Azores',
    '0': 'Europe/London', '1': 'Europe/Paris', '2': 'Europe/Helsinki',
    '3': 'Europe/Moscow', '4': 'Asia/Dubai', '5': 'Asia/Karachi',
    '6': 'Asia/Dhaka', '7': 'Asia/Bangkok', '8': 'Asia/Shanghai',
    '9': 'Asia/Tokyo', '10': 'Australia/Sydney', '11': 'Pacific/Noumea',
    '12': 'Pacific/Auckland',
  }
  return common[String(offsetHours) as unknown as number] || 'Etc/GMT'
}
