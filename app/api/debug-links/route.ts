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
    
    const debug = {
      session: {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      },
      queries: [],
      results: {}
    }

    // 1. Tous les liens dans la base
    const allLinksQuery = 'SELECT id, "userId", title, slug, "isActive" FROM links ORDER BY "createdAt" DESC'
    const allLinks = await pool.query(allLinksQuery)
    debug.queries.push(allLinksQuery)
    debug.results.allLinks = {
      count: allLinks.rows.length,
      data: allLinks.rows
    }

    // 2. Liens pour l'utilisateur connecté
    if (session?.user?.id) {
      const userLinksQuery = `SELECT * FROM links WHERE "userId" = '${session.user.id}'`
      const userLinks = await pool.query(userLinksQuery)
      debug.queries.push(userLinksQuery)
      debug.results.userLinks = {
        count: userLinks.rows.length,
        data: userLinks.rows
      }
    }

    // 3. Vérifier la correspondance userId
    const userMatchQuery = `
      SELECT DISTINCT l."userId", u.email, u.id as user_table_id
      FROM links l
      LEFT JOIN "User" u ON l."userId" = u.id
    `
    const userMatch = await pool.query(userMatchQuery)
    debug.queries.push(userMatchQuery)
    debug.results.userIdMatches = userMatch.rows

    // 4. Test de la route /api/links-final
    let apiResponse = null
    try {
      const response = await fetch('http://localhost:3000/api/links-final', {
        headers: session ? {
          'Cookie': `next-auth.session-token=${session.user.id}`
        } : {}
      })
      apiResponse = {
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : null
      }
    } catch (e: any) {
      apiResponse = { error: e.message }
    }
    debug.results.apiLinksFinale = apiResponse

    // 5. Structure de la table links
    const schemaQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'links'
      ORDER BY ordinal_position
    `
    const schema = await pool.query(schemaQuery)
    debug.results.tableSchema = schema.rows

    // 6. Problèmes potentiels
    debug.problems = []
    
    if (allLinks.rows.length > 0 && session?.user?.id) {
      const hasUserLinks = allLinks.rows.some(l => l.userId === session.user.id)
      if (!hasUserLinks) {
        debug.problems.push({
          issue: 'Aucun lien pour cet utilisateur',
          detail: `Les liens existent mais aucun n'appartient à l'utilisateur ${session.user.id}`
        })
      }
    }

    // Vérifier si les userId correspondent
    const unmatchedUsers = userMatch.rows.filter(r => !r.user_table_id)
    if (unmatchedUsers.length > 0) {
      debug.problems.push({
        issue: 'UserId non correspondants',
        detail: 'Certains liens ont des userId qui n\'existent pas dans la table User',
        affected: unmatchedUsers
      })
    }

    return NextResponse.json(debug, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
    
  } catch (error: any) {
    console.error('❌ Erreur debug links:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}