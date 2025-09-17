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
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
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

    if (userToDelete.role === 'admin' || userToDelete.role === 'manager') {
      return NextResponse.json(
        { error: 'Impossible de supprimer un administrateur ou manager' },
        { status: 403 }
      )
    }

    // Un manager ne peut pas supprimer d'autres utilisateurs ayant des rôles spéciaux
    if (session.user.role === 'manager' && userToDelete.role !== 'user') {
      return NextResponse.json(
        { error: 'Vous ne pouvez supprimer que les utilisateurs standards' },
        { status: 403 }
      )
    }

    // Incrémenter sessionVersion pour déconnecter immédiatement, puis supprimer
    await prisma.user.update({
      where: { id: params.id },
      data: { sessionVersion: { increment: 1 } }
    })
    
    // Attendre un moment pour que la déconnexion se propage
    await new Promise(resolve => setTimeout(resolve, 1000))
    
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