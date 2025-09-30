const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkLink() {
  const link = await prisma.link.findUnique({
    where: { slug: 'lolobptss' },
    include: {
      multiLinks: {
        orderBy: { order: 'asc' }
      }
    }
  })
  
  console.log('\n📋 Lien:', link.title)
  console.log('Slug:', link.slug)
  console.log('Profile Image:', link.profileImage ? 'Oui' : 'Non')
  console.log('Cover Image:', link.coverImage ? 'Oui' : 'Non')
  console.log('\n📱 MultiLinks:\n')
  
  if (link.multiLinks.length === 0) {
    console.log('❌ Aucun multiLink!')
  } else {
    link.multiLinks.forEach((ml, index) => {
      console.log((index + 1) + '. ' + ml.title)
      console.log('   URL: ' + ml.url)
      console.log('   Icon: ' + (ml.icon || 'Aucun'))
      console.log('   IconImage: ' + (ml.iconImage ? 'Oui' : 'Non'))
      console.log('')
    })
  }
  
  await prisma.$disconnect()
}

checkLink()
