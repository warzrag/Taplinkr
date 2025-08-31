import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkwgorynhgnmldzbhhrb.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2dvcnluaGdubWxkemJoaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTE4ODAsImV4cCI6MjA0Mjc4Nzg4MH0.Ev-KpsHZ2rl-rvMoVP33N2yyw3O3tMhqlPNmT58wz74'

  try {
    // Test 1: Récupérer les liens
    const linksResponse = await fetch(
      `${supabaseUrl}/rest/v1/Link?select=*`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      }
    )
    
    const allLinks = linksResponse.ok ? await linksResponse.json() : []
    
    // Test 2: Récupérer les utilisateurs
    const usersResponse = await fetch(
      `${supabaseUrl}/rest/v1/User?select=id,email,username`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      }
    )
    
    const allUsers = usersResponse.ok ? await usersResponse.json() : []
    
    // Filtrer les liens de l'utilisateur connecté
    const userLinks = allLinks.filter((l: any) => l.userId === session.user.id)
    
    return NextResponse.json({
      connected: true,
      currentUser: {
        id: session.user.id,
        email: session.user.email
      },
      database: {
        totalLinks: allLinks.length,
        totalUsers: allUsers.length,
        yourLinks: userLinks.length
      },
      links: userLinks.map((l: any) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        clicks: l.clicks,
        isActive: l.isActive
      })),
      users: allUsers
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Erreur de connexion',
      message: error.message,
      connected: false
    }, { status: 500 })
  }
}