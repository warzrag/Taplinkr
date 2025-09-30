const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanLinks() {
  // Supprimer les 3 liens fantômes
  const slugsToDelete = ['lolobkeikzed', 'lauravissante', 'zdzdaZ']
  
  for (const slug of slugsToDelete) {
    try {
      await prisma.link.delete({
        where: { slug: slug }
      })
      console.log('✅ Supprimé: ' + slug)
    } catch (error) {
      console.log('❌ Erreur pour ' + slug + ':', error.message)
    }
  }
  
  // Vérifier ce qui reste
  const remaining = await prisma.link.findMany({
    select: {
      slug: true,
      title: true
    }
  })
  
  console.log('\n📋 Liens restants:')
  remaining.forEach(link => {
    console.log('- ' + link.title + ' (' + link.slug + ')')
  })
  
  await prisma.$disconnect()
}

cleanLinks()
