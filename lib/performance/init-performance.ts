// Script d'initialisation des optimisations de performance
// À importer dans le layout principal de l'application

export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return

  // 1. Préchargement des routes critiques
  const criticalRoutes = [
    '/dashboard',
    '/dashboard/links',
    '/dashboard/analytics',
    '/settings'
  ]

  // Utiliser requestIdleCallback pour ne pas bloquer le thread principal
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      criticalRoutes.forEach(route => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = route
        link.as = 'document'
        document.head.appendChild(link)
      })
    })
  }

  // 2. Service Worker pour le cache offline (si supporté)
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service Worker registration failed')
    })
  }

  // 3. Lazy loading des images avec Intersection Observer
  const lazyLoadImages = () => {
    const images = document.querySelectorAll('img[data-src]')

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = img.dataset.src!
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)

            // Ajouter une classe pour l'animation de fade-in
            img.classList.add('fade-in')
          }
        })
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      })

      images.forEach(img => imageObserver.observe(img))
    } else {
      // Fallback pour les anciens navigateurs
      images.forEach(img => {
        const imgElement = img as HTMLImageElement
        imgElement.src = imgElement.dataset.src!
      })
    }
  }

  // 4. Optimisation de la navigation avec prefetch au survol
  const optimizeNavigation = () => {
    let prefetchedUrls = new Set<string>()

    document.addEventListener('mouseover', (e) => {
      const link = (e.target as HTMLElement).closest('a')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href || !href.startsWith('/') || prefetchedUrls.has(href)) return

      // Prefetch après un court délai pour éviter les survols accidentels
      const timeoutId = setTimeout(() => {
        const prefetchLink = document.createElement('link')
        prefetchLink.rel = 'prefetch'
        prefetchLink.href = href
        document.head.appendChild(prefetchLink)
        prefetchedUrls.add(href)
      }, 100)

      // Annuler si la souris quitte le lien rapidement
      link.addEventListener('mouseleave', () => {
        clearTimeout(timeoutId)
      }, { once: true })
    }, { passive: true })
  }

  // 5. Optimisation du scroll pour les listes longues
  const optimizeScroll = () => {
    let ticking = false

    function updateScroll() {
      // Ajouter les optimisations de scroll ici
      ticking = false
    }

    document.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll)
        ticking = true
      }
    }, { passive: true })
  }

  // 6. Détection de la connexion lente
  const detectSlowConnection = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection

      if (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        document.documentElement.classList.add('save-data')
        // Désactiver les animations et images non essentielles
        console.log('🐢 Mode économie de données activé')
      }

      // Écouter les changements de connexion
      connection.addEventListener('change', detectSlowConnection)
    }
  }

  // 7. Optimisation de la mémoire - nettoyer les event listeners non utilisés
  const cleanupListeners = () => {
    // Nettoyer automatiquement après 30 minutes d'inactivité
    let inactivityTimer: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        console.log('🧹 Nettoyage mémoire après inactivité')
        // Déclencher un garbage collection si possible
        if ('gc' in window) {
          (window as any).gc()
        }
      }, 1800000) // 30 minutes
    }

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true })
    })
  }

  // 8. Préchargement des fonts critiques
  const preloadFonts = () => {
    const fonts = [
      { family: 'Inter', weight: '400' },
      { family: 'Inter', weight: '500' },
      { family: 'Inter', weight: '600' },
      { family: 'Space Grotesk', weight: '500' }
    ]

    fonts.forEach(({ family, weight }) => {
      const font = new FontFace(
        family,
        `url(/fonts/${family.replace(' ', '')}-${weight}.woff2)`,
        { weight }
      )

      font.load().catch(() => {
        console.log(`Font ${family} ${weight} failed to load`)
      })
    })
  }

  // 9. Mesure et rapport de performance
  const measurePerformance = () => {
    if ('PerformanceObserver' in window) {
      // Observer les Core Web Vitals
      try {
        const po = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            // Log ou envoyer les métriques à un service d'analytics
            console.log(`⚡ ${entry.name}: ${Math.round(entry.value)}ms`)
          }
        })

        po.observe({ type: 'largest-contentful-paint', buffered: true })
        po.observe({ type: 'first-input', buffered: true })
        po.observe({ type: 'layout-shift', buffered: true })
      } catch (e) {
        // PerformanceObserver non supporté pour ce type
      }
    }
  }

  // 10. Initialiser toutes les optimisations
  document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages()
    optimizeNavigation()
    optimizeScroll()
    detectSlowConnection()
    cleanupListeners()
    preloadFonts()
    measurePerformance()
  })

  // 11. Optimisation spécifique pour React
  // Batching des updates pour éviter les re-renders inutiles
  let batchedUpdates: (() => void)[] = []
  let rafId: number | null = null

  window.batchUpdate = (callback: () => void) => {
    batchedUpdates.push(callback)

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        const updates = batchedUpdates.slice()
        batchedUpdates = []
        rafId = null

        updates.forEach(fn => fn())
      })
    }
  }

  // 12. Détection du mode sombre pour éviter le flash
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (isDarkMode) {
    document.documentElement.classList.add('dark')
  }

  console.log('🚀 Optimisations de performance initialisées')
}

// Types pour TypeScript
declare global {
  interface Window {
    batchUpdate: (callback: () => void) => void
  }
}