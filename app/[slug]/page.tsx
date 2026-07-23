import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import PublicDirectRedirect from '@/components/PublicDirectRedirect'
import PublicLinkPreviewFinal from '@/components/PublicLinkPreviewFinal'
import PublicPasswordGate from '@/components/PublicPasswordGate'
import {
  getDirectRedirectLocale,
  getExternalBrowserUrl,
  getInstagramExternalBrowserUrl,
  getMobilePlatform,
  isInAppBrowser,
  isInstagramInAppBrowser,
} from '@/lib/external-browser'
import { prisma } from '@/lib/prisma'
import { passwordCookieName, verifySignedToken } from '@/lib/signed-token'
import { normalizeHttpURL, validateURL } from '@/lib/url-validator'

interface PageProps {
  params: Promise<{ slug: string }>
}

function toPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function isMetadataImage(src?: string | null) {
  return Boolean(src && !src.startsWith('data:'))
}

const publicUserSelect = {
  id: true,
  name: true,
  username: true,
  image: true,
  bio: true,
} as const

async function attachMultiLinks(link: any) {
  const multiLinks = await prisma.multiLink.findMany({
    where: { parentLinkId: link.id },
  })

  return {
    ...link,
    multiLinks: [...multiLinks].sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999)),
  }
}

const getLinkData = cache(async (slug: string) => {
  const link = await prisma.link.findUnique({
    where: { slug },
    include: {
      user: { select: publicUserSelect },
      passwordProtection: { select: { hint: true } },
    },
  })

  if (link) return attachMultiLinks(link)

  // Users expect /username to work. When no link slug matches, render the
  // first active public page owned by that username.
  const user = await prisma.user.findUnique({
    where: { username: slug },
    select: publicUserSelect,
  })

  if (!user) return null

  const userLinks = await prisma.link.findMany({
    where: { userId: user.id },
  })

  const activeLinks = [...userLinks]
    .filter((item: any) => item.isActive)
    .sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999))

  const preferredLink = activeLinks.find((item: any) => !item.isDirect) || activeLinks[0]
  if (!preferredLink) return null
  const passwordProtection = await prisma.passwordProtection.findUnique({
    where: { linkId: preferredLink.id },
    select: { hint: true },
  })
  return attachMultiLinks({ ...preferredLink, user, passwordProtection })
})

export default async function LinkPage(props: PageProps) {
  const params = await props.params;
  const link = await getLinkData(params.slug)

  if (!link || !link.isActive) {
    notFound()
  }

  if (link.passwordProtection) {
    const token = (await cookies()).get(passwordCookieName(link.id))?.value
    if (!verifySignedToken(token, 'password-access', link.id)) {
      return <PublicPasswordGate linkId={link.id} title={link.title || 'Page protégée'} hint={link.passwordProtection.hint} />
    }
  }

  if (link.isDirect && link.directUrl) {
    if (link.shieldEnabled || link.isUltraLink) {
      redirect(`/shield/${link.slug}`)
    }

    const destination = normalizeHttpURL(link.directUrl)
    if (!validateURL(destination)) notFound()

    const requestHeaders = await headers()
    const userAgent = (requestHeaders.get('user-agent') || '').slice(0, 1000)

    try {
      const ip = (requestHeaders.get('x-forwarded-for')?.split(',')[0] || requestHeaders.get('x-real-ip') || 'unknown')
        .trim()
        .slice(0, 64)
      const recentClicks = await prisma.click.count({
        where: { linkId: link.id, ip, createdAt: { gte: new Date(Date.now() - 60_000) } },
      })

      if (recentClicks < 10) {
        await prisma.$transaction([
          prisma.click.create({
            data: {
              linkId: link.id,
              userId: link.userId,
              ip,
              userAgent,
              referer: (requestHeaders.get('referer') || 'direct').slice(0, 2000),
              country: requestHeaders.get('x-vercel-ip-country') || 'Unknown',
              device: /mobile/i.test(userAgent) ? 'mobile' : 'desktop',
            },
          }),
          prisma.link.update({
            where: { id: link.id },
            data: { clicks: { increment: 1 } },
          }),
        ])
      }
    } catch (error) {
      console.error('Erreur lors du suivi du lien direct:', error)
    }

    const referer = requestHeaders.get('referer') || ''
    if (isInAppBrowser(userAgent, referer)) {
      const isInstagram = isInstagramInAppBrowser(userAgent, referer)
      const forwardedHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
      const host = forwardedHost?.split(',')[0]?.trim() || 'www.taplinkr.com'
      const forwardedProto = requestHeaders.get('x-forwarded-proto')?.split(',')[0]?.trim()
      const protocol = forwardedProto === 'http' ? 'http' : 'https'
      const publicUrl = `${protocol}://${host}/${encodeURIComponent(params.slug)}`
      const externalBrowserUrl = isInstagram
        ? getInstagramExternalBrowserUrl(publicUrl)
        : getExternalBrowserUrl(publicUrl, getMobilePlatform(userAgent))
      const locale = getDirectRedirectLocale(
        requestHeaders.get('x-vercel-ip-country'),
        requestHeaders.get('accept-language'),
      )

      return (
        <PublicDirectRedirect
          destination={destination}
          externalBrowserUrl={externalBrowserUrl}
          locale={locale}
        />
      )
    }

    redirect(destination)
  }

  return <PublicLinkPreviewFinal link={toPlainObject(link)} />
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const link = await getLinkData(params.slug)

  if (!link) {
    return {
      title: 'Page non trouvée',
      description: "Cette page n'existe pas",
    }
  }

  if (link.isDirect) {
    return {
      title: 'TapLinkr Direct',
      description: 'Secure redirect powered by TapLinkr.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const owner = link.user?.name || link.user?.username || 'TapLinkr'
  const title = link.title || `${owner} - TapLinkr`
  const description = link.description || `Découvrez les liens de ${owner}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: isMetadataImage(link.coverImage) ? [link.coverImage] : [],
    },
  }
}

export const revalidate = 60
export const dynamic = 'force-dynamic'
