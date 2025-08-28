import { prisma } from '../lib/prisma'

// Script pour modifier la base de données directement
async function runDatabaseOperations() {
  try {
    // Exemple : Réinitialiser tous les compteurs de clics
    const resetClicks = await prisma.link.updateMany({
      data: { 
        clicks: 0,
        views: 0 
      }
    })
    console.log('Clics réinitialisés:', resetClicks)

    // Exemple : Ajouter des clics de test
    const testLink = await prisma.link.findFirst({
      where: { slug: 'lauravissantes' }
    })
    
    if (testLink) {
      const updated = await prisma.link.update({
        where: { id: testLink.id },
        data: { 
          clicks: { increment: 100 },
          views: { increment: 100 }
        }
      })
      console.log('Lien mis à jour:', updated)
    }

    // Afficher les totaux
    const links = await prisma.link.findMany()
    const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
    console.log('Total des clics dans la base:', totalClicks)

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  runDatabaseOperations()
}

export { runDatabaseOperations }