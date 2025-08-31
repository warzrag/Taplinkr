import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserLinksDB } from '@/lib/db-direct-v2'

// Route finale qui utilise PostgreSQL directement avec la bonne structure
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ Pas de session utilisateur')
      return NextResponse.json([])
    }

    console.log('🔍 Récupération des liens FINAL pour:', session.user.id)
    
    // Utiliser la connexion directe PostgreSQL avec la bonne table
    const links = await getUserLinksDB(session.user.id)
    
    console.log(`✅ API Links FINAL: ${links.length} liens trouvés`)
    
    if (links.length > 0) {
      console.log('Premier lien:', {
        id: links[0].id,
        title: links[0].title,
        slug: links[0].slug
      })
    }
    
    return NextResponse.json(links)
    
  } catch (error) {
    console.error('❌ Erreur API Links FINAL:', error)
    return NextResponse.json([])
  }
}