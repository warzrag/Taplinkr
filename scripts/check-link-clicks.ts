import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Vérifier le lien lolobptss
    const link = await prisma.link.findUnique({
      where: { slug: 'lolobptss' },
      include: {
        user: true,
        multiLinks: true
      }
    })

    if (!link) {
      console.log('❌ Lien non trouvé')
      return
    }

    console.log('📊 Informations du lien:')
    console.log('- ID:', link.id)
    console.log('- Titre:', link.title)
    console.log('- Slug:', link.slug)
    console.log('- Clics:', link.clicks)
    console.log('- Vues:', link.views)
    console.log('- Créé le:', link.createdAt)
    console.log('- Modifié le:', link.updatedAt)
    console.log('- Propriétaire:', link.user.email)

    // Vérifier les clicks dans la table Click
    const clicks = await prisma.click.findMany({
      where: { linkId: link.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log('\n📈 Derniers clics enregistrés:', clicks.length)
    clicks.forEach((click, i) => {
      console.log(`  ${i + 1}. ${click.createdAt} - IP: ${click.ip || 'N/A'}`)
    })

    // Compter le total de clics dans la table Click
    const totalClicks = await prisma.click.count({
      where: { linkId: link.id }
    })

    console.log('\n🔢 Comparaison:')
    console.log('- Clics dans link.clicks:', link.clicks)
    console.log('- Clics dans la table Click:', totalClicks)

    if (link.clicks !== totalClicks) {
      console.log('⚠️ INCOHÉRENCE DÉTECTÉE!')
    }

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()