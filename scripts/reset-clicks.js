// Script pour remettre tous les clics à 0
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetClicks() {
  try {
    console.log('🔄 Remise à zéro des compteurs de clics...')

    // 1. Remettre les compteurs des MultiLink à 0
    const multiLinksUpdated = await prisma.multiLink.updateMany({
      data: {
        clicks: 0
      }
    })
    console.log(`✅ ${multiLinksUpdated.count} MultiLinks remis à 0`)

    // 2. Remettre les compteurs des Link à 0
    const linksUpdated = await prisma.link.updateMany({
      data: {
        clicks: 0
      }
    })
    console.log(`✅ ${linksUpdated.count} Links remis à 0`)

    // 3. Optionnel: Supprimer tous les clics historiques
    const clicksDeleted = await prisma.click.deleteMany({})
    console.log(`✅ ${clicksDeleted.count} clics historiques supprimés`)

    console.log('🎉 Tous les clics ont été remis à zéro !')
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetClicks()
