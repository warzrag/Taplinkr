import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer le premier lien de l'utilisateur
    const firstLink = await prisma.link.findFirst({
      where: { userId: session.user.id },
      select: { id: true, slug: true, title: true }
    })

    if (!firstLink) {
      return NextResponse.json({ 
        error: 'Aucun lien trouvé. Créez d\'abord un lien.' 
      }, { status: 404 })
    }

    // Créer un clic de test
    const testClick = await prisma.click.create({
      data: {
        linkId: firstLink.id,
        userId: session.user.id,
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        referer: 'https://google.com',
        device: 'desktop',
        country: 'France'
      }
    })

    // Vérifier combien de clics existent maintenant
    const totalClicks = await prisma.click.count({
      where: { userId: session.user.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Clic de test créé avec succès',
      clickCreated: testClick,
      linkUsed: firstLink,
      totalClicksForUser: totalClicks
    })

  } catch (error) {
    console.error('Erreur création clic test:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du clic test', details: error },
      { status: 500 }
    )
  }
}