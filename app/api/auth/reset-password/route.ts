import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Valider la longueur du mot de passe
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Trouver le token et vérifier qu'il n'est pas expiré
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    if (verificationToken.type !== 'password_reset') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      )
    }

    if (new Date() > verificationToken.expiresAt) {
      // Supprimer le token expiré
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id }
      })
      
      return NextResponse.json(
        { error: 'Token expired. Please request a new link.' },
        { status: 400 }
      )
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { password: hashedPassword, sessionVersion: { increment: 1 } }
      }),
      prisma.verificationToken.deleteMany({
        where: { userId: verificationToken.userId, type: 'password_reset' }
      })
    ])

    return NextResponse.json({
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Erreur reset password:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
