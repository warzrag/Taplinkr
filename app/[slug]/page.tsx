import { cache } from 'react'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import PublicDirectRedirect from '@/components/PublicDirectRedirect'
import PublicLinkPreviewFinal from '@/components/PublicLinkPreviewFinal'
import PublicPasswordGate from '@/components/PublicPasswordGate'
import { prisma } from '@/lib/prisma'
import { passwordCookieName, verifySignedToken } from '@/lib/signed-token'

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

    return (
      <PublicDirectRedirect
        linkId={link.id}
        title={link.title || 'Lien TapLinkr'}
        url={link.directUrl}
      />
    )
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
