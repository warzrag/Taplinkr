'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Music, ExternalLink, X } from 'lucide-react'

interface EmbedLinkProps {
  url: string
  title: string
  description?: string | null
  icon?: string | null
  onClick: () => void
  style?: any
  className?: string
}

export default function EmbedLink({ url, title, description, icon, onClick, style, className }: EmbedLinkProps) {
  const [showEmbed, setShowEmbed] = useState(false)
  
  // Détecter le type d'embed
  const getEmbedInfo = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    if (youtubeMatch) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`,
        thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`,
        icon: '🎬',
        color: 'from-red-500 to-red-700'
      }
    }
    
    // Spotify
    const spotifyMatch = url.match(/spotify\.com\/(track|album|playlist|artist)\/([^?]+)/)
    if (spotifyMatch) {
      const [, type, id] = spotifyMatch
      return {
        type: 'spotify',
        embedUrl: `https://open.spotify.com/embed/${type}/${id}`,
        icon: '🎵',
        color: 'from-green-400 to-green-600'
      }
    }
    
    // SoundCloud
    if (url.includes('soundcloud.com')) {
      return {
        type: 'soundcloud',
        embedUrl: url, // SoundCloud nécessite une API pour obtenir l'embed URL
        icon: '🎧',
        color: 'from-orange-400 to-orange-600'
      }
    }
    
    return null
  }
  
  const embedInfo = getEmbedInfo(url)
  
  // Si ce n'est pas un lien embed supporté, retourner un lien normal
  if (!embedInfo) {
    return (
      <motion.button
        onClick={onClick}
        className={className}
        style={style}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center">
          <div className="mr-3 text-2xl">
            {icon || '🔗'}
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-bold text-sm" style={{ color: 'inherit' }}>
              {title}
            </h3>
            {description && (
              <p className="text-xs mt-1 opacity-80" style={{ color: 'inherit' }}>
                {description}
              </p>
            )}
          </div>
          <ExternalLink className="w-4 h-4 opacity-60" style={{ color: 'inherit' }} />
        </div>
      </motion.button>
    )
  }
  
  // Afficher l'embed
  if (showEmbed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full"
      >
        {/* Bouton fermer */}
        <button
          onClick={() => setShowEmbed(false)}
          className="absolute -top-2 -right-2 z-50 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        
        {/* Embed container */}
        <div className="w-full rounded-2xl overflow-hidden shadow-2xl">
          {embedInfo.type === 'youtube' && (
            <div className="relative pt-[56.25%]">
              <iframe
                src={embedInfo.embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          
          {embedInfo.type === 'spotify' && (
            <iframe
              src={embedInfo.embedUrl}
              className="w-full"
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          )}
        </div>
      </motion.div>
    )
  }
  
  // Bouton avec preview pour les embeds
  return (
    <motion.button
      onClick={() => {
        setShowEmbed(true)
        onClick() // Pour tracker le clic
      }}
      className={`${className} relative overflow-hidden group`}
      style={style}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient overlay pour les embeds */}
      <div className={`absolute inset-0 bg-gradient-to-r ${embedInfo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="flex items-center relative z-10">
        {/* Icon avec indicateur de média */}
        <div className="mr-3 relative">
          <span className="text-2xl">{embedInfo.icon}</span>
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r ${embedInfo.color} rounded-full flex items-center justify-center`}>
            {embedInfo.type === 'youtube' ? (
              <Play className="w-3 h-3 text-white" fill="white" />
            ) : (
              <Music className="w-3 h-3 text-white" />
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 text-left">
          <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'inherit' }}>
            {title}
            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${embedInfo.color} text-white`}>
              {embedInfo.type === 'youtube' ? 'Vidéo' : 'Musique'}
            </span>
          </h3>
          {description && (
            <p className="text-xs mt-1 opacity-80" style={{ color: 'inherit' }}>
              {description}
            </p>
          )}
        </div>
        
        {/* Play icon */}
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${embedInfo.color} flex items-center justify-center`}>
          {embedInfo.type === 'youtube' ? (
            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
          ) : (
            <Music className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
    </motion.button>
  )
}