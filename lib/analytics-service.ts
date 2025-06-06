import { prisma } from './prisma'
import { headers } from 'next/headers'

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
      const deviceInfo = this.parseUserAgent(data.request.userAgent || '')
      const utmParams = this.parseUTMParams(data.request.url || '')
      
      // Create analytics event
      await prisma.analyticsEvent.create({
        data: {
          linkId: data.linkId,
          userId: data.userId,
          eventType: data.eventType,
          ip: data.request.ip,
          userAgent: data.request.userAgent,
          referer: data.request.referer,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          utmSource: utmParams.source,
          utmMedium: utmParams.medium,
          utmCampaign: utmParams.campaign,
          utmTerm: utmParams.term,
          utmContent: utmParams.content,
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

    const dailyStats = await prisma.analyticsSummary.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'asc' }
    })

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

    return {
      totalLinks,
      totalClicks,
      dailyStats,
      topLinks
    }
  }
}

export const analyticsService = new AnalyticsService()