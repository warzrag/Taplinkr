'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function usePreload() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session?.user?.id) return

    // Pré-charger les routes importantes
    const criticalRoutes = [
      '/dashboard',
      '/dashboard/links',
      '/settings'
    ]

    // Utiliser l'API Intersection Observer pour précharger intelligemment
    const preloadLink = (href: string) => {
      router.prefetch(href)
    }

    // Précharger les routes critiques immédiatement
    criticalRoutes.forEach(route => {
      preloadLink(route)
    })

    // Précharger les données utilisateur
    const preloadUserData = async () => {
      try {
        // Précharger les liens (sera mis en cache)
        await fetch('/api/links/fast', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          priority: 'low' as any
        })

        // Précharger les analytics
        await fetch('/api/analytics/dashboard-simple', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          priority: 'low' as any
        })
      } catch (error) {
        // Silencieux - c'est juste du préchargement
      }
    }

    // Attendre que la page soit idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        preloadUserData()
      })
    } else {
      // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
      setTimeout(preloadUserData, 1000)
    }

    // Observer les liens pour précharger au hover
    const links = document.querySelectorAll('a[href^="/"]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement
          const href = link.getAttribute('href')
          if (href) {
            router.prefetch(href)
          }
        }
      })
    }, { rootMargin: '50px' })

    links.forEach(link => observer.observe(link))

    return () => {
      links.forEach(link => observer.unobserve(link))
    }
  }, [session, router])
}

// Hook pour précharger au hover
export function useHoverPreload(href: string) {
  const router = useRouter()

  return {
    onMouseEnter: () => {
      router.prefetch(href)
    }
  }
}