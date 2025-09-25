import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const link = await prisma.link.findUnique({
      where: { slug: 'lolobptss' }
    })

    // Récupérer tous les clics des 5 dernières minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)

    const recentClicks = await prisma.click.findMany({
      where: {
        linkId: link?.id,
        createdAt: { gte: fiveMinutesAgo }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        createdAt: true,
        ip: true
      }
    })

    console.log(`📊 ${recentClicks.length} clics dans les 5 dernières minutes`)

    if (recentClicks.length > 1) {
      // Analyser l'intervalle entre les clics
      const intervals: number[] = []
      for (let i = 1; i < recentClicks.length; i++) {
        const interval = recentClicks[i].createdAt.getTime() - recentClicks[i-1].createdAt.getTime()
        intervals.push(Math.round(interval / 1000))
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length

      console.log('\n⏰ Analyse des intervalles:')
      console.log(`  Intervalle moyen: ${avgInterval.toFixed(1)} secondes`)
      console.log(`  Min: ${Math.min(...intervals)} secondes`)
      console.log(`  Max: ${Math.max(...intervals)} secondes`)

      // Afficher les 10 derniers intervalles
      console.log('\n📈 Derniers intervalles (en secondes):')
      intervals.slice(-10).forEach((interval, i) => {
        console.log(`  ${i + 1}. ${interval}s`)
      })
    }

    // Grouper par minute
    const clicksByMinute = new Map<string, number>()
    recentClicks.forEach(click => {
      const minute = click.createdAt.toISOString().substring(0, 16)
      clicksByMinute.set(minute, (clicksByMinute.get(minute) || 0) + 1)
    })

    console.log('\n📊 Clics par minute:')
    Array.from(clicksByMinute.entries()).forEach(([minute, count]) => {
      console.log(`  ${minute}: ${count} clics`)
    })

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()