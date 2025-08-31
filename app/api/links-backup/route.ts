import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Route de SECOURS qui retourne des données hardcodées si la DB ne répond pas
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    // D'abord essayer de récupérer depuis Supabase
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkwgorynhgnmldzbhhrb.supabase.co'
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2dvcnluaGdubWxkemJoaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTE4ODAsImV4cCI6MjA0Mjc4Nzg4MH0.Ev-KpsHZ2rl-rvMoVP33N2yyw3O3tMhqlPNmT58wz74'

      const response = await fetch(
        `${supabaseUrl}/rest/v1/Link?userId=eq.${session.user.id}&order=order.asc`,
        {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          signal: AbortSignal.timeout(5000) // Timeout de 5 secondes
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Links Backup: Données récupérées depuis Supabase')
        return NextResponse.json(data)
      }
    } catch (error) {
      console.error('❌ Supabase non disponible, utilisation des données de secours')
    }

    // Si Supabase ne répond pas, retourner des données de démonstration
    // Ces données permettent au moins d'afficher quelque chose
    const backupLinks = [
      {
        id: 'backup-1',
        userId: session.user.id,
        title: 'Mon TapLinkr',
        slug: 'demo-link',
        bio: 'Page de démonstration',
        directUrl: null,
        isDirect: false,
        isActive: true,
        clicks: 0,
        views: 0,
        profileImage: null,
        coverImage: null,
        theme: 'gradient',
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        order: 0,
        folderId: null,
        multiLinks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    console.log('⚠️ Links Backup: Retour des données de secours')
    return NextResponse.json(backupLinks)
    
  } catch (error) {
    console.error('❌ Erreur Links Backup:', error)
    return NextResponse.json([])
  }
}