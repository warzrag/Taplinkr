import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    console.log('🧪 Test login for:', email)

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        emailVerified: true,
        username: true,
        banned: true,
        sessionVersion: true,
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Aucun utilisateur trouvé avec cet email'
      })
    }

    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: 'NO_PASSWORD',
        message: 'Cet utilisateur n\'a pas de mot de passe (compte OAuth?)'
      })
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Mot de passe incorrect'
      })
    }

    // Succès
    return NextResponse.json({
      success: true,
      message: 'Identifiants valides !',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        banned: user.banned,
        sessionVersion: user.sessionVersion,
      }
    })

  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json({
      error: 'SERVER_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
