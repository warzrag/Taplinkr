import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/lib/permissions'
import { checkPermission } from '@/lib/permissions'
import { nanoid } from 'nanoid'

// GET /api/teams - Récupérer l'équipe de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        team: {
          include: {
            owner: {
              select: { id: true, name: true, email: true, image: true }
            },
            members: {
              select: { id: true, name: true, nickname: true, email: true, image: true, teamRole: true }
            },
            invitations: {
              where: { status: 'pending' },
              select: { id: true, email: true, role: true, createdAt: true }
            }
          }
        },
        ownedTeam: {
          include: {
            members: {
              select: { id: true, name: true, nickname: true, email: true, image: true, teamRole: true }
            },
            invitations: {
              where: { status: 'pending' },
              select: { id: true, email: true, role: true, createdAt: true }
            }
          }
        }
      }
    })

    const team = user?.ownedTeam || user?.team
    
    return NextResponse.json({ team })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'équipe:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'équipe' },
      { status: 500 }
    )
  }
}

// POST /api/teams - Créer une nouvelle équipe (Premium uniquement)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Le nom de l\'équipe est requis' }, { status: 400 })
    }

    // Vérifier les permissions Premium
    console.log('Recherche utilisateur:', session.user.id)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    console.log('Utilisateur trouvé:', user ? { id: user.id, plan: user.plan, role: user.role } : 'null')

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const permissions = getUserPermissions(user)
    console.log('Permissions:', permissions)
    
    // Les admins ont toujours accès aux équipes
    const isAdmin = user.role === 'admin'
    const hasTeamAccess = isAdmin || checkPermission(permissions, 'hasTeamMembers')
    console.log('Accès équipe:', hasTeamAccess, 'Admin:', isAdmin)
    
    if (!hasTeamAccess) {
      return NextResponse.json({ 
        error: 'Fonctionnalité Premium requise',
        message: 'Les équipes sont disponibles avec le plan Premium'
      }, { status: 403 })
    }

    // Vérifier si l'utilisateur a déjà une équipe
    const existingTeam = await prisma.team.findFirst({
      where: { ownerId: session.user.id }
    })

    if (existingTeam) {
      console.log('❌ Équipe existante trouvée:', { id: existingTeam.id, name: existingTeam.name })
      return NextResponse.json({ 
        error: 'Vous possédez déjà une équipe',
        existingTeam: { id: existingTeam.id, name: existingTeam.name }
      }, { status: 400 })
    }

    // Créer l'équipe
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${nanoid(6)}`
    
    console.log('Création équipe avec:', { name, description, slug, ownerId: session.user.id })
    
    const team = await prisma.team.create({
      data: {
        name,
        description,
        slug,
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true }
        },
        members: {
          select: { id: true, name: true, email: true, image: true, teamRole: true }
        },
        invitations: {
          where: { status: 'pending' },
          select: { id: true, email: true, role: true, createdAt: true }
        }
      }
    })
    
    console.log('Équipe créée:', team.id)
    
    // Mettre à jour l'utilisateur pour définir son teamId et son rôle
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        teamId: team.id,
        teamRole: 'owner'
      }
    })

    return NextResponse.json({ team }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de l\'équipe:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'équipe' },
      { status: 500 }
    )
  }
}