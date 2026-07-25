import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { message: 'Verification token required' },
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
        { message: 'Invalid or already used token' },
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
        { message: 'The verification link has expired' },
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
          message: 'Email already verified. You can log in.',
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
        message: 'Email verified successfully. You can now log in.',
        success: true
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
