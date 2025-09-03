import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET() {
  try {
    console.log('🔍 Debug DB - Récupération de toutes les données...')
    
    // Récupérer toutes les tables importantes
    const [users, links, multiLinks, folders, clicks] = await Promise.all([
      pool.query('SELECT * FROM "User" ORDER BY "createdAt" DESC'),
      pool.query('SELECT * FROM links ORDER BY "createdAt" DESC'),
      pool.query('SELECT * FROM multi_links ORDER BY "createdAt" DESC'),
      pool.query('SELECT * FROM folders ORDER BY "createdAt" DESC LIMIT 10'),
      pool.query('SELECT * FROM clicks ORDER BY "createdAt" DESC LIMIT 20')
    ])

    // Compter les enregistrements
    const [linkCount, multiLinkCount, clickCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM links'),
      pool.query('SELECT COUNT(*) FROM multi_links'),
      pool.query('SELECT COUNT(*) FROM clicks')
    ])

    // Analyser les liens par utilisateur
    const linksByUser = await pool.query(`
      SELECT u.email, u.id as user_id, COUNT(l.id) as link_count
      FROM "User" u
      LEFT JOIN links l ON u.id = l."userId"
      GROUP BY u.id, u.email
      ORDER BY link_count DESC
    `)

    // Vérifier les sessions actives
    const sessions = await pool.query(`
      SELECT * FROM sessions 
      WHERE expires > NOW() 
      ORDER BY expires DESC 
      LIMIT 5
    `).catch(() => ({ rows: [] }))

    const data = {
      timestamp: new Date().toISOString(),
      counts: {
        users: users.rows.length,
        links: linkCount.rows[0].count,
        multiLinks: multiLinkCount.rows[0].count,
        clicks: clickCount.rows[0].count
      },
      users: users.rows.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt
      })),
      links: links.rows.map(l => ({
        id: l.id,
        userId: l.userId,
        title: l.title,
        slug: l.slug,
        isDirect: l.isDirect,
        directUrl: l.directUrl,
        isActive: l.isActive,
        clicks: l.clicks,
        views: l.views,
        profileImage: l.profileImage,
        coverImage: l.coverImage,
        createdAt: l.createdAt,
        multiLinksCount: multiLinks.rows.filter(ml => ml.linkId === l.id).length
      })),
      multiLinks: multiLinks.rows.map(ml => ({
        id: ml.id,
        linkId: ml.linkId,
        title: ml.title,
        url: ml.url,
        clicks: ml.clicks,
        order: ml.order
      })),
      linksByUser: linksByUser.rows,
      recentClicks: clicks.rows.map(c => ({
        id: c.id,
        linkId: c.linkId,
        timestamp: c.createdAt,
        country: c.country,
        device: c.device
      })),
      folders: folders.rows.map(f => ({
        id: f.id,
        name: f.name,
        userId: f.userId
      })),
      sessions: sessions.rows.map(s => ({
        userId: s.userId,
        expires: s.expires
      })),
      // Requêtes SQL pour debug
      debugQueries: {
        findLinksForUser: (userId: string) => 
          `SELECT * FROM links WHERE "userId" = '${userId}'`,
        checkUserExists: (email: string) => 
          `SELECT * FROM "User" WHERE email = '${email}'`
      }
    }

    console.log('✅ Debug DB - Données récupérées:', {
      users: data.counts.users,
      links: data.counts.links,
      multiLinks: data.counts.multiLinks
    })

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('❌ Erreur Debug DB:', error)
    return NextResponse.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 })
  }
}