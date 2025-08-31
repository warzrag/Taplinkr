import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Route qui utilise l'API REST Supabase directement (sans Prisma)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    // Utiliser l'API REST de Supabase directement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkwgorynhgnmldzbhhrb.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2dvcnluaGdubWxkemJoaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTE4ODAsImV4cCI6MjA0Mjc4Nzg4MH0.Ev-KpsHZ2rl-rvMoVP33N2yyw3O3tMhqlPNmT58wz74'

    // Récupérer les liens de l'utilisateur
    const linksResponse = await fetch(
      `${supabaseUrl}/rest/v1/Link?userId=eq.${session.user.id}&order=order.asc&select=*`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      }
    )

    if (!linksResponse.ok) {
      console.error('Erreur Supabase:', linksResponse.status)
      return NextResponse.json([])
    }

    const links = await linksResponse.json()

    // Pour chaque lien, récupérer ses multiLinks
    const linksWithMultiLinks = await Promise.all(
      links.map(async (link: any) => {
        const multiLinksResponse = await fetch(
          `${supabaseUrl}/rest/v1/MultiLink?linkId=eq.${link.id}&order=order.asc`,
          {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
            }
          }
        )
        
        const multiLinks = multiLinksResponse.ok ? await multiLinksResponse.json() : []
        
        return {
          ...link,
          multiLinks
        }
      })
    )

    console.log(`✅ API Links Direct: ${linksWithMultiLinks.length} liens trouvés`)
    return NextResponse.json(linksWithMultiLinks)
    
  } catch (error) {
    console.error('❌ Erreur API Links Direct:', error)
    // Retourner un tableau vide au lieu d'une erreur
    return NextResponse.json([])
  }
}