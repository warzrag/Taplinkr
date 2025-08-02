import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
// Email temporairement désactivé
// const emailModule = process.env.RESEND_API_KEY 
//   ? require('@/lib/email-resend')
//   : require('@/lib/email')
// const { sendEmail, getVerificationEmailTemplate } = emailModule

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

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

    // Générer un token de vérification unique
    const emailVerificationToken = nanoid(32)
    const emailVerificationExpiry = new Date()
    emailVerificationExpiry.setHours(emailVerificationExpiry.getHours() + 24) // Expire dans 24h

    // Créer l'utilisateur (temporairement avec email vérifié automatiquement)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        username,
        emailVerified: true, // Temporairement activé automatiquement
        emailVerificationToken,
        emailVerificationExpiry
      }
    })

    // Email désactivé temporairement pour le déploiement initial
    /*
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${emailVerificationToken}`
    
    await sendEmail({
      to: email,
      subject: 'Vérifiez votre compte LinkTracker',
      html: getVerificationEmailTemplate(user.name || username, verificationUrl)
    })
    */

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user

    return NextResponse.json(
      { 
        message: 'Compte créé avec succès !',
        user: userWithoutSensitiveData,
        requiresVerification: false // Email auto-vérifié temporairement
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}