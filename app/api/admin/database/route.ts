import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const TABLE_TO_MODEL: Record<string, string> = {
  users: 'user',
  links: 'link',
  multi_links: 'multiLink',
  multiLinks: 'multiLink',
  clicks: 'click',
  folders: 'folder',
  files: 'file',
  analytics_events: 'analyticsEvent',
  analyticsEvents: 'analyticsEvent',
  analytics_summary: 'analyticsSummary',
  analyticsSummary: 'analyticsSummary',
  templates: 'template',
  user_profiles: 'userProfile',
  userProfiles: 'userProfile',
  user_themes: 'userTheme',
  userThemes: 'userTheme',
  password_protections: 'passwordProtection',
  passwordProtections: 'passwordProtection',
  password_attempts: 'passwordAttempt',
  passwordAttempts: 'passwordAttempt',
  link_schedules: 'linkSchedule',
  linkSchedules: 'linkSchedule',
  scheduled_jobs: 'scheduledJob',
  scheduledJobs: 'scheduledJob',
  custom_domains: 'customDomain',
  customDomains: 'customDomain',
  notifications: 'notification',
  notification_preferences: 'notificationPreference',
  notificationPreferences: 'notificationPreference',
  push_subscriptions: 'pushSubscription',
  pushSubscriptions: 'pushSubscription',
  teams: 'team',
  team_invitations: 'teamInvitation',
  teamInvitations: 'teamInvitation',
  team_templates: 'teamTemplate',
  teamTemplates: 'teamTemplate',
  team_analytics: 'teamAnalytics',
  teamAnalytics: 'teamAnalytics',
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table') || ''
    const model = TABLE_TO_MODEL[table]
    if (!model || !(prisma as any)[model]) {
      return NextResponse.json({ error: 'Table inconnue' }, { status: 400 })
    }

    const page = Math.max(Number(searchParams.get('page') || 0), 0)
    const pageSize = Math.min(Math.max(Number(searchParams.get('pageSize') || 50), 1), 100)
    const client = (prisma as any)[model]

    const [data, count] = await Promise.all([
      client.findMany({
        orderBy: { createdAt: 'desc' },
        skip: page * pageSize,
        take: pageSize,
      }).catch(() => client.findMany({ skip: page * pageSize, take: pageSize })),
      client.count().catch(() => 0),
    ])

    return NextResponse.json({ data, count })
  } catch (error: any) {
    console.error('Admin database error:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}
