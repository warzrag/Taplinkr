import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('❌ Pas de session utilisateur')
      return NextResponse.json([])
    }

    console.log('🔍 Bridge: Recherche des liens pour:', session.user.email)
    
    // 1. D'abord, trouver l'utilisateur dans la table "users" (minuscule) par email
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    )
    
    if (userResult.rows.length === 0) {
      console.log('❌ Utilisateur non trouvé dans la table users')
      return NextResponse.json([])
    }
    
    const userId = userResult.rows[0].id
    console.log('✅ UserId trouvé dans table users:', userId)
    
    // 2. Récupérer les liens de cet utilisateur
    const linksResult = await pool.query(
      `SELECT * FROM links WHERE "userId" = $1 ORDER BY "order" ASC`,
      [userId]
    )
    
    const links = linksResult.rows
    console.log(`✅ ${links.length} liens trouvés`)
    
    // 3. Pour chaque lien, récupérer ses multiLinks
    for (const link of links) {
      const multiLinksResult = await pool.query(
        `SELECT * FROM multi_links WHERE "linkId" = $1 ORDER BY "order" ASC`,
        [link.id]
      )
      link.multiLinks = multiLinksResult.rows || []
    }
    
    return NextResponse.json(links)
    
  } catch (error) {
    console.error('❌ Erreur API Links Bridge:', error)
    return NextResponse.json([])
  }
}