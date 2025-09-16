'use client'

import { useState, useEffect } from 'react'

interface PublicLinkPreviewProps {
  link: any
}

export default function PublicLinkPreviewFinal({ link }: PublicLinkPreviewProps) {
  const [clickedLinks, setClickedLinks] = useState<string[]>([])
  const [clickId, setClickId] = useState<string | null>(null)
  const [showAgeConfirm, setShowAgeConfirm] = useState(false)
  const [pendingLink, setPendingLink] = useState<{id: string, url: string} | null>(null)
  
  // Tracker la vue de la page au chargement
  useEffect(() => {
    if (link?.id) {
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

      // Tracker la durée de visite
      const startTime = Date.now()
      
      // Envoyer la durée quand l'utilisateur quitte la page
      const handleBeforeUnload = () => {
        if (clickId) {
          const duration = Math.floor((Date.now() - startTime) / 1000) // en secondes
          navigator.sendBeacon('/api/track-duration', JSON.stringify({
            clickId: clickId,
            duration
          }))
        }
      }
      
      window.addEventListener('beforeunload', handleBeforeUnload)
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [link?.id, clickId])

  if (!link) {
    return <div className="min-h-screen bg-gray-900" />
  }

  const handleLinkClick = async (id: string, url: string) => {
    // Stocker le lien en attente et afficher la confirmation
    setPendingLink({ id, url })
    setShowAgeConfirm(true)
  }

  const confirmAndOpenLink = async () => {
    if (!pendingLink) return

    // Marquer comme cliqué visuellement
    if (!clickedLinks.includes(pendingLink.id)) {
      setClickedLinks([...clickedLinks, pendingLink.id])
    }
    
    // Enregistrer le clic dans la base de données avec données enrichies
    try {
      await fetch('/api/track-multilink-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          multiLinkId: pendingLink.id,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language || 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      })
    } catch (error) {
      console.error('Erreur tracking clic:', error)
    }
    
    // Ouvrir le lien
    window.open(pendingLink.url, '_blank')
    
    // Fermer le modal
    setShowAgeConfirm(false)
    setPendingLink(null)
  }

  const cancelConfirm = () => {
    setShowAgeConfirm(false)
    setPendingLink(null)
  }

  const profileImage = link?.profileImage || null
  const coverImage = link?.coverImage || null
  const title = link?.title || 'Mes liens'
  const bio = link?.bio || null
  const multiLinks = link?.multiLinks || []
  const clicks = link?.clicks || 0

  return (
    <div className="min-h-screen relative bg-black">
      {/* Background avec couverture */}
      <div className="fixed inset-0 z-0">
        {coverImage ? (
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url(${coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-60" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-800 to-pink-700">
            <div className="absolute inset-0 bg-black bg-opacity-40" />
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          
          {/* Header avec profil */}
          <div className="text-center mb-8">
            {profileImage && (
              <div className="mb-4">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 mx-auto rounded-full border-4 border-white border-opacity-50 shadow-2xl object-cover"
                />
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {title}
            </h1>
            
            {bio && (
              <p className="text-white text-opacity-90 max-w-md mx-auto mb-4">
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
                
                return (
                  <button
                    key={linkId}
                    onClick={() => handleLinkClick(linkId, linkUrl)}
                    className="w-full bg-white bg-opacity-95 hover:bg-opacity-100 rounded-xl p-4 shadow-lg transition-all transform hover:scale-105 flex items-center gap-3"
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
                    
                    {isClicked && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
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
          <div className="mt-12 text-center">
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

      {/* Modal de confirmation d'âge */}
      {showAgeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Confirmation d'âge
              </h2>
              <p className="text-gray-600">
                Êtes-vous majeur ?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Ce contenu est réservé aux personnes de plus de 18 ans.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelConfirm}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
              >
                Non, j'ai moins de 18 ans
              </button>
              <button
                onClick={confirmAndOpenLink}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                Oui, j'ai plus de 18 ans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}