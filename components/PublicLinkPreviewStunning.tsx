'use client'

import { useState } from 'react'
import { 
  ExternalLink, 
  Share2, 
  Heart, 
  Eye,
  MapPin,
  Sparkles,
  ChevronDown,
  Instagram,
  Twitter,
  Youtube,
  Globe,
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

export default function PublicLinkPreviewStunning({ link }: PublicLinkPreviewProps) {
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
      toast.success('Lien copié dans le presse-papiers!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    if (!liked) {
      toast('❤️ Merci pour votre soutien!', { duration: 2000 })
    }
  }

  const scrollToLinks = () => {
    document.getElementById('links-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    })
  }

  const profileImage = link.profileImage || link.user.image
  const coverImage = link.coverImage

  // Icône selon l'URL
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
    return <Globe className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Hero Section avec couverture plein écran */}
      <div className="relative min-h-screen flex items-end">
        {/* Image de couverture */}
        <div className="absolute inset-0">
          {coverImage ? (
            <>
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover animate-fade-in"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
            </>
          ) : (
            <>
              <div className="w-full h-full bg-gradient-to-br from-purple-900 via-pink-800 to-indigo-900" />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
        </div>

        {/* Contenu Hero */}
        <div className="relative z-10 w-full pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Photo de profil */}
            {profileImage && (
              <div className="mb-6 animate-scale-in">
                <div className="relative inline-block">
                  <img
                    src={profileImage}
                    alt={link.title}
                    className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-white/30 shadow-2xl object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-2.5 animate-pulse-slow">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Titre */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-slide-up">
              {link.title}
            </h1>

            {/* Bio/Description */}
            {(link.description || link.bio) && (
              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto animate-slide-up-delay">
                {link.description || link.bio}
              </p>
            )}

            {/* Localisation */}
            {(link.city || link.country) && (
              <div className="flex items-center justify-center gap-2 text-white/70 mb-8 animate-fade-in-delay">
                <MapPin className="w-4 h-4" />
                <span>{[link.city, link.country].filter(Boolean).join(', ')}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in-delay">
              <button
                onClick={handleLike}
                className={`px-5 py-2.5 rounded-full transition-all transform hover:scale-105 active:scale-95 ${
                  liked 
                    ? 'bg-red-500/80 text-white' 
                    : 'bg-black/10 backdrop-blur text-white border border-white/20 hover:bg-black/20'
                }`}
              >
                <Heart className={`w-5 h-5 inline mr-2 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'Aimé' : 'J\'aime'}
              </button>

              <button
                onClick={handleShare}
                className="px-5 py-2.5 bg-black/10 backdrop-blur text-white rounded-full border border-white/20 hover:bg-black/20 transition-all transform hover:scale-105 active:scale-95"
              >
                {copied ? <Check className="w-5 h-5 inline mr-2" /> : <Share2 className="w-5 h-5 inline mr-2" />}
                {copied ? 'Copié!' : 'Partager'}
              </button>

              <div className="px-5 py-2.5 bg-black/10 backdrop-blur text-white rounded-full border border-white/20">
                <Eye className="w-5 h-5 inline mr-2" />
                {link.clicks} vues
              </div>
            </div>

            {/* Flèche scroll */}
            <button
              onClick={scrollToLinks}
              className="animate-bounce-slow cursor-pointer"
              aria-label="Voir les liens"
            >
              <ChevronDown className="w-8 h-8 text-white/60 mx-auto hover:text-white/80 transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Section des liens */}
      <div id="links-section" className="bg-gradient-to-b from-black via-gray-900 to-black py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4">
            {link.multiLinks && link.multiLinks.length > 0 ? (
              link.multiLinks.map((multiLink, index) => (
                <button
                  key={multiLink.id}
                  onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                  className="w-full group transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    animation: `slideInLeft 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="relative bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-md rounded-2xl p-5 border border-gray-700/50 hover:border-purple-500/50 transition-all overflow-hidden">
                    {/* Effet de brillance */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Icône */}
                        {multiLink.icon || multiLink.iconImage ? (
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20">
                            <img 
                              src={multiLink.icon || multiLink.iconImage || ''} 
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">
                                      ${getSocialIcon(multiLink.url).props.children || '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>'}
                                    </div>
                                  `;
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">
                            {getSocialIcon(multiLink.url)}
                          </div>
                        )}
                        
                        <div className="text-left">
                          <div className="text-white font-semibold text-lg">
                            {multiLink.title}
                          </div>
                          {multiLink.description && (
                            <div className="text-gray-400 text-sm mt-0.5">
                              {multiLink.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Flèche */}
                      <div className="text-gray-400 group-hover:text-purple-400 transition-all group-hover:translate-x-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>

                    {/* Indicateur visité */}
                    {clickedLinks.has(multiLink.id) && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Aucun lien disponible</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-20 text-center">
            <a 
              href="https://www.taplinkr.com" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full border border-purple-500/20 hover:border-purple-500/40 transition-all group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="text-sm text-gray-400 group-hover:text-purple-400 transition-colors">
                Créé avec TapLinkr
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        
        .animate-slide-up-delay {
          animation: slideUp 0.6s ease-out 0.2s both;
        }
        
        .animate-fade-in-delay {
          animation: fadeIn 0.6s ease-out 0.4s both;
        }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
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
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}