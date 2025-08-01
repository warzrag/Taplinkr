const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkLinkClicks() {
  try {
    // Récupérer tous les liens avec leurs clics
    const links = await prisma.link.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        clicks: true,
        views: true,
        createdAt: true
      }
    })
    
    console.log('Liens et leurs compteurs:')
    let totalClicks = 0
    let totalViews = 0
    
    links.forEach(link => {
      if (link.clicks > 0 || link.views > 0) {
        console.log(`- ${link.title} (/${link.slug}): ${link.clicks} clics, ${link.views} vues`)
        totalClicks += link.clicks
        totalViews += link.views
      }
    })
    
    console.log(`\nTotal des compteurs sur les liens: ${totalClicks} clics, ${totalViews} vues`)
    
    // Comparer avec la table Click
    const realClickCount = await prisma.click.count()
    console.log(`Nombre réel de clics dans la table Click: ${realClickCount}`)
    
    console.log(`\nDifférence: ${totalClicks - realClickCount} clics`)
    
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLinkClicks()