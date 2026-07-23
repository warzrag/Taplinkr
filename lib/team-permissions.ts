import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions, type UserPermissions } from '@/lib/permissions'
import {
  hasTeamActionPermission,
  TeamAction,
  TeamRole,
} from '@/lib/team-roles'
import { NextResponse } from 'next/server'

export { TeamAction, TeamRole } from '@/lib/team-roles'

export async function checkTeamPermissionAction(
  userId: string,
  teamId: string,
  action: TeamAction
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true, teamRole: true }
    })

    if (!user || user.teamId !== teamId) {
      return false
    }

    return hasTeamActionPermission(user.teamRole || TeamRole.VIEWER, action)
  } catch (error) {
    console.error('Erreur vérification permission:', error)
    return false
  }
}

export async function requireTeamPermission(
  action: TeamAction,
  teamId?: string
): Promise<{ authorized: boolean; userId?: string; teamId?: string; error?: NextResponse }> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return {
        authorized: false,
        error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true, teamRole: true }
    })

    if (!user?.teamId) {
      return {
        authorized: false,
        error: NextResponse.json({ error: 'Pas d\'équipe' }, { status: 404 })
      }
    }

    const effectiveTeamId = teamId || user.teamId
    const hasPermission = await checkTeamPermissionAction(session.user.id, effectiveTeamId, action)

    if (!hasPermission) {
      return {
        authorized: false,
        error: NextResponse.json({ error: 'Permission refusée' }, { status: 403 })
      }
    }

    return {
      authorized: true,
      userId: session.user.id,
      teamId: effectiveTeamId
    }
  } catch (error) {
    console.error('Erreur middleware permission:', error)
    return {
      authorized: false,
      error: NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
  }
}

// Fonction pour logger les actions dans l'audit trail
export async function logTeamAction(
  teamId: string,
  userId: string,
  action: string,
  linkId?: string,
  details?: any,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info',
  request?: Request
) {
  try {
    const ipAddress = request?.headers.get('x-forwarded-for') ||
                      request?.headers.get('x-real-ip') ||
                      'unknown'
    const userAgent = request?.headers.get('user-agent') || 'unknown'

    await prisma.teamAuditLog.create({
      data: {
        teamId,
        userId,
        linkId,
        action,
        details: details || undefined,
        ipAddress,
        userAgent,
        severity
      }
    })
  } catch (error) {
    console.error('Erreur log audit:', error)
  }
}

// Fonction pour enregistrer l'historique des modifications
export async function recordLinkHistory(
  linkId: string,
  teamId: string,
  userId: string,
  action: 'create' | 'update' | 'delete' | 'share' | 'unshare',
  changes?: any,
  metadata?: any
) {
  try {
    await prisma.teamLinkHistory.create({
      data: {
        linkId,
        teamId,
        userId,
        action,
        changes: changes || undefined,
        metadata: metadata || undefined
      }
    })
  } catch (error) {
    console.error('Erreur historique lien:', error)
  }
}

// Fonctions existantes mises à jour
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
  if (user.team?.owner) {
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

  // Si l'équipe est absente ou incomplète, le plan personnel reste
  // la source de vérité de repli et l'action ne provoque pas d'erreur 500.
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
  limit: 'maxPages' | 'maxLinksPerPage' | 'maxMultiLinks' | 'maxFolders' | 'maxTeamMembers',
  currentCount: number
): Promise<boolean> {
  const permissions = await getTeamAwareUserPermissions(userId)
  const { checkLimit } = await import('@/lib/permissions')
  return checkLimit(permissions, limit, currentCount)
}
