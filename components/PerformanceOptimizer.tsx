'use client'

import { useEffect } from 'react'
import { initPerformanceOptimizations } from '@/lib/performance/init-performance'
import { useRouter } from 'next/navigation'

export default function PerformanceOptimizer() {
  const router = useRouter()

  useEffect(() => {
    // Initialiser les optimisations au montage
    initPerformanceOptimizations()

    // Précharger les routes principales après le chargement initial
    const prefetchRoutes = () => {
      const routes = ['/dashboard', '/dashboard/links', '/dashboard/analytics', '/settings']
      routes.forEach(route => {
        router.prefetch(route)
      })
    }

    // Attendre que la page soit chargée avant de précharger
    if (document.readyState === 'complete') {
      prefetchRoutes()
    } else {
      window.addEventListener('load', prefetchRoutes)
    }

    // Ajouter un indicateur de navigation global
    const originalPush = router.push
    router.push = function(...args) {
      document.body.classList.add('navigating')
      const result = originalPush.apply(this, args)

      // Retirer la classe après la navigation
      if (result && typeof result.then === 'function') {
        result.then(() => {
          setTimeout(() => {
            document.body.classList.remove('navigating')
          }, 100)
        })
      }

      return result
    }

    // Cleanup
    return () => {
      window.removeEventListener('load', prefetchRoutes)
    }
  }, [router])

  // Ce composant ne rend rien visuellement
  return null
}