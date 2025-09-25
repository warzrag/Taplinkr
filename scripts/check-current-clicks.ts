import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Vérifier directement dans la base
    const link = await prisma.link.findUnique({
      where: { slug: 'lolobptss' },
      select: {
        id: true,
        title: true,
        slug: true,
        clicks: true,
        views: true,
        updatedAt: true
      }
    })

    console.log('📊 État actuel du lien lolobptss:')
    console.log('- ID:', link?.id)
    console.log('- Titre:', link?.title)
    console.log('- Clics:', link?.clicks)
    console.log('- Vues:', link?.views)
    console.log('- Dernière mise à jour:', link?.updatedAt)

    // Compter les enregistrements dans la table Click
    const clickCount = await prisma.click.count({
      where: { linkId: link?.id }
    })

    console.log('\n📈 Enregistrements dans la table Click:', clickCount)

    // Voir les derniers clics
    const recentClicks = await prisma.click.findMany({
      where: { linkId: link?.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        ip: true
      }
    })

    if (recentClicks.length > 0) {
      console.log('\n🕒 Derniers clics:')
      recentClicks.forEach((click, i) => {
        console.log(`  ${i + 1}. ${click.createdAt} - IP: ${click.ip}`)
      })
    }

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()