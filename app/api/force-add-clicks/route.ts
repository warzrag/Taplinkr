import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

// Créer une nouvelle instance de Prisma à chaque requête
// pour éviter les problèmes de prepared statements
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { slug, count } = await request.json()
    const clicksToAdd = count || 100

    // Exécuter une simple requête UPDATE
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "Link" SET clicks = clicks + $1, views = views + $1 WHERE slug = $2`,
      clicksToAdd,
      slug
    )

    // Récupérer le lien mis à jour
    const updatedLink = await prisma.$queryRawUnsafe(
      `SELECT id, title, slug, clicks, views FROM "Link" WHERE slug = $1`,
      slug
    )

    return NextResponse.json({
      success: true,
      message: `Ajouté ${clicksToAdd} clics au lien ${slug}`,
      rowsAffected: result,
      updatedLink
    })

  } catch (error: any) {
    console.error('Erreur force-add-clicks:', error)
    return NextResponse.json({ 
      error: error.message || String(error),
      code: error.code
    }, { status: 500 })
  } finally {
    // IMPORTANT: toujours déconnecter pour éviter les fuites
    await prisma.$disconnect()
  }
}