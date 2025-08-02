import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
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

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
    if (!user) {
      return NextResponse.json({
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.'
      })
    }

    // Générer un token de réinitialisation
    const token = nanoid(32)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // Supprimer les anciens tokens de réinitialisation pour cet utilisateur
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        type: 'password_reset'
      }
    })

    // Créer le nouveau token
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'password_reset',
        expiresAt
      }
    })

    // Envoyer l'email
    try {
      await sendPasswordResetEmail(user.email, user.name || user.username, token)
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      // Ne pas bloquer si l'email échoue, mais logger l'erreur
    }

    return NextResponse.json({
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.'
    })
  } catch (error) {
    console.error('Erreur forgot password:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}