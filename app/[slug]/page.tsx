import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PublicLinkPreviewFinal from '@/components/PublicLinkPreviewFinal'

interface PageProps {
  params: { slug: string }
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

  return <PublicLinkPreviewFinal link={link} />
}

export async function generateMetadata({ params }: PageProps) {
  const link = await prisma.link.findUnique({
    where: { slug: params.slug },
    include: {
      user: true
    }
  })

  if (!link) {
    return {
      title: 'Page non trouvée',
      description: 'Cette page n\'existe pas'
    }
  }

  return {
    title: link.title || `${link.user.name || link.user.username} - TapLinkr`,
    description: link.description || `Découvrez tous les liens de ${link.user.name || link.user.username}`,
    openGraph: {
      title: link.title || `${link.user.name || link.user.username} - TapLinkr`,
      description: link.description || `Découvrez tous les liens de ${link.user.name || link.user.username}`,
      images: link.coverImage ? [link.coverImage] : []
    }
  }
}