import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Réinitialiser une dernière fois
    await prisma.link.updateMany({
      data: {
        clicks: 0,
        views: 0
      }
    })

    const deleted = await prisma.click.deleteMany({})

    console.log('✅ Tous les liens réinitialisés à 0')
    console.log(`🗑️ ${deleted.count} enregistrements supprimés`)

    // Vérifier l'état final
    const links = await prisma.link.findMany({
      select: {
        title: true,
        slug: true,
        clicks: true,
        views: true
      },
      orderBy: { title: 'asc' }
    })

    console.log('\n📊 État final de tous les liens:')
    links.forEach(link => {
      console.log(`  - ${link.slug}: ${link.clicks} clics, ${link.views} vues`)
    })

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()