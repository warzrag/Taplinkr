import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username requis' }, { status: 400 })
    }

    // Nettoyer le username
    const cleanUsername = username.toLowerCase().trim()

    // Vérifier la validité du format
    const isValid = /^[a-z0-9_-]{3,30}$/.test(cleanUsername)
    
    if (!isValid) {
      return NextResponse.json({ 
        available: false, 
        error: 'Le nom d\'utilisateur doit contenir entre 3 et 30 caractères (lettres, chiffres, tirets et underscores uniquement)'
      }, { status: 200 })
    }

    // Vérifier les noms réservés
    const reservedUsernames = [
      'api', 'app', 'admin', 'dashboard', 'auth', 'login', 'signup', 'signin',
      'settings', 'profile', 'user', 'users', 'team', 'teams', 'help', 'support',
      'about', 'privacy', 'terms', 'legal', 'blog', 'news', 'contact', 'home',
      'www', 'mail', 'ftp', 'email', 'test', 'demo', 'root', 'public'
    ]

    if (reservedUsernames.includes(cleanUsername)) {
      return NextResponse.json({ 
        available: false, 
        error: 'Ce nom d\'utilisateur est réservé'
      }, { status: 200 })
    }

    // Vérifier si le username existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { username: cleanUsername },
      select: { id: true }
    })

    if (existingUser) {
      return NextResponse.json({ 
        available: false, 
        error: 'Ce nom d\'utilisateur est déjà pris'
      }, { status: 200 })
    }

    return NextResponse.json({ 
      available: true,
      username: cleanUsername
    })
  } catch (error) {
    console.error('Erreur vérification username:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}