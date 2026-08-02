import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import {
  DomainIntegrationError,
  domainManager,
  isCustomDomainAutomationConfigured,
} from '@/lib/domain-manager'
import { prisma } from '@/lib/prisma'
import { checkTeamPermission } from '@/lib/team-permissions'

function serializeDomain(domain: any) {
  let dnsRecords = []
  try {
    dnsRecords = domain.dnsRecords ? JSON.parse(domain.dnsRecords) : []
  } catch {
    dnsRecords = []
  }
  return { ...domain, dnsRecords }
}

async function currentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, teamId: true, teamRole: true, role: true },
  })
}

function errorResponse(error: unknown) {
  if (error instanceof DomainIntegrationError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error('Custom-domain request failed:', error)
  return NextResponse.json({ error: 'Unable to update the custom domain.' }, { status: 500 })
}

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [domainRows, linkRows, allowed] = await Promise.all([
      // Keep these Firestore reads on single-field indexes. Sorting and the
      // small ownership/status checks are intentionally completed in memory
      // so this screen does not depend on a newly-created composite index.
      prisma.customDomain.findMany({ where: { userId: user.id } }),
      prisma.link.findMany({
        where: {
          OR: [
            { userId: user.id },
            ...(user.teamId ? [{ teamId: user.teamId }] : []),
          ],
        },
        select: {
          id: true,
          userId: true,
          teamId: true,
          teamShared: true,
          isActive: true,
          order: true,
          slug: true,
          title: true,
          internalName: true,
          isDirect: true,
        },
      }),
      checkTeamPermission(user.id, 'hasCustomDomain'),
    ])

    const domains = domainRows.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    const links = linkRows
      .filter((link: any) => link.isActive && (
        link.userId === user.id ||
        Boolean(user.teamId && link.teamId === user.teamId && link.teamShared)
      ))
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      .map(({ id, slug, title, internalName, isDirect }: any) => ({
        id,
        slug,
        title,
        internalName,
        isDirect,
      }))

    return NextResponse.json({
      domains: domains.map(serializeDomain),
      links,
      allowed: allowed || user.role.toLowerCase() === 'admin',
      automationConfigured: isCustomDomainAutomationConfigured(),
      maxDomains: 3,
    })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const allowed = await checkTeamPermission(user.id, 'hasCustomDomain')
    if (!allowed && user.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Custom domains require the Premium plan.' }, { status: 403 })
    }

    const count = await prisma.customDomain.count({ where: { userId: user.id } })
    if (count >= 3) {
      return NextResponse.json({ error: 'You can connect up to 3 custom domains.' }, { status: 403 })
    }

    const body = await request.json()
    const domain = typeof body.domain === 'string' ? body.domain : ''
    const linkId = typeof body.linkId === 'string' ? body.linkId : ''
    if (!domain || !linkId) {
      return NextResponse.json({ error: 'Choose a domain and a destination.' }, { status: 400 })
    }

    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        isActive: true,
        OR: [
          { userId: user.id },
          ...(user.teamId ? [{ teamId: user.teamId, teamShared: true }] : []),
        ],
      },
      select: { slug: true },
    })
    if (!link) return NextResponse.json({ error: 'Destination link not found.' }, { status: 404 })

    const created = await domainManager.addDomain(user.id, { domain, redirectTo: link.slug })
    return NextResponse.json({ domain: serializeDomain(created) }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Domain id is required.' }, { status: 400 })
    await domainManager.deleteDomain(id, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
