import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { validateUsername } from '@/lib/username'

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get('username')
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const validation = validateUsername(username)
    if ('error' in validation) {
      return NextResponse.json({ available: false, error: validation.error })
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: validation.username },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json({ available: false, error: "This username is already taken" })
    }

    return NextResponse.json({ available: true, username: validation.username })
  } catch (error) {
    console.error('Erreur de vérification du nom d’utilisateur :', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
