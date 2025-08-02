import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EmailService } from '@/lib/email-service'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return NextResponse.json(
        { message: 'Si cet email existe, un nouveau lien de vérification a été envoyé.' },
        { status: 200 }
      )
    }

    // Vérifier si l'email est déjà vérifié
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Cet email est déjà vérifié' },
        { status: 400 }
      )
    }

    // Supprimer les anciens tokens de vérification
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'email'
      }
    })

    // Créer un nouveau token
    const verificationToken = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: nanoid(32),
        type: 'email',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
      }
    })

    // Envoyer l'email
    await EmailService.sendVerificationEmail(
      user.email,
      user.name || user.username,
      verificationToken.token
    )

    return NextResponse.json(
      { message: 'Un nouveau lien de vérification a été envoyé à votre adresse email.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}