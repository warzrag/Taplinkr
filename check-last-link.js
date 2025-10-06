const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkLastLink() {
  const link = await prisma.link.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      multiLinks: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!link) {
    console.log('Aucun lien trouvé')
    return
  }

  console.log('\n📋 Dernier lien créé:')
  console.log('Title:', link.title)
  console.log('Slug:', link.slug)
  console.log('Created:', link.createdAt)
  console.log('\n📱 MultiLinks:', link.multiLinks.length)

  if (link.multiLinks.length === 0) {
    console.log('❌ Aucun multiLink attaché!')
  } else {
    link.multiLinks.forEach((ml, index) => {
      console.log(`\n${index + 1}. ${ml.title}`)
      console.log('   URL:', ml.url)
      console.log('   Icon:', ml.icon || 'Aucun')
    })
  }

  await prisma.$disconnect()
}

checkLastLink()
