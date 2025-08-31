import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'

// Route pour créer un lien SANS Prisma
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { title, bio, isDirect, directUrl } = body

    // Générer un slug unique
    const slug = nanoid(10)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkwgorynhgnmldzbhhrb.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2dvcnluaGdubWxkemJoaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTE4ODAsImV4cCI6MjA0Mjc4Nzg4MH0.Ev-KpsHZ2rl-rvMoVP33N2yyw3O3tMhqlPNmT58wz74'

    // Créer le nouveau lien
    const newLink = {
      id: nanoid(),
      userId: session.user.id,
      title: title || 'Mon lien',
      slug,
      bio: bio || '',
      directUrl: directUrl || null,
      isDirect: isDirect || false,
      isActive: true,
      clicks: 0,
      views: 0,
      order: 0,
      theme: 'gradient',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/Link`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newLink)
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Erreur création lien:', error)
      return NextResponse.json({ 
        error: 'Erreur lors de la création',
        details: error 
      }, { status: 500 })
    }

    const created = await response.json()
    console.log('✅ Lien créé avec succès:', created[0]?.slug)

    return NextResponse.json(created[0] || created)
    
  } catch (error: any) {
    console.error('❌ Erreur création lien:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: error.message 
    }, { status: 500 })
  }
}