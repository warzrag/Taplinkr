import { prisma } from '@/lib/prisma'
import { STRIPE_PLANS } from '@/lib/stripe'

export async function checkUsageLimits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      planType: true,
      monthlyClicks: true,
      monthlyClicksLimit: true,
      linksCount: true,
      linksLimit: true,
    }
  })

  if (!user) {
    throw new Error('Utilisateur introuvable')
  }

  const plan = STRIPE_PLANS[user.planType]
  
  return {
    canCreateLink: user.linksCount < user.linksLimit || user.linksLimit === -1,
    canReceiveClicks: user.monthlyClicks < user.monthlyClicksLimit || user.monthlyClicksLimit === -1,
    usage: {
      links: {
        current: user.linksCount,
        limit: user.linksLimit,
        percentage: user.linksLimit === -1 ? 0 : Math.round((user.linksCount / user.linksLimit) * 100)
      },
      clicks: {
        current: user.monthlyClicks,
        limit: user.monthlyClicksLimit,
        percentage: user.monthlyClicksLimit === -1 ? 0 : Math.round((user.monthlyClicks / user.monthlyClicksLimit) * 100)
      }
    },
    plan: {
      name: plan.name,
      type: user.planType,
      features: plan.features
    }
  }
}

export async function incrementLinkCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      linksCount: {
        increment: 1
      }
    }
  })
}

export async function decrementLinkCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      linksCount: {
        decrement: 1
      }
    }
  })
}

export async function incrementClickCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyClicks: {
        increment: 1
      }
    }
  })
}

export async function resetMonthlyUsage() {
  // Fonction à appeler mensuellement (via cron job)
  await prisma.user.updateMany({
    data: {
      monthlyClicks: 0
    }
  })
}

export function formatUsageText(current: number, limit: number): string {
  if (limit === -1) {
    return `${current.toLocaleString()} / Illimité`
  }
  return `${current.toLocaleString()} / ${limit.toLocaleString()}`
}

export function getUsageColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-600'
  if (percentage >= 75) return 'text-orange-600'
  if (percentage >= 50) return 'text-yellow-600'
  return 'text-green-600'
}

export function getUsageBgColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 75) return 'bg-orange-500'
  if (percentage >= 50) return 'bg-yellow-500'
  return 'bg-green-500'
}