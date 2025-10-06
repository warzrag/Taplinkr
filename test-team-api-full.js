const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testFullAPI() {
  console.log('🧪 TEST COMPLET API TEAM POUR ivorraflorent1@gmail.com\n')

  const email = 'ivorraflorent1@gmail.com'

  try {
    // 1. Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        teamId: true,
        teamRole: true
      }
    })

    console.log('1️⃣ Utilisateur:')
    console.log('   ID:', user.id)
    console.log('   Email:', user.email)
    console.log('   TeamId:', user.teamId)
    console.log('   TeamRole:', user.teamRole)
    console.log('')

    if (!user.teamId) {
      console.log('❌ PROBLÈME: L\'utilisateur n\'a pas de teamId!')
      return
    }

    // 2. Vérifier les permissions (comme requireTeamPermission)
    console.log('2️⃣ Vérification permissions VIEW_LINKS:')

    const PERMISSIONS = {
      owner: ['VIEW_LINKS', 'CREATE_LINK', 'EDIT_LINK', 'DELETE_LINK', 'SHARE_LINK'],
      admin: ['VIEW_LINKS', 'CREATE_LINK', 'EDIT_LINK', 'DELETE_LINK', 'SHARE_LINK'],
      editor: ['VIEW_LINKS', 'CREATE_LINK', 'EDIT_LINK', 'SHARE_LINK'],
      member: ['VIEW_LINKS', 'CREATE_LINK', 'EDIT_LINK', 'SHARE_LINK'],
      viewer: ['VIEW_LINKS']
    }

    const role = user.teamRole || 'viewer'
    const hasViewPermission = PERMISSIONS[role]?.includes('VIEW_LINKS') || false

    console.log('   Rôle:', role)
    console.log('   A la permission VIEW_LINKS:', hasViewPermission ? '✅ OUI' : '❌ NON')
    console.log('')

    if (!hasViewPermission) {
      console.log('❌ PROBLÈME: L\'utilisateur n\'a pas la permission VIEW_LINKS!')
      return
    }

    // 3. Simuler exactement la requête de l'API
    console.log('3️⃣ Requête API (exactement comme /api/team/sync-links):')
    console.log('   WHERE teamId =', user.teamId)
    console.log('   WHERE teamShared = true')
    console.log('')

    const teamLinks = await prisma.link.findMany({
      where: {
        teamId: user.teamId,
        teamShared: true
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        clicks: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        lastModifiedBy: true,
        teamShared: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        originalOwner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lastModifier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { multiLinks: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    console.log('4️⃣ RÉSULTAT API:')
    console.log('   Nombre de liens:', teamLinks.length)
    console.log('')

    if (teamLinks.length === 0) {
      console.log('❌ AUCUN LIEN RETOURNÉ!\n')

      // Debug supplémentaire
      const allLinksWithTeamId = await prisma.link.findMany({
        where: { teamId: user.teamId },
        select: { slug: true, teamShared: true }
      })
      console.log('   Debug: Liens avec teamId', user.teamId + ':', allLinksWithTeamId.length)
      allLinksWithTeamId.forEach(l => {
        console.log('     -', l.slug, '(teamShared:', l.teamShared + ')')
      })
    } else {
      console.log('✅ LIENS TROUVÉS:\n')
      teamLinks.forEach((link, i) => {
        console.log('   Lien', i + 1 + ':')
        console.log('     Slug:', link.slug)
        console.log('     Titre:', link.title)
        console.log('     Propriétaire:', link.user?.email)
        console.log('     TeamShared:', link.teamShared)
        console.log('     MultiLinks:', link._count.multiLinks)
        console.log('')
      })
    }

    // 5. Format de retour de l'API
    console.log('5️⃣ FORMAT DE RETOUR (ce que le frontend reçoit):')
    const apiResponse = {
      links: teamLinks,
      teamId: user.teamId,
      count: teamLinks.length
    }
    console.log(JSON.stringify(apiResponse, null, 2))

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testFullAPI()
