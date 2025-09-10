import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    console.log('🔍 Debug Dashboard pour:', session.user.email)

    // 1. Vérifier directement avec Prisma
    const links = await prisma.link.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        multiLinks: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    // 2. Essayer aussi par email
    const linksByEmail = await prisma.link.findMany({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    // 3. Vérifier toutes les routes API
    const apiTests = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/links`).then(r => ({ route: '/api/links', ok: r.ok, status: r.status })),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/links-bridge`).then(r => ({ route: '/api/links-bridge', ok: r.ok, status: r.status })),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/links-direct`).then(r => ({ route: '/api/links-direct', ok: r.ok, status: r.status }))
    ]).catch(e => [])

    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
        username: session.user.username
      },
      
      results: {
        byPrisma: {
          count: links.length,
          links: links
        },
        byEmail: {
          count: linksByEmail.length,
          links: linksByEmail
        }
      },
      
      apiStatus: apiTests,
      
      debug: {
        timestamp: new Date().toISOString(),
        contextUsed: 'Le dashboard utilise /api/links-bridge qui cherche dans table users (minuscule)',
        problem: links.length > 0 ? 'Les liens existent mais links-bridge ne les trouve pas' : 'Aucun lien trouvé'
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur debug',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}