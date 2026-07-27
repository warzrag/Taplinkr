import { NextRequest, NextResponse } from 'next/server'

import { assessClickRequest, recordFilteredClick } from '@/lib/click-quality'
import { buildClickMetadata } from '@/lib/click-metadata'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { linkId, multiLinkId } = await request.json()

    if (typeof linkId !== 'string' || !linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { userId: true, folderId: true, isActive: true },
    })
    if (!link?.isActive) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    if (multiLinkId) {
      const child = await prisma.multiLink.findFirst({
        where: { id: multiLinkId, parentLinkId: linkId },
      })
      if (!child) {
        return NextResponse.json({ error: 'Invalid sub-link' }, { status: 400 })
      }
    }

    const assessment = await assessClickRequest({ request, linkId, multiLinkId })
    if (!assessment.counted) {
      await recordFilteredClick({
        linkId,
        userId: link.userId,
        multiLinkId,
        assessment,
      })
      return NextResponse.json({ success: true, counted: false, reason: assessment.reason })
    }

    const clickMetadata = await buildClickMetadata({
      assessment,
      headers: request.headers,
    })
    await prisma.click.create({
      data: {
        linkId,
        userId: link.userId,
        folderIdAtClick: link.folderId,
        multiLinkId: multiLinkId || null,
        ...clickMetadata,
      },
    })

    if (multiLinkId) {
      await prisma.multiLink.update({
        where: { id: multiLinkId },
        data: { clicks: { increment: 1 } },
      })
    }

    await prisma.link.update({
      where: { id: linkId },
      data: { clicks: { increment: 1 } },
    })

    return NextResponse.json({ success: true, counted: true })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}
