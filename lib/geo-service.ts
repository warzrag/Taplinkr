// Service pour obtenir les informations géographiques à partir de l'IP
// Utilise une API gratuite qui ne nécessite pas de clé API

interface GeoData {
  country: string
  countryCode: string
  region: string
  city: string
  latitude: number
  longitude: number
  timezone: string
  isp: string
}

export async function getGeoData(ip: string): Promise<Partial<GeoData>> {
  // Ne pas géolocaliser les IPs locales
  if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      country: 'France', // Default to France for local IPs
      countryCode: 'FR',
      region: 'France',
      city: 'France'
    }
  }

  try {
    // Utilisation de ipapi.co (gratuit, limite de 1000 requêtes par jour)
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch geo data')
    }

    const data = await response.json()

    if (!data.error) {
      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'XX',
        region: data.region || 'Unknown',
        city: data.city || 'Unknown',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        timezone: data.timezone || 'Unknown',
        isp: data.org || 'Unknown'
      }
    }
  } catch (error) {
    console.error('Error fetching geo data:', error)
  }

  // Fallback pour les cas d'erreur
  return {
    country: 'Unknown',
    countryCode: 'XX',
    region: 'Unknown',
    city: 'Unknown'
  }
}

// Fonction pour parser le User-Agent et obtenir des informations sur l'appareil
export function parseUserAgent(userAgent: string): {
  device: string
  browser: string
  os: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
} {
  const ua = userAgent.toLowerCase()

  // Détection du type d'appareil
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) {
    deviceType = 'mobile'
  } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
    deviceType = 'tablet'
  }

  // Détection du navigateur
  let browser = 'Unknown'
  if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('edg')) browser = 'Edge'
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera'
  else if (ua.includes('trident') || ua.includes('msie')) browser = 'Internet Explorer'

  // Détection de l'OS
  let os = 'Unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

  // Détection du modèle d'appareil (simplifié)
  let device = deviceType.charAt(0).toUpperCase() + deviceType.slice(1)
  if (ua.includes('iphone')) device = 'iPhone'
  else if (ua.includes('ipad')) device = 'iPad'
  else if (ua.includes('samsung')) device = 'Samsung'
  else if (ua.includes('pixel')) device = 'Google Pixel'

  return {
    device,
    browser,
    os,
    deviceType
  }
}

// Fonction pour extraire le domaine du referer
export function parseReferer(referer: string | null): {
  source: string
  medium: string
  domain: string
} {
  if (!referer || referer === 'direct') {
    return {
      source: 'Direct',
      medium: 'none',
      domain: 'direct'
    }
  }

  try {
    const url = new URL(referer)
    const domain = url.hostname.replace('www.', '')
    
    // Détection des sources communes
    let source = domain
    let medium = 'referral'

    // Réseaux sociaux
    if (domain.includes('facebook.com') || domain.includes('fb.com')) {
      source = 'Facebook'
      medium = 'social'
    } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
      source = 'Twitter/X'
      medium = 'social'
    } else if (domain.includes('instagram.com')) {
      source = 'Instagram'
      medium = 'social'
    } else if (domain.includes('linkedin.com')) {
      source = 'LinkedIn'
      medium = 'social'
    } else if (domain.includes('youtube.com')) {
      source = 'YouTube'
      medium = 'social'
    } else if (domain.includes('tiktok.com')) {
      source = 'TikTok'
      medium = 'social'
    } else if (domain.includes('reddit.com')) {
      source = 'Reddit'
      medium = 'social'
    } else if (domain.includes('pinterest.com')) {
      source = 'Pinterest'
      medium = 'social'
    }
    // Moteurs de recherche
    else if (domain.includes('google.')) {
      source = 'Google'
      medium = 'organic'
    } else if (domain.includes('bing.com')) {
      source = 'Bing'
      medium = 'organic'
    } else if (domain.includes('yahoo.')) {
      source = 'Yahoo'
      medium = 'organic'
    } else if (domain.includes('duckduckgo.com')) {
      source = 'DuckDuckGo'
      medium = 'organic'
    }
    // Messageries
    else if (domain.includes('whatsapp.com')) {
      source = 'WhatsApp'
      medium = 'messaging'
    } else if (domain.includes('telegram.org')) {
      source = 'Telegram'
      medium = 'messaging'
    } else if (domain.includes('discord.com')) {
      source = 'Discord'
      medium = 'messaging'
    }

    return {
      source,
      medium,
      domain
    }
  } catch (error) {
    return {
      source: 'Unknown',
      medium: 'unknown',
      domain: referer
    }
  }
}

// Fonction pour parser les paramètres UTM
export function parseUTMParams(url: string): {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
} {
  try {
    const urlObj = new URL(url)
    const params = urlObj.searchParams

    return {
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      utmTerm: params.get('utm_term') || undefined,
      utmContent: params.get('utm_content') || undefined
    }
  } catch {
    return {}
  }
}