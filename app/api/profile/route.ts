import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        bannerImage: true,
        avatarId: true,
        bannerId: true,
        theme: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundImage: true,
        twitterUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
        youtubeUrl: true,
        tiktokUrl: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      bio,
      image,
      bannerImage,
      avatarId,
      bannerId,
      theme,
      primaryColor,
      secondaryColor,
      backgroundImage,
      twitterUrl,
      instagramUrl,
      linkedinUrl,
      youtubeUrl,
      tiktokUrl,
    } = body

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(image !== undefined && { image }),
        ...(bannerImage !== undefined && { bannerImage }),
        ...(avatarId !== undefined && { avatarId }),
        ...(bannerId !== undefined && { bannerId }),
        ...(theme !== undefined && { theme }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(backgroundImage !== undefined && { backgroundImage }),
        ...(twitterUrl !== undefined && { twitterUrl }),
        ...(instagramUrl !== undefined && { instagramUrl }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(youtubeUrl !== undefined && { youtubeUrl }),
        ...(tiktokUrl !== undefined && { tiktokUrl }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        bannerImage: true,
        avatarId: true,
        bannerId: true,
        theme: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundImage: true,
        twitterUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
        youtubeUrl: true,
        tiktokUrl: true,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}