import { prisma } from '@/lib/prisma'
import { getUserPermissions, type UserPermissions } from '@/lib/permissions'

export async function getTeamAwareUserPermissions(userId: string): Promise<UserPermissions> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      team: {
        include: {
          owner: {
            select: {
              plan: true,
              planExpiresAt: true
            }
          }
        }
      }
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Si l'utilisateur fait partie d'une équipe, utiliser le plan du propriétaire
  if (user.team) {
    return getUserPermissions({
      role: user.role,
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      teamOwner: {
        plan: user.team.owner.plan,
        planExpiresAt: user.team.owner.planExpiresAt
      }
    })
  }

  // Sinon, utiliser son propre plan
  return getUserPermissions({
    role: user.role,
    plan: user.plan,
    planExpiresAt: user.planExpiresAt
  })
}

export async function checkTeamPermission(
  userId: string,
  feature: keyof import('@/lib/permissions').PlanLimits
): Promise<boolean> {
  const permissions = await getTeamAwareUserPermissions(userId)
  const { checkPermission } = await import('@/lib/permissions')
  return checkPermission(permissions, feature)
}

export async function checkTeamLimit(
  userId: string,
  limit: 'maxPages' | 'maxLinksPerPage' | 'maxFolders' | 'maxTeamMembers',
  currentCount: number
): Promise<boolean> {
  const permissions = await getTeamAwareUserPermissions(userId)
  const { checkLimit } = await import('@/lib/permissions')
  return checkLimit(permissions, limit, currentCount)
}