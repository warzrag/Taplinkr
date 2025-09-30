const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function listLinks() {
  const links = await prisma.link.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      profileImage: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  console.log('\n📋 Liste de tes liens:\n')
  links.forEach((link, index) => {
    console.log((index + 1) + '. ' + link.title + ' (' + link.slug + ')')
    console.log('   URL: https://www.taplinkr.com/' + link.slug)
    console.log('   Créé: ' + link.createdAt.toLocaleString())
    console.log('')
  })

  await prisma.$disconnect()
}

listLinks()
