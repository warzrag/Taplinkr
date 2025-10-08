'use client'

import { useState, useEffect } from 'react'

interface PublicLinkPreviewProps {
  link: any
}

export default function PublicLinkPreviewFinal({ link }: PublicLinkPreviewProps) {
  const [clickedLinks, setClickedLinks] = useState<string[]>([])
  const [clickId, setClickId] = useState<string | null>(null)
  const [confirmedLinks, setConfirmedLinks] = useState<string[]>([])
  const [confirmingLink, setConfirmingLink] = useState<string | null>(null)
  const [showBrowserPrompt, setShowBrowserPrompt] = useState(false)

  // 🔥 SMART REDIRECT: Forcer l'ouverture dans le navigateur externe
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    // Détecter les navigateurs in-app
    const isInstagram = userAgent.includes('Instagram')
    const isFacebook = userAgent.includes('FBAN') || userAgent.includes('FBAV')
    const isTikTok = userAgent.includes('TikTok') || userAgent.includes('musical_ly')
    const isTwitter = userAgent.includes('Twitter')
    const isLinkedIn = userAgent.includes('LinkedInApp')
    const isSnapchat = userAgent.includes('Snapchat')

    const isInAppBrowser = isInstagram || isFacebook || isTikTok || isTwitter || isLinkedIn || isSnapchat

    if (isInAppBrowser) {
      console.log('🚨 Navigateur in-app détecté:', userAgent)

      const currentUrl = window.location.href
      const isIOS = /iPhone|iPad|iPod/.test(userAgent)
      const isAndroid = /Android/.test(userAgent)

      // 🔥 TECHNIQUE GETMYSOCIAL : Auto-trigger ouverture navigateur externe
      if (isIOS) {
        console.log('📱 iOS - Auto-trigger Safari')

        // Méthode 1 : Tenter avec googlechrome:// d'abord (si Chrome installé)
        try {
          window.location.href = 'googlechrome://' + currentUrl.replace(/^https?:\/\//, '')
        } catch (e) {
          console.log('Chrome non installé')
        }

        // Méthode 2 : Forcer l'ouverture avec un lien invisible qui s'auto-clique
        setTimeout(() => {
          const link = document.createElement('a')
          link.href = currentUrl
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          link.style.display = 'none'
          document.body.appendChild(link)

          // Simuler un vrai clic utilisateur (pas juste .click())
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          })
          link.dispatchEvent(clickEvent)

          setTimeout(() => document.body.removeChild(link), 100)
        }, 200)

      } else if (isAndroid) {
        console.log('🤖 Android - Auto-trigger Chrome')

        // Android : Utiliser intent:// qui déclenche automatiquement le choix navigateur
        const intentUrl = 'intent://' + currentUrl.replace(/^https?:\/\//, '') + '#Intent;scheme=https;action=android.intent.action.VIEW;end'
        window.location.href = intentUrl
      }

      // Fallback : Afficher le prompt manuel après 3 secondes si toujours là
      setTimeout(() => {
        // Vérifier si on est toujours dans l'in-app browser
        if (window.navigator.userAgent.includes('Instagram') ||
            window.navigator.userAgent.includes('FBAN') ||
            window.navigator.userAgent.includes('TikTok')) {
          setShowBrowserPrompt(true)
        }
      }, 3000)
    }
  }, [])

  // Tracker la vue avec protection contre les multiples appels
  useEffect(() => {
    if (!link?.id) return

    // Protection: une seule fois par session navigateur
    const tracked = sessionStorage.getItem(`tracked_session_${link.id}`)
    if (tracked) {
      console.log('Déjà tracké dans cette session')
      return
    }

    // Marquer comme tracké AVANT l'appel API
    sessionStorage.setItem(`tracked_session_${link.id}`, 'true')

    const trackingData = {
      linkId: link.id,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    }

    fetch('/api/track-link-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Tracking enregistré:', data)
        if (data.clickId) {
          setClickId(data.clickId)
        }
      })
      .catch(error => {
        console.error('Erreur tracking:', error)
        // En cas d'erreur, permettre un nouveau tracking
        sessionStorage.removeItem(`tracked_session_${link.id}`)
      })
  }, [link?.id])

  if (!link) {
    return <div className="min-h-screen bg-gray-900" />
  }

  const handleLinkClick = async (id: string, url: string) => {
    // Si pas encore confirmé, demander confirmation
    if (!confirmedLinks.includes(id)) {
      setConfirmingLink(id)
      return
    }

    // Si déjà confirmé, ouvrir directement
    // Marquer comme cliqué visuellement
    if (!clickedLinks.includes(id)) {
      setClickedLinks([...clickedLinks, id])
    }
    
    // Enregistrer le clic dans la base de données
    try {
      await fetch('/api/track-multilink-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          multiLinkId: id,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language || 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      })
    } catch (error) {
      console.error('Erreur tracking clic:', error)
    }
    
    // Ouvrir le lien
    window.open(url, '_blank')
  }

  const confirmAge = (id: string) => {
    setConfirmedLinks([...confirmedLinks, id])
    setConfirmingLink(null)
  }

  const cancelConfirm = () => {
    setConfirmingLink(null)
  }

  const profileImage = link?.profileImage || null
  const profileStyle = link?.profileStyle || 'circle'
  const coverImage = link?.coverImage || null
  const title = link?.title || 'Mes liens'
  const bio = link?.description || null
  const multiLinks = link?.multiLinks || []
  const clicks = link?.clicks || 0
  const borderRadius = link?.borderRadius || 'rounded-2xl' // Forme des boutons

  // En mode beacon, utiliser profileImage comme background
  const backgroundImage = profileStyle === 'beacon' ? profileImage : coverImage

  console.log('🔍 PublicLinkPreviewFinal - link:', link)
  console.log('🔍 PublicLinkPreviewFinal - multiLinks:', multiLinks)

  return (
    <div className="min-h-screen relative bg-gray-900">
      {/* 🔥 OVERLAY: Prompt pour ouvrir dans navigateur externe */}
      {showBrowserPrompt && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>

              {/* Titre */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ouvre dans ton navigateur
                </h2>
                <p className="text-gray-400 text-sm">
                  Pour une meilleure expérience, ouvre cette page dans Safari ou Chrome
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-white/5 rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                  <p className="text-white text-sm">
                    Appuie sur les <span className="font-bold">3 points</span> ou <span className="font-bold">···</span> en haut
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                  <p className="text-white text-sm">
                    Sélectionne <span className="font-bold">"Ouvrir dans Safari"</span> ou <span className="font-bold">"Ouvrir dans Chrome"</span>
                  </p>
                </div>
              </div>

              {/* Copier le lien */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Lien copié ! Colle-le dans Safari ou Chrome')
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                📋 Copier le lien
              </button>

              {/* Bouton fermer */}
              <button
                onClick={() => setShowBrowserPrompt(false)}
                className="text-gray-400 text-sm hover:text-white transition-colors"
              >
                Continuer quand même
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background flouté pour desktop */}
      <div className="hidden md:block fixed inset-0 z-0">
        {backgroundImage ? (
          <div
            className="w-full h-full blur-3xl scale-110"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900">
            <div className="absolute inset-0 bg-black/50" />
          </div>
        )}
      </div>

      {/* Background pour mobile */}
      <div className="md:hidden fixed inset-0 z-0">
        {backgroundImage ? (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900" />
        )}
      </div>

      {/* Conteneur format téléphone centré sur desktop */}
      <div className="relative z-10 min-h-screen flex items-center justify-center md:py-8 md:px-4">
        <div className="w-full md:w-[390px] md:max-h-[844px] md:rounded-[3rem] md:shadow-2xl md:overflow-hidden md:bg-black/10 md:backdrop-blur-xl">
          {/* Background image pour desktop (dans le cadre) */}
          <div className="hidden md:block absolute inset-0 z-0 rounded-[3rem] overflow-hidden">
            {backgroundImage ? (
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/40" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900" />
            )}
          </div>

          {/* Contenu */}
          <div className="relative z-10 min-h-screen md:min-h-0 md:h-[844px] flex flex-col justify-end overflow-y-auto">
            <div className="w-full px-6 pb-20 pt-12">
          
          {/* Header avec profil */}
          <div className="text-center mb-8">
            {/* Photo de profil en rond - seulement en mode circle */}
            {profileImage && profileStyle === 'circle' && (
              <div className="mb-4">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 mx-auto rounded-full border-4 border-white/30 shadow-2xl object-cover"
                />
              </div>
            )}

            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
              {title}
            </h1>

            {bio && (
              <p className="text-white/80 text-sm max-w-md mx-auto mb-4 px-4">
                {bio}
              </p>
            )}
          </div>

          {/* Liste des liens */}
          <div className="space-y-3">
            {multiLinks.length > 0 ? (
              multiLinks.map((item: any) => {
                const linkId = item?.id || Math.random().toString()
                const linkTitle = item?.title || 'Lien'
                const linkUrl = item?.url || '#'
                const linkIcon = item?.icon || item?.iconImage || null
                const isClicked = clickedLinks.includes(linkId)
                
                if (confirmingLink === linkId) {
                  // Afficher la confirmation dans le bouton
                  return (
                    <div
                      key={linkId}
                      className={`w-full bg-red-900 bg-opacity-20 backdrop-blur-md border border-red-500 border-opacity-40 ${borderRadius} p-4 transform transition-all duration-200`}
                    >
                      <div className="text-center">
                        <p className="text-white text-sm mb-3">⚠️ Contenu réservé aux +18 ans</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => cancelConfirm()}
                            className="flex-1 px-3 py-2 bg-black bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white text-sm font-medium transition-all"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => {
                              confirmAge(linkId)
                              // Marquer comme cliqué
                              if (!clickedLinks.includes(linkId)) {
                                setClickedLinks([...clickedLinks, linkId])
                              }
                              // Enregistrer le clic
                              fetch('/api/track-multilink-click', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ 
                                  multiLinkId: linkId,
                                  screenResolution: `${window.screen.width}x${window.screen.height}`,
                                  language: navigator.language || 'en',
                                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                })
                              }).catch(console.error)
                              // Ouvrir le lien immédiatement
                              window.open(linkUrl, '_blank')
                            }}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-all"
                          >
                            J'ai +18 ans
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <button
                    key={linkId}
                    onClick={() => handleLinkClick(linkId, linkUrl)}
                    className={`w-full bg-white/90 hover:bg-white/95 backdrop-blur-sm ${borderRadius} py-3 px-4 shadow-lg transition-all transform hover:scale-[1.02] flex items-center gap-2 group`}
                  >
                    {linkIcon && (
                      <img
                        src={linkIcon}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        onError={(e: any) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}

                    <span className="flex-1 text-center text-gray-900 font-semibold text-xs whitespace-nowrap px-1" style={{ minWidth: 0 }}>
                      {linkTitle}
                    </span>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!confirmedLinks.includes(linkId) && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded whitespace-nowrap">
                          18+
                        </span>
                      )}

                      {isClicked && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded whitespace-nowrap">
                          Visité
                        </span>
                      )}

                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="text-center py-8 text-white text-opacity-60">
                Aucun lien disponible
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center pb-6">
            <a
              href="https://www.taplinkr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-opacity-50 text-sm hover:text-opacity-70 transition-opacity"
            >
              Créé avec TapLinkr
            </a>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}