import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import PublicLinkPreview from '@/components/PublicLinkPreview'
import PublicLinkPreviewBeautiful from '@/components/PublicLinkPreviewBeautiful'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const link = await prisma.link.findUnique({
    where: { slug: params.slug },
    include: {
      user: {
        include: {
          avatar: true,
          banner: true
        }
      },
      cover: true,
    }
  })

  if (!link || !link.isActive) {
    return {
      title: 'Lien introuvable',
    }
  }

  // Debug - à supprimer après test
  console.log('Debug image priorités:', {
    coverUrl: link.cover?.url,
    coverImage: link.coverImage,
    profileImage: link.profileImage,
    userAvatarUrl: link.user.avatar?.url,
    userImage: link.user.image
  })

  // Construire l'URL absolue pour l'image
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const imageUrl = link.cover?.url || link.coverImage || link.profileImage || link.user.avatar?.url || link.user.image || '/favicon.ico'
  
  // Gérer les différents types d'URLs
  let absoluteImageUrl: string
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // URL absolue
    absoluteImageUrl = imageUrl
  } else if (imageUrl.startsWith('data:')) {
    // Data URI (base64)
    absoluteImageUrl = imageUrl
  } else {
    // URL relative
    absoluteImageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
  }
  
  console.log('URL finale pour OpenGraph:', absoluteImageUrl)

  return {
    title: link.title,
    description: link.description || `Découvrez les liens de ${link.user.name || link.user.username}`,
    openGraph: {
      title: link.title,
      description: link.description || `Découvrez les liens de ${link.user.name || link.user.username}`,
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: link.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: link.title,
      description: link.description || `Découvrez les liens de ${link.user.name || link.user.username}`,
      images: [absoluteImageUrl],
    },
  }
}

export default async function LinkPage({ params }: PageProps) {
  const link = await prisma.link.findUnique({
    where: { slug: params.slug },
    include: {
      user: true,
      multiLinks: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!link || !link.isActive) {
    notFound()
  }

  // Utiliser la nouvelle version magnifique
  return <PublicLinkPreviewBeautiful link={link} />
}