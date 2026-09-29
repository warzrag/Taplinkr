'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { ShellSkeleton } from '@/components/dashboard/DashboardSkeleton'

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // Attendre que le status soit définitif avant de rediriger
    // Cela évite la redirection pendant le chargement initial après login
    if (status === 'unauthenticated') {
      // Petit délai pour laisser le temps à la session de se charger
      const timer = setTimeout(() => {
        // Vérifier à nouveau après le délai
        if (status === 'unauthenticated') {
          setShouldRedirect(true)
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [status])

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/auth/signin')
    }
  }, [shouldRedirect, router])

  // Pendant le chargement : la silhouette de l'espace membre, qui scintille,
  // plutot qu'un rond qui tourne sur un ecran vide.
  if (status === 'loading' || (status === 'unauthenticated' && !shouldRedirect)) {
    return <ShellSkeleton />
  }

  if (!session) {
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
