interface ParsedUserAgent {
  browser: {
    name: string
    version: string
  }
  os: {
    name: string
    version: string
  }
  device: {
    type: 'mobile' | 'tablet' | 'desktop'
    vendor: string
    model: string
  }
  bot: boolean
}

export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const ua = userAgent.toLowerCase()
  
  // Détecter les bots
  const isBot = /bot|crawler|spider|scraper|facebookexternalhit|whatsapp|telegram|slack|discord/i.test(ua)
  
  // Détecter le navigateur
  let browserName = 'Unknown Browser'
  let browserVersion = ''
  
  if (ua.includes('instagram')) {
    browserName = 'Instagram'
  } else if (ua.includes('fban') || ua.includes('fbav')) {
    browserName = 'Facebook'
  } else if (ua.includes('snapchat')) {
    browserName = 'Snapchat'
  } else if (ua.includes('tiktok')) {
    browserName = 'TikTok'
  } else if (ua.includes('linkedin')) {
    browserName = 'LinkedIn'
  } else if (ua.includes('twitter')) {
    browserName = 'Twitter'
  } else if (ua.includes('edg/')) {
    browserName = 'Microsoft Edge'
    const match = ua.match(/edg\/(\d+)/)
    if (match) browserVersion = match[1]
  } else if (ua.includes('chrome') && !ua.includes('edg')) {
    browserName = 'Google Chrome'
    const match = ua.match(/chrome\/(\d+)/)
    if (match) browserVersion = match[1]
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browserName = 'Safari'
    const match = ua.match(/version\/(\d+)/)
    if (match) browserVersion = match[1]
  } else if (ua.includes('firefox')) {
    browserName = 'Mozilla Firefox'
    const match = ua.match(/firefox\/(\d+)/)
    if (match) browserVersion = match[1]
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browserName = 'Opera'
    const match = ua.match(/(?:opera|opr)\/(\d+)/)
    if (match) browserVersion = match[1]
  }
  
  // Détecter l'OS
  let osName = 'Unknown OS'
  let osVersion = ''
  
  if (ua.includes('windows nt 10')) {
    osName = 'Windows'
    osVersion = '10'
  } else if (ua.includes('windows nt 11')) {
    osName = 'Windows'
    osVersion = '11'
  } else if (ua.includes('windows')) {
    osName = 'Windows'
  } else if (ua.includes('mac os x')) {
    osName = 'macOS'
    const match = ua.match(/mac os x (\d+)[._](\d+)/)
    if (match) osVersion = `${match[1]}.${match[2]}`
  } else if (ua.includes('android')) {
    osName = 'Android'
    const match = ua.match(/android (\d+)/)
    if (match) osVersion = match[1]
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    osName = 'iOS'
    const match = ua.match(/os (\d+)_(\d+)/)
    if (match) osVersion = `${match[1]}.${match[2]}`
  } else if (ua.includes('linux')) {
    osName = 'Linux'
  }
  
  // Détecter le type d'appareil
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
  let deviceVendor = ''
  let deviceModel = ''
  
  if (ua.includes('iphone')) {
    deviceType = 'mobile'
    deviceVendor = 'Apple'
    deviceModel = 'iPhone'
  } else if (ua.includes('ipad')) {
    deviceType = 'tablet'
    deviceVendor = 'Apple'
    deviceModel = 'iPad'
  } else if (ua.includes('android')) {
    if (ua.includes('mobile')) {
      deviceType = 'mobile'
    } else if (ua.includes('tablet')) {
      deviceType = 'tablet'
    } else {
      // Heuristique basée sur la résolution ou d'autres indices
      deviceType = ua.includes('mobile') ? 'mobile' : 'tablet'
    }
    
    // Essayer de détecter le fabricant
    if (ua.includes('samsung')) {
      deviceVendor = 'Samsung'
    } else if (ua.includes('huawei')) {
      deviceVendor = 'Huawei'
    } else if (ua.includes('xiaomi')) {
      deviceVendor = 'Xiaomi'
    } else if (ua.includes('oppo')) {
      deviceVendor = 'Oppo'
    } else if (ua.includes('vivo')) {
      deviceVendor = 'Vivo'
    } else if (ua.includes('pixel')) {
      deviceVendor = 'Google'
      deviceModel = 'Pixel'
    }
  } else if (ua.includes('windows phone')) {
    deviceType = 'mobile'
    deviceVendor = 'Microsoft'
  } else if (ua.includes('mobile') || ua.includes('mobi')) {
    deviceType = 'mobile'
  }
  
  return {
    browser: {
      name: browserName,
      version: browserVersion
    },
    os: {
      name: osName,
      version: osVersion
    },
    device: {
      type: deviceType,
      vendor: deviceVendor,
      model: deviceModel
    },
    bot: isBot
  }
}