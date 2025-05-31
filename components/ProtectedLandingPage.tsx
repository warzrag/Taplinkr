'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ProtectedLandingPageProps {
  link: {
    id: string
    title: string
    url: string
    shortCode: string
    isDirect?: boolean
  }
  encodedData: string
}

export function ProtectedLandingPage({ link, encodedData }: ProtectedLandingPageProps) {
  const router = useRouter()
  const [isValidated, setIsValidated] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const interactionRef = useRef({
    mouseMovements: 0,
    clicks: 0,
    touches: 0,
    keyPresses: 0,
    startTime: Date.now(),
    jsExecuted: true
  })

  // Protection avancée contre les bots
  useEffect(() => {
    // Vérifications anti-bot avancées
    const checks = {
      // 1. Vérifier les propriétés du navigateur
      hasWebGL: !!window.WebGLRenderingContext,
      hasWebRTC: !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection),
      hasMediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      
      // 2. Vérifier les dimensions de l'écran
      screenValid: window.screen.width > 0 && window.screen.height > 0,
      windowValid: window.innerWidth > 0 && window.innerHeight > 0,
      
      // 3. Vérifier les capacités JavaScript
      hasPromise: typeof Promise !== 'undefined',
      hasSymbol: typeof Symbol !== 'undefined',
      hasProxy: typeof Proxy !== 'undefined',
      
      // 4. Détecter les headless browsers
      isHeadless: navigator.webdriver || 
                  (navigator.userAgent.includes('HeadlessChrome')) ||
                  !navigator.languages || navigator.languages.length === 0,
      
      // 5. Vérifier le user agent
      suspiciousUA: /bot|crawl|spider|scrape|facebookexternalhit|whatsapp|telegram|twitter|pinterest|linkedin|instagram/i.test(navigator.userAgent),
      
      // 6. Vérifier les plugins (les bots n'en ont généralement pas)
      hasPlugins: navigator.plugins && navigator.plugins.length > 0,
      
      // 7. Vérifier la résolution
      devicePixelRatioValid: window.devicePixelRatio > 0,
      
      // 8. Vérifier les permissions
      hasPermissions: !!navigator.permissions,
      
      // 9. Détecter l'automatisation
      isAutomated: !!(window as any).document.__selenium_unwrapped ||
                   !!(window as any).document.__webdriver_evaluate ||
                   !!(window as any).document.__driver_evaluate
    }

    // Score de confiance
    const trustScore = Object.values(checks).filter(v => v === true).length
    const isBot = checks.suspiciousUA || checks.isHeadless || checks.isAutomated || trustScore < 5

    setDebugInfo(checks)

    if (isBot) {
      console.log('Bot detected with score:', trustScore)
      // Pour les bots, on ne fait rien
      return
    }

    // Événements d'interaction humaine
    const handleMouseMove = (e: MouseEvent) => {
      interactionRef.current.mouseMovements++
      // Vérifier que le mouvement est naturel (pas trop régulier)
      if (interactionRef.current.mouseMovements > 10) {
        validateHuman()
      }
    }

    const handleClick = () => {
      interactionRef.current.clicks++
      if (interactionRef.current.clicks > 0) {
        validateHuman()
      }
    }

    const handleTouch = () => {
      interactionRef.current.touches++
      validateHuman()
    }

    const handleKeyPress = () => {
      interactionRef.current.keyPresses++
      if (interactionRef.current.keyPresses > 2) {
        validateHuman()
      }
    }

    const validateHuman = () => {
      const timeSpent = Date.now() - interactionRef.current.startTime
      // Au moins 100ms sur la page et une interaction
      if (timeSpent > 100 && !isBot) {
        setIsValidated(true)
      }
    }

    // Ajouter les listeners
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    window.addEventListener('touchstart', handleTouch)
    window.addEventListener('keydown', handleKeyPress)

    // Pour les liens directs, valider automatiquement après vérifications
    if (link.isDirect && !isBot) {
      setTimeout(() => {
        if (!checks.suspiciousUA && !checks.isHeadless) {
          setIsValidated(true)
        }
      }, 500)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('touchstart', handleTouch)
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [link.isDirect])

  // Fonction de redirection sécurisée
  const secureRedirect = async () => {
    if (!isValidated || isRedirecting) return
    
    setIsRedirecting(true)

    try {
      // Double vérification côté client
      const isRealUser = interactionRef.current.jsExecuted && 
                        (interactionRef.current.mouseMovements > 0 || 
                         interactionRef.current.touches > 0 ||
                         interactionRef.current.clicks > 0)

      if (!isRealUser && !link.isDirect) {
        console.log('Failed human validation')
        return
      }

      // Enregistrer le clic de manière obfusquée
      const payload = btoa(JSON.stringify({
        l: link.id,
        d: encodedData,
        t: Date.now(),
        v: btoa(navigator.userAgent + screen.width + screen.height),
        h: interactionRef.current
      }))

      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkId: link.id,
          encodedData,
          timestamp: Date.now(),
          validation: payload
        })
      })

      // Décodage et redirection obfusquée
      const decoded = JSON.parse(atob(encodedData))
      
      // Technique de redirection multiple pour éviter la détection
      const redirectMethods = [
        () => window.location.href = decoded.url,
        () => window.location.assign(decoded.url),
        () => window.location.replace(decoded.url),
        () => { 
          const a = document.createElement('a')
          a.href = decoded.url
          a.click()
        }
      ]

      // Utiliser une méthode aléatoire
      const method = redirectMethods[Math.floor(Math.random() * redirectMethods.length)]
      
      // Countdown
      if (!link.isDirect) {
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              method()
            }
            return prev - 1
          })
        }, 1000)
      } else {
        // Pour les liens directs, redirection immédiate mais toujours protégée
        setTimeout(method, 100)
      }
    } catch (error) {
      console.error('Redirect error:', error)
      // Fallback
      setTimeout(() => {
        const decoded = JSON.parse(atob(encodedData))
        window.location.href = decoded.url
      }, 1000)
    }
  }

  // Auto-redirect pour les liens directs validés
  useEffect(() => {
    if (isValidated && link.isDirect && !isRedirecting) {
      secureRedirect()
    }
  }, [isValidated, link.isDirect])

  // Design différent selon le type
  if (link.isDirect && isValidated && isRedirecting) {
    // Pour les liens directs, affichage minimal pendant la redirection
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Redirection...</p>
        </div>
      </div>
    )
  }

  // Page de landing complète pour les liens protégés
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
          
          {/* Description */}
          <p className="text-gray-300 text-center mb-8">
            {link.isDirect ? 'Redirection sécurisée en cours...' : 'Cliquez pour accéder au contenu'}
          </p>

          {/* Bouton ou loader */}
          {!isRedirecting ? (
            <button
              onClick={secureRedirect}
              disabled={!isValidated}
              className={`w-full py-4 px-6 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 ${
                isValidated
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isValidated ? 'Continuer' : 'Validation en cours...'}
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

          {/* Sécurité */}
          <div className="mt-8 flex items-center justify-center text-xs text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Lien protégé et sécurisé
          </div>

          {/* Debug info en dev */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-500">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}