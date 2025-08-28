import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Route simple pour ajouter des clics SANS Prisma
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que c'est bien un admin
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { slug, count } = await request.json()
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug requis' }, { status: 400 })
    }

    const clicksToAdd = count || 100

    // Utiliser l'API REST de Supabase directement
    const supabaseUrl = 'https://dkwgorynhgnmldzbhhrb.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2dvcnluaGdubWxkemJoaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTE4ODAsImV4cCI6MjA0Mjc4Nzg4MH0.Ev-KpsHZ2rl-rvMoVP33N2yyw3O3tMhqlPNmT58wz74'

    // D'abord, récupérer le lien actuel
    const getResponse = await fetch(
      `${supabaseUrl}/rest/v1/Link?slug=eq.${slug}&select=id,clicks,views`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      }
    )

    const responseText = await getResponse.text()
    console.log('Response from Supabase:', responseText)
    
    let links
    try {
      links = JSON.parse(responseText)
    } catch (e) {
      return NextResponse.json({ 
        error: 'Erreur parsing réponse Supabase',
        response: responseText,
        status: getResponse.status
      }, { status: 500 })
    }
    
    if (!links || links.length === 0) {
      return NextResponse.json({ 
        error: 'Lien non trouvé',
        slug,
        response: links
      }, { status: 404 })
    }

    const link = links[0]
    if (!link) {
      return NextResponse.json({ 
        error: 'Lien vide',
        links
      }, { status: 404 })
    }
    
    const currentClicks = link.clicks !== undefined ? link.clicks : 0
    const currentViews = link.views !== undefined ? link.views : 0
    const newClicks = currentClicks + clicksToAdd
    const newViews = currentViews + clicksToAdd

    // Mettre à jour le lien
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/Link?id=eq.${link.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          clicks: newClicks,
          views: newViews
        })
      }
    )

    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      return NextResponse.json({ error }, { status: 500 })
    }

    const updated = await updateResponse.json()

    return NextResponse.json({
      success: true,
      message: `Ajouté ${clicksToAdd} clics au lien ${slug}`,
      before: { clicks: currentClicks, views: currentViews },
      after: { clicks: newClicks, views: newViews },
      updated
    })

  } catch (error) {
    console.error('Erreur add-clicks:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}