import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { EmailService } from '@/lib/email-service'
import { nanoid } from 'nanoid'
import { checkRateLimit, getClientIP, RateLimitPresets } from '@/lib/rate-limit'
import { validateUsername } from '@/lib/username'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : ''
    const preferredUsername = body.username ? validateUsername(body.username) : null

    const rateLimit = checkRateLimit(`register:${getClientIP(request)}`, RateLimitPresets.AUTH_REGISTER)
    if (!rateLimit.success) {
      return NextResponse.json({ message: rateLimit.message }, { status: 429 })
    }

    // Validation basique
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { message: 'Email valide et mot de passe de 8 à 128 caractères requis' },
        { status: 400 }
      )
    }

    if (preferredUsername && 'error' in preferredUsername) {
      return NextResponse.json({ message: preferredUsername.error }, { status: 400 })
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
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24) || 'creator'
    let username = preferredUsername && 'username' in preferredUsername ? preferredUsername.username : baseUsername
    let counter = 1

    while (await prisma.user.findUnique({ where: { username } })) {
      if (preferredUsername && 'username' in preferredUsername) {
        return NextResponse.json({ message: "Ce nom d’utilisateur vient d’être pris. Choisissez-en un autre." }, { status: 409 })
      }
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
    return NextResponse.json(
      { 
        message: 'Compte créé avec succès ! Vérifiez votre email pour activer votre compte.',
        user: { id: user.id, email: user.email, name: user.name, username: user.username },
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
