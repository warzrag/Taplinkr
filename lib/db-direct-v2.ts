// Connexion directe à PostgreSQL - Version adaptée à la structure réelle
import { Pool } from 'pg'

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
      `SELECT * FROM links WHERE "userId" = $1 ORDER BY "order" ASC`,
      [userId]
    )
    
    const links = result.rows
    
    // Pour chaque lien, récupérer ses multiLinks
    for (const link of links) {
      const multiLinksResult = await query(
        `SELECT * FROM multi_links WHERE "linkId" = $1 ORDER BY "order" ASC`,
        [link.id]
      )
      link.multiLinks = multiLinksResult.rows || []
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
    // Adapter les champs à la structure de la table "links"
    const result = await query(
      `INSERT INTO links (
        id, "userId", title, slug, description, 
        "isDirect", "directUrl", "isActive", 
        "shieldEnabled", "isUltraLink", "isOnline",
        clicks, views, "order",
        color, icon, "profileImage", "coverImage",
        "fontFamily", "borderRadius", "backgroundColor", "textColor",
        "instagramUrl", "tiktokUrl", "twitterUrl", "youtubeUrl",
        animation, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11,
        $12, $13, $14,
        $15, $16, $17, $18,
        $19, $20, $21, $22,
        $23, $24, $25, $26,
        $27, $28, $29
      ) RETURNING *`,
      [
        linkData.id,
        linkData.userId,
        linkData.title,
        linkData.slug,
        linkData.description || linkData.bio || '',
        linkData.isDirect || false,
        linkData.directUrl,
        linkData.isActive !== false, // Par défaut true
        linkData.shieldEnabled || false,
        linkData.isUltraLink || false,
        false, // isOnline
        linkData.clicks || 0,
        linkData.views || 0,
        linkData.order || 0,
        linkData.primaryColor || '#3b82f6', // color
        linkData.icon || '',
        linkData.profileImage,
        linkData.coverImage,
        linkData.fontFamily || 'system',
        linkData.borderRadius || 'rounded-xl',
        linkData.backgroundColor || '#ffffff',
        linkData.textColor || '#1f2937',
        linkData.instagramUrl,
        linkData.tiktokUrl,
        linkData.twitterUrl,
        linkData.youtubeUrl,
        linkData.animation || 'none',
        new Date(),
        new Date()
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
    console.log('📎 createMultiLinksDB - linkId:', linkId, 'multiLinks:', multiLinks)
    const createdLinks = []

    for (const ml of multiLinks) {
      const result = await query(
        `INSERT INTO multi_links (
          id, link_id, title, url, icon, icon_image, "order", clicks,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          `${linkId}_${ml.order || 0}_${Date.now()}`,
          linkId,
          ml.title,
          ml.url,
          ml.icon || '',
          ml.iconImage || ml.icon || '',  // Sauvegarder dans les deux champs
          ml.order || 0,
          0,
          new Date(),
          new Date()
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

// Supprimer un lien
export async function deleteLinkDB(linkId: string) {
  try {
    // D'abord supprimer les multilinks
    await query('DELETE FROM multi_links WHERE "linkId" = $1', [linkId])
    
    // Puis supprimer le lien
    await query('DELETE FROM links WHERE id = $1', [linkId])
    
    return true
  } catch (error) {
    console.error('Erreur suppression lien:', error)
    throw error
  }
}

// Mettre à jour un lien
export async function updateLinkDB(linkId: string, updates: any) {
  try {
    const fields = []
    const values = []
    let index = 1
    
    // Construire dynamiquement la requête UPDATE
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== 'userId') {
        fields.push(`"${key}" = $${index}`)
        values.push(updates[key])
        index++
      }
    })
    
    // Ajouter updatedAt
    fields.push(`"updatedAt" = $${index}`)
    values.push(new Date())
    values.push(linkId)
    
    const result = await query(
      `UPDATE links SET ${fields.join(', ')} WHERE id = $${index + 1} RETURNING *`,
      values
    )
    
    return result.rows[0]
  } catch (error) {
    console.error('Erreur mise à jour lien:', error)
    throw error
  }
}

// Tester la connexion
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()')
    return true
  } catch (error) {
    console.error('❌ Erreur connexion DB:', error)
    return false
  }
}