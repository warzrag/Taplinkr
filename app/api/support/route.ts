import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/resend-email'
import { checkRateLimit } from '@/lib/rate-limit'

const SUPPORT_CATEGORIES = new Set(['general', 'technical', 'billing', 'feature', 'other'])

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimit = checkRateLimit(`support:${session.user.id}`, {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000,
    message: 'You have sent too many support requests. Please try again later.',
  })
  if (!rateLimit.success) {
    return NextResponse.json({ error: rateLimit.message }, { status: 429 })
  }

  try {
    const body = await request.json()
    const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const category = typeof body.category === 'string' ? body.category : 'general'

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 })
    }
    if (subject.length > 160 || message.length > 10_000) {
      return NextResponse.json({ error: 'Your support request is too long.' }, { status: 400 })
    }
    if (!SUPPORT_CATEGORIES.has(category)) {
      return NextResponse.json({ error: 'Invalid support category.' }, { status: 400 })
    }

    const delivery = await sendEmail({
      to: process.env.SUPPORT_EMAIL || 'hello@taplinkr.com',
      replyTo: session.user.email,
      subject: `[TapLinkr ${category}] ${subject}`,
      html: `
        <h2>TapLinkr support request</h2>
        <p><strong>From:</strong> ${escapeHtml(session.user.name || 'TapLinkr user')} (${escapeHtml(session.user.email)})</p>
        <p><strong>Account ID:</strong> ${escapeHtml(session.user.id)}</p>
        <p><strong>Category:</strong> ${escapeHtml(category)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      `,
    })

    if (!delivery.success) {
      return NextResponse.json({ error: 'Unable to send your message right now.' }, { status: 503 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Support request failed:', error)
    return NextResponse.json({ error: 'Unable to send your message right now.' }, { status: 500 })
  }
}
