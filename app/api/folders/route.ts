import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Récupérer tous les dossiers de l'utilisateur
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const folders = await prisma.folder.findMany({
      where: { 
        user: { email: session.user.email },
        parentId: null // Seulement les dossiers racine
      },
      include: {
        links: {
          include: {
            multiLinks: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        children: {
          include: {
            links: {
              include: {
                multiLinks: {
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            },
            children: {
              include: {
                links: {
                  include: {
                    multiLinks: {
                      orderBy: { order: 'asc' }
                    }
                  },
                  orderBy: { order: 'asc' }
                }
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST - Créer un nouveau dossier
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color, icon, parentId } = body

    // Vérifier que le nom est fourni
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Le nom du dossier est requis' }, { status: 400 })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier que le dossier parent existe si fourni
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: { 
          id: parentId,
          userId: user.id 
        }
      })
      
      if (!parentFolder) {
        return NextResponse.json({ error: 'Dossier parent introuvable' }, { status: 404 })
      }
    }

    // Calculer l'ordre pour le nouveau dossier
    const lastFolder = await prisma.folder.findFirst({
      where: { 
        userId: user.id,
        parentId: parentId || null
      },
      orderBy: { order: 'desc' }
    })

    const folder = await prisma.folder.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3b82f6',
        icon: icon || '📁',
        userId: user.id,
        parentId: parentId || null,
        order: (lastFolder?.order || 0) + 1
      },
      include: {
        links: {
          include: {
            multiLinks: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}