import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { EmailService } from '@/lib/email-service'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validation basique
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Générer un username unique
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    let username = baseUsername
    let counter = 1

    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`
      counter++
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur avec email non vérifié
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        username,
        emailVerified: false // Email doit être vérifié
      }
    })

    // Créer un token de vérification
    const verificationToken = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: nanoid(32),
        type: 'email',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 heures
      }
    })

    // Envoyer l'email de vérification
    await EmailService.sendVerificationEmail(
      user.email,
      user.name || user.username,
      verificationToken.token
    )

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'Compte créé avec succès ! Vérifiez votre email pour activer votre compte.',
        user: userWithoutPassword,
        requiresEmailVerification: true
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { 
        message: 'Erreur serveur',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}