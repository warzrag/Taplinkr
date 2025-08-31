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

    const supabaseUrl = 'https://dkwgorynhgnmldzbhhrb.supabase.co'
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2dvcnluaGdubWxkemJoaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTE4ODAsImV4cCI6MjA0Mjc4Nzg4MH0.Ev-KpsHZ2rl-rvMoVP33N2yyw3O3tMhqlPNmT58wz74'

    // Récupérer les dossiers de l'utilisateur
    const foldersResponse = await fetch(
      `${supabaseUrl}/rest/v1/Folder?userId=eq.${session.user.id}&order=order.asc`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      }
    )

    if (!foldersResponse.ok) {
      console.error('Erreur Supabase folders:', foldersResponse.status)
      return NextResponse.json([])
    }

    const folders = await foldersResponse.json()

    // Récupérer TOUS les liens de l'utilisateur
    const linksResponse = await fetch(
      `${supabaseUrl}/rest/v1/Link?userId=eq.${session.user.id}&order=order.asc&select=*`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      }
    )

    const allLinks = linksResponse.ok ? await linksResponse.json() : []

    // Organiser les liens par dossier
    const linksByFolder: { [key: string]: any[] } = {}
    allLinks.forEach((link: any) => {
      if (link.folderId) {
        if (!linksByFolder[link.folderId]) {
          linksByFolder[link.folderId] = []
        }
        linksByFolder[link.folderId].push(link)
      }
    })

    // Construire la hiérarchie des dossiers avec leurs liens
    const foldersWithLinks = folders.map((folder: any) => {
      const folderLinks = linksByFolder[folder.id] || []
      
      // Récupérer les sous-dossiers
      const children = folders.filter((f: any) => f.parentId === folder.id).map((child: any) => ({
        ...child,
        links: linksByFolder[child.id] || [],
        children: [] // Pour simplifier, pas de récursion profonde
      }))
      
      return {
        ...folder,
        links: folderLinks,
        children: folder.parentId ? [] : children // Seulement pour les dossiers racine
      }
    })

    // Filtrer pour ne garder que les dossiers racine
    const rootFolders = foldersWithLinks.filter((f: any) => !f.parentId)

    console.log(`✅ API Folders Direct: ${rootFolders.length} dossiers, ${allLinks.length} liens trouvés`)
    return NextResponse.json(rootFolders)
    
  } catch (error) {
    console.error('❌ Erreur API Folders Direct:', error)
    return NextResponse.json([])
  }
}