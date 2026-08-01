import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'admin'
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  try {
    const domains = await prisma.customDomain.findMany({
      select: {
        id: true,
        userId: true,
        domain: true,
        subdomain: true,
        verified: true,
        sslEnabled: true,
        sslExpiry: true,
        redirectTo: true,
        createdAt: true,
        user: { select: { email: true, name: true, username: true, plan: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({
      domains,
      automationConfigured: Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID),
    })
  } catch (error) {
    console.error('Admin domains failed:', error)
    return NextResponse.json({ error: 'Unable to load domains' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Domain id is required' }, { status: 400 })

  try {
    const domain = await prisma.customDomain.findUnique({ where: { id } })
    if (!domain) return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    if (domain.verified || domain.sslEnabled) {
      return NextResponse.json({ error: 'Disconnect this domain from Vercel before removing its record.' }, { status: 409 })
    }
    await prisma.customDomain.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin domain removal failed:', error)
    return NextResponse.json({ error: 'Unable to remove domain record' }, { status: 500 })
  }
}
