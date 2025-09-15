import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Test 1: Compter les clics
    let clickCount = 0
    try {
      clickCount = await prisma.click.count()
    } catch (e: any) {
      return NextResponse.json({ 
        error: 'Erreur counting clicks',
        details: e.message,
        hint: 'La table clicks n\'existe peut-être pas'
      }, { status: 500 })
    }

    // Test 2: Récupérer un clic simple
    let firstClick = null
    try {
      firstClick = await prisma.click.findFirst({
        select: {
          id: true,
          linkId: true,
          createdAt: true
        }
      })
    } catch (e: any) {
      return NextResponse.json({ 
        error: 'Erreur fetching click',
        details: e.message,
        clickCount,
        hint: 'Problème avec la structure de la table'
      }, { status: 500 })
    }

    // Test 3: Vérifier les colonnes disponibles
    let clickWithAllFields = null
    try {
      clickWithAllFields = await prisma.click.findFirst({
        select: {
          id: true,
          linkId: true,
          userId: true,
          ip: true,
          userAgent: true,
          referer: true,
          country: true,
          city: true,
          region: true,
          device: true,
          createdAt: true
        }
      })
    } catch (e: any) {
      return NextResponse.json({ 
        error: 'Certaines colonnes manquent',
        details: e.message,
        clickCount,
        firstClick,
        hint: 'Les colonnes country, city, region ou device n\'existent peut-être pas'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      clickCount,
      firstClick,
      clickWithAllFields,
      message: 'Tout fonctionne correctement'
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur générale',
      details: error.message
    }, { status: 500 })
  }
}