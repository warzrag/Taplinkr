import { Suspense, lazy } from 'react'
import dynamic from 'next/dynamic'
import { Metadata } from 'next'

// Lazy load des composants non-critiques
const DashboardSidebar = dynamic(() => import('@/components/dashboard/DashboardSidebar'), {
  loading: () => <div className="w-64 h-screen bg-gray-50 animate-pulse" />,
  ssr: false
})

const DashboardHeader = dynamic(() => import('@/components/dashboard/DashboardHeader'), {
  loading: () => <div className="h-16 bg-white animate-pulse" />,
  ssr: false
})

// Préchargement des routes critiques
export const metadata: Metadata = {
  title: 'Dashboard | TapLinkr',
  description: 'Gérez vos liens et analytics',
  // Préconnexion aux domaines externes
  other: {
    'link': [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com' },
      { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' }
    ]
  }
}

// Skeleton loader pour le contenu
function ContentSkeleton() {
  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  )
}

export default function OptimizedDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* CSS critique inline pour éviter FOUC */}
      <style jsx global>{`
        body.navigating {
          cursor: progress;
        }

        body.navigating * {
          pointer-events: none;
        }

        /* Optimisation des transitions */
        * {
          will-change: auto;
        }

        /* Réduire le CLS */
        img, video, iframe {
          aspect-ratio: attr(width) / attr(height);
          height: auto;
        }

        /* Smooth loading */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar avec lazy loading */}
        <Suspense fallback={<div className="w-64 bg-gray-50 animate-pulse" />}>
          <DashboardSidebar />
        </Suspense>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header avec lazy loading */}
          <Suspense fallback={<div className="h-16 bg-white animate-pulse" />}>
            <DashboardHeader />
          </Suspense>

          {/* Contenu principal avec Suspense */}
          <main className="flex-1 overflow-y-auto">
            <Suspense fallback={<ContentSkeleton />}>
              <div className="fade-in">
                {children}
              </div>
            </Suspense>
          </main>
        </div>
      </div>

      {/* Préchargement des scripts non-critiques */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Précharger les routes au ralenti
            if ('requestIdleCallback' in window) {
              requestIdleCallback(() => {
                const routes = ['/dashboard/links', '/dashboard/analytics', '/settings'];
                routes.forEach(route => {
                  const link = document.createElement('link');
                  link.rel = 'prefetch';
                  link.href = route;
                  document.head.appendChild(link);
                });
              });
            }

            // Observer pour lazy loading des images
            if ('IntersectionObserver' in window) {
              const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                  if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                  }
                });
              }, { rootMargin: '50px' });

              document.addEventListener('DOMContentLoaded', () => {
                document.querySelectorAll('img[data-src]').forEach(img => {
                  imageObserver.observe(img);
                });
              });
            }
          `
        }}
      />
    </div>
  )
}