import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PublicLinkPreviewFinal from '@/components/PublicLinkPreviewFinal'

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

  return <PublicLinkPreviewFinal link={link} />
}