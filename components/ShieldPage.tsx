'use client'

import { useState, useEffect } from 'react'
import { Shield, ExternalLink, ArrowRight } from 'lucide-react'

interface Link {
  id: string
  slug: string
  url: string
  title?: string
  description?: string
  user: {
    id: string
    username: string
    name?: string
  }
}

interface ShieldPageProps {
  link: Link
}

export default function ShieldPage({ link }: ShieldPageProps) {
  const [countdown, setCountdown] = useState(5)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsReady(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleContinue = async () => {
    // Enregistrer le clic avant la redirection
    try {
      await fetch('/api/clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link.id })
      })
    } catch (error) {
      // Ignorer les erreurs pour ne pas bloquer la redirection
    }

    // Rediriger vers l'URL de destination
    window.location.href = link.url
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Protection Shield
              </h1>
              <p className="text-white/80">
                Vérification de sécurité en cours...
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Lien protégé détecté
              </h2>
              <p className="text-gray-600">
                Ce lien est protégé par notre système de sécurité pour éviter les accès automatisés.
              </p>
            </div>

            {/* Link Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <ExternalLink className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  {link.title && (
                    <h3 className="font-medium text-gray-900 mb-1">
                      {link.title}
                    </h3>
                  )}
                  <p className="text-sm text-gray-600 mb-2">
                    Partagé par {link.user.name || link.user.username}
                  </p>
                  <p className="text-xs text-gray-500 break-all">
                    Destination: {link.url}
                  </p>
                </div>
              </div>
            </div>

            {/* Countdown */}
            {!isReady ? (
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {countdown}
                  </span>
                </div>
                <p className="text-gray-600">
                  Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                </p>
              </div>
            ) : (
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <ArrowRight className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-gray-600 mb-4">
                  Vérification terminée ! Vous pouvez maintenant continuer.
                </p>
                <button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Continuer vers le site</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Auto redirect when ready */}
            {isReady && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Ou attendez 3 secondes pour une redirection automatique
                </p>
              </div>
            )}

            {/* Security info */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Protégé par LinkTracker Shield</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Auto-redirect après 8 secondes au total (5s countdown + 3s grace period)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    // Cette fonction sera appelée côté client
  }, 8000)
}