import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const folderId = params.id

    // Récupérer le dossier avec ses liens ET sous-dossiers
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: session.user.id
      },
      include: {
        links: true,
        children: {
          include: {
            links: true
          }
        }
      }
    })

    if (!folder) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    // Calculer les statistiques
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 🔥 FIX: Calculer les clics du dossier + sous-dossiers (comme dans DragDropDashboard)
    const directClicks = folder.links.reduce((sum, link) =>
      sum + (link.clicks || 0), 0
    )

    const childrenClicks = (folder.children || []).reduce((sum, child) => {
      return sum + (child.links || []).reduce(
        (linkSum, link) => linkSum + (link.clicks || 0), 0
      )
    }, 0)

    const totalClicks = directClicks + childrenClicks

    // 🔥 FIX: Compter les liens du dossier + sous-dossiers
    const directLinksCount = folder.links.length
    const childrenLinksCount = (folder.children || []).reduce(
      (sum, child) => sum + (child.links?.length || 0), 0
    )
    const linksCount = directLinksCount + childrenLinksCount

    console.log(`📊 Folder Analytics: ${folder.name} - ${linksCount} liens (${directLinksCount} directs, ${childrenLinksCount} dans sous-dossiers) - ${totalClicks} clics (${directClicks} directs, ${childrenClicks} sous-dossiers)`)

    // Calcul simplifié du taux de croissance (simulation)
    // Dans une vraie app, on comparerait les clics sur différentes périodes
    const growthRate = totalClicks > 0 ? Math.floor(Math.random() * 30) - 10 : 0

    // 🔥 FIX: Top lien basé sur TOUS les liens (dossier + sous-dossiers)
    const allLinks = [
      ...folder.links,
      ...(folder.children || []).flatMap(child => child.links || [])
    ]

    const topLink = allLinks
      .map(link => ({
        title: link.title,
        clicks: link.clicks || 0
      }))
      .sort((a, b) => b.clicks - a.clicks)[0]

    // Heure de pic simulée (dans une vraie app, on analyserait les clicks par heure)
    const peakHour = 14 + Math.floor(Math.random() * 6) // Entre 14h et 20h

    // 🔥 FIX: Dernière activité basée sur TOUS les liens (dossier + sous-dossiers)
    const lastActivity = allLinks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]

    const formatLastActivity = (date: Date) => {
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffHours < 1) return "Il y a moins d'1h"
      if (diffHours < 24) return `Il y a ${diffHours}h`
      if (diffDays === 1) return "Hier"
      if (diffDays < 7) return `Il y a ${diffDays}j`
      return "Plus d'une semaine"
    }

    const result = {
      totalClicks,
      linksCount,
      growthRate,
      topLink: topLink?.clicks > 0 ? topLink : undefined,
      peakHour: peakHour,
      lastActivity: lastActivity ? formatLastActivity(new Date(lastActivity.updatedAt)) : "Aucune activité"
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics du dossier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}