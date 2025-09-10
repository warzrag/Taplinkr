import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import os from 'os'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier si l'utilisateur est admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // 1. Santé de la base de données
    let dbStatus = 'error'
    let dbStats = {}
    try {
      // Tester la connexion d'abord
      await prisma.$queryRaw`SELECT 1`
      
      // Ensuite récupérer les stats une par une pour éviter les erreurs
      const userCount = await prisma.user.count().catch(() => 0)
      const linkCount = await prisma.link.count().catch(() => 0)
      const clickCount = await prisma.click.count().catch(() => 0)
      const folderCount = await prisma.folder.count().catch(() => 0)
      
      dbStatus = 'healthy'
      dbStats = {
        users: userCount,
        links: linkCount,
        clicks: clickCount,
        folders: folderCount
      }
    } catch (error) {
      dbStatus = 'error'
      dbStats = { 
        error: error.message,
        hint: 'Database connection issue - may need to restart the app'
      }
    }

    // 2. Informations système
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
      },
      cpu: {
        model: os.cpus()[0]?.model || 'Unknown',
        cores: os.cpus().length,
        speed: os.cpus()[0]?.speed || 0
      }
    }

    // 3. Variables d'environnement (sans les secrets)
    const envStatus = {
      database: !!process.env.DATABASE_URL,
      nextAuth: !!process.env.NEXTAUTH_SECRET,
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      email: !!process.env.RESEND_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL
    }

    // 4. Performance récente
    const recentStats = await prisma.analyticsEvent.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Dernières 24h
        }
      },
      _count: true,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 5. Erreurs récentes (si vous avez un système de logs)
    const recentErrors = [] // À implémenter selon votre système de logs

    // 6. État des services externes
    const externalServices = {
      supabase: await checkSupabase(),
      stripe: await checkStripe(),
      email: await checkEmail()
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        stats: dbStats
      },
      system: systemInfo,
      environment: envStatus,
      performance: {
        last24h: recentStats.length,
        avgResponseTime: 'N/A' // À implémenter
      },
      services: externalServices,
      errors: recentErrors
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      error: error.message 
    }, { status: 500 })
  }
}

async function checkSupabase() {
  try {
    // Test simple de connexion
    const user = await prisma.user.findFirst()
    return { status: 'healthy', latency: 'N/A' }
  } catch (error) {
    return { status: 'error', error: error.message }
  }
}

async function checkStripe() {
  // À implémenter selon votre config Stripe
  return { status: 'not_configured' }
}

async function checkEmail() {
  // À implémenter selon votre config email
  return { status: 'not_configured' }
}