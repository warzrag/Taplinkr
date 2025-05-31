import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { customization } = body

    // Vérifier que le lien appartient à l'utilisateur ou que c'est un admin
    const link = await prisma.link.findUnique({
      where: { id },
    })

    if (!link) {
      return NextResponse.json({ error: 'Lien introuvable' }, { status: 404 })
    }

    if (link.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Mettre à jour la customisation du lien
    const updatedLink = await prisma.link.update({
      where: { id },
      data: { 
        customization: customization,
        updatedAt: new Date()
      },
    })

    return NextResponse.json(updatedLink)
  } catch (error) {
    console.error('Update link customization error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la customisation' }, { status: 500 })
  }
}