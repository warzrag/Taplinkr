'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

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

  // Afficher le loader pendant le chargement ou si pas encore de session
  if (status === 'loading' || (status === 'unauthenticated' && !shouldRedirect)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-brand-500" />
          <div className="text-gray-600 dark:text-gray-400">Chargement...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>
}