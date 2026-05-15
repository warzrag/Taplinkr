import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
    }

    let dbStatus = 'not_tested'
    let userCount = 0
    let linkCount = 0

    try {
      userCount = await prisma.user.count()
      linkCount = await prisma.link.count()
      dbStatus = 'connected'
    } catch (dbError: any) {
      dbStatus = dbError.message || 'connection_failed'
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      hasFirebaseServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
      dbStatus,
      stats: {
        users: userCount,
        links: linkCount,
      },
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NON DEFINI',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      error: String(error),
      environment: process.env.NODE_ENV,
      hasFirebaseServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    }, { status: 500 })
  }
}
