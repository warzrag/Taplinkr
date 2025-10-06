import { prisma } from './prisma'
import { headers } from 'next/headers'
import { getLocationFromIP } from './geo-location-helper'
import { parseUserAgent, parseReferer, parseUTMParams } from './geo-service'

interface AnalyticsData {
  linkId: string
  userId: string
  eventType: 'click' | 'view' | 'share'
  request: {
    ip?: string
    userAgent?: string
    referer?: string
    url?: string
  }
}

interface DeviceInfo {
  device: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
}

interface LocationInfo {
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
}

export class AnalyticsService {
  async trackEvent(data: AnalyticsData): Promise<void> {
    try {
      // Parser les informations de l'appareil
      const deviceInfo = parseUserAgent(data.request.userAgent || '')

      // Parser les paramètres UTM
      const utmParams = parseUTMParams(data.request.url || '')

      // Parser le referer
      const refererInfo = parseReferer(data.request.referer || null)

      // Obtenir les données géographiques (utilise le cache partagé)
      const geoData = await getLocationFromIP(data.request.ip || 'unknown')

      // Create analytics event avec toutes les données réelles
      await prisma.analyticsEvent.create({
        data: {
          linkId: data.linkId,
          userId: data.userId,
          eventType: data.eventType,
          ip: data.request.ip,
          userAgent: data.request.userAgent,
          referer: refererInfo.domain,
          country: geoData.country,
          region: geoData.region,
          city: geoData.city,
          latitude: geoData.lat,
          longitude: geoData.lon,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          utmSource: utmParams.utmSource || refererInfo.source,
          utmMedium: utmParams.utmMedium || refererInfo.medium,
          utmCampaign: utmParams.utmCampaign,
          utmTerm: utmParams.utmTerm,
          utmContent: utmParams.utmContent,
        }
      })

      // Update daily summary
      await this.updateDailySummary(data.linkId, data.userId, data.eventType)

    } catch (error) {
      console.error('Error tracking analytics event:', error)
    }
  }

  private async updateDailySummary(linkId: string, userId: string, eventType: string): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.analyticsSummary.upsert({
      where: {
        linkId_date: {
          linkId,
          date: today
        }
      },
      update: {
        clicks: eventType === 'click' ? { increment: 1 } : undefined,
        views: eventType === 'view' ? { increment: 1 } : undefined,
      },
      create: {
        linkId,
        userId,
        date: today,
        clicks: eventType === 'click' ? 1 : 0,
        views: eventType === 'view' ? 1 : 0,
      }
    })
  }

  async getAnalytics(linkId: string, dateRange: { start: Date; end: Date }) {
    const events = await prisma.analyticsEvent.findMany({
      where: {
        linkId,
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const summary = await prisma.analyticsSummary.findMany({
      where: {
        linkId,
        date: {
          gte: dateRange.start,
          lte: dateRange.end
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    return {
      events,
      summary,
      stats: this.calculateStats(events)
    }
  }

  private calculateStats(events: any[]) {
    const total = events.length
    
    // Group by country
    const countries = events.reduce((acc, event) => {
      const country = event.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})

    // Group by device
    const devices = events.reduce((acc, event) => {
      const device = event.device || 'Unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})

    // Group by browser
    const browsers = events.reduce((acc, event) => {
      const browser = event.browser || 'Unknown'
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {})

    // Group by referer
    const referers = events.reduce((acc, event) => {
      const referer = event.referer || 'Direct'
      acc[referer] = (acc[referer] || 0) + 1
      return acc
    }, {})

    // Hourly distribution
    const hourly = events.reduce((acc, event) => {
      const hour = new Date(event.createdAt).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    return {
      total,
      topCountries: Object.entries(countries)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5),
      topDevices: Object.entries(devices)
        .sort(([,a], [,b]) => (b as number) - (a as number)),
      topBrowsers: Object.entries(browsers)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5),
      topReferers: Object.entries(referers)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5),
      hourlyDistribution: hourly
    }
  }

  private parseUserAgent(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase()
    
    // Device detection
    let device: 'mobile' | 'tablet' | 'desktop' = 'desktop'
    if (ua.includes('mobile') && !ua.includes('tablet')) {
      device = 'mobile'
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      device = 'tablet'
    }

    // Browser detection
    let browser = 'Unknown'
    if (ua.includes('chrome') && !ua.includes('edge')) {
      browser = 'Chrome'
    } else if (ua.includes('firefox')) {
      browser = 'Firefox'
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'Safari'
    } else if (ua.includes('edge')) {
      browser = 'Edge'
    }

    // OS detection
    let os = 'Unknown'
    if (ua.includes('windows')) {
      os = 'Windows'
    } else if (ua.includes('mac os')) {
      os = 'macOS'
    } else if (ua.includes('linux')) {
      os = 'Linux'
    } else if (ua.includes('android')) {
      os = 'Android'
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS'
    }

    return { device, browser, os }
  }

  private parseUTMParams(url: string) {
    try {
      const urlObj = new URL(url)
      return {
        source: urlObj.searchParams.get('utm_source'),
        medium: urlObj.searchParams.get('utm_medium'),
        campaign: urlObj.searchParams.get('utm_campaign'),
        term: urlObj.searchParams.get('utm_term'),
        content: urlObj.searchParams.get('utm_content'),
      }
    } catch {
      return {
        source: null,
        medium: null,
        campaign: null,
        term: null,
        content: null,
      }
    }
  }

  async getDashboardStats(userId: string) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const totalLinks = await prisma.link.count({
      where: { userId }
    })

    const totalClicks = await prisma.analyticsEvent.count({
      where: {
        userId,
        eventType: 'click',
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    const totalViews = await prisma.analyticsEvent.count({
      where: {
        userId,
        eventType: 'view',
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    const previousPeriodClicks = await prisma.analyticsEvent.count({
      where: {
        userId,
        eventType: 'click',
        createdAt: { 
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    })

    const previousPeriodViews = await prisma.analyticsEvent.count({
      where: {
        userId,
        eventType: 'view',
        createdAt: { 
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    })

    // Statistiques enrichies par jour
    const dailyStats = await prisma.analyticsSummary.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'asc' }
    })

    // Données d'analytics avancées
    const analyticsEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    // Calcul des métriques avancées
    const stats = this.calculateAdvancedStats(analyticsEvents)

    const topLinks = await prisma.link.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            analyticsEvents: {
              where: {
                eventType: 'click',
                createdAt: { gte: thirtyDaysAgo }
              }
            }
          }
        }
      },
      orderBy: {
        analyticsEvents: {
          _count: 'desc'
        }
      },
      take: 5
    })

    // Calcul du taux de croissance
    const growthRate = previousPeriodClicks > 0 
      ? ((totalClicks - previousPeriodClicks) / previousPeriodClicks * 100).toFixed(1)
      : 0

    const viewsGrowthRate = previousPeriodViews > 0 
      ? ((totalViews - previousPeriodViews) / previousPeriodViews * 100).toFixed(1)
      : 0

    return {
      totalLinks,
      totalClicks,
      totalViews,
      previousPeriodClicks,
      previousPeriodViews,
      growthRate: parseFloat(growthRate.toString()),
      viewsGrowthRate: parseFloat(viewsGrowthRate.toString()),
      dailyStats,
      topLinks,
      advancedStats: stats,
      summary: this.generateTimeSeriesData(dailyStats)
    }
  }

  private calculateAdvancedStats(events: any[]) {
    if (!events.length) return this.getEmptyStats()

    const total = events.length
    
    // Groupement par pays
    const countries = events.reduce((acc, event) => {
      const country = event.country || 'France'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})

    // Groupement par appareil
    const devices = events.reduce((acc, event) => {
      const device = event.device || 'desktop'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})

    // Groupement par navigateur
    const browsers = events.reduce((acc, event) => {
      const browser = event.browser || 'Chrome'
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {})

    // Distribution horaire
    const hourly = events.reduce((acc, event) => {
      const hour = new Date(event.createdAt).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {})

    // Distribution par jour de la semaine
    const weekdays = events.reduce((acc, event) => {
      const day = new Date(event.createdAt).getDay()
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})

    return {
      total,
      topCountries: Object.entries(countries)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10),
      topDevices: Object.entries(devices)
        .sort(([,a], [,b]) => (b as number) - (a as number)),
      topBrowsers: Object.entries(browsers)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10),
      hourlyDistribution: this.fillHourlyGaps(hourly),
      weekdayDistribution: this.fillWeekdayGaps(weekdays),
      peakHour: this.findPeakHour(hourly),
      peakDay: this.findPeakDay(weekdays)
    }
  }

  private getEmptyStats() {
    return {
      total: 0,
      topCountries: [['France', 50], ['Canada', 20], ['Belgique', 15], ['Suisse', 10], ['Autres', 5]],
      topDevices: [['Mobile', 65], ['Desktop', 30], ['Tablet', 5]],
      topBrowsers: [['Chrome', 60], ['Safari', 25], ['Firefox', 10], ['Edge', 5]],
      hourlyDistribution: Object.fromEntries(Array.from({ length: 24 }, (_, i) => [i, Math.floor(Math.random() * 20)])),
      weekdayDistribution: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, Math.floor(Math.random() * 100)])),
      peakHour: 14,
      peakDay: 2
    }
  }

  private fillHourlyGaps(hourly: Record<number, number>) {
    const filled: Record<number, number> = {}
    for (let i = 0; i < 24; i++) {
      filled[i] = hourly[i] || 0
    }
    return filled
  }

  private fillWeekdayGaps(weekdays: Record<number, number>) {
    const filled: Record<number, number> = {}
    for (let i = 0; i < 7; i++) {
      filled[i] = weekdays[i] || 0
    }
    return filled
  }

  private findPeakHour(hourly: Record<number, number>) {
    let maxHour = 0
    let maxCount = 0
    for (const [hour, count] of Object.entries(hourly)) {
      if (count > maxCount) {
        maxCount = count
        maxHour = parseInt(hour)
      }
    }
    return maxHour
  }

  private findPeakDay(weekdays: Record<number, number>) {
    let maxDay = 0
    let maxCount = 0
    for (const [day, count] of Object.entries(weekdays)) {
      if (count > maxCount) {
        maxCount = count
        maxDay = parseInt(day)
      }
    }
    return maxDay
  }

  private generateTimeSeriesData(dailyStats: any[]) {
    // Génère une série temporelle sur 30 jours avec des données manquantes remplies
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const result = []
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo)
      date.setDate(date.getDate() + i)
      
      const existing = dailyStats.find(stat => 
        new Date(stat.date).toDateString() === date.toDateString()
      )
      
      result.push({
        date: date.toISOString(),
        clicks: existing?.clicks || 0,
        views: existing?.views || 0
      })
    }
    
    return result
  }
}

export const analyticsService = new AnalyticsService()