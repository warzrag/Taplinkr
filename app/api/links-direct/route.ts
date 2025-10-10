import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Route simplifiée qui utilise Prisma
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    // Récupérer l'équipe de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true }
    })

    // ⚡ Optimisation: charger seulement les champs essentiels
    // Inclure les liens personnels ET les liens d'équipe
    const links = await prisma.link.findMany({
      where: {
        OR: [
          { userId: session.user.id },  // Mes liens
          ...(user?.teamId ? [{
            teamId: user.teamId,         // Liens d'équipe
            teamShared: true
          }] : [])
        ]
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        internalName: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        coverImage: true,
        profileImage: true,
        profileStyle: true,
        clicks: true,
        views: true,
        isActive: true,
        isDirect: true,
        directUrl: true,
        order: true,
        folderId: true,
        teamShared: true,  // Pour distinguer les liens d'équipe
        userId: true,      // Pour savoir qui est le propriétaire
        assignedToUserId: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            nickname: true,
            email: true,
            image: true
          }
        },
        createdAt: true,
        updatedAt: true,
        // Charger seulement le count des multiLinks, pas tous les détails
        _count: {
          select: { multiLinks: true }
        }
      }
    })

    const response = NextResponse.json(links)

    // Cache de 30 secondes
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')

    return response
    
  } catch (error) {
    console.error('❌ Erreur API Links Direct:', error)
    return NextResponse.json([])
  }
}