const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// Générer un ID unique (style cuid)
function generateId() {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 15)
  return 'c' + timestamp + randomStr
}

async function simulateClicks() {
  try {
    // Utiliser directement l'userId connu
    const userId = 'cmeufjew70000s3zd98ng8say'

    const linkResult = await pool.query(`
      SELECT id FROM links WHERE "userId" = $1 LIMIT 1
    `, [userId])

    if (linkResult.rows.length === 0) {
      console.log('❌ Aucun lien trouvé')
      process.exit(1)
    }

    const linkId = linkResult.rows[0].id
    
    console.log(`✅ Utilisateur: ${userId}`)
    console.log(`✅ Lien: ${linkId}`)
    console.log(`\n🔄 Insertion de 500 clics pour la France...`)
    
    // Insérer 500 clics
    for (let i = 0; i < 500; i++) {
      await pool.query(`
        INSERT INTO clicks (
          id,
          "linkId",
          "userId",
          ip,
          "userAgent",
          device,
          browser,
          os,
          country,
          city,
          region,
          "createdAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      `, [
        generateId(),
        linkId,
        userId,
        `91.170.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        'Mozilla/5.0 (simulation)',
        'mobile',
        'Chrome',
        'iOS',
        'France',
        'Paris',
        'Île-de-France'
      ])
      
      if ((i + 1) % 100 === 0) {
        console.log(`   ✓ ${i + 1} clics insérés...`)
      }
    }
    
    console.log(`\n✅ 500 clics insérés avec succès pour la France !`)
    
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    await pool.end()
    process.exit(1)
  }
}

simulateClicks()
