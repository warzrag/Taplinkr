import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS, type UserPlan } from '@/lib/permissions'
import { getTeamAwareUserPermissions } from '@/lib/team-permissions'

function activePlan(plan: string, expiresAt?: Date | null): UserPlan {
  if (expiresAt && expiresAt < new Date()) return 'free'
  return plan === 'standard' || plan === 'premium' ? plan : 'free'
}

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [user, permissions, landingPages, directLinks] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          teamId: true,
          teamRole: true,
          instagramUrl: true,
          twitterUrl: true,
          youtubeUrl: true,
          tiktokUrl: true,
          linkedinUrl: true,
        },
      }),
      getTeamAwareUserPermissions(session.user.id),
      prisma.link.count({ where: { userId: session.user.id, isDirect: false } }),
      prisma.link.count({ where: { userId: session.user.id, isDirect: true } }),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const plan = permissions.role === 'admin'
      ? 'premium'
      : activePlan(permissions.plan, permissions.planExpiresAt)
    const limits = PLAN_LIMITS[plan]
    const socialAccounts = [
      user.instagramUrl,
      user.twitterUrl,
      user.youtubeUrl,
      user.tiktokUrl,
      user.linkedinUrl,
    ].filter(Boolean).length

    return NextResponse.json({
      plan,
      landingPages: { used: landingPages, limit: limits.maxPages },
      directLinks: { used: directLinks, limit: limits.maxPages },
      socialAccounts: { used: socialAccounts, locked: !limits.hasSocialMedia },
      canManagePlan: !user.teamId || user.teamRole === 'owner',
    })
  } catch (error) {
    console.error('Unable to load sidebar usage:', error)
    return NextResponse.json({ error: 'Unable to load usage' }, { status: 500 })
  }
}
