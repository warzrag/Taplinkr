export type UserRole = 'user' | 'admin'
export type UserPlan = 'free' | 'pro' | 'business'

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
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  free: {
    maxPages: 1,
    maxLinksPerPage: 10,
    maxFolders: 3,
    hasAnalytics: true, // Basic analytics only
    hasAdvancedAnalytics: false,
    hasCustomThemes: false,
    hasPremiumThemes: false,
    hasAnimations: false,
    hasIntegrations: false,
    hasCustomDomain: false,
    hasApiAccess: false,
    hasWhiteLabel: false,
    hasTeamMembers: false,
    maxTeamMembers: 0,
    hasQRCode: true, // Basic QR code
    hasCustomQRCode: false,
    hasPrioritySupport: false,
  },
  pro: {
    maxPages: -1, // Unlimited
    maxLinksPerPage: -1, // Unlimited
    maxFolders: -1, // Unlimited
    hasAnalytics: true,
    hasAdvancedAnalytics: true,
    hasCustomThemes: true,
    hasPremiumThemes: true,
    hasAnimations: true,
    hasIntegrations: true,
    hasCustomDomain: false,
    hasApiAccess: false,
    hasWhiteLabel: true,
    hasTeamMembers: false,
    maxTeamMembers: 0,
    hasQRCode: true,
    hasCustomQRCode: true,
    hasPrioritySupport: true,
  },
  business: {
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
    maxTeamMembers: 5,
    hasQRCode: true,
    hasCustomQRCode: true,
    hasPrioritySupport: true,
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
    maxPages: 'Passez au plan Pro pour créer des pages illimitées',
    maxLinksPerPage: 'Passez au plan Pro pour ajouter plus de liens',
    maxFolders: 'Passez au plan Pro pour créer plus de dossiers',
    hasAnalytics: 'Cette fonctionnalité nécessite un plan payant',
    hasAdvancedAnalytics: 'Les analytics avancés nécessitent le plan Pro',
    hasCustomThemes: 'Les thèmes personnalisés nécessitent le plan Pro',
    hasPremiumThemes: 'Les thèmes premium nécessitent le plan Pro',
    hasAnimations: 'Les animations nécessitent le plan Pro',
    hasIntegrations: 'Les intégrations (YouTube, Spotify) nécessitent le plan Pro',
    hasCustomDomain: 'Le domaine personnalisé nécessite le plan Business',
    hasApiAccess: 'L\'accès API nécessite le plan Business',
    hasWhiteLabel: 'La suppression de la bannière nécessite le plan Pro',
    hasTeamMembers: 'Les membres d\'équipe nécessitent le plan Business',
    maxTeamMembers: 'Passez au plan Business pour ajouter plus de membres',
    hasQRCode: 'Cette fonctionnalité nécessite un plan payant',
    hasCustomQRCode: 'Les QR codes personnalisés nécessitent le plan Pro',
    hasPrioritySupport: 'Le support prioritaire nécessite le plan Pro',
  }

  return messages[feature] || 'Cette fonctionnalité nécessite un plan supérieur'
}