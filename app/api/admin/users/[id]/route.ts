import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    // Vérifier que l'utilisateur à supprimer n'est pas un admin
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true }
    })

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    if (userToDelete.role === 'admin') {
      return NextResponse.json(
        { error: 'Impossible de supprimer un administrateur' },
        { status: 403 }
      )
    }

    // Supprimer l'utilisateur et toutes ses données associées
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}