const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkLinkHistory() {
  try {
    // Récupérer tous les liens avec leurs dates et clics
    const links = await prisma.link.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        clicks: true,
        views: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log('Historique des liens:')
    console.log('=====================')
    
    links.forEach(link => {
      const createdDate = new Date(link.createdAt).toLocaleDateString('fr-FR')
      const updatedDate = new Date(link.updatedAt).toLocaleDateString('fr-FR')
      console.log(`\n${link.title} (/${link.slug})`)
      console.log(`  Créé le: ${createdDate}`)
      console.log(`  Mis à jour le: ${updatedDate}`)
      console.log(`  Clics: ${link.clicks}`)
      console.log(`  Vues: ${link.views}`)
    })
    
    // Vérifier les clics dans la table Click pour chaque lien
    console.log('\n\nClics réels enregistrés:')
    console.log('========================')
    
    for (const link of links) {
      const realClicks = await prisma.click.findMany({
        where: { linkId: link.id },
        orderBy: { createdAt: 'asc' }
      })
      
      if (realClicks.length > 0) {
        console.log(`\n${link.title}:`)
        realClicks.forEach(click => {
          console.log(`  - ${new Date(click.createdAt).toLocaleString('fr-FR')}`)
        })
      }
    }
    
    // Afficher un résumé par jour
    console.log('\n\nRésumé des clics par jour (tous les liens):')
    console.log('===========================================')
    
    const allClicks = await prisma.click.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    const clicksByDay = {}
    allClicks.forEach(click => {
      const day = new Date(click.createdAt).toLocaleDateString('fr-FR')
      clicksByDay[day] = (clicksByDay[day] || 0) + 1
    })
    
    Object.entries(clicksByDay).forEach(([day, count]) => {
      console.log(`${day}: ${count} clics`)
    })
    
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLinkHistory()