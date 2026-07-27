import { NextRequest, NextResponse } from 'next/server'

import { assessClickRequest, recordFilteredClick } from '@/lib/click-quality'
import { buildClickMetadata } from '@/lib/click-metadata'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { multiLinkId, sessionId, screenResolution, language, timezone } = body

    if (typeof multiLinkId !== 'string' || !multiLinkId) {
      return NextResponse.json({ error: 'multiLinkId is required' }, { status: 400 })
    }

    const multiLink = await prisma.multiLink.findUnique({
      where: { id: multiLinkId },
      include: { parentLink: true },
    })
    if (!multiLink?.parentLink?.isActive) {
      return NextResponse.json({ error: 'MultiLink not found' }, { status: 404 })
    }

    const assessment = await assessClickRequest({
      request,
      linkId: multiLink.parentLinkId,
      multiLinkId,
      sessionId: typeof sessionId === 'string' ? sessionId : null,
    })

    if (!assessment.counted) {
      await recordFilteredClick({
        linkId: multiLink.parentLinkId,
        userId: multiLink.parentLink.userId,
        multiLinkId,
        assessment,
      })
      return NextResponse.json({
        success: true,
        counted: false,
        reason: assessment.reason,
      })
    }

    const clickMetadata = await buildClickMetadata({
      assessment,
      headers: request.headers,
      client: { sessionId, screenResolution, language, timezone },
    })

    await prisma.$transaction([
      prisma.click.create({
        data: {
          linkId: multiLink.parentLinkId,
          userId: multiLink.parentLink.userId,
          folderIdAtClick: multiLink.parentLink.folderId,
          multiLinkId,
          ...clickMetadata,
        },
      }),
      prisma.multiLink.update({
        where: { id: multiLinkId },
        data: { clicks: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ success: true, counted: true })
  } catch (error) {
    console.error('Erreur lors de l’enregistrement du clic MultiLink:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
