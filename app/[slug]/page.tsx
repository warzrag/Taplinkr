import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PublicLinkPreviewFinal from '@/components/PublicLinkPreviewFinal'
import { cache } from 'react'

interface PageProps {
  params: { slug: string }
}

// Cache la requête pour éviter les doublons
const getLinkData = cache(async (slug: string) => {
  const link = await prisma.link.findUnique({
    where: { slug },
    include: {
      user: true,
      multiLinks: {
        orderBy: { order: 'asc' }
      }
    }
  })
  return link
})

export default async function LinkPage({ params }: PageProps) {
  try {
    const link = await getLinkData(params.slug)

    if (!link) {
      console.error(`Link not found for slug: ${params.slug}`)
      notFound()
    }

    if (!link.isActive) {
      console.error(`Link is not active: ${params.slug}`)
      notFound()
    }

    // 🔍 DEBUG: Vérifier les multiLinks
    console.log(`🔍 [${params.slug}] Loaded link with ${link.multiLinks?.length || 0} multiLinks`)
    if (link.multiLinks && link.multiLinks.length > 0) {
      link.multiLinks.forEach((ml, i) => {
        console.log(`   ${i+1}. ${ml.title} -> ${ml.url}`)
      })
    }

    return <PublicLinkPreviewFinal link={link} />
  } catch (error) {
    console.error('Error loading link:', error)
    notFound()
  }
}

export async function generateMetadata({ params }: PageProps) {
  const link = await getLinkData(params.slug)

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

// Configuration optimale pour vitesse maximale
export const revalidate = 0 // Désactiver le cache temporairement pour debugging
export const dynamic = 'force-dynamic' // Forcer le mode dynamique (pas de cache)