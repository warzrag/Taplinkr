// Limites des plans d'abonnement
export const PLAN_LIMITS = {
  free: {
    maxLinks: 1,
    maxMultiLinks: 1,
    maxPages: 1,
    customDomain: false,
    analytics: 'basic',
    support: 'email',
    removeBranding: false,
    customThemes: false,
    animations: false,
    integrations: false,
    exportData: false,
    abTesting: false
  },
  pro: {
    maxLinks: -1, // -1 = illimité
    maxMultiLinks: -1,
    maxPages: -1,
    customDomain: false,
    analytics: 'advanced',
    support: 'priority',
    removeBranding: true,
    customThemes: true,
    animations: true,
    integrations: true,
    exportData: true,
    abTesting: true
  },
  business: {
    maxLinks: -1,
    maxMultiLinks: -1,
    maxPages: -1,
    customDomain: true,
    analytics: 'realtime',
    support: 'dedicated',
    removeBranding: true,
    customThemes: true,
    animations: true,
    integrations: true,
    exportData: true,
    abTesting: true,
    teamMembers: 5,
    apiAccess: true
  }
}

export type PlanType = keyof typeof PLAN_LIMITS

export async function checkUserLimits(userId: string, prisma: any) {
  // Récupérer l'utilisateur et son plan
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscription: true,
      _count: {
        select: {
          links: true
        }
      }
    }
  })

  if (!user) {
    throw new Error('Utilisateur non trouvé')
  }

  // Plan par défaut : gratuit
  const userPlan = user.subscription?.plan || 'free'
  const limits = PLAN_LIMITS[userPlan as PlanType] || PLAN_LIMITS.free

  // Compter les liens actuels
  const linkCount = await prisma.link.count({
    where: { userId }
  })

  // Compter les multi-links
  const multiLinkCount = await prisma.multiLink.count({
    where: { 
      link: {
        userId
      }
    }
  })

  return {
    plan: userPlan,
    limits,
    usage: {
      links: linkCount,
      multiLinks: multiLinkCount
    },
    canAddLink: limits.maxLinks === -1 || linkCount < limits.maxLinks,
    canAddMultiLink: limits.maxMultiLinks === -1 || multiLinkCount < limits.maxMultiLinks
  }
}

export function getLimitMessage(limitType: 'links' | 'multiLinks', plan: string) {
  const messages = {
    links: {
      free: 'Vous avez atteint la limite de 1 lien du plan gratuit. Passez au plan Pro pour créer des liens illimités.',
      pro: 'Limite de liens atteinte.',
      business: 'Limite de liens atteinte.'
    },
    multiLinks: {
      free: 'Vous avez atteint la limite de 1 multi-link du plan gratuit. Passez au plan Pro pour créer des multi-links illimités.',
      pro: 'Limite de multi-links atteinte.',
      business: 'Limite de multi-links atteinte.'
    }
  }

  return messages[limitType][plan as keyof typeof messages[typeof limitType]] || 'Limite atteinte.'
}