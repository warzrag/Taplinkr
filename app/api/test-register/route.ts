import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const steps: any[] = []
  
  try {
    // Étape 1: Parser le body
    steps.push({ step: 1, action: 'Parse body', status: 'start' })
    const body = await request.json()
    const { email, password, name } = body
    steps.push({ step: 1, action: 'Parse body', status: 'success', data: { email, hasPassword: !!password } })

    // Étape 2: Validation
    steps.push({ step: 2, action: 'Validation', status: 'start' })
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email et mot de passe requis',
        steps
      }, { status: 400 })
    }
    steps.push({ step: 2, action: 'Validation', status: 'success' })

    // Étape 3: Importer Prisma
    steps.push({ step: 3, action: 'Import Prisma', status: 'start' })
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    steps.push({ step: 3, action: 'Import Prisma', status: 'success' })

    // Étape 4: Connexion à la DB
    steps.push({ step: 4, action: 'Connect to DB', status: 'start' })
    await prisma.$connect()
    steps.push({ step: 4, action: 'Connect to DB', status: 'success' })

    // Étape 5: Vérifier si l'utilisateur existe
    steps.push({ step: 5, action: 'Check existing user', status: 'start' })
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    steps.push({ step: 5, action: 'Check existing user', status: 'success', exists: !!existingUser })

    if (existingUser) {
      await prisma.$disconnect()
      return NextResponse.json({
        error: 'Un utilisateur avec cet email existe déjà',
        steps
      }, { status: 400 })
    }

    // Étape 6: Générer username
    steps.push({ step: 6, action: 'Generate username', status: 'start' })
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    let username = baseUsername
    let counter = 1
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`
      counter++
    }
    steps.push({ step: 6, action: 'Generate username', status: 'success', username })

    // Étape 7: Hasher le mot de passe
    steps.push({ step: 7, action: 'Hash password', status: 'start' })
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)
    steps.push({ step: 7, action: 'Hash password', status: 'success' })

    // Étape 8: Créer l'utilisateur
    steps.push({ step: 8, action: 'Create user', status: 'start' })
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        username,
        emailVerified: true
      }
    })
    steps.push({ step: 8, action: 'Create user', status: 'success', userId: user.id })

    await prisma.$disconnect()

    return NextResponse.json({
      message: 'Test réussi ! L\'utilisateur peut être créé.',
      steps,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Erreur lors du test',
      message: error.message,
      steps,
      stack: error.stack
    }, { status: 500 })
  }
}