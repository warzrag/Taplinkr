import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidTimeZone, readChosenTimeZone, writeChosenTimeZone } from '@/lib/reporting-timezone'

export const dynamic = 'force-dynamic'

/** Fuseau des stats choisi par la personne connectee (null = celui de l'appareil). */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { analytics: true },
  })
  return NextResponse.json({ timeZone: readChosenTimeZone(profile?.analytics) })
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const requested = body?.timeZone
  if (requested !== null && !isValidTimeZone(requested)) {
    return NextResponse.json({ error: 'Unknown time zone.' }, { status: 400 })
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { analytics: true },
  })
  const analytics = writeChosenTimeZone(profile?.analytics, requested)
  await prisma.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, analytics },
    update: { analytics },
  })
  return NextResponse.json({ timeZone: requested })
}
