import { isIP } from 'node:net'
import { geoCache } from './geo-cache'

interface LocationData {
  country: string
  countryCode: string
  region: string
  city: string
  timezone: string
  lat: number
  lon: number
}

const unknownLocation: LocationData = {
  country: 'Unknown',
  countryCode: 'XX',
  region: 'N/A',
  city: 'N/A',
  timezone: 'UTC',
  lat: 0,
  lon: 0,
}

function isPrivateIp(ip: string) {
  return ip === '::1' || ip === '127.0.0.1' || ip.startsWith('10.') ||
    ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:')
}

export async function getLocationFromIP(rawIp: string): Promise<LocationData> {
  const ip = rawIp.trim()
  if (!isIP(ip) || isPrivateIp(ip)) return unknownLocation

  const cached = geoCache.get(ip)
  if (cached) return cached

  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: AbortSignal.timeout(3000),
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return unknownLocation

    const data = await response.json()
    if (data.error) return unknownLocation

    const location: LocationData = {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      region: data.region || 'N/A',
      city: data.city || 'N/A',
      timezone: data.timezone || 'UTC',
      lat: Number(data.latitude) || 0,
      lon: Number(data.longitude) || 0,
    }

    geoCache.set(ip, location)
    return location
  } catch {
    return unknownLocation
  }
}
