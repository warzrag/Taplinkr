import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Route pour administrer la base de données
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que c'est bien un admin
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { action, data } = await request.json()

    switch (action) {
      case 'ADD_TEST_CLICKS': {
        // Ajouter des clics de test à un lien
        const link = await prisma.link.findFirst({
          where: { slug: data.slug || 'lauravissantes' }
        })
        
        if (link) {
          const updated = await prisma.link.update({
            where: { id: link.id },
            data: { 
              clicks: { increment: data.count || 10 },
              views: { increment: data.count || 10 }
            }
          })
          
          // Créer aussi des entrées dans la table Click
          for (let i = 0; i < (data.count || 10); i++) {
            await prisma.click.create({
              data: {
                linkId: link.id,
                userId: link.userId,
                ip: `127.0.0.${i}`,
                userAgent: 'Test Bot',
                referer: 'test',
                device: 'desktop',
                country: 'France'
                // Pas de city ni region - ces colonnes n'existent pas
              }
            })
          }
          
          return NextResponse.json({ 
            success: true, 
            message: `Ajouté ${data.count || 10} clics au lien ${link.slug}`,
            link: updated 
          })
        }
        break
      }
      
      case 'RESET_ALL_CLICKS': {
        // Réinitialiser tous les compteurs
        await prisma.link.updateMany({
          data: { clicks: 0, views: 0 }
        })
        
        await prisma.click.deleteMany({})
        
        return NextResponse.json({ 
          success: true, 
          message: 'Tous les compteurs ont été réinitialisés' 
        })
      }
      
      case 'GET_STATS': {
        // Obtenir des statistiques
        const totalLinks = await prisma.link.count()
        const totalClicks = await prisma.click.count()
        const links = await prisma.link.findMany({
          select: { id: true, title: true, slug: true, clicks: true, views: true }
        })
        
        return NextResponse.json({
          totalLinks,
          totalClicks,
          links,
          totalClicksSum: links.reduce((sum, l) => sum + (l.clicks || 0), 0)
        })
      }
      
      default:
        return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Aucune action effectuée' }, { status: 400 })
    
  } catch (error) {
    console.error('Erreur DB Admin:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}