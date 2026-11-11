import { readFile } from 'node:fs/promises'
import { isIP } from 'node:net'
import { Reader, type CityResponse } from 'mmdb-lib'

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
  region: '',
  city: '',
  timezone: '',
  lat: 0,
  lon: 0,
}

// The database lives on the server, outside the app folders, so both running
// copies share it and a deploy never overwrites it. Lookups stay local: the
// visitor's IP is never sent to a third-party service.
// IP geolocation by DB-IP (https://db-ip.com), CC BY 4.0.
const databasePath = process.env.GEOIP_DB_PATH || 'C:/web/data/geoip/dbip-city-lite.mmdb'
const retryAfterFailureMs = 10 * 60 * 1000

let readerPromise: Promise<Reader<CityResponse> | null> | null = null
let failedAt = 0

function loadReader() {
  if (readerPromise) return readerPromise
  if (failedAt && Date.now() - failedAt < retryAfterFailureMs) return Promise.resolve(null)
  readerPromise = readFile(databasePath)
    .then(buffer => new Reader<CityResponse>(buffer))
    .catch(error => {
      console.error(`Geolocation database unavailable (${databasePath}):`, error instanceof Error ? error.message : error)
      failedAt = Date.now()
      readerPromise = null
      return null
    })
  return readerPromise
}

function isPrivateIp(ip: string) {
  return ip === '::1' || ip === '127.0.0.1' || ip.startsWith('10.') ||
    ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:')
}

function countryName(code: string | undefined, fallback: string | undefined) {
  if (!code) return fallback || 'Unknown'
  try {
    return new Intl.DisplayNames(['en-US'], { type: 'region' }).of(code.toUpperCase()) || fallback || code
  } catch {
    return fallback || code
  }
}

export async function getLocationFromIP(rawIp: string): Promise<LocationData> {
  const ip = rawIp.trim()
  if (!isIP(ip) || isPrivateIp(ip)) return unknownLocation

  const reader = await loadReader()
  if (!reader) return unknownLocation

  try {
    const record = reader.get(ip)
    if (!record?.country) return unknownLocation

    return {
      country: countryName(record.country.iso_code, record.country.names?.en),
      countryCode: record.country.iso_code || 'XX',
      region: record.subdivisions?.[0]?.names?.en || '',
      city: record.city?.names?.en || '',
      timezone: record.location?.time_zone || '',
      lat: Number(record.location?.latitude) || 0,
      lon: Number(record.location?.longitude) || 0,
    }
  } catch {
    return unknownLocation
  }
}
