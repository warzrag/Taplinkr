import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { analyticsService } from '@/lib/analytics-service'
import { passwordProtectionService } from '@/lib/password-protection'
import { templateEngine } from '@/lib/template-engine'
import ShieldPage from '@/components/ShieldPage'
import MultiLinkPage from '@/components/MultiLinkPage'
import PasswordProtectionModal from '@/components/protection/PasswordProtectionModal'

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

    // Use new analytics service
    await analyticsService.trackEvent({
      linkId,
      userId,
      eventType: 'view',
      request: {
        ip: ip.split(',')[0].trim(),
        userAgent,
        referer
      }
    })

    // Incrémenter le compteur de clics pour la compatibilité
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

  // Check password protection
  const protection = await passwordProtectionService.getProtectionInfo(link.id)
  if (protection) {
    // Check if user has verified cookie
    const headersList = headers()
    const cookieHeader = headersList.get('cookie') || ''
    const hasVerified = cookieHeader.includes(`verified_${link.id}=true`)
    
    if (!hasVerified) {
      // Show password protection modal
      return (
        <PasswordProtectionModal
          linkTitle={link.title}
          hint={protection.hint || undefined}
          isLocked={protection.lockedUntil ? protection.lockedUntil > new Date() : false}
          lockedUntil={protection.lockedUntil || undefined}
          onVerify={async (password: string) => {
            'use server'
            // This will be handled by the verify API endpoint
            return { success: false, error: 'Use API endpoint' }
          }}
        />
      )
    }
  }

  // Enregistrer le clic de manière asynchrone
  try {
    await recordClick(link.id, link.userId)
  } catch (error) {
    // Ignorer les erreurs d'enregistrement pour ne pas bloquer la redirection
  }

  // Get user profile with template
  const profile = await templateEngine.renderProfile(link.userId)

  // Tous les liens affichent maintenant la page MultiLink avec template
  return <MultiLinkPage link={link} profile={profile} />
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