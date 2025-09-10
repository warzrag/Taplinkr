import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    console.log('🔍 Vérification urgente pour:', session.user.email)

    // 1. Vérifier l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        links: {
          include: {
            multiLinks: true
          }
        },
        folders: {
          include: {
            links: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'Utilisateur non trouvé',
        sessionUserId: session.user.id 
      }, { status: 404 })
    }

    // 2. Chercher TOUS les liens (même orphelins)
    const allLinks = await prisma.link.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { userId: user.id }
        ]
      },
      include: {
        multiLinks: true,
        folder: true
      }
    })

    // 3. Historique des clicks
    const recentClicks = await prisma.click.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // 4. Recherche par username
    const linksByUsername = await prisma.link.findMany({
      where: {
        user: {
          username: session.user.username
        }
      }
    })

    // 5. Vérifier s'il y a eu une migration ou changement d'ID
    const possibleUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.username }
        ]
      }
    })

    return NextResponse.json({
      status: 'emergency_check',
      timestamp: new Date().toISOString(),
      
      currentUser: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        linksCount: user.links.length,
        foldersCount: user.folders.length
      },
      
      sessionInfo: {
        userId: session.user.id,
        email: session.user.email,
        username: session.user.username
      },
      
      links: {
        viaUser: user.links,
        allFound: allLinks,
        byUsername: linksByUsername,
        total: allLinks.length
      },
      
      recentClicks: recentClicks,
      
      possibleDuplicateUsers: possibleUsers.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        createdAt: u.createdAt
      })),
      
      debug: {
        prismaConnection: 'OK',
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
      }
    })
  } catch (error) {
    console.error('❌ Erreur emergency check:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la vérification',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}