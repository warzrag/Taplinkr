import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Réinitialiser les clics de TOUS les liens
    const result = await prisma.link.updateMany({
      data: {
        clicks: 0,
        views: 0
      }
    })

    console.log(`✅ ${result.count} liens réinitialisés`)
    console.log('  - Tous les clics: 0')
    console.log('  - Toutes les vues: 0')

    // Supprimer tous les enregistrements de clics
    const deletedClicks = await prisma.click.deleteMany({})
    console.log(`\n🗑️ ${deletedClicks.count} enregistrements de clics supprimés`)

    // Afficher la liste des liens réinitialisés
    const links = await prisma.link.findMany({
      select: {
        title: true,
        slug: true,
        clicks: true,
        views: true
      }
    })

    console.log('\n📊 État des liens:')
    links.forEach(link => {
      console.log(`  - ${link.title} (/${link.slug}): ${link.clicks} clics, ${link.views} vues`)
    })

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()