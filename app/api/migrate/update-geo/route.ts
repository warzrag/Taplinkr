import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLocationFromIP } from '@/lib/geo-location-helper'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || session.user.email !== 'flore.bouchevereau@gmail.com') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer tous les clics sans données de géolocalisation
    const clicksWithoutGeo = await prisma.click.findMany({
      where: {
        AND: [
          { ip: { not: null } },
          { ip: { not: '' } },
          {
            OR: [
              { country: null },
              { country: 'Unknown' }
            ]
          }
        ]
      },
      select: {
        id: true,
        ip: true
      },
      take: 100 // Limiter pour éviter de surcharger l'API
    })

    console.log(`Trouvé ${clicksWithoutGeo.length} clics sans géolocalisation`)

    let updated = 0
    let errors = 0

    // Mettre à jour chaque clic avec les données de géolocalisation
    for (const click of clicksWithoutGeo) {
      if (!click.ip) continue

      try {
        const geoData = await getLocationFromIP(click.ip)
        
        await prisma.click.update({
          where: { id: click.id },
          data: {
            country: geoData.country || 'Unknown'
          }
        })
        
        updated++
        
        // Attendre un peu entre chaque requête pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Erreur pour le clic ${click.id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration terminée: ${updated} clics mis à jour, ${errors} erreurs`,
      total: clicksWithoutGeo.length,
      updated,
      errors
    })

  } catch (error) {
    console.error('Erreur lors de la migration:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la migration' },
      { status: 500 }
    )
  }
}