'use client'

import { useState } from 'react'
import { 
  ExternalLink, 
  Share2, 
  Heart, 
  Eye,
  MapPin,
  Sparkles,
  Check
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface MultiLink {
  id: string
  title: string
  url: string
  description?: string | null
  icon?: string | null
  iconImage?: string | null
  order: number
}

interface PublicLinkPreviewProps {
  link: {
    id: string
    slug: string
    title: string
    description?: string | null
    bio?: string | null
    profileImage?: string | null
    coverImage?: string | null
    city?: string | null
    country?: string | null
    clicks: number
    multiLinks: MultiLink[]
    user: {
      username: string
      name?: string | null
      image?: string | null
      bio?: string | null
    }
  }
}

export default function PublicLinkPreviewWorking({ link }: PublicLinkPreviewProps) {
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)

  const handleLinkClick = async (multiLinkId: string, url: string) => {
    setClickedLinks(prev => new Set(prev).add(multiLinkId))
    
    try {
      await fetch('/api/track-multilink-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiLinkId })
      })
    } catch (error) {
      console.error('Erreur tracking:', error)
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          text: link.description || link.bio || '',
          url: url
        })
      } catch (err) {
        console.error('Erreur partage:', err)
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Lien copié!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    if (!liked) {
      toast('❤️ Merci!', { duration: 2000 })
    }
  }

  const profileImage = link.profileImage || link.user.image
  const coverImage = link.coverImage

  return (
    <div className="min-h-screen bg-black">
      {/* Image de couverture en background */}
      {coverImage && (
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>
      )}
      
      {!coverImage && (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900">
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Contenu */}
      <div className="relative z-10 min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Header avec profil */}
          <div className="text-center mb-8">
            {/* Photo de profil */}
            {profileImage && (
              <div className="mb-4">
                <img
                  src={profileImage}
                  alt={link.title}
                  className="w-28 h-28 md:w-36 md:h-36 mx-auto rounded-full border-4 border-white/30 shadow-xl object-cover"
                />
              </div>
            )}

            {/* Titre */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {link.title}
            </h1>

            {/* Bio */}
            {(link.description || link.bio) && (
              <p className="text-lg text-white/90 mb-4 max-w-2xl mx-auto">
                {link.description || link.bio}
              </p>
            )}

            {/* Location */}
            {(link.city || link.country) && (
              <div className="flex items-center justify-center gap-2 text-white/70 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{[link.city, link.country].filter(Boolean).join(', ')}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-3 flex-wrap mb-4">
              <button
                onClick={handleLike}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  liked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart className={`w-4 h-4 inline mr-1.5 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'Aimé' : 'J\'aime'}
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium hover:bg-white/30 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 inline mr-1.5" />
                    Copié!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 inline mr-1.5" />
                    Partager
                  </>
                )}
              </button>

              <div className="px-4 py-2 bg-white/10 text-white rounded-full text-sm">
                <Eye className="w-4 h-4 inline mr-1.5" />
                {link.clicks} vues
              </div>
            </div>
          </div>

          {/* Section des liens - Grid responsive */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
            {link.multiLinks && link.multiLinks.length > 0 ? (
              link.multiLinks.map((multiLink) => (
                <button
                  key={multiLink.id}
                  onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                  className="group relative w-full"
                >
                  <div className="relative bg-white/95 hover:bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]">
                    <div className="flex items-center gap-4">
                      {/* Icône ou image */}
                      {multiLink.icon || multiLink.iconImage ? (
                        <div className="flex-shrink-0">
                          <img 
                            src={multiLink.icon || multiLink.iconImage || ''} 
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover"
                            onError={(e) => {
                              // Masquer l'image si elle ne charge pas
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white" />
                        </div>
                      )}
                      
                      {/* Texte */}
                      <div className="flex-1 text-left">
                        <div className="font-bold text-gray-900 text-lg">
                          {multiLink.title}
                        </div>
                        {multiLink.description && (
                          <div className="text-gray-600 text-sm mt-0.5">
                            {multiLink.description}
                          </div>
                        )}
                      </div>

                      {/* Flèche */}
                      <div className="text-gray-400 group-hover:text-purple-600 transition-colors group-hover:translate-x-1 transform">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>

                    {/* Badge visité */}
                    {clickedLinks.has(multiLink.id) && (
                      <div className="absolute top-2 right-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                        Visité
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-white/50" />
                <p className="text-white/70 text-lg">Aucun lien disponible</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <a 
              href="https://www.taplinkr.com" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Sparkles className="w-4 h-4" />
              Créé avec TapLinkr
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}