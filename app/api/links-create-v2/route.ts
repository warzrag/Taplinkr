import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createLink, createMultiLinks } from '@/lib/supabase'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      bio, 
      isDirect, 
      directUrl,
      multiLinks,
      profileImage,
      coverImage,
      slug,
      description,
      instagramUrl,
      tiktokUrl,
      twitterUrl,
      youtubeUrl,
      animation,
      borderRadius,
      fontFamily,
      backgroundColor,
      textColor
    } = body

    // Créer le lien principal
    const linkData = {
      id: nanoid(),
      userId: session.user.id,
      title: title || 'Mon lien',
      slug: slug || nanoid(10),
      bio: bio || description || '',
      description: description || '',
      directUrl: directUrl || null,
      isDirect: isDirect || false,
      isActive: true,
      clicks: 0,
      views: 0,
      order: 0,
      theme: 'gradient',
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      profileImage: profileImage || null,
      coverImage: coverImage || null,
      instagramUrl: instagramUrl || null,
      tiktokUrl: tiktokUrl || null,
      twitterUrl: twitterUrl || null,
      youtubeUrl: youtubeUrl || null,
      animation: animation || 'none',
      borderRadius: borderRadius || 'rounded-xl',
      fontFamily: fontFamily || 'system',
      backgroundColor: backgroundColor || '#ffffff',
      textColor: textColor || '#1f2937',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('📝 Création du lien:', linkData.slug)
    
    // Créer le lien dans Supabase
    const newLink = await createLink(linkData)
    
    // Si c'est un multi-lien, créer les sous-liens
    if (!isDirect && multiLinks && multiLinks.length > 0) {
      console.log('📎 Création de', multiLinks.length, 'multilinks')
      const createdMultiLinks = await createMultiLinks(newLink.id, multiLinks)
      newLink.multiLinks = createdMultiLinks
    }
    
    console.log('✅ Lien créé avec succès:', newLink.slug)
    
    return NextResponse.json(newLink)
    
  } catch (error: any) {
    console.error('❌ Erreur création lien:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la création',
      message: error.message 
    }, { status: 500 })
  }
}