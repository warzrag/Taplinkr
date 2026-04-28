import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import os from 'os'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
    }

    let dbStatus = 'error'
    let dbStats: Record<string, any> = {}
    try {
      const [userCount, linkCount, clickCount, folderCount] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.link.count().catch(() => 0),
        prisma.click.count().catch(() => 0),
        prisma.folder.count().catch(() => 0),
      ])

      dbStatus = 'healthy'
      dbStats = {
        users: userCount,
        links: linkCount,
        clicks: clickCount,
        folders: folderCount,
      }
    } catch (error: any) {
      dbStatus = 'error'
      dbStats = {
        error: error.message,
        hint: 'Firestore connection issue. Check FIREBASE_SERVICE_ACCOUNT_JSON.',
      }
    }

    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: `${(((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2)}%`,
      },
      cpu: {
        model: os.cpus()[0]?.model || 'Unknown',
        cores: os.cpus().length,
        speed: os.cpus()[0]?.speed || 0,
      },
    }

    const envStatus = {
      firebase: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
      nextAuth: !!process.env.NEXTAUTH_SECRET,
      email: !!process.env.RESEND_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
    }

    const recentEvents = await prisma.analyticsEvent.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }).catch(() => 0)

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        stats: dbStats,
      },
      system: systemInfo,
      environment: envStatus,
      performance: {
        last24h: recentEvents,
        avgResponseTime: 'N/A',
      },
      services: {
        firebase: checkFirebase(),
        stripe: checkStripe(),
        email: checkEmail(),
      },
      errors: [],
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
    }, { status: 500 })
  }
}

function checkFirebase() {
  return process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? { status: 'configured' }
    : { status: 'missing_env', env: 'FIREBASE_SERVICE_ACCOUNT_JSON' }
}

function checkStripe() {
  return process.env.STRIPE_SECRET_KEY
    ? { status: 'configured' }
    : { status: 'not_configured' }
}

function checkEmail() {
  return process.env.RESEND_API_KEY
    ? { status: 'configured' }
    : { status: 'not_configured' }
}
