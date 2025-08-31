import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserLinks } from '@/lib/supabase'

// Route qui utilise le client Supabase JS
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('❌ Pas de session utilisateur')
      return NextResponse.json([])
    }

    console.log('🔍 Récupération des liens pour:', session.user.id)
    
    // Utiliser le helper Supabase
    const links = await getUserLinks(session.user.id)
    
    console.log(`✅ API Links Supabase: ${links.length} liens trouvés`)
    
    return NextResponse.json(links)
    
  } catch (error) {
    console.error('❌ Erreur API Links Supabase:', error)
    return NextResponse.json([])
  }
}