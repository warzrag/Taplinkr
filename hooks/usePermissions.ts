'use client'

import { useSession } from 'next-auth/react'
import { UserPermissions, checkPermission, checkLimit, getRemainingLimit, getUpgradeMessage, PlanLimits } from '@/lib/permissions'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function usePermissions() {
  const { data: session } = useSession()
  const router = useRouter()

  const userPermissions: UserPermissions = {
    role: (session?.user as any)?.role || 'user',
    plan: (session?.user as any)?.plan || 'free',
    planExpiresAt: (session?.user as any)?.planExpiresAt
  }

  const hasPermission = (feature: keyof PlanLimits): boolean => {
    return checkPermission(userPermissions, feature)
  }

  const canAddMore = (
    limit: 'maxPages' | 'maxLinksPerPage' | 'maxFolders' | 'maxTeamMembers',
    currentCount: number
  ): boolean => {
    return checkLimit(userPermissions, limit, currentCount)
  }

  const remaining = (
    limit: 'maxPages' | 'maxLinksPerPage' | 'maxFolders' | 'maxTeamMembers',
    currentCount: number
  ): number => {
    return getRemainingLimit(userPermissions, limit, currentCount)
  }

  const requirePermission = (feature: keyof PlanLimits): boolean => {
    const hasAccess = hasPermission(feature)
    if (!hasAccess) {
      toast.error(getUpgradeMessage(feature), {
        duration: 5000,
        icon: '🔒',
        style: {
          background: '#FEF3C7',
          color: '#92400E',
        },
      })
      
      // Optionally redirect to pricing page after a delay
      setTimeout(() => {
        router.push('/pricing')
      }, 2000)
    }
    return hasAccess
  }

  const requireLimit = (
    limit: 'maxPages' | 'maxLinksPerPage' | 'maxFolders' | 'maxTeamMembers',
    currentCount: number
  ): boolean => {
    const canAdd = canAddMore(limit, currentCount)
    if (!canAdd) {
      const remainingCount = remaining(limit, currentCount)
      toast.error(
        remainingCount === 0 
          ? `Vous avez atteint la limite de votre plan. ${getUpgradeMessage(limit)}`
          : `Il vous reste ${remainingCount} élément(s) dans votre plan`,
        {
          duration: 5000,
          icon: '⚠️',
          style: {
            background: '#FEF3C7',
            color: '#92400E',
          },
        }
      )
      
      setTimeout(() => {
        router.push('/pricing')
      }, 2000)
    }
    return canAdd
  }

  const isAdmin = (): boolean => {
    return userPermissions.role === 'admin'
  }

  const isPro = (): boolean => {
    return userPermissions.plan === 'pro' || userPermissions.plan === 'business' || isAdmin()
  }

  const isBusiness = (): boolean => {
    return userPermissions.plan === 'business' || isAdmin()
  }

  const getPlan = (): string => {
    return isAdmin() ? 'Admin' : userPermissions.plan
  }

  return {
    hasPermission,
    canAddMore,
    remaining,
    requirePermission,
    requireLimit,
    isAdmin,
    isPro,
    isBusiness,
    getPlan,
    userPermissions,
  }
}