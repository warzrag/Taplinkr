const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function checkMultiLinks() {
  try {
    const links = await pool.query('SELECT id, title, slug FROM links ORDER BY "createdAt" DESC LIMIT 1')

    if (links.rows.length === 0) {
      console.log('Aucun lien trouvé')
      return
    }

    const link = links.rows[0]
    console.log(`\n📋 Lien: ${link.title} (${link.slug})`)
    console.log(`ID: ${link.id}`)

    const multiLinks = await pool.query(
      'SELECT id, title, url, icon, icon_image FROM multi_links WHERE parent_link_id = $1 ORDER BY "order" ASC',
      [link.id]
    )

    console.log(`\n📱 MultiLinks: ${multiLinks.rows.length}`)

    if (multiLinks.rows.length === 0) {
      console.log('❌ Aucun multiLink attaché!')
    } else {
      multiLinks.rows.forEach((ml, index) => {
        console.log(`\n${index + 1}. ${ml.title}`)
        console.log(`   URL: ${ml.url}`)
        console.log(`   Icon: ${ml.icon || 'Aucun'}`)
      })
    }

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error(error)
    process.exit(1)
  }
}

checkMultiLinks()
