import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PublicProfile from '@/components/PublicProfile'

interface PageProps {
  params: { username: string }
}

async function getUserWithLinks(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    })
    return user
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return null
  }
}

export default async function UserProfile({ params }: PageProps) {
  const user = await getUserWithLinks(params.username)

  if (!user) {
    notFound()
  }

  return <PublicProfile user={user} />
}

export async function generateMetadata({ params }: PageProps) {
  const user = await getUserWithLinks(params.username)

  if (!user) {
    return {
      title: 'Profil non trouvé'
    }
  }

  return {
    title: `${user.name || user.username} - GetAllMyLinks`,
    description: `Découvrez tous les liens de ${user.name || user.username} sur GetAllMyLinks`,
    openGraph: {
      title: `${user.name || user.username} - GetAllMyLinks`,
      description: `Découvrez tous les liens de ${user.name || user.username} sur GetAllMyLinks`,
      type: 'profile',
    }
  }
}