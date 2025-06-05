import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
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
    
    const { linkId, isActive } = body

    if (typeof linkId !== 'string' || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'linkId et isActive requis' }, { status: 400 })
    }

    // Vérifier que le lien appartient à l'utilisateur
    const existingLink = await prisma.link.findFirst({
      where: { id: linkId, userId: session.user.id }
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    const link = await prisma.link.update({
      where: { id: linkId },
      data: { isActive }
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Erreur lors du toggle du lien:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}