import { cookies, headers } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { notFound, redirect } from 'next/navigation'

import PublicDirectRedirect from '@/components/PublicDirectRedirect'
import PublicLinkPreviewFinal from '@/components/PublicLinkPreviewFinal'
import PublicPasswordGate from '@/components/PublicPasswordGate'
import {
  getExternalBrowserTarget,
} from '@/lib/external-browser'
import { prisma } from '@/lib/prisma'
import {
  PUBLIC_LINK_CACHE_SECONDS,
  PUBLIC_LINK_CACHE_TAG,
} from '@/lib/public-link-cache'
import { passwordCookieName, verifySignedToken } from '@/lib/signed-token'
import { normalizeHttpURL, validateURL } from '@/lib/url-validator'
import { parseLandingSettings } from '@/lib/landing-settings'

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

async function hydrateLandingPage(link: any, knownUser?: any) {
  const [user, passwordProtection, multiLinks] = await Promise.all([
    knownUser
      ? Promise.resolve(knownUser)
      : prisma.user.findUnique({
          where: { id: link.userId },
          select: publicUserSelect,
        }),
    prisma.passwordProtection.findUnique({
      where: { linkId: link.id },
      select: { hint: true },
    }),
    prisma.multiLink.findMany({
      where: { parentLinkId: link.id },
    }),
  ])

  return {
    ...link,
    user,
    passwordProtection,
    multiLinks: [...multiLinks].sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999)),
  }
}

const getLinkData = unstable_cache(async (slug: string) => {
  const link = await prisma.link.findUnique({
    where: { slug },
  })

  if (link) {
    // Direct links only need the destination and optional password gate.
    // Avoid hydrating the owner and child links on the critical redirect path.
    if (link.isDirect) {
      const passwordProtection = await prisma.passwordProtection.findUnique({
        where: { linkId: link.id },
        select: { hint: true },
      })
      return toPlainObject({ ...link, passwordProtection, multiLinks: [] })
    }
    return toPlainObject(await hydrateLandingPage(link))
  }

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
  return toPlainObject(await hydrateLandingPage(preferredLink, user))
}, ['public-link-by-slug-v2'], {
  revalidate: PUBLIC_LINK_CACHE_SECONDS,
  tags: [PUBLIC_LINK_CACHE_TAG],
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
      return <PublicPasswordGate linkId={link.id} title={link.title || 'Protected page'} hint={link.passwordProtection.hint} />
    }
  }

  if (link.isDirect && link.directUrl) {
    const destination = normalizeHttpURL(link.directUrl)
    if (!validateURL(destination)) notFound()

    const requestHeaders = await headers()
    const userAgent = (requestHeaders.get('user-agent') || '').slice(0, 1000)
    const referer = requestHeaders.get('referer') || ''
    const forwardedHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
    const host = forwardedHost?.split(',')[0]?.trim() || 'www.taplinkr.com'
    const forwardedProto = requestHeaders.get('x-forwarded-proto')?.split(',')[0]?.trim()
    const protocol = forwardedProto === 'http' ? 'http' : 'https'
    const normalizedHost = host.toLowerCase().replace(/:\d+$/, '')
    const isPlatformHost = normalizedHost === 'taplinkr.com' ||
      normalizedHost === 'www.taplinkr.com' ||
      normalizedHost === 'localhost' ||
      normalizedHost === '127.0.0.1' ||
      normalizedHost.endsWith('.vercel.app')
    const publicUrl = `${protocol}://${host}${isPlatformHost ? `/${encodeURIComponent(params.slug)}` : '/'}`
    const externalBrowserUrl = getExternalBrowserTarget({
      currentUrl: publicUrl,
      userAgent,
      referer,
    })

    if (link.shieldEnabled || link.isUltraLink) {
      // Preserve the native-browser handoff before entering Shield. Once Safari
      // or the Android browser reloads the public URL, this request is no
      // longer in-app and can safely continue to the Shield verification page.
      if (externalBrowserUrl) {
        return (
          <PublicDirectRedirect
            linkId={link.id}
            destination={`/shield/${encodeURIComponent(link.slug)}`}
            externalBrowserUrl={externalBrowserUrl}
          />
        )
      }
      redirect(`/shield/${link.slug}`)
    }

    // Always serve a real TapLinkr page before navigating. This keeps TapLinkr's
    // neutral title and favicon attached to the shared URL instead of letting
    // browsers associate the destination's branding with it.
    return (
      <PublicDirectRedirect
        linkId={link.id}
        destination={destination}
        externalBrowserUrl={externalBrowserUrl}
      />
    )
  }

  const landingSettings = parseLandingSettings(link.shieldConfig)
  const requestHeaders = await headers()
  const country = (requestHeaders.get('x-vercel-ip-country') || '').toUpperCase()
  let city = requestHeaders.get('x-vercel-ip-city') || ''
  try { city = decodeURIComponent(city) } catch {}

  const redirectRule = landingSettings.geoRedirects.find(rule => !rule.countries.length || rule.countries.includes(country))
  if (redirectRule?.url && validateURL(redirectRule.url)) redirect(redirectRule.url)

  if (landingSettings.geoFilter.enabled && landingSettings.geoFilter.countries.length) {
    const listed = landingSettings.geoFilter.countries.includes(country)
    const blocked = landingSettings.geoFilter.mode === 'allow' ? !listed : listed
    if (blocked) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#070a12] px-5 text-center text-white">
          <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl">
            <h1 className="text-2xl font-black">This page is not available in your country</h1>
            <p className="mt-3 text-sm leading-6 text-white/55">The page owner has limited access by geographic region.</p>
          </div>
        </main>
      )
    }
  }

  if (landingSettings.inAppBrowserWarning) {
    const userAgent = (requestHeaders.get('user-agent') || '').slice(0, 1000)
    const referer = requestHeaders.get('referer') || ''
    const forwardedHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || 'www.taplinkr.com'
    const forwardedProto = requestHeaders.get('x-forwarded-proto')?.split(',')[0]?.trim()
    const protocol = forwardedProto === 'http' ? 'http' : 'https'
    const publicUrl = `${protocol}://${forwardedHost}/${encodeURIComponent(params.slug)}`
    const externalBrowserUrl = getExternalBrowserTarget({ currentUrl: publicUrl, userAgent, referer })
    if (externalBrowserUrl) {
      return <PublicDirectRedirect linkId={link.id} destination={publicUrl} externalBrowserUrl={externalBrowserUrl} trackClick={false} />
    }
  }

  return <PublicLinkPreviewFinal link={toPlainObject({ ...link, _visitorCountry: country, _visitorCity: city })} />
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const link = await getLinkData(params.slug)

  if (!link) {
    return {
      title: 'Page not found',
      description: 'This page does not exist',
    }
  }

  if (link.isDirect) {
    return {
      title: 'TapLinkr — Opening link',
      description: 'A secure link powered by TapLinkr.',
      robots: {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
      },
      openGraph: {
        title: 'TapLinkr',
        description: 'A secure link powered by TapLinkr.',
        url: `/${encodeURIComponent(params.slug)}`,
        siteName: 'TapLinkr',
        type: 'website',
        images: ['/final.png'],
      },
      twitter: {
        card: 'summary',
        title: 'TapLinkr',
        description: 'A secure link powered by TapLinkr.',
        images: ['/final.png'],
      },
    }
  }

  const owner = link.user?.name || link.user?.username || 'TapLinkr'
  const title = link.title || `${owner} - TapLinkr`
  const description = link.description || `Explore ${owner}'s links`

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
