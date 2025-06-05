import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import ShieldPage from '@/components/ShieldPage'
import MultiLinkPage from '@/components/MultiLinkPage'

interface PageProps {
  params: { slug: string }
}

async function getLink(slug: string) {
  try {
    console.log('Recherche du lien avec slug:', slug)
    const link = await prisma.link.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            image: true,
            bio: true,
            bannerImage: true,
            theme: true,
            primaryColor: true,
            secondaryColor: true,
            backgroundImage: true,
            twitterUrl: true,
            instagramUrl: true,
            linkedinUrl: true,
            youtubeUrl: true,
            tiktokUrl: true
          }
        },
        multiLinks: {
          orderBy: { order: 'asc' }
        }
      }
    })
    console.log('Lien trouvé:', link ? `${link.title} (actif: ${link.isActive})` : 'Non trouvé')
    return link
  } catch (error) {
    console.error('Erreur lors de la récupération du lien:', error)
    return null
  }
}

async function recordClick(linkId: string, userId: string) {
  try {
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || ''
    const referer = headersList.get('referer') || ''

    // Détection simple du device
    const device = userAgent.toLowerCase().includes('mobile') ? 'mobile' : 
                  userAgent.toLowerCase().includes('tablet') ? 'tablet' : 'desktop'

    // Créer l'enregistrement du clic
    await prisma.click.create({
      data: {
        linkId,
        userId,
        ip: ip.split(',')[0].trim(), // Prendre la première IP si multiple
        userAgent,
        referer,
        device
      }
    })

    // Incrémenter le compteur de clics
    await prisma.link.update({
      where: { id: linkId },
      data: {
        clicks: {
          increment: 1
        }
      }
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic:', error)
    // Ne pas bloquer la redirection si l'enregistrement échoue
  }
}

export default async function RedirectPage({ params }: PageProps) {
  const link = await getLink(params.slug)

  if (!link) {
    notFound()
  }

  // Vérifier si le lien est actif
  if (!link.isActive) {
    notFound()
  }

  // Enregistrer le clic de manière asynchrone
  try {
    await recordClick(link.id, link.userId)
  } catch (error) {
    // Ignorer les erreurs d'enregistrement pour ne pas bloquer la redirection
  }

  // Tous les liens affichent maintenant la page MultiLink
  return <MultiLinkPage link={link} />
}

// Générer des métadonnées pour l'aperçu social
export async function generateMetadata({ params }: PageProps) {
  const link = await getLink(params.slug)

  if (!link) {
    return {
      title: 'Lien non trouvé'
    }
  }

  return {
    title: link.title || `Lien de ${link.user.name || link.user.username}`,
    description: link.description || `Découvrez ce lien partagé par ${link.user.name || link.user.username}`,
    openGraph: {
      title: link.title || `Lien de ${link.user.name || link.user.username}`,
      description: link.description || `Découvrez ce lien partagé par ${link.user.name || link.user.username}`,
      type: 'website',
    },
    robots: {
      index: false,
      follow: false,
    }
  }
}