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

    return (
      <>
        {/* Script inline pour redirection INSTANTANÉE avant chargement React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const ua = navigator.userAgent || '';
                const isInApp = ua.includes('Instagram') || ua.includes('FBAN') || ua.includes('FBAV') || ua.includes('TikTok');
                if (!isInApp) return;

                const isIOS = /iPad|iPhone|iPod/.test(ua);
                const isAndroid = /Android/.test(ua);
                const url = window.location.href;

                setTimeout(function() {
                  if (isIOS) {
                    window.location.href = 'x-safari-https://' + url.replace(/^https?:\\/\\//, '');
                  } else if (isAndroid) {
                    const host = url.replace(/^https?:\\/\\//, '').replace(/\\/$/, '');
                    window.location.href = 'intent://' + host + '#Intent;scheme=https;action=android.intent.action.VIEW;end';
                  }
                }, 500);
              })();
            `,
          }}
        />
        <PublicLinkPreviewFinal link={link} />
      </>
    )
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

// Configuration pour ISR (Incremental Static Regeneration)
export const revalidate = 60 // 1 minute de cache - balance entre fraîcheur et performance