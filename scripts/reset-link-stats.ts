import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Réinitialiser les stats du lien lolobptss
    const link = await prisma.link.update({
      where: { slug: 'lolobptss' },
      data: {
        clicks: 0,
        views: 0
      }
    })

    console.log('✅ Stats réinitialisées pour le lien:', link.title)
    console.log('  - Clics: 0')
    console.log('  - Vues: 0')

    // Optionnel: Supprimer les anciens enregistrements de clics
    const deleted = await prisma.click.deleteMany({
      where: { linkId: link.id }
    })

    console.log(`\n🗑️ ${deleted.count} enregistrements de clics supprimés`)

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()