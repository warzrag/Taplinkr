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

    // Use ipapi.co (free, no key required, 1000 requests per day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    
    if (!response.ok) {
      return defaultLocation
    }

    const data = await response.json()
    
    // ipapi.co returns data directly without status field
    if (data && !data.error) {
      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'XX',
        region: data.region || 'N/A',
        city: data.city || 'N/A',
        timezone: data.timezone || 'UTC',
        lat: data.latitude || 0,
        lon: data.longitude || 0
      }
    }

    return defaultLocation
  } catch (error) {
    console.error('Error getting location from IP:', error)
    return defaultLocation
  }
}