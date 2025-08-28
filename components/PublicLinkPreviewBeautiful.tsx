'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Copy,
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
  animation?: string | null
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
    backgroundColor?: string | null
    textColor?: string | null
    city?: string | null
    country?: string | null
    instagramUrl?: string | null
    tiktokUrl?: string | null
    twitterUrl?: string | null
    youtubeUrl?: string | null
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

export default function PublicLinkPreviewBeautiful({ link }: PublicLinkPreviewProps) {
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [viewCount, setViewCount] = useState(link.clicks)

  const handleLinkClick = async (multiLinkId: string, url: string) => {
    setClickedLinks(prev => new Set(prev).add(multiLinkId))
    
    // Animation de clic
    const button = document.getElementById(`link-${multiLinkId}`)
    if (button) {
      button.classList.add('scale-95')
      setTimeout(() => button.classList.remove('scale-95'), 200)
    }
    
    try {
      await fetch('/api/track-multilink-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiLinkId })
      })
    } catch (error) {
      console.error('Erreur tracking:', error)
    }

    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer')
    }, 150)
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
      toast.success('Lien copié !')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLike = () => {
    setLiked(!liked)
    if (!liked) {
      toast('❤️ Merci !', { duration: 2000 })
    }
  }

  const scrollToLinks = () => {
    document.getElementById('links-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    })
  }

  const profileImage = link.profileImage || link.user.image
  const coverImage = link.coverImage

  // Déterminer l'icône sociale basée sur l'URL
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
    <div className="min-h-screen bg-black">
      {/* Hero Section avec image de couverture */}
      <div className="relative h-screen">
        {/* Image de couverture en plein écran */}
        {coverImage ? (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient pour lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
            </motion.div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700">
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* Contenu sur l'image */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-4">
          <div className="max-w-4xl mx-auto w-full">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center"
            >
              {/* Photo de profil */}
              {profileImage && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="relative inline-block">
                    <img
                      src={profileImage}
                      alt={link.title}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 backdrop-blur-sm shadow-2xl"
                    />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                      className="absolute -bottom-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-2"
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Titre */}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                {link.title}
              </h1>

              {/* Description/Bio */}
              {(link.description || link.bio) && (
                <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto drop-shadow-lg">
                  {link.description || link.bio}
                </p>
              )}

              {/* Localisation */}
              {(link.city || link.country) && (
                <div className="flex items-center justify-center gap-2 text-white/80 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>{[link.city, link.country].filter(Boolean).join(', ')}</span>
                </div>
              )}

              {/* Statistiques et Actions */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`px-6 py-3 rounded-full backdrop-blur-md transition-all ${
                    liked 
                      ? 'bg-red-500/30 text-red-300 border border-red-400/50' 
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <Heart className={`w-5 h-5 inline mr-2 ${liked ? 'fill-current' : ''}`} />
                  {liked ? 'Aimé' : 'J\'aime'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="px-6 py-3 bg-white/10 text-white rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
                >
                  {copied ? <Check className="w-5 h-5 inline mr-2" /> : <Share2 className="w-5 h-5 inline mr-2" />}
                  {copied ? 'Copié !' : 'Partager'}
                </motion.button>

                <div className="px-6 py-3 bg-white/10 text-white rounded-full backdrop-blur-md border border-white/20">
                  <Eye className="w-5 h-5 inline mr-2" />
                  {viewCount} vues
                </div>
              </div>
            </motion.div>

            {/* Flèche pour scroll */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{ 
                opacity: { delay: 1 },
                y: { duration: 2, repeat: Infinity }
              }}
              className="text-center cursor-pointer"
              onClick={scrollToLinks}
            >
              <ChevronDown className="w-8 h-8 text-white/60 mx-auto" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Section des liens */}
      <div id="links-section" className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {link.multiLinks && link.multiLinks.length > 0 ? (
              link.multiLinks.map((multiLink, index) => (
                <motion.button
                  key={multiLink.id}
                  id={`link-${multiLink.id}`}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                  className="w-full group relative overflow-hidden"
                >
                  <div className="relative bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-5 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
                    {/* Effet de brillance au hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Icône du lien */}
                        {multiLink.icon || multiLink.iconImage ? (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-0.5">
                            <img 
                              src={multiLink.icon || multiLink.iconImage || ''} 
                              alt=""
                              className="w-full h-full rounded-xl object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden w-full h-full rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                              {getSocialIcon(multiLink.url)}
                            </div>
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
                            <div className="text-gray-400 text-sm mt-1">
                              {multiLink.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Flèche animée */}
                      <div className="text-gray-400 group-hover:text-purple-400 transition-all duration-300 group-hover:translate-x-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>

                    {/* Badge de clic si déjà visité */}
                    {clickedLinks.has(multiLink.id) && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    )}
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun lien disponible pour le moment</p>
              </div>
            )}
          </motion.div>

          {/* Footer élégant */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-20 text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full border border-purple-500/20">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <a 
                href="https://www.taplinkr.com" 
                className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Créé avec TapLinkr
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}