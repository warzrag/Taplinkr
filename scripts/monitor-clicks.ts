import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function monitor() {
  console.clear()
  console.log('📊 MONITORING DES CLICS EN TEMPS RÉEL')
  console.log('=====================================')
  console.log('Appuyez Ctrl+C pour arrêter\n')

  let lastCount = 0

  setInterval(async () => {
    try {
      const link = await prisma.link.findUnique({
        where: { slug: 'lolobptss' },
        select: {
          clicks: true,
          views: true,
          updatedAt: true
        }
      })

      if (link) {
        const timestamp = new Date().toLocaleTimeString()

        if (link.clicks !== lastCount) {
          console.log(`\n🔔 [${timestamp}] NOUVEAU CLIC DÉTECTÉ!`)
          console.log(`   Clics: ${lastCount} → ${link.clicks} (+${link.clicks - lastCount})`)
          lastCount = link.clicks
        } else {
          process.stdout.write(`\r⏱️  [${timestamp}] Clics: ${link.clicks} | Vues: ${link.views}`)
        }
      }
    } catch (error) {
      // Ignorer les erreurs silencieusement
    }
  }, 1000) // Vérifier chaque seconde
}

monitor().catch(console.error)