import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const link = await prisma.link.findUnique({
      where: { slug: 'lolobptss' }
    })

    if (!link) {
      console.log('❌ Lien non trouvé')
      return
    }

    // Analyser les clics par IP
    const clicksByIP = await prisma.click.groupBy({
      by: ['ip'],
      where: { linkId: link.id },
      _count: true,
      orderBy: {
        _count: {
          ip: 'desc'
        }
      },
      take: 10
    })

    console.log('📊 Top 10 des IPs:')
    clicksByIP.forEach(item => {
      console.log(`  ${item.ip}: ${item._count} clics`)
    })

    // Analyser les clics par heure
    const allClicks = await prisma.click.findMany({
      where: { linkId: link.id },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    })

    if (allClicks.length > 0) {
      const firstClick = allClicks[0].createdAt
      const lastClick = allClicks[allClicks.length - 1].createdAt

      console.log('\n⏰ Période d\'activité:')
      console.log(`  Premier clic: ${firstClick}`)
      console.log(`  Dernier clic: ${lastClick}`)

      // Grouper par heure
      const clicksByHour = new Map<string, number>()
      allClicks.forEach(click => {
        const hour = click.createdAt.toISOString().substring(0, 13)
        clicksByHour.set(hour, (clicksByHour.get(hour) || 0) + 1)
      })

      console.log('\n📈 Clics par heure:')
      Array.from(clicksByHour.entries()).forEach(([hour, count]) => {
        console.log(`  ${hour}:00 - ${count} clics`)
      })
    }

    // Analyser les user agents
    const clicksByUA = await prisma.click.groupBy({
      by: ['browser'],
      where: {
        linkId: link.id,
        browser: { not: null }
      },
      _count: true,
      orderBy: {
        _count: {
          browser: 'desc'
        }
      },
      take: 5
    })

    console.log('\n🌐 Top navigateurs:')
    clicksByUA.forEach(item => {
      console.log(`  ${item.browser || 'Unknown'}: ${item._count} clics`)
    })

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()