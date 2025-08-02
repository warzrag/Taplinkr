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

    // Chercher le token de vérification
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { 
        token,
        type: 'email'
      },
      include: { user: true }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { message: 'Token invalide ou déjà utilisé' },
        { status: 404 }
      )
    }

    // Vérifier si le token n'a pas expiré
    if (new Date() > verificationToken.expiresAt) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      })
      
      return NextResponse.json(
        { message: 'Le lien de vérification a expiré' },
        { status: 400 }
      )
    }

    // Vérifier si l'email est déjà vérifié
    if (verificationToken.user.emailVerified) {
      // Supprimer le token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      })
      
      return NextResponse.json(
        { 
          message: 'Email déjà vérifié. Vous pouvez vous connecter.',
          success: true
        },
        { status: 200 }
      )
    }

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: true
      }
    })

    // Supprimer le token utilisé
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id }
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