import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  requireTeamPermission,
  TeamAction
} from '@/lib/team-permissions'

// GET: Récupérer les logs d'audit de l'équipe
export async function GET(request: Request) {
  try {
    const { authorized, userId, teamId, error } = await requireTeamPermission(TeamAction.VIEW_SETTINGS)
    if (!authorized) return error

    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity') || undefined
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Construire les filtres
    const where: any = {
      teamId: teamId
    }

    if (severity) {
      where.severity = severity
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Récupérer les logs
    const [logs, total] = await Promise.all([
      prisma.teamAuditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          link: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.teamAuditLog.count({ where })
    ])

    // Statistiques par gravité
    const stats = await prisma.teamAuditLog.groupBy({
      by: ['severity'],
      where: {
        teamId: teamId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
        }
      },
      _count: {
        severity: true
      }
    })

    const severityStats = stats.reduce((acc, stat) => {
      acc[stat.severity] = stat._count.severity
      return acc
    }, {} as Record<string, number>)

    // Actions les plus fréquentes
    const topActions = await prisma.teamAuditLog.groupBy({
      by: ['action'],
      where: {
        teamId: teamId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      },
      take: 10
    })

    return NextResponse.json({
      logs,
      total,
      stats: {
        severityDistribution: severityStats,
        topActions: topActions.map(action => ({
          action: action.action,
          count: action._count.action
        })),
        totalLogs: total,
        periodDays: 30
      },
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Erreur récupération audit logs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des logs' },
      { status: 500 }
    )
  }
}

// POST: Créer une entrée d'audit manuelle (pour les actions critiques)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const {
      action,
      details,
      severity = 'info',
      linkId
    } = await request.json()

    if (!action) {
      return NextResponse.json(
        { error: 'Action requise' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true }
    })

    if (!user?.teamId) {
      return NextResponse.json(
        { error: 'Pas d\'équipe' },
        { status: 404 }
      )
    }

    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const log = await prisma.teamAuditLog.create({
      data: {
        teamId: user.teamId,
        userId: session.user.id,
        linkId,
        action,
        details: details || undefined,
        severity,
        ipAddress,
        userAgent
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Si c'est une action critique, notifier les admins
    if (severity === 'critical' || severity === 'error') {
      const admins = await prisma.user.findMany({
        where: {
          teamId: user.teamId,
          teamRole: {
            in: ['owner', 'admin']
          }
        },
        select: { id: true }
      })

      await Promise.all(
        admins.map(admin =>
          prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'critical_action',
              title: `Action critique: ${action}`,
              message: `${log.user.name || log.user.email} a effectué une action critique`,
              data: JSON.stringify({ logId: log.id, action, severity })
            }
          })
        )
      )
    }

    return NextResponse.json({
      message: 'Log créé avec succès',
      log
    })
  } catch (error) {
    console.error('Erreur création audit log:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du log' },
      { status: 500 }
    )
  }
}

// DELETE: Supprimer les anciens logs (admin seulement)
export async function DELETE(request: Request) {
  try {
    const { authorized, teamId, error } = await requireTeamPermission(TeamAction.DELETE_TEAM)
    if (!authorized) return error

    const { searchParams } = new URL(request.url)
    const daysToKeep = parseInt(searchParams.get('daysToKeep') || '90')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await prisma.teamAuditLog.deleteMany({
      where: {
        teamId: teamId,
        createdAt: {
          lt: cutoffDate
        },
        severity: {
          notIn: ['critical', 'error'] // Garder les logs critiques
        }
      }
    })

    return NextResponse.json({
      message: `${result.count} logs supprimés`,
      deletedCount: result.count,
      cutoffDate
    })
  } catch (error) {
    console.error('Erreur suppression logs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des logs' },
      { status: 500 }
    )
  }
}