import { prisma } from './prisma'

export interface ScheduleConfig {
  startDate?: Date
  endDate?: Date
  timezone?: string
  isRecurring?: boolean
  recurrenceRule?: string
  actionOnStart?: 'activate' | 'redirect' | 'email'
  actionOnEnd?: 'deactivate' | 'archive' | 'email'
  notifyStart?: boolean
  notifyEnd?: boolean
}

export class LinkScheduler {
  async scheduleLink(linkId: string, userId: string, config: ScheduleConfig) {
    // Create or update schedule
    const schedule = await prisma.linkSchedule.upsert({
      where: { linkId },
      update: {
        ...config,
        timezone: config.timezone || 'UTC'
      },
      create: {
        linkId,
        userId,
        ...config,
        timezone: config.timezone || 'UTC'
      }
    })

    // Create scheduled jobs
    await this.createScheduledJobs(schedule.id, config)

    return schedule
  }

  async updateSchedule(scheduleId: string, updates: Partial<ScheduleConfig>) {
    const schedule = await prisma.linkSchedule.update({
      where: { id: scheduleId },
      data: updates
    })

    // Delete existing jobs and create new ones
    await prisma.scheduledJob.deleteMany({
      where: { scheduleId, executed: false }
    })

    await this.createScheduledJobs(scheduleId, {
      startDate: schedule.startDate || undefined,
      endDate: schedule.endDate || undefined,
      actionOnStart: schedule.actionOnStart || undefined,
      actionOnEnd: schedule.actionOnEnd || undefined,
      notifyStart: schedule.notifyStart,
      notifyEnd: schedule.notifyEnd,
      ...updates
    })

    return schedule
  }

  async cancelSchedule(scheduleId: string) {
    // Delete all pending jobs
    await prisma.scheduledJob.deleteMany({
      where: { scheduleId, executed: false }
    })

    // Delete schedule
    await prisma.linkSchedule.delete({
      where: { id: scheduleId }
    })
  }

  private async createScheduledJobs(scheduleId: string, config: ScheduleConfig) {
    const jobs = []

    // Start job
    if (config.startDate && config.actionOnStart) {
      jobs.push({
        scheduleId,
        jobType: config.actionOnStart,
        scheduledFor: config.startDate
      })
    }

    // Start notification
    if (config.startDate && config.notifyStart) {
      jobs.push({
        scheduleId,
        jobType: 'notify_start',
        scheduledFor: config.startDate
      })
    }

    // End job
    if (config.endDate && config.actionOnEnd) {
      jobs.push({
        scheduleId,
        jobType: config.actionOnEnd,
        scheduledFor: config.endDate
      })
    }

    // End notification
    if (config.endDate && config.notifyEnd) {
      jobs.push({
        scheduleId,
        jobType: 'notify_end',
        scheduledFor: config.endDate
      })
    }

    if (jobs.length > 0) {
      await prisma.scheduledJob.createMany({
        data: jobs
      })
    }
  }

  async processScheduledJobs() {
    const now = new Date()
    
    const pendingJobs = await prisma.scheduledJob.findMany({
      where: {
        scheduledFor: { lte: now },
        executed: false
      },
      include: {
        schedule: {
          include: {
            link: true,
            user: true
          }
        }
      }
    })

    for (const job of pendingJobs) {
      try {
        await this.executeJob(job)
        
        await prisma.scheduledJob.update({
          where: { id: job.id },
          data: {
            executed: true,
            executedAt: new Date()
          }
        })
      } catch (error) {
        await prisma.scheduledJob.update({
          where: { id: job.id },
          data: {
            executed: true,
            executedAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        })
      }
    }

    return pendingJobs.length
  }

  private async executeJob(job: any) {
    const { jobType, schedule } = job
    const { link, user } = schedule

    switch (jobType) {
      case 'activate':
        await prisma.link.update({
          where: { id: link.id },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        await prisma.link.update({
          where: { id: link.id },
          data: { isActive: false }
        })
        break

      case 'notify_start':
        await this.sendNotification(user.id, {
          type: 'schedule',
          title: 'Lien activé',
          message: `Votre lien "${link.title}" est maintenant actif selon la planification.`
        })
        break

      case 'notify_end':
        await this.sendNotification(user.id, {
          type: 'schedule',
          title: 'Lien désactivé',
          message: `Votre lien "${link.title}" a été désactivé selon la planification.`
        })
        break

      default:
        console.warn(`Unknown job type: ${jobType}`)
    }
  }

  private async sendNotification(userId: string, notification: {
    type: string
    title: string
    message: string
  }) {
    await prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message
      }
    })
  }

  async getSchedule(linkId: string) {
    return await prisma.linkSchedule.findUnique({
      where: { linkId },
      include: {
        scheduledJobs: {
          orderBy: { scheduledFor: 'asc' }
        }
      }
    })
  }

  async getUserSchedules(userId: string) {
    return await prisma.linkSchedule.findMany({
      where: { userId },
      include: {
        link: {
          select: {
            id: true,
            title: true,
            slug: true,
            isActive: true
          }
        },
        scheduledJobs: {
          where: { executed: false },
          orderBy: { scheduledFor: 'asc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }
}

export const linkScheduler = new LinkScheduler()