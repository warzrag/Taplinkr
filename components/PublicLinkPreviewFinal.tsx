'use client'

import { useState, useEffect } from 'react'

interface PublicLinkPreviewProps {
  link: any
}

export default function PublicLinkPreviewFinal({ link }: PublicLinkPreviewProps) {
  const [clickedLinks, setClickedLinks] = useState<string[]>([])
  const [clickId, setClickId] = useState<string | null>(null)
  
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
    // Marquer comme cliqué visuellement
    if (!clickedLinks.includes(id)) {
      setClickedLinks([...clickedLinks, id])
    }
    
    // Enregistrer le clic dans la base de données avec données enrichies
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
            
            {clicks > 0 && (
              <div className="text-white text-opacity-70 text-sm">
                {clicks} vues
              </div>
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
    </div>
  )
}