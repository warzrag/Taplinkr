'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function usePrefetch() {
  const router = useRouter()

  useEffect(() => {
    // Précharger les routes communes
    const routes = [
      '/dashboard',
      '/dashboard/links',
      '/settings',
    ]

    routes.forEach(route => {
      router.prefetch(route)
    })

    // Précharger l'API des liens
    fetch('/api/links/fast', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {})

  }, [router])
}