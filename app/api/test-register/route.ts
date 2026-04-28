import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const steps: any[] = []

  try {
    steps.push({ step: 1, action: 'Parse body', status: 'start' })
    const body = await request.json()
    const { email, password, name } = body
    steps.push({ step: 1, action: 'Parse body', status: 'success', data: { email, hasPassword: !!password } })

    steps.push({ step: 2, action: 'Validation', status: 'start' })
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis', steps }, { status: 400 })
    }
    steps.push({ step: 2, action: 'Validation', status: 'success' })

    steps.push({ step: 3, action: 'Check existing user', status: 'start' })
    const existingUser = await prisma.user.findUnique({ where: { email } })
    steps.push({ step: 3, action: 'Check existing user', status: 'success', exists: !!existingUser })

    if (existingUser) {
      return NextResponse.json({
        error: 'Un utilisateur avec cet email existe deja',
        steps,
      }, { status: 400 })
    }

    steps.push({ step: 4, action: 'Generate username', status: 'start' })
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    let username = baseUsername
    let counter = 1
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`
      counter++
    }
    steps.push({ step: 4, action: 'Generate username', status: 'success', username })

    steps.push({ step: 5, action: 'Hash password', status: 'start' })
    const hashedPassword = await bcrypt.hash(password, 12)
    steps.push({ step: 5, action: 'Hash password', status: 'success' })

    steps.push({ step: 6, action: 'Create user', status: 'start' })
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        username,
        emailVerified: true,
      },
    })
    steps.push({ step: 6, action: 'Create user', status: 'success', userId: user.id })

    return NextResponse.json({
      message: 'Test reussi. L utilisateur peut etre cree.',
      steps,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Erreur lors du test',
      message: error.message,
      steps,
      stack: error.stack,
    }, { status: 500 })
  }
}
