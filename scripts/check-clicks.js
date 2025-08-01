const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkClicks() {
  try {
    // Compter les clics
    const clickCount = await prisma.click.count()
    console.log('Nombre total de clics:', clickCount)
    
    // Récupérer les derniers clics
    const recentClicks = await prisma.click.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        link: {
          select: {
            title: true,
            slug: true
          }
        }
      }
    })
    
    console.log('\nDerniers clics:')
    recentClicks.forEach(click => {
      console.log(`- ${new Date(click.createdAt).toLocaleString()} - ${click.link.title} (/${click.link.slug})`)
    })
    
    // Grouper par jour
    const last30Days = await prisma.click.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })
    
    const clicksByDay = {}
    last30Days.forEach(click => {
      const day = new Date(click.createdAt).toISOString().split('T')[0]
      clicksByDay[day] = (clicksByDay[day] || 0) + 1
    })
    
    console.log('\nClics par jour (30 derniers jours):')
    Object.entries(clicksByDay).sort().forEach(([day, count]) => {
      console.log(`${day}: ${count} clics`)
    })
    
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClicks()