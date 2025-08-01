'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Lock, Clock, ArrowRight, Loader2 } from 'lucide-react'

interface LinkData {
  id: string
  slug: string
  title: string
  directUrl: string
  shieldEnabled: boolean
  isUltraLink: boolean
  shieldConfig?: string
}

interface ShieldConfig {
  level: number
  timer: number
  features: string[]
}

export default function ShieldPage() {
  const params = useParams()
  const router = useRouter()
  const [link, setLink] = useState<LinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(0)
  const [canProceed, setCanProceed] = useState(false)
  const [isBot, setIsBot] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [shouldAutoRedirect, setShouldAutoRedirect] = useState(false)

  useEffect(() => {
    // Détection basique des bots
    const userAgent = navigator.userAgent.toLowerCase()
    const botPatterns = [
      'bot', 'crawl', 'spider', 'scrape', 'facebook', 'whatsapp', 
      'telegram', 'twitter', 'linkedin', 'pinterest', 'instagram',
      'snap', 'tiktok', 'discord'
    ]
    
    const detected = botPatterns.some(pattern => userAgent.includes(pattern))
    setIsBot(detected)

    // Charger les données du lien
    fetchLinkData()
  }, [params.slug])

  // Effet pour la redirection automatique
  useEffect(() => {
    if (shouldAutoRedirect && canProceed && link?.directUrl) {
      console.log('Auto-redirect triggered')
      const timer = setTimeout(() => {
        // Enregistrer l'action
        fetch(`/api/analytics/shield-action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            linkId: link.id,
            action: 'proceed',
            isBot
          })
        }).catch(console.error)
        
        // S'assurer que l'URL est valide
        let targetUrl = link.directUrl
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = 'https://' + targetUrl
        }
        
        console.log('Auto-redirecting to:', targetUrl)
        window.location.href = targetUrl
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [shouldAutoRedirect, canProceed, link, isBot])

  const fetchLinkData = async () => {
    try {
      const response = await fetch(`/api/links/shield/${params.slug}`)
      if (!response.ok) throw new Error('Link not found')
      
      const data = await response.json()
      console.log('Link data received:', data)
      setLink(data)
      
      // Parser la configuration
      const config: ShieldConfig = data.shieldConfig 
        ? JSON.parse(data.shieldConfig) 
        : { level: 2, timer: 3000, features: [] }
      
      console.log('Shield config:', config)
      
      // Initialiser le countdown
      setCountdown(Math.ceil(config.timer / 1000))
      setShowContent(true)
      setLoading(false)
      
      // Si c'est un bot et ULTRA LINK, ne pas démarrer le timer
      if (isBot && data.isUltraLink) {
        setCanProceed(true)
        return
      }
      
      // Démarrer le timer
      startCountdown(config.timer, config.level)
      
    } catch (error) {
      console.error('Error loading link:', error)
      router.push('/404')
    }
  }

  const startCountdown = (duration: number, level: number) => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      
      setCountdown(Math.ceil(remaining / 1000))
      
      if (remaining === 0) {
        clearInterval(interval)
        setCanProceed(true)
        setLoading(false)
        
        // Marquer pour redirection automatique si niveau 2
        if (level === 2) {
          setShouldAutoRedirect(true)
        }
      }
    }, 100)
  }

  const handleProceed = () => {
    console.log('handleProceed called', { canProceed, link, directUrl: link?.directUrl })
    
    if (!canProceed) {
      console.log('Cannot proceed - timer not finished')
      return
    }
    
    if (!link?.directUrl) {
      console.error('No direct URL found')
      return
    }
    
    // Enregistrer l'action
    fetch(`/api/analytics/shield-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        linkId: link.id,
        action: 'proceed',
        isBot
      })
    }).catch(console.error)
    
    // S'assurer que l'URL est valide
    let targetUrl = link.directUrl
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl
    }
    
    console.log('Redirecting to:', targetUrl)
    
    // Rediriger avec obfuscation pour ULTRA LINK
    if (link.isUltraLink) {
      // Méthode simple et fiable
      setTimeout(() => {
        window.location.href = targetUrl
      }, 100)
    } else {
      window.location.href = targetUrl
    }
  }

  // Contenu adaptatif pour les bots (ULTRA LINK)
  if (isBot && link?.isUltraLink) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <article className="prose lg:prose-xl">
            <h1>Understanding Web Security and Link Protection</h1>
            <p>
              In today&apos;s digital landscape, protecting web resources and ensuring 
              safe browsing experiences has become increasingly important. This article 
              explores modern approaches to web security and link protection mechanisms.
            </p>
            <h2>The Importance of Secure Redirects</h2>
            <p>
              Secure redirect systems help protect users from malicious websites while 
              maintaining a smooth browsing experience. These systems analyze incoming 
              traffic and apply various security measures to ensure safety.
            </p>
            <h3>Key Features of Modern Protection Systems</h3>
            <ul>
              <li>Real-time threat detection and analysis</li>
              <li>Adaptive content delivery based on visitor patterns</li>
              <li>Advanced encryption and obfuscation techniques</li>
              <li>Comprehensive analytics and monitoring</li>
            </ul>
            <p>
              By implementing these features, web services can provide better protection 
              against automated attacks while maintaining accessibility for legitimate users.
            </p>
          </article>
        </div>
      </div>
    )
  }

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  const config: ShieldConfig = link?.shieldConfig 
    ? JSON.parse(link.shieldConfig) 
    : { level: 2, timer: 3000, features: [] }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
            link?.isUltraLink 
              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
          }`}>
            {link?.isUltraLink ? (
              <Zap className="w-10 h-10 text-white" />
            ) : (
              <Shield className="w-10 h-10 text-white" />
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          {link?.isUltraLink ? 'ULTRA LINK Protection' : 'Shield Protection Active'}
        </h1>
        
        <p className="text-white/70 text-center mb-8">
          {link?.isUltraLink 
            ? 'Maximum security verification in progress'
            : 'Verifying your request for security'}
        </p>

        {/* Timer */}
        <div className="mb-8">
          <div className="relative">
            {/* Progress bar background */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${
                  link?.isUltraLink 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: config.timer / 1000, ease: 'linear' }}
              />
            </div>
          </div>
          
          {/* Countdown */}
          <div className="flex justify-center mt-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-white tabular-nums">
                {countdown}
              </div>
              <div className="text-sm text-white/50">seconds</div>
            </div>
          </div>
        </div>

        {/* Features */}
        {link?.isUltraLink && (
          <div className="mb-6 space-y-2">
            {config.features.includes('adaptive-content') && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Lock className="w-4 h-4" />
                <span>Adaptive content protection</span>
              </div>
            )}
            {config.features.includes('ai-detection') && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Shield className="w-4 h-4" />
                <span>AI-powered threat detection</span>
              </div>
            )}
            {config.features.includes('js-obfuscation') && (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Clock className="w-4 h-4" />
                <span>Advanced redirect encryption</span>
              </div>
            )}
          </div>
        )}

        {/* Action button or auto-redirect message */}
        <AnimatePresence>
          {canProceed && (
            <>
              {config.level === 2 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-white">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Redirection automatique...</span>
                  </div>
                  <p className="text-sm text-white/60 mt-2">
                    Vous allez être redirigé vers {link?.title}
                  </p>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleProceed}
                  className={`w-full py-4 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all ${
                    link?.isUltraLink
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                  }`}
                >
                  Continue to {link?.title}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Security note */}
        <p className="text-xs text-white/40 text-center mt-6">
          This security check helps protect against automated access and ensures a safe browsing experience.
        </p>
      </motion.div>
    </div>
  )
}