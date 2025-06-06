import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// PUT - Déplacer un lien vers un dossier
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { folderId } = body

    // Vérifier que le lien appartient à l'utilisateur
    const existingLink = await prisma.link.findFirst({
      where: { 
        id: params.id, 
        user: { email: session.user.email } 
      }
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    // Si folderId est fourni, vérifier que le dossier appartient à l'utilisateur
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { 
          id: folderId, 
          user: { email: session.user.email } 
        }
      })

      if (!folder) {
        return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
      }
    }

    // Mettre à jour le lien
    const link = await prisma.link.update({
      where: { id: params.id },
      data: { folderId: folderId || null },
      include: {
        multiLinks: {
          orderBy: { order: 'asc' }
        },
        folder: true
      }
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Erreur lors du déplacement du lien:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}