import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decrementLinkCount } from '@/lib/usage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params

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

    await prisma.link.delete({
      where: { id },
    })

    // Décrémenter le compteur de liens
    await decrementLinkCount(session.user.id)

    return NextResponse.json({ message: 'Lien supprimé avec succès' })
  } catch (error) {
    console.error('Delete link error:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du lien' }, { status: 500 })
  }
}

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
    const { title, url } = body

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

    const updatedLink = await prisma.link.update({
      where: { id },
      data: { title, url },
    })

    return NextResponse.json(updatedLink)
  } catch (error) {
    console.error('Update link error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du lien' }, { status: 500 })
  }
}