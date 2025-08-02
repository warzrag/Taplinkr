interface LocationData {
  country: string
  countryCode: string
  region: string
  city: string
  timezone: string
  lat: number
  lon: number
}

export async function getLocationFromIP(ip: string): Promise<LocationData> {
  const defaultLocation: LocationData = {
    country: 'Unknown',
    countryCode: 'XX',
    region: 'N/A',
    city: 'N/A',
    timezone: 'UTC',
    lat: 0,
    lon: 0
  }

  try {
    // Skip for localhost/private IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        ...defaultLocation,
        country: 'Local',
        countryCode: 'LOCAL',
        city: 'Localhost',
        region: 'Development'
      }
    }

    // Use ip-api.com (free, no key required, 45 requests per minute)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,timezone,lat,lon`)
    
    if (!response.ok) {
      return defaultLocation
    }

    const data = await response.json()
    
    if (data.status === 'success') {
      return {
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        region: data.regionName || data.region || 'N/A',
        city: data.city || 'N/A',
        timezone: data.timezone || 'UTC',
        lat: data.lat || 0,
        lon: data.lon || 0
      }
    }

    return defaultLocation
  } catch (error) {
    console.error('Error getting location from IP:', error)
    return defaultLocation
  }
}