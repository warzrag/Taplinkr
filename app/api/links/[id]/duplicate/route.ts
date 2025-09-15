import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { getUpgradeMessage } from '@/lib/permissions'
import { checkTeamLimit } from '@/lib/team-permissions'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id

    // Vérifier que le lien appartient à l'utilisateur
    const existingLink = await prisma.link.findFirst({
      where: { id: params.id, userId: userId }
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    // Vérifier les limites du plan avant de dupliquer
    const linkCount = await prisma.link.count({
      where: { userId }
    })

    if (!(await checkTeamLimit(userId, 'maxLinksPerPage', linkCount))) {
      return NextResponse.json({ 
        error: 'Limite de liens atteinte',
        message: getUpgradeMessage('maxLinksPerPage')
      }, { status: 403 })
    }

    // Générer un nouveau slug unique
    let newSlug = `${existingLink.slug}-copy`
    let counter = 1

    while (await prisma.link.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${existingLink.slug}-copy-${counter}`
      counter++
    }

    // Dupliquer le lien
    const duplicatedLink = await prisma.link.create({
      data: {
        slug: newSlug,
        url: existingLink.url,
        title: existingLink.title ? `${existingLink.title} (copie)` : null,
        description: existingLink.description,
        type: existingLink.type,
        shield: existingLink.shield,
        isActive: false, // Les liens dupliqués sont inactifs par défaut
        userId: session.user.id
      }
    })

    return NextResponse.json(duplicatedLink, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la duplication du lien:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}