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
  const [hasTracked, setHasTracked] = useState(false)
  
  // Tracker la vue de la page au chargement
  useEffect(() => {
    // Éviter le double tracking
    if (link?.id && !hasTracked) {
      setHasTracked(true)
      // Collecter des informations supplémentaires
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
          // L'API retourne le clickId créé
          if (data.clickId) {
            setClickId(data.clickId)
          }
        })
        .catch(console.error)

      // Ne pas gérer la durée pour l'instant, ça cause des problèmes
    }
  }, [link?.id, hasTracked]) // Dépendre de hasTracked pour éviter le re-tracking

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
  const coverImage = link?.coverImage || null
  const title = link?.title || 'Mes liens'
  const bio = link?.description || null
  const multiLinks = link?.multiLinks || []
  const clicks = link?.clicks || 0

  console.log('🔍 PublicLinkPreviewFinal - link:', link)
  console.log('🔍 PublicLinkPreviewFinal - multiLinks:', multiLinks)

  return (
    <div className="min-h-screen relative bg-gray-900">
      {/* Background flou pour PC */}
      <div className="fixed inset-0 z-0">
        {coverImage ? (
          <div
            className="w-full h-full blur-2xl scale-110"
            style={{
              backgroundImage: `url(${coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-70" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900">
            <div className="absolute inset-0 bg-black bg-opacity-50" />
          </div>
        )}
      </div>

      {/* Conteneur format téléphone */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-[390px] mx-auto">
          {/* Simulation cadre téléphone sur desktop */}
          <div className="hidden md:block absolute inset-0 -inset-x-8 -inset-y-8 bg-black/20 backdrop-blur-xl rounded-[3rem] shadow-2xl" />

          {/* Contenu scrollable style téléphone */}
          <div className="relative bg-white/10 backdrop-blur-md rounded-[2.5rem] md:rounded-[2rem] min-h-[600px] max-h-[90vh] overflow-y-auto">
            <div className="p-6">
          
          {/* Header avec profil */}
          <div className="text-center mb-8">
            {profileImage && (
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
                      className="w-full bg-red-900 bg-opacity-20 backdrop-blur-md border border-red-500 border-opacity-40 rounded-xl p-4 transform transition-all duration-200"
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
                    className="w-full bg-white/90 hover:bg-white/95 backdrop-blur-sm rounded-2xl py-3 px-4 shadow-lg transition-all transform hover:scale-[1.02] flex items-center gap-3 group"
                  >
                    {linkIcon && (
                      <img
                        src={linkIcon}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e: any) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    
                    <span className="flex-1 text-left text-gray-900 font-semibold text-lg">
                      {linkTitle}
                    </span>
                    
                    {!confirmedLinks.includes(linkId) && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded mr-2">
                        18+
                      </span>
                    )}
                    
                    {isClicked && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Visité
                      </span>
                    )}
                    
                    <svg 
                      className="w-5 h-5 text-gray-400 ml-2"
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