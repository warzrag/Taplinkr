import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkIds } = body // Array d'IDs dans le nouvel ordre

    if (!Array.isArray(linkIds)) {
      return NextResponse.json({ error: 'linkIds must be an array' }, { status: 400 })
    }

    // Vérifier que tous les liens appartiennent à l'utilisateur
    const links = await prisma.link.findMany({
      where: {
        id: { in: linkIds },
        userId: session.user.id
      }
    })

    if (links.length !== linkIds.length) {
      return NextResponse.json({ error: 'Some links do not belong to this user' }, { status: 403 })
    }

    // Mettre à jour l'ordre de chaque lien
    const updatePromises = linkIds.map((linkId, index) =>
      prisma.link.update({
        where: { id: linkId },
        data: { order: index }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ message: 'Order updated' })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
