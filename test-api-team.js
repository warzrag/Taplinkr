const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testAPI() {
  console.log('🧪 TEST API /api/team/sync-links\n')

  const userId = 'cmfo461b3000211jifrvgjlf1' // ivorraflorent1@gmail.com
  const teamId = 'cmevf2x7d00039emy3xym5b93' // celia team

  try {
    // Simuler exactement ce que fait l'API
    console.log('📡 Simulation de l\'API GET /api/team/sync-links\n')
    console.log('UserId:', userId)
    console.log('TeamId:', teamId)
    console.log('')

    // C'est exactement la même requête que dans /api/team/sync-links
    const teamLinks = await prisma.link.findMany({
      where: {
        teamId: teamId,
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

    console.log('📊 RÉSULTATS:')
    console.log('Nombre de liens trouvés:', teamLinks.length)
    console.log('')

    if (teamLinks.length === 0) {
      console.log('❌ AUCUN LIEN TROUVÉ !\n')

      // Vérifier pourquoi
      console.log('🔍 Vérification détaillée:\n')

      const allLinksInTeam = await prisma.link.findMany({
        where: { teamId: teamId },
        select: { slug: true, teamShared: true, teamId: true }
      })
      console.log('Liens avec teamId =', teamId + ':', allLinksInTeam.length)
      allLinksInTeam.forEach(l => {
        console.log('  -', l.slug, '| teamShared:', l.teamShared)
      })

    } else {
      teamLinks.forEach((link, i) => {
        console.log('Lien', i + 1 + ':')
        console.log('  Slug:', link.slug)
        console.log('  Titre:', link.title)
        console.log('  Propriétaire:', link.user?.email || 'N/A')
        console.log('  MultiLinks:', link._count.multiLinks)
        console.log('  Vues:', link.views, '| Clics:', link.clicks)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()
