import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Partager TOUS les dossiers de l'utilisateur avec son équipe
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Récupérer l'utilisateur et son équipe
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, teamId: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.teamId) {
      return NextResponse.json({ error: 'You are not a member of a team' }, { status: 400 })
    }

    console.log('🔍 Partage des dossiers pour:', user.email)
    console.log('   TeamId:', user.teamId)

    // Récupérer tous les dossiers NON partagés de l'utilisateur
    const foldersToShare = await prisma.folder.findMany({
      where: {
        userId: user.id,
        teamShared: false
      },
      select: {
        id: true,
        name: true
      }
    })

    console.log(`📁 ${foldersToShare.length} dossier(s) à partager`)

    if (foldersToShare.length === 0) {
      return NextResponse.json({
        message: 'Tous vos dossiers sont déjà partagés',
        count: 0
      })
    }

    // Partager tous les dossiers
    const result = await prisma.folder.updateMany({
      where: {
        userId: user.id,
        teamShared: false
      },
      data: {
        teamShared: true,
        teamId: user.teamId,
        originalOwnerId: user.id
      }
    })

    console.log(`✅ ${result.count} dossier(s) partagés avec l'équipe`)

    // Récupérer la liste finale
    const sharedFolders = await prisma.folder.findMany({
      where: {
        teamId: user.teamId,
        teamShared: true
      },
      select: {
        id: true,
        name: true
      }
    })

    return NextResponse.json({
      message: `${result.count} dossier(s) partagés avec succès`,
      count: result.count,
      totalShared: sharedFolders.length,
      folders: sharedFolders.map(f => f.name)
    })
  } catch (error) {
    console.error('❌ Erreur partage dossiers:', error)
    return NextResponse.json({
      error: 'Unable to share folders',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
