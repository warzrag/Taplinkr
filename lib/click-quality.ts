import { createHash } from 'crypto'

import { prisma } from './prisma'
import {
  anonymizeVisitor,
  classifyClickHeaders,
  type ClickFilterReason,
  type ClickHeaderReader,
} from './click-quality-core'

export {
  anonymizeVisitor,
  classifyClickHeaders,
  type ClickFilterReason,
} from './click-quality-core'

export interface ClickAssessment {
  counted: boolean
  reason: ClickFilterReason | null
  visitorHash: string
  rawIp: string
  userAgent: string
  referer: string
}

export async function assessClickRequest(input: {
  request: { headers: ClickHeaderReader }
  linkId: string
  multiLinkId?: string | null
  sessionId?: string | null
}): Promise<ClickAssessment> {
  const { request, linkId, multiLinkId, sessionId } = input
  const rawIp = (
    request.headers.get('x-forwarded-for')?.split(',')[0]
    || request.headers.get('x-real-ip')
    || 'unknown'
  ).trim().slice(0, 128)
  const visitorHash = anonymizeVisitor(rawIp, request.headers)
  const userAgent = (request.headers.get('user-agent') || '').slice(0, 1000)
  const referer = (request.headers.get('referer') || 'direct').slice(0, 2000)
  const headerReason = classifyClickHeaders(request.headers)

  if (headerReason) {
    return { counted: false, reason: headerReason, visitorHash, rawIp, userAgent, referer }
  }

  const now = Date.now()
  const visitorClicks = await prisma.click.findMany({
    where: { ip: visitorHash },
    select: {
      linkId: true,
      multiLinkId: true,
      sessionId: true,
      createdAt: true,
    },
  })
  const recentTargetClicks = visitorClicks.filter(click =>
    click.linkId === linkId
    && new Date(click.createdAt).getTime() >= now - 20_000
  )

  const duplicate = multiLinkId
    ? recentTargetClicks.some(click =>
        click.multiLinkId === multiLinkId
        || Boolean(sessionId && click.sessionId === sessionId)
      )
    : recentTargetClicks.some(click => !click.multiLinkId)

  if (duplicate) {
    return { counted: false, reason: 'duplicate', visitorHash, rawIp, userAgent, referer }
  }

  const recentVisitorClicks = visitorClicks.filter(click =>
    new Date(click.createdAt).getTime() >= now - 60_000
  ).length

  if (recentVisitorClicks >= 12) {
    return { counted: false, reason: 'burst', visitorHash, rawIp, userAgent, referer }
  }

  return { counted: true, reason: null, visitorHash, rawIp, userAgent, referer }
}

export async function recordFilteredClick(input: {
  linkId: string
  userId: string
  assessment: ClickAssessment
  multiLinkId?: string | null
}) {
  if (!input.assessment.reason) return

  const minuteBucket = Math.floor(Date.now() / 60_000)
  const id = createHash('sha256')
    .update([
      input.linkId,
      input.multiLinkId || '',
      input.assessment.visitorHash,
      input.assessment.reason,
      minuteBucket,
    ].join('|'))
    .digest('hex')

  try {
    await prisma.filteredClick.create({
      data: {
        id,
        linkId: input.linkId,
        userId: input.userId,
        multiLinkId: input.multiLinkId || null,
        visitorHash: input.assessment.visitorHash,
        reason: input.assessment.reason,
        userAgent: input.assessment.userAgent,
        referer: input.assessment.referer,
      },
    })
  } catch (error) {
    // Tracking quality must never prevent a visitor from opening the link.
    console.error('Unable to record a filtered click:', error)
  }
}
