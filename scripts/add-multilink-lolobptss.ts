import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const link = await prisma.link.findUnique({
      where: { slug: 'lolobptss' },
    })

    if (!link) {
      console.log('❌ Lien lolobptss non trouvé')
      return
    }

    // Créer un multiLink de test
    const multiLink = await prisma.multiLink.create({
      data: {
        title: 'Mon OnlyFans 🔥',
        url: 'https://onlyfans.com/lolobptss',
        description: 'Contenu exclusif 18+',
        order: 0,
        parentLinkId: link.id,
        icon: '🔥'
      }
    })

    console.log('✅ MultiLink ajouté avec succès:', multiLink.id)
    console.log('  Titre:', multiLink.title)
    console.log('  URL:', multiLink.url)

    // Vérifier
    const updatedLink = await prisma.link.findUnique({
      where: { slug: 'lolobptss' },
      include: {
        multiLinks: true
      }
    })

    console.log('\n📊 Lien mis à jour:')
    console.log('  MultiLinks:', updatedLink?.multiLinks.length)

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()