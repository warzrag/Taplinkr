'use client'

import { useState } from 'react'
import { 
  ExternalLink, 
  Share2, 
  Heart, 
  Eye,
  MapPin,
  Sparkles,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Check,
  Link2
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
  clicks: number
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

export default function PublicLinkPreviewVisible({ link }: PublicLinkPreviewProps) {
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

  const getSocialIcon = (url: string) => {
    if (url.includes('instagram')) return <Instagram className="w-5 h-5" />
    if (url.includes('twitter') || url.includes('x.com')) return <Twitter className="w-5 h-5" />
    if (url.includes('youtube')) return <Youtube className="w-5 h-5" />
    if (url.includes('tiktok')) return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    )
    if (url.includes('onlyfans')) return <Heart className="w-5 h-5" />
    return <Link2 className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen relative">
      {/* Background avec image de couverture */}
      <div className="fixed inset-0 z-0">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </>
        ) : (
          <>
            <div className="w-full h-full bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900" />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen">
        {/* Container centré sur mobile, split sur desktop */}
        <div className="lg:flex lg:min-h-screen">
          
          {/* Section Profil - Fixe sur desktop, en haut sur mobile */}
          <div className="lg:w-1/3 lg:min-h-screen lg:sticky lg:top-0 p-6 lg:p-12 flex items-center justify-center">
            <div className="text-center w-full max-w-sm mx-auto">
              {/* Photo de profil */}
              {profileImage && (
                <div className="mb-6">
                  <div className="relative inline-block">
                    <img
                      src={profileImage}
                      alt={link.title}
                      className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white/30 shadow-2xl object-cover animate-scale-in"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-2 animate-pulse-slow">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Titre */}
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 animate-fade-in">
                {link.title}
              </h1>

              {/* Bio */}
              {(link.description || link.bio) && (
                <p className="text-base lg:text-lg text-white/90 mb-4 animate-fade-in">
                  {link.description || link.bio}
                </p>
              )}

              {/* Localisation */}
              {(link.city || link.country) && (
                <div className="flex items-center justify-center gap-2 text-white/70 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{[link.city, link.country].filter(Boolean).join(', ')}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                <button
                  onClick={handleLike}
                  className={`px-4 py-2 rounded-full text-sm transition-all transform hover:scale-105 ${
                    liked 
                      ? 'bg-red-500/80 text-white' 
                      : 'bg-white/20 backdrop-blur text-white hover:bg-white/30'
                  }`}
                >
                  <Heart className={`w-4 h-4 inline mr-1.5 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Aimé' : 'J\'aime'}
                </button>

                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-full text-sm hover:bg-white/30 transition-all transform hover:scale-105"
                >
                  {copied ? <Check className="w-4 h-4 inline mr-1.5" /> : <Share2 className="w-4 h-4 inline mr-1.5" />}
                  {copied ? 'Copié!' : 'Partager'}
                </button>
              </div>

              {/* Stats */}
              <div className="text-white/70 text-sm">
                <Eye className="w-4 h-4 inline mr-1" />
                {link.clicks} vues
              </div>
            </div>
          </div>

          {/* Section Liens - Scrollable */}
          <div className="lg:w-2/3 p-6 lg:p-12">
            {/* Titre mobile uniquement */}
            <div className="lg:hidden mb-6 text-center">
              <h2 className="text-xl font-semibold text-white/90">Mes liens</h2>
            </div>

            {/* Container des liens avec hauteur max sur desktop */}
            <div className="max-w-2xl mx-auto space-y-3 lg:py-8">
              {link.multiLinks && link.multiLinks.length > 0 ? (
                link.multiLinks.map((multiLink, index) => (
                  <button
                    key={multiLink.id}
                    onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                    className="w-full group transform transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] animate-slide-in"
                    style={{
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-4 lg:p-5 shadow-xl hover:shadow-2xl transition-all overflow-hidden group">
                      {/* Effet de brillance au hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Icône colorée */}
                          <div className="relative">
                            {multiLink.icon || multiLink.iconImage ? (
                              <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg">
                                <img 
                                  src={multiLink.icon || multiLink.iconImage || ''} 
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.className = "w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg";
                                      parent.innerHTML = '';
                                      const icon = getSocialIcon(multiLink.url);
                                      if (typeof icon === 'object' && icon !== null) {
                                        parent.innerHTML = '<svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>';
                                      }
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
                                {getSocialIcon(multiLink.url)}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-left">
                            <div className="text-gray-900 font-bold text-lg lg:text-xl">
                              {multiLink.title}
                            </div>
                            {multiLink.description && (
                              <div className="text-gray-600 text-sm mt-0.5">
                                {multiLink.description}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Flèche animée */}
                        <div className="text-gray-400 group-hover:text-purple-600 transition-all group-hover:translate-x-2">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>

                      {/* Badge visité */}
                      {clickedLinks.has(multiLink.id) && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                          <Check className="w-3 h-3" />
                          Visité
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12 bg-white/10 backdrop-blur rounded-2xl">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-white/50" />
                  <p className="text-white/70">Aucun lien disponible</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <a 
                href="https://www.taplinkr.com" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-all group text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Créé avec TapLinkr
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Styles CSS */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out both;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  )
}