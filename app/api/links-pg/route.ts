import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserLinksDB } from '@/lib/db-direct'

// Route qui utilise PostgreSQL directement
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ Pas de session utilisateur')
      return NextResponse.json([])
    }

    console.log('🔍 Récupération des liens PG pour:', session.user.id)
    
    // Utiliser la connexion directe PostgreSQL
    const links = await getUserLinksDB(session.user.id)
    
    console.log(`✅ API Links PG: ${links.length} liens trouvés`)
    
    return NextResponse.json(links)
    
  } catch (error) {
    console.error('❌ Erreur API Links PG:', error)
    return NextResponse.json([])
  }
}