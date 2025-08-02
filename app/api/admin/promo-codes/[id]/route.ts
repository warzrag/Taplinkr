import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Seul l'admin peut modifier les codes promo
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const { isActive } = await request.json()

    const promoCode = await prisma.promoCode.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error('Erreur lors de la modification du code promo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Seul l'admin peut supprimer les codes promo
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    await prisma.promoCode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du code promo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}