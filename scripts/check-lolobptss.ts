import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const link = await prisma.link.findUnique({
      where: { slug: 'lolobptss' },
      include: {
        user: true,
        multiLinks: true
      }
    })

    if (!link) {
      console.log('❌ Aucun lien trouvé avec le slug lolobptss')
      return
    }

    console.log('📊 Lien trouvé:')
    console.log('- ID:', link.id)
    console.log('- Titre:', link.title)
    console.log('- Slug:', link.slug)
    console.log('- Est direct?:', link.isDirect)
    console.log('- URL directe:', link.directUrl)
    console.log('- Actif?:', link.isActive)
    console.log('- Propriétaire:', link.user.email)
    console.log('\n📌 MultiLinks:', link.multiLinks.length)

    if (link.multiLinks.length > 0) {
      link.multiLinks.forEach((ml, i) => {
        console.log(`  ${i + 1}. ${ml.title} - ${ml.url}`)
      })
    } else {
      console.log('  ⚠️ Aucun multi-link associé')
    }

    // Vérifier s'il y a d'autres liens pour cet utilisateur
    const allUserLinks = await prisma.link.findMany({
      where: { userId: link.userId },
      include: {
        multiLinks: true
      }
    })

    console.log('\n👤 Tous les liens de l\'utilisateur:', allUserLinks.length)
    allUserLinks.forEach(l => {
      console.log(`  - ${l.title} (${l.slug}) - ${l.multiLinks.length} multi-links`)
    })

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()