export type UserRole = 'user' | 'admin'
export type UserPlan = 'free' | 'standard' | 'premium'

export interface UserPermissions {
  role: UserRole
  plan: UserPlan
  planExpiresAt?: Date | null
}

export interface PlanLimits {
  maxPages: number
  maxLinksPerPage: number
  maxFolders: number
  hasAnalytics: boolean
  hasAdvancedAnalytics: boolean
  hasCustomThemes: boolean
  hasPremiumThemes: boolean
  hasAnimations: boolean
  hasIntegrations: boolean
  hasCustomDomain: boolean
  hasApiAccess: boolean
  hasWhiteLabel: boolean
  hasTeamMembers: boolean
  maxTeamMembers: number
  hasQRCode: boolean
  hasCustomQRCode: boolean
  hasPrioritySupport: boolean
  hasProfileImage: boolean
  hasCoverImage: boolean
  hasCustomFonts: boolean
  hasSocialMedia: boolean
  hasLocationDisplay: boolean
  hasOnlineStatus: boolean
  hasCustomIcons: boolean
  hasEmailCapture: boolean
  hasPasswordProtection: boolean
  hasExpirationDate: boolean
  hasUltraLink: boolean
  hasShieldLink: boolean
  hasAdvancedCustomization: boolean
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    maxPages: 1,
    maxLinksPerPage: 5,
    maxFolders: 3, // Permettre 3 dossiers en gratuit
    hasAnalytics: true, // Basic analytics only
    hasAdvancedAnalytics: false,
    hasCustomThemes: false,
    hasPremiumThemes: false,
    hasAnimations: true, // Toutes les animations disponibles
    hasIntegrations: false,
    hasCustomDomain: false,
    hasApiAccess: false,
    hasWhiteLabel: false,
    hasTeamMembers: false,
    maxTeamMembers: 0,
    hasQRCode: false,
    hasCustomQRCode: false,
    hasPrioritySupport: false,
    hasProfileImage: true, // Photo de profil disponible
    hasCoverImage: true, // Photo de couverture disponible
    hasCustomFonts: false,
    hasSocialMedia: false,
    hasLocationDisplay: false,
    hasOnlineStatus: false,
    hasCustomIcons: false,
    hasEmailCapture: false,
    hasPasswordProtection: false,
    hasExpirationDate: false,
    hasUltraLink: false,
    hasShieldLink: false,
    hasAdvancedCustomization: false,
  },
  standard: {
    maxPages: -1, // Unlimited
    maxLinksPerPage: -1, // Unlimited
    maxFolders: -1, // Unlimited
    hasAnalytics: true,
    hasAdvancedAnalytics: true,
    hasCustomThemes: true,
    hasPremiumThemes: false,
    hasAnimations: true,
    hasIntegrations: true,
    hasCustomDomain: false,
    hasApiAccess: false,
    hasWhiteLabel: true,
    hasTeamMembers: false,
    maxTeamMembers: 0,
    hasQRCode: true,
    hasCustomQRCode: true,
    hasPrioritySupport: false,
    hasProfileImage: true,
    hasCoverImage: true,
    hasCustomFonts: true,
    hasSocialMedia: true,
    hasLocationDisplay: true,
    hasOnlineStatus: true,
    hasCustomIcons: true,
    hasEmailCapture: true,
    hasPasswordProtection: false,
    hasExpirationDate: false,
    hasUltraLink: false,
    hasShieldLink: false,
    hasAdvancedCustomization: false,
  },
  premium: {
    maxPages: -1, // Unlimited
    maxLinksPerPage: -1, // Unlimited
    maxFolders: -1, // Unlimited
    hasAnalytics: true,
    hasAdvancedAnalytics: true,
    hasCustomThemes: true,
    hasPremiumThemes: true,
    hasAnimations: true,
    hasIntegrations: true,
    hasCustomDomain: true,
    hasApiAccess: true,
    hasWhiteLabel: true,
    hasTeamMembers: true,
    maxTeamMembers: 10,
    hasQRCode: true,
    hasCustomQRCode: true,
    hasPrioritySupport: true,
    hasProfileImage: true,
    hasCoverImage: true,
    hasCustomFonts: true,
    hasSocialMedia: true,
    hasLocationDisplay: true,
    hasOnlineStatus: true,
    hasCustomIcons: true,
    hasEmailCapture: true,
    hasPasswordProtection: true,
    hasExpirationDate: true,
    hasUltraLink: true,
    hasShieldLink: true,
    hasAdvancedCustomization: true,
  },
}

export function checkPermission(
  user: UserPermissions,
  feature: keyof PlanLimits
): boolean {
  // Admin has all permissions
  if (user.role === 'admin') {
    return true
  }

  // Check if plan is still valid
  if (user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
    // Plan expired, revert to free
    return PLAN_LIMITS.free[feature] as boolean
  }

  const planLimits = PLAN_LIMITS[user.plan]
  return planLimits[feature] as boolean
}

export function checkLimit(
  user: UserPermissions,
  limit: 'maxPages' | 'maxLinksPerPage' | 'maxFolders' | 'maxTeamMembers',
  currentCount: number
): boolean {
  // Admin has no limits
  if (user.role === 'admin') {
    return true
  }

  // Check if plan is still valid
  const activePlan = user.planExpiresAt && new Date(user.planExpiresAt) < new Date() 
    ? 'free' 
    : user.plan

  const planLimits = PLAN_LIMITS[activePlan]
  const maxLimit = planLimits[limit] as number

  // -1 means unlimited
  if (maxLimit === -1) {
    return true
  }

  return currentCount < maxLimit
}

export function getRemainingLimit(
  user: UserPermissions,
  limit: 'maxPages' | 'maxLinksPerPage' | 'maxFolders' | 'maxTeamMembers',
  currentCount: number
): number {
  // Admin has unlimited
  if (user.role === 'admin') {
    return -1
  }

  const activePlan = user.planExpiresAt && new Date(user.planExpiresAt) < new Date() 
    ? 'free' 
    : user.plan

  const planLimits = PLAN_LIMITS[activePlan]
  const maxLimit = planLimits[limit] as number

  // -1 means unlimited
  if (maxLimit === -1) {
    return -1
  }

  return Math.max(0, maxLimit - currentCount)
}

export function getUpgradeMessage(feature: keyof PlanLimits): string {
  const messages: Record<keyof PlanLimits, string> = {
    maxPages: 'Passez au plan Standard pour créer des pages illimitées',
    maxLinksPerPage: 'Passez au plan Standard pour ajouter plus de liens',
    maxFolders: 'Passez au plan Standard pour créer plus de dossiers',
    hasAnalytics: 'Cette fonctionnalité nécessite un plan payant',
    hasAdvancedAnalytics: 'Les analytics avancés nécessitent le plan Standard',
    hasCustomThemes: 'Les thèmes personnalisés nécessitent le plan Standard',
    hasPremiumThemes: 'Les thèmes premium nécessitent le plan Premium',
    hasAnimations: 'Les animations sont disponibles dans tous les plans',
    hasIntegrations: 'Les intégrations (YouTube, Spotify) nécessitent le plan Standard',
    hasCustomDomain: 'Le domaine personnalisé nécessite le plan Premium',
    hasApiAccess: 'L\'accès API nécessite le plan Premium',
    hasWhiteLabel: 'La suppression de la bannière nécessite le plan Standard',
    hasTeamMembers: 'Les membres d\'équipe nécessitent le plan Premium',
    maxTeamMembers: 'Passez au plan Premium pour ajouter plus de membres',
    hasQRCode: 'Le code QR nécessite le plan Standard',
    hasCustomQRCode: 'Les QR codes personnalisés nécessitent le plan Standard',
    hasPrioritySupport: 'Le support prioritaire nécessite le plan Premium',
    hasProfileImage: 'La photo de profil est disponible dans tous les plans',
    hasCoverImage: 'La photo de couverture est disponible dans tous les plans',
    hasCustomFonts: 'Les polices personnalisées nécessitent le plan Standard',
    hasSocialMedia: 'Les réseaux sociaux nécessitent le plan Standard',
    hasLocationDisplay: 'L\'affichage de la localisation nécessite le plan Standard',
    hasOnlineStatus: 'Le statut en ligne nécessite le plan Standard',
    hasCustomIcons: 'Les icônes personnalisées nécessitent le plan Standard',
    hasEmailCapture: 'La capture d\'email nécessite le plan Standard',
    hasPasswordProtection: 'La protection par mot de passe nécessite le plan Premium',
    hasExpirationDate: 'La date d\'expiration nécessite le plan Premium',
    hasUltraLink: 'Ultra Link nécessite le plan Premium',
    hasShieldLink: 'Shield Link nécessite le plan Premium',
    hasAdvancedCustomization: 'La personnalisation avancée nécessite le plan Premium',
  }

  return messages[feature] || 'Cette fonctionnalité nécessite un plan supérieur'
}

// Utilitaire pour obtenir les permissions d'un utilisateur
export function getUserPermissions(user: {
  role: string;
  plan: string;
  planExpiresAt?: Date | null;
  teamOwner?: {
    plan: string;
    planExpiresAt?: Date | null;
  };
}): UserPermissions {
  // Si l'utilisateur fait partie d'une équipe, utiliser le plan du propriétaire
  if (user.teamOwner) {
    return {
      role: user.role as UserRole,
      plan: user.teamOwner.plan as UserPlan,
      planExpiresAt: user.teamOwner.planExpiresAt
    }
  }
  
  return {
    role: user.role as UserRole,
    plan: user.plan as UserPlan,
    planExpiresAt: user.planExpiresAt
  }
}