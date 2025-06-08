import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PublicLinkPreview from '@/components/PublicLinkPreview'

interface PageProps {
  params: { slug: string }
}

export default async function LinkPage({ params }: PageProps) {
  const link = await prisma.link.findUnique({
    where: { slug: params.slug },
    include: {
      user: true,
      multiLinks: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!link || !link.isActive) {
    notFound()
  }

  return <PublicLinkPreview link={link} />
}