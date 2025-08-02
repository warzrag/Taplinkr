import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 1. Vérifier la variable d'environnement
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return NextResponse.json({
        error: 'DATABASE_URL non définie',
        status: 'error'
      })
    }

    // 2. Analyser l'URL sans exposer le mot de passe
    const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/)
    if (!urlParts) {
      return NextResponse.json({
        error: 'Format DATABASE_URL invalide',
        format: 'Le format devrait être: postgresql://user:password@host:port/database',
        status: 'error'
      })
    }

    const [, user, , host, database] = urlParts
    
    // 3. Tester avec le client Prisma
    let prismaError = null
    try {
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()
      
      // Tenter une connexion
      await prisma.$connect()
      
      // Tester une requête simple
      const userCount = await prisma.user.count()
      
      await prisma.$disconnect()
      
      return NextResponse.json({
        status: 'success',
        database: {
          user,
          host,
          database: database.split('?')[0],
          params: database.includes('?') ? database.split('?')[1] : 'none'
        },
        connection: 'OK',
        userCount,
        message: 'Connexion à la base de données réussie!'
      })
    } catch (e: any) {
      prismaError = e.message
    }

    return NextResponse.json({
      status: 'error',
      database: {
        user,
        host,
        database: database.split('?')[0],
        params: database.includes('?') ? database.split('?')[1] : 'none'
      },
      error: prismaError,
      hint: 'Vérifiez que l\'URL est sur une seule ligne sans espaces'
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      type: 'general'
    }, { status: 500 })
  }
}