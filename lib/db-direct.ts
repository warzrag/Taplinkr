// Connexion directe à PostgreSQL sans passer par l'API Supabase
import { Pool } from 'pg'

// Configuration de la connexion
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Helper pour exécuter des requêtes
export async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params)
    return result
  } catch (error) {
    console.error('Erreur DB:', error)
    throw error
  }
}

// Récupérer les liens d'un utilisateur
export async function getUserLinksDB(userId: string) {
  try {
    const result = await query(
      `SELECT * FROM "links" WHERE "userId" = $1 ORDER BY "order" ASC`,
      [userId]
    )
    
    const links = result.rows
    
    // Pour chaque lien, récupérer ses multiLinks
    for (const link of links) {
      const multiLinksResult = await query(
        `SELECT * FROM "multi_links" WHERE "linkId" = $1 ORDER BY "order" ASC`,
        [link.id]
      )
      link.multiLinks = multiLinksResult.rows
    }
    
    return links
  } catch (error) {
    console.error('Erreur récupération liens:', error)
    return []
  }
}

// Créer un lien
export async function createLinkDB(linkData: any) {
  try {
    const result = await query(
      `INSERT INTO "links" (
        id, "userId", title, slug, bio, description, "directUrl", 
        "isDirect", "isActive", clicks, views, "order", theme, 
        "primaryColor", "secondaryColor", "profileImage", "coverImage",
        "instagramUrl", "tiktokUrl", "twitterUrl", "youtubeUrl",
        animation, "borderRadius", "fontFamily", "backgroundColor", "textColor",
        "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 
        $8, $9, $10, $11, $12, $13, 
        $14, $15, $16, $17,
        $18, $19, $20, $21,
        $22, $23, $24, $25, $26,
        $27, $28
      ) RETURNING *`,
      [
        linkData.id,
        linkData.userId,
        linkData.title,
        linkData.slug,
        linkData.bio,
        linkData.description,
        linkData.directUrl,
        linkData.isDirect,
        linkData.isActive,
        linkData.clicks,
        linkData.views,
        linkData.order,
        linkData.theme,
        linkData.primaryColor,
        linkData.secondaryColor,
        linkData.profileImage,
        linkData.coverImage,
        linkData.instagramUrl,
        linkData.tiktokUrl,
        linkData.twitterUrl,
        linkData.youtubeUrl,
        linkData.animation,
        linkData.borderRadius,
        linkData.fontFamily,
        linkData.backgroundColor,
        linkData.textColor,
        linkData.createdAt,
        linkData.updatedAt
      ]
    )
    
    return result.rows[0]
  } catch (error) {
    console.error('Erreur création lien:', error)
    throw error
  }
}

// Créer des multilinks
export async function createMultiLinksDB(linkId: string, multiLinks: any[]) {
  try {
    const createdLinks = []
    
    for (const ml of multiLinks) {
      const result = await query(
        `INSERT INTO "multi_links" (
          id, "linkId", title, url, icon, "order", clicks,
          "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          `${linkId}_${ml.order || 0}_${Date.now()}`,
          linkId,
          ml.title,
          ml.url,
          ml.icon || '',
          ml.order || 0,
          0,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      )
      createdLinks.push(result.rows[0])
    }
    
    return createdLinks
  } catch (error) {
    console.error('Erreur création multilinks:', error)
    return []
  }
}

// Tester la connexion
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()')
    console.log('✅ Connexion DB réussie:', result.rows[0].now)
    return true
  } catch (error) {
    console.error('❌ Erreur connexion DB:', error)
    return false
  }
}