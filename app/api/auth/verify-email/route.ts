import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { message: 'Token de vérification requis' },
        { status: 400 }
      )
    }

    // Chercher l'utilisateur avec ce token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerified: false
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Token invalide ou déjà utilisé' },
        { status: 404 }
      )
    }

    // Vérifier si le token n'a pas expiré
    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return NextResponse.json(
        { message: 'Le lien de vérification a expiré' },
        { status: 400 }
      )
    }

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null
      }
    })

    return NextResponse.json(
      { 
        message: 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.',
        success: true
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}