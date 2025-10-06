const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function checkClicks() {
  try {
    // Vérifier les clics sur les multiLinks
    const multiLinkClicks = await pool.query(`
      SELECT ml.title, ml.clicks, ml."parentLinkId"
      FROM multi_links ml
      ORDER BY ml.clicks DESC
    `)

    console.log('\n📊 Clics sur les multiLinks:')
    if (multiLinkClicks.rows.length === 0) {
      console.log('❌ Aucun multiLink trouvé')
    } else {
      multiLinkClicks.rows.forEach((ml, i) => {
        console.log(`${i + 1}. ${ml.title} - ${ml.clicks} clics`)
      })
    }

    // Vérifier les événements de clics dans la table clicks
    const clickEvents = await pool.query(`
      SELECT COUNT(*) as total, "linkId", "multiLinkId"
      FROM clicks
      GROUP BY "linkId", "multiLinkId"
    `)

    console.log('\n📈 Événements de clics enregistrés:')
    if (clickEvents.rows.length === 0) {
      console.log('❌ Aucun événement de clic enregistré')
    } else {
      console.log(`✅ ${clickEvents.rows.length} événement(s) de clic`)
      clickEvents.rows.forEach((event, i) => {
        console.log(`${i + 1}. LinkId: ${event.linkId}, MultiLinkId: ${event.multiLinkId || 'N/A'}, Total: ${event.total}`)
      })
    }

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

checkClicks()
