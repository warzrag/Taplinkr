import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET - Récupérer tous les dossiers de l'utilisateur (personnels + équipe)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'utilisateur et son équipe
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, teamId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Inclure les dossiers personnels ET les dossiers d'équipe partagés
    const folders = await prisma.folder.findMany({
      where: {
        OR: [
          { userId: user.id },  // Mes dossiers personnels
          ...(user.teamId ? [{
            teamId: user.teamId,  // Dossiers d'équipe
            teamShared: true
          }] : [])
        ],
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
  console.log('📁 [API FOLDERS] POST /api/folders appelé')
  
  try {
    const session = await getServerSession(authOptions)
    console.log('📁 [API FOLDERS] Session:', { 
      email: session?.user?.email,
      hasSession: !!session 
    })
    
    if (!session?.user?.email) {
      console.log('❌ [API FOLDERS] Erreur: Pas de session')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color, icon, parentId } = body
    console.log('📁 [API FOLDERS] Body reçu:', body)

    // Vérifier que le nom est fourni
    if (!name || name.trim() === '') {
      console.log('❌ [API FOLDERS] Erreur: Nom vide')
      return NextResponse.json({ error: 'Le nom du dossier est requis' }, { status: 400 })
    }

    // Récupérer l'utilisateur
    console.log('📁 [API FOLDERS] Recherche utilisateur:', session.user.email)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    console.log('📁 [API FOLDERS] Utilisateur trouvé:', { 
      id: user?.id, 
      email: user?.email,
      found: !!user 
    })

    if (!user) {
      console.log('❌ [API FOLDERS] Erreur: Utilisateur non trouvé')
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

    const folderData = {
      name: name.trim(),
      description: description?.trim() || null,
      color: color || '#3b82f6',
      icon: icon || '📁',
      userId: user.id,
      parentId: parentId || null,
      order: (lastFolder?.order || 0) + 1
    }
    
    console.log('📁 [API FOLDERS] Création du dossier avec les données:', folderData)
    
    const folder = await prisma.folder.create({
      data: folderData,
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
    
    console.log('✅ [API FOLDERS] Dossier créé avec succès:', {
      id: folder.id,
      name: folder.name,
      userId: folder.userId
    })

    return NextResponse.json(folder)
  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error)
    
    // Gestion détaillée des erreurs Prisma
    if (error instanceof Error) {
      console.error('Message d\'erreur:', error.message)
      console.error('Stack trace:', error.stack)
      
      // Vérifier si c'est une erreur Prisma
      if (error.message.includes('P2002')) {
        return NextResponse.json({ 
          error: 'Un dossier avec ce nom existe déjà' 
        }, { status: 400 })
      }
      
      if (error.message.includes('P2025')) {
        return NextResponse.json({ 
          error: 'Utilisateur ou données introuvables' 
        }, { status: 404 })
      }
    }
    
    return NextResponse.json({ 
      error: 'Erreur lors de la création du dossier',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}