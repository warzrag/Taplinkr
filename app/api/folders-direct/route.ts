import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/redis-cache'
import { filtreLiensAttribues } from '@/lib/team-links'
import { chargerContexteEquipe } from '@/lib/team-context'

// Route qui utilise Prisma pour récupérer les dossiers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    console.log('🔍 [folders-direct] Requête GET reçue')

    if (!session?.user?.email) {
      console.error('❌ [folders-direct] Pas de session ou email')
      return NextResponse.json([])
    }

    console.log('🔍 [folders-direct] Session:', {
      email: session.user.email,
      hasId: !!session.user.id
    })

    // 🔥 RÉCUPÉRER L'UTILISATEUR VIA EMAIL (comme /api/folders)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, teamId: true }
    })

    if (!user) {
      console.error('❌ [folders-direct] Utilisateur non trouvé:', session.user.email)
      return NextResponse.json([])
    }

    console.log('✅ [folders-direct] Utilisateur trouvé:', {
      id: user.id,
      hasTeam: !!user.teamId
    })

    // 🔥 DÉSACTIVATION CACHE REDIS: Problème multi-instance Next.js
    // cache.del() n'invalide qu'une instance, pas toutes
    // On utilise uniquement localStorage côté client pour la performance
    console.log('⚡ [folders-direct] Requête DB (pas de cache Redis)')

    // Accès exclusif : les dossiers restent visibles, mais on n'y montre que
    // les liens attribués à la personne. Sans ce filtre, cette route rendrait
    // le réglage inutile : il suffirait de l'appeler pour tout revoir.
    const contexte = await chargerContexteEquipe(user.id)
    const filtreExclusif = filtreLiensAttribues({
      actorUserId: user.id,
      actorTeamRole: contexte.teamRole,
      restrictToAssigned: contexte.restrictToAssigned,
    })

    // ⚡ Optimisation: charger seulement les champs nécessaires + dossiers d'équipe
    const folders = await prisma.folder.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.teamId ? [{
            teamId: user.teamId,
            teamShared: true
          }] : [])
        ],
        parentId: null // Charger directement les dossiers racine
      },
      orderBy: { order: 'asc' },
      include: {
        links: {
          ...(filtreExclusif ? { where: filtreExclusif } : {}),
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            internalName: true,
            slug: true,
            icon: true,
            color: true,
            clicks: true,
            views: true,
            isActive: true,
            isDirect: true,
            order: true,
            folderId: true,
            assignedToUserId: true,
            assignedTo: {
              select: {
                id: true,
                name: true,
                nickname: true,
                email: true,
                image: true
              }
            },
            // Ne pas charger les multiLinks ici
            _count: {
              select: { multiLinks: true }
            }
          }
        },
        children: {
          orderBy: { order: 'asc' },
          include: {
            links: {
              ...(filtreExclusif ? { where: filtreExclusif } : {}),
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                internalName: true,
                slug: true,
                icon: true,
                color: true,
                clicks: true,
                views: true,
                isActive: true,
                isDirect: true,
                order: true,
                folderId: true,
                assignedToUserId: true,
                assignedTo: {
                  select: {
                    id: true,
                    name: true,
                    nickname: true,
                    email: true,
                    image: true
                  }
                },
                _count: {
                  select: { multiLinks: true }
                }
              }
            }
          }
        }
      }
    })

    console.log('✅ [folders-direct] Dossiers trouvés:', {
      count: folders.length,
      names: folders.map(f => f.name)
    })

    // 🔥 PAS DE CACHE REDIS (problème multi-instance)
    const response = NextResponse.json(folders)
    response.headers.set('X-Cache', 'NONE')
    response.headers.set('Cache-Control', 'private, no-cache, must-revalidate')

    return response

  } catch (error) {
    console.error('❌ Erreur API Folders Direct:', error)
    return NextResponse.json([])
  }
}