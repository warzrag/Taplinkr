'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Globe, Play, FileText, Instagram, Twitter, Github, Music, Heart, Star } from 'lucide-react'

interface BeaconStyleCardProps {
  link: {
    id: string
    title: string
    url: string
    description?: string | null
    icon?: string
  }
  onClick: () => void
  isClicked?: boolean
}

export default function BeaconStyleCard({ link, onClick, isClicked = false }: BeaconStyleCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Déterminer le type de contenu avec des styles adaptés au thème Beacons
  const getContentInfo = () => {
    const url = link.url.toLowerCase()
    const title = link.title.toLowerCase()
    
    if (url.includes('onlyfans') || title.includes('only fans') || title.includes('onlyfans')) {
      return {
        type: 'onlyfans',
        icon: <Heart className="w-5 h-5" />,
        gradient: 'from-blue-400 to-blue-600',
        emoji: '💎',
        color: 'bg-blue-500'
      }
    }
    if (url.includes('telegram') || title.includes('telegram')) {
      return {
        type: 'telegram',
        icon: <span className="text-lg">✈️</span>,
        gradient: 'from-gray-500 to-gray-700',
        emoji: '✈️',
        color: 'bg-gray-500'
      }
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return {
        type: 'video',
        icon: <Play className="w-5 h-5" />,
        gradient: 'from-red-500 to-red-600',
        emoji: '🎬',
        color: 'bg-red-500'
      }
    }
    if (url.includes('instagram.com')) {
      return {
        type: 'social',
        icon: <Instagram className="w-5 h-5" />,
        gradient: 'from-purple-500 via-pink-500 to-orange-500',
        emoji: '📸',
        color: 'bg-purple-500'
      }
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return {
        type: 'social',
        icon: <Twitter className="w-5 h-5" />,
        gradient: 'from-sky-400 to-blue-600',
        emoji: '🐦',
        color: 'bg-sky-500'
      }
    }
    if (url.includes('github.com')) {
      return {
        type: 'code',
        icon: <Github className="w-5 h-5" />,
        gradient: 'from-gray-600 to-gray-900',
        emoji: '💻',
        color: 'bg-gray-700'
      }
    }
    if (url.includes('spotify.com')) {
      return {
        type: 'music',
        icon: <Music className="w-5 h-5" />,
        gradient: 'from-green-400 to-green-600',
        emoji: '🎵',
        color: 'bg-green-500'
      }
    }
    
    return {
      type: 'website',
      icon: <Globe className="w-5 h-5" />,
      gradient: 'from-purple-400 to-purple-600',
      emoji: '🔗',
      color: 'bg-purple-500'
    }
  }

  const contentInfo = getContentInfo()

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.02,
        y: -2
      }}
      whileTap={{ 
        scale: 0.98 
      }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
    >
      {/* Glow effect */}
      <motion.div
        className={`absolute -inset-1 rounded-2xl blur-lg ${contentInfo.color} opacity-0 group-hover:opacity-20 transition-all duration-300`}
      />

      {/* Main card - Style Beacons */}
      <motion.div
        onClick={onClick}
        className={`relative overflow-hidden bg-white/90 backdrop-blur-md rounded-2xl cursor-pointer transition-all duration-300 hover:bg-white hover:shadow-lg ${
          isClicked ? 'animate-pulse' : ''
        }`}
      >
        {/* Content */}
        <div className="p-4">
          <div className="flex items-center">
            {/* Icon/Emoji */}
            <motion.div
              className="mr-4 text-2xl filter drop-shadow-sm"
              animate={isHovered ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 0.6 }}
            >
              {link.icon || contentInfo.emoji}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                {link.title}
              </h3>
              
              {link.description && (
                <p className="text-gray-600 text-xs line-clamp-1">
                  {link.description}
                </p>
              )}
              
              {/* Emojis décoratifs selon le type */}
              {contentInfo.type === 'onlyfans' && (
                <p className="text-xs mt-1">💝🔥</p>
              )}
              {contentInfo.type === 'telegram' && (
                <p className="text-xs mt-1">💝🔐</p>
              )}
            </div>

            {/* Arrow */}
            <motion.div
              className="ml-3 flex-shrink-0"
              animate={isHovered ? { x: [0, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </motion.div>
          </div>
        </div>

        {/* Subtle shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={isHovered ? { x: '200%' } : {}}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />

        {/* Click effect */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              initial={{ x: '-100%', skewX: -15 }}
              animate={{ x: '200%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}