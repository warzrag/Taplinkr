import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createLinkDB, createMultiLinksDB } from '@/lib/db-direct-v2'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    
    // Créer le lien principal avec la structure adaptée
    const linkData = {
      id: nanoid(),
      userId: session.user.id,
      title: body.title || 'Mon lien',
      slug: body.slug || nanoid(10),
      description: body.description || body.bio || '',
      bio: body.bio || body.description || '',
      directUrl: body.directUrl || null,
      isDirect: body.isDirect || false,
      isActive: true,
      shieldEnabled: body.shieldEnabled || false,
      isUltraLink: body.isUltraLink || false,
      clicks: 0,
      views: 0,
      order: 0,
      primaryColor: body.primaryColor || '#3b82f6',
      icon: body.icon || '',
      profileImage: body.profileImage || null,
      coverImage: body.coverImage || null,
      instagramUrl: body.instagramUrl || null,
      tiktokUrl: body.tiktokUrl || null,
      twitterUrl: body.twitterUrl || null,
      youtubeUrl: body.youtubeUrl || null,
      animation: body.animation || 'none',
      borderRadius: body.borderRadius || 'rounded-xl',
      fontFamily: body.fontFamily || 'system',
      backgroundColor: body.backgroundColor || '#ffffff',
      textColor: body.textColor || '#1f2937'
    }

    // Créer le lien dans PostgreSQL
    const newLink = await createLinkDB(linkData)

    // Si c'est un multi-lien, créer les sous-liens
    console.log('🔍 API Check - isDirect:', body.isDirect, 'multiLinks count:', body.multiLinks?.length)
    if (!body.isDirect && body.multiLinks && body.multiLinks.length > 0) {
      console.log('✅ Appel createMultiLinksDB')
      const createdMultiLinks = await createMultiLinksDB(newLink.id, body.multiLinks)
      console.log('✅ createMultiLinksDB terminé, retour:', createdMultiLinks.length)
      newLink.multiLinks = createdMultiLinks
    } else {
      console.log('❌ Condition non remplie - pas de création de multiLinks')
      newLink.multiLinks = []
    }
    
    return NextResponse.json(newLink)
    
  } catch (error: any) {
    console.error('❌ Erreur création lien FINAL:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la création',
      message: error.message 
    }, { status: 500 })
  }
}