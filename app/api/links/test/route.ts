import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Test link endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
    }
    
    const { linkId } = body

    if (!linkId) {
      return NextResponse.json({ error: 'linkId requis' }, { status: 400 })
    }

    // Vérifier que le lien appartient à l'utilisateur
    const link = await prisma.link.findFirst({
      where: { 
        id: linkId, 
        userId: session.user.id 
      },
      include: {
        multiLinks: true
      }
    })

    if (!link) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    // Tester les URLs
    const results = []
    
    if (link.multiLinks && link.multiLinks.length > 0) {
      // Tester chaque multilink
      for (const multiLink of link.multiLinks) {
        try {
          const response = await fetch(multiLink.url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000) // Timeout de 5 secondes
          })
          
          results.push({
            url: multiLink.url,
            title: multiLink.title,
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
          })
        } catch (error) {
          results.push({
            url: multiLink.url,
            title: multiLink.title,
            status: 0,
            ok: false,
            statusText: 'Erreur de connexion'
          })
        }
      }
    }

    return NextResponse.json({
      linkId: link.id,
      title: link.title,
      slug: link.slug,
      results,
      testedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur lors du test du lien:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}