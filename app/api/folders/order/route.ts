import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// PUT - Mettre à jour l'ordre des dossiers
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { folderIds } = body

    if (!Array.isArray(folderIds)) {
      return NextResponse.json({ error: 'folderIds doit être un tableau' }, { status: 400 })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier que tous les dossiers appartiennent à l'utilisateur
    const userFolders = await prisma.folder.findMany({
      where: { 
        userId: user.id,
        id: { in: folderIds }
      }
    })

    if (userFolders.length !== folderIds.length) {
      return NextResponse.json({ error: 'Certains dossiers ne vous appartiennent pas' }, { status: 403 })
    }

    // Mettre à jour l'ordre des dossiers
    const updatePromises = folderIds.map((folderId, index) => 
      prisma.folder.update({
        where: { id: folderId },
        data: { order: index }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre des dossiers:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}