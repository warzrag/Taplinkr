'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { UserPermissions, checkPermission, checkLimit, getRemainingLimit, getUpgradeMessage, PlanLimits } from '@/lib/permissions'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function useTeamPermissions() {
  const { data: session } = useSession()
  const router = useRouter()
  const [teamInfo, setTeamInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchTeamInfo()
    }
  }, [session])

  const fetchTeamInfo = async () => {
    try {
      const response = await fetch('/api/user/team')
      if (response.ok) {
        const data = await response.json()
        setTeamInfo(data)
      } else if (response.status === 404) {
        // Pas d'équipe, c'est normal
        setTeamInfo(null)
      }
    } catch (error) {
      console.error('Erreur récupération équipe:', error)
    } finally {
      setLoading(false)
    }
  }

  // Déterminer les permissions en tenant compte de l'équipe
  const userPermissions: UserPermissions = teamInfo?.teamOwner ? {
    role: (session?.user as any)?.role || 'user',
    plan: teamInfo.teamOwner.plan,
    planExpiresAt: teamInfo.teamOwner.planExpiresAt
  } : {
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

  const isStandard = (): boolean => {
    return userPermissions.plan === 'standard' || userPermissions.plan === 'premium' || isAdmin()
  }

  const isPremium = (): boolean => {
    return userPermissions.plan === 'premium' || isAdmin()
  }

  const getPlan = (): string => {
    if (isAdmin()) return 'Admin'
    if (teamInfo?.teamOwner) return `${userPermissions.plan} (via équipe)`
    return userPermissions.plan
  }

  const isInTeam = (): boolean => {
    return !!teamInfo?.team
  }

  return {
    hasPermission,
    canAddMore,
    remaining,
    requirePermission,
    requireLimit,
    isAdmin,
    isStandard,
    isPremium,
    getPlan,
    isInTeam,
    loading,
    teamInfo,
    permissions: {
      ...userPermissions,
      userId: session?.user?.id
    },
  }
}