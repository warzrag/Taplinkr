import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import {
  dashboardPeriodStart,
  type DashboardPeriod,
} from '@/lib/dashboard-metrics'
import { buildFolderInsights } from '@/lib/folder-insights'
import { prisma } from '@/lib/prisma'

const periods = new Set<DashboardPeriod>(['today', '7d', '30d'])

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestedPeriod = request.nextUrl.searchParams.get('period') as DashboardPeriod | null
    const period = requestedPeriod && periods.has(requestedPeriod) ? requestedPeriod : '7d'
    const timeZone = request.nextUrl.searchParams.get('timeZone') || 'UTC'
    const now = new Date()
    const requestedStart = request.nextUrl.searchParams.get('start')
    const parsedStart = requestedStart ? new Date(requestedStart) : null
    const earliestAllowed = new Date(now)
    earliestAllowed.setUTCDate(earliestAllowed.getUTCDate() - 31)
    const start = parsedStart && !Number.isNaN(parsedStart.getTime())
      && parsedStart <= now && parsedStart >= earliestAllowed
      ? parsedStart
      : dashboardPeriodStart(period, now)

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true },
    })
    const teamMembers = currentUser?.teamId
      ? await prisma.user.findMany({
          where: { teamId: currentUser.teamId },
          select: { id: true },
        })
      : []
    const visibleUserIds = [...new Set([session.user.id, ...teamMembers.map(member => member.id)])]

    const [folders, links] = await Promise.all([
      prisma.folder.findMany({
        where: currentUser?.teamId
          ? {
              OR: [
                { userId: session.user.id },
                { teamId: currentUser.teamId, teamShared: true },
              ],
            }
          : { userId: session.user.id },
        select: {
          id: true,
          name: true,
          parentId: true,
        },
      }),
      prisma.link.findMany({
        where: currentUser?.teamId
          ? {
              OR: [
                { userId: { in: visibleUserIds } },
                { teamId: currentUser.teamId, teamShared: true },
              ],
            }
          : { userId: session.user.id },
        select: {
          id: true,
          folderId: true,
          isDirect: true,
          title: true,
          internalName: true,
          slug: true,
        },
      }),
    ])

    const linkIds = new Set(links.map(link => link.id))
    const folderIds = new Set(folders.map(folder => folder.id))
    // Une seule requete, bornee par lien ET par date. Avant : une requete par
    // lien sans borne de date, donc tout l'historique relu a chaque affichage
    // pour n'en garder que la periode demandee.
    const recentClicks = linkIds.size
      ? await prisma.click.findMany({
          where: {
            linkId: { in: [...linkIds] },
            createdAt: { gte: start, lte: now },
          },
          select: {
            linkId: true,
            folderIdAtClick: true,
            multiLinkId: true,
            createdAt: true,
          },
        })
      : []

    const insights = buildFolderInsights({
      period,
      now,
      timeZone,
      folders,
      links,
      clicks: recentClicks
        .filter(click => linkIds.has(click.linkId))
        .map(click => ({
          ...click,
          folderIdAtClick: click.folderIdAtClick && folderIds.has(click.folderIdAtClick)
            ? click.folderIdAtClick
            : null,
        })),
    })

    return NextResponse.json({
      period,
      start: start.toISOString(),
      end: now.toISOString(),
      insights,
    }, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Unable to load folder analytics:', error)
    return NextResponse.json({ error: 'Unable to load folder analytics' }, { status: 500 })
  }
}
