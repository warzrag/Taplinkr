import { cache } from 'react'
import { notFound, redirect } from 'next/navigation'

import PublicDirectRedirect from '@/components/PublicDirectRedirect'
import PublicLinkPreviewFinal from '@/components/PublicLinkPreviewFinal'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: { slug: string }
}

function toPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function isMetadataImage(src?: string | null) {
  return Boolean(src && !src.startsWith('data:'))
}

function publicUser(user: any) {
  if (!user) return null
  const { password, emailVerified, links, ...safeUser } = user
  return safeUser
}

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
      user: true,
    },
  })

  if (link) return attachMultiLinks(link)

  // Users expect /username to work. When no link slug matches, render the
  // first active public page owned by that username.
  const user = await prisma.user.findUnique({
    where: { username: slug },
  })

  if (!user) return null

  const userLinks = await prisma.link.findMany({
    where: { userId: user.id },
  })

  const activeLinks = [...userLinks]
    .filter((item: any) => item.isActive)
    .sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999))

  const preferredLink = activeLinks.find((item: any) => !item.isDirect) || activeLinks[0]
  return preferredLink ? attachMultiLinks({ ...preferredLink, user: publicUser(user) }) : null
})

export default async function LinkPage({ params }: PageProps) {
  const link = await getLinkData(params.slug)

  if (!link || !link.isActive) {
    notFound()
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

export async function generateMetadata({ params }: PageProps) {
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
