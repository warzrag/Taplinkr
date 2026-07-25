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
  maxMultiLinks: number
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
    maxLinksPerPage: 1,
    maxMultiLinks: 1,
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
    maxMultiLinks: -1, // Unlimited
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
    hasTeamMembers: true,
    maxTeamMembers: 10,
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
    maxMultiLinks: -1, // Unlimited
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

function normalizePlan(plan: string | null | undefined): UserPlan {
  return plan === 'standard' || plan === 'premium' ? plan : 'free'
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

  const planLimits = PLAN_LIMITS[normalizePlan(user.plan)]
  return planLimits[feature] as boolean
}

export function checkLimit(
  user: UserPermissions,
  limit: 'maxPages' | 'maxLinksPerPage' | 'maxMultiLinks' | 'maxFolders' | 'maxTeamMembers',
  currentCount: number
): boolean {
  // Admin has no limits
  if (user.role === 'admin') {
    return true
  }

  // Check if plan is still valid
  const activePlan = user.planExpiresAt && new Date(user.planExpiresAt) < new Date() 
    ? 'free' 
    : normalizePlan(user.plan)

  const planLimits = PLAN_LIMITS[activePlan]
  const maxLimit = planLimits[limit] as number

  // -1 means unlimited
  if (maxLimit === -1) {
    return true
  }

  // Pour maxLinksPerPage avec plan gratuit, on veut vérifier que l'utilisateur
  // peut créer un nouveau lien. Si currentCount >= maxLimit, il a déjà atteint la limite
  return currentCount < maxLimit
}

export function getRemainingLimit(
  user: UserPermissions,
  limit: 'maxPages' | 'maxLinksPerPage' | 'maxMultiLinks' | 'maxFolders' | 'maxTeamMembers',
  currentCount: number
): number {
  // Admin has unlimited
  if (user.role === 'admin') {
    return -1
  }

  const activePlan = user.planExpiresAt && new Date(user.planExpiresAt) < new Date() 
    ? 'free' 
    : normalizePlan(user.plan)

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
    maxPages: 'Upgrade to Standard to create unlimited pages',
    maxLinksPerPage: 'You reached the free plan limit of 1 link. Upgrade to create unlimited links',
    maxMultiLinks: 'You reached the free plan limit of 1 multi-link. Upgrade to create unlimited multi-links',
    maxFolders: 'Upgrade to Standard to create more folders',
    hasAnalytics: 'This feature requires a paid plan',
    hasAdvancedAnalytics: 'Advanced analytics require the Standard plan',
    hasCustomThemes: 'Custom themes require the Standard plan',
    hasPremiumThemes: 'Premium themes require the Premium plan',
    hasAnimations: 'Les animations sont disponibles dans tous les plans',
    hasIntegrations: 'Integrations such as YouTube and Spotify require the Standard plan',
    hasCustomDomain: 'Custom domains require the Premium plan',
    hasApiAccess: 'API access requires the Premium plan',
    hasWhiteLabel: 'Removing TapLinkr branding requires the Standard plan',
    hasTeamMembers: 'Team members require the Standard plan or higher',
    maxTeamMembers: 'Passez au plan Premium pour ajouter plus de membres (max 10)',
    hasQRCode: 'QR codes require the Standard plan',
    hasCustomQRCode: 'Custom QR codes require the Standard plan',
    hasPrioritySupport: 'Priority support requires the Premium plan',
    hasProfileImage: 'La photo de profil est disponible dans tous les plans',
    hasCoverImage: 'La photo de couverture est disponible dans tous les plans',
    hasCustomFonts: 'Custom fonts require the Standard plan',
    hasSocialMedia: 'Social media features require the Standard plan',
    hasLocationDisplay: 'Location display requires the Standard plan',
    hasOnlineStatus: 'Online status requires the Standard plan',
    hasCustomIcons: 'Custom icons require the Standard plan',
    hasEmailCapture: 'Email capture requires the Standard plan',
    hasPasswordProtection: 'Password protection requires the Premium plan',
    hasExpirationDate: 'Expiration dates require the Premium plan',
    hasUltraLink: 'Ultra Link requires the Premium plan',
    hasShieldLink: 'Shield Link requires the Premium plan',
    hasAdvancedCustomization: 'Advanced customization requires the Premium plan',
  }

  return messages[feature] || 'This feature requires a higher plan'
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
      plan: normalizePlan(user.teamOwner.plan),
      planExpiresAt: user.teamOwner.planExpiresAt
    }
  }
  
  return {
    role: user.role as UserRole,
    plan: normalizePlan(user.plan),
    planExpiresAt: user.planExpiresAt
  }
}
