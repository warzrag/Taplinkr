import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PublicLinkPreviewFinal from '@/components/PublicLinkPreviewFinal'
import { unstable_cache } from 'next/cache'

// Récupérer un lien avec cache
const getCachedLink = unstable_cache(
  async (slug: string) => {
    try {
      const link = await prisma.link.findUnique({
        where: { slug },
        include: {
          multiLinks: {
            where: { isActive: true },
            orderBy: { order: 'asc' }
          },
          user: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      })

      if (!link || !link.isActive) {
        return null
      }

      return link
    } catch (error) {
      console.error('Erreur récupération lien:', error)
      return null
    }
  },
  ['link'],
  {
    revalidate: 60, // Revalider toutes les 60 secondes
    tags: ['links']
  }
)

// Générer les paramètres statiques pour les liens populaires
export async function generateStaticParams() {
  try {
    // Prégénérer les 100 liens les plus populaires
    const popularLinks = await prisma.link.findMany({
      where: { isActive: true },
      orderBy: { views: 'desc' },
      take: 100,
      select: { slug: true }
    })

    return popularLinks.map((link) => ({
      slug: link.slug
    }))
  } catch (error) {
    console.error('Erreur génération params:', error)
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const link = await getCachedLink(params.slug)

  if (!link) {
    return {
      title: 'Lien introuvable | TapLinkr',
      description: 'Ce lien n\'existe pas ou a été supprimé.'
    }
  }

  return {
    title: `${link.title} | TapLinkr`,
    description: link.description || `Découvrez ${link.title} sur TapLinkr`,
    openGraph: {
      title: link.title,
      description: link.description || `Découvrez ${link.title} sur TapLinkr`,
      images: link.coverImage ? [{ url: link.coverImage }] : [],
      url: `https://taplinkr.com/${link.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title: link.title,
      description: link.description || `Découvrez ${link.title} sur TapLinkr`,
      images: link.coverImage ? [link.coverImage] : []
    }
  }
}

export default async function PublicLinkPage({ params }: { params: { slug: string } }) {
  const link = await getCachedLink(params.slug)

  if (!link) {
    notFound()
  }

  return <PublicLinkPreviewFinal link={link as any} />
}