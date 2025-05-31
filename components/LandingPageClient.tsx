'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface LandingPageClientProps {
  link: {
    id: string
    title: string
    url: string
    shortCode: string
  }
  encodedData: string
}

export function LandingPageClient({ link, encodedData }: LandingPageClientProps) {
  const router = useRouter()
  const [isHuman, setIsHuman] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [mouseMovements, setMouseMovements] = useState(0)

  // Détecter les mouvements de souris pour valider l'humain
  useEffect(() => {
    const handleMouseMove = () => {
      setMouseMovements(prev => prev + 1)
      if (mouseMovements > 5) {
        setIsHuman(true)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchstart', () => setIsHuman(true))

    // Vérifier si c'est un bot par le user agent
    const userAgent = navigator.userAgent.toLowerCase()
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'facebookexternalhit',
      'whatsapp', 'telegram', 'twitter', 'pinterest', 'linkedin'
    ]
    
    const isBot = botPatterns.some(pattern => userAgent.includes(pattern))
    
    // Si c'est un bot, on ne montre pas le vrai lien
    if (isBot) {
      setIsHuman(false)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseMovements])

  const handleRedirect = async () => {
    if (!isHuman || isRedirecting) return
    
    setIsRedirecting(true)

    try {
      // Enregistrer le clic via une API sécurisée
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: link.id,
          encodedData,
          timestamp: Date.now(),
          validation: btoa(navigator.userAgent + Date.now()) // Token simple
        })
      })

      // Countdown avant redirection
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            // Décoder et rediriger
            const decoded = JSON.parse(atob(encodedData))
            window.location.href = decoded.url
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Erreur lors du tracking:', error)
      // Rediriger quand même après erreur
      setTimeout(() => {
        const decoded = JSON.parse(atob(encodedData))
        window.location.href = decoded.url
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      {/* Effet de fond animé */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Logo/Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white font-bold">
                {link.title.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {link.title}
          </h1>
          
          {/* Description neutre */}
          <p className="text-gray-300 text-center mb-8">
            Cliquez pour accéder au contenu
          </p>

          {/* Bouton de redirection avec protection */}
          {!isRedirecting ? (
            <button
              onClick={handleRedirect}
              disabled={!isHuman}
              className={`w-full py-4 px-6 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 ${
                isHuman
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isHuman ? 'Continuer vers le site' : 'Bougez votre souris pour continuer'}
            </button>
          ) : (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-white text-lg">
                Redirection dans {countdown}...
              </p>
            </div>
          )}

          {/* Indicateur de sécurité */}
          <div className="mt-8 flex items-center justify-center text-xs text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Lien sécurisé par LinkTracker
          </div>
        </div>

        {/* Instructions cachées pour les humains */}
        {!isHuman && (
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>Déplacez votre souris ou touchez l'écran pour continuer</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}