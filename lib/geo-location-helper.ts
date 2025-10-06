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

    // Vérifier le cache d'abord
    const cached = geoCache.get(ip)
    if (cached) {
      console.log('Géolocalisation depuis le cache pour:', ip)
      return cached
    }

    // Essayer d'abord ipapi.co (gratuit, 1000 requêtes/jour)
    console.log(`🔄 Appel API ipapi.co pour: ${ip}`)
    const response = await fetch(`https://ipapi.co/${ip}/json/`)

    console.log(`📡 Réponse ipapi.co: status=${response.status}`)

    // Si erreur 429 (Too Many Requests), essayer l'API de fallback
    if (response.status === 429) {
      console.log('⚠️ Limite ipapi.co atteinte (429), utilisation de ip-api.com comme fallback')
      try {
        const fallbackResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone`)

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          console.log('📦 Réponse fallback ip-api.com:', fallbackData)

          if (fallbackData.status === 'success') {
            const locationData = {
              country: fallbackData.country || 'Unknown',
              countryCode: fallbackData.countryCode || 'XX',
              region: fallbackData.regionName || 'N/A',
              city: fallbackData.city || 'N/A',
              lat: fallbackData.lat || 0,
              lon: fallbackData.lon || 0,
              timezone: fallbackData.timezone || 'UTC'
            }

            // Mettre en cache
            geoCache.set(ip, locationData)
            console.log('✅ Géolocalisation réussie (fallback):', locationData.country, locationData.city)
            return locationData
          }
        }
      } catch (fallbackError) {
        console.error('❌ Erreur API fallback:', fallbackError)
      }

      // Si le fallback échoue aussi, retourner Unknown
      return defaultLocation
    }

    if (!response.ok) {
      console.log(`❌ Erreur API géolocalisation: ${response.status} pour IP: ${ip}`)
      return defaultLocation
    }

    const data = await response.json()
    console.log('📦 Données ipapi.co:', data)

    // Vérifier si on a atteint la limite de taux
    if (data.error) {
      console.log('❌ Erreur API:', data.error, data.reason)
      return defaultLocation
    }

    // ipapi.co returns data directly
    const locationData = {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      region: data.region || 'N/A',
      city: data.city || 'N/A',
      timezone: data.timezone || 'UTC',
      lat: data.latitude || 0,
      lon: data.longitude || 0
    }

    // Mettre en cache le résultat
    geoCache.set(ip, locationData)
    console.log('✅ Géolocalisation réussie (ipapi.co):', locationData.country, locationData.city)

    return locationData
  } catch (error) {
    console.error('Error getting location from IP:', error)
    return defaultLocation
  }
}