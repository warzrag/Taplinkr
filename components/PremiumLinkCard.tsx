'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Globe, Shield, Play, FileText, Instagram, Twitter, Github, Music, Sparkles, ArrowUpRight } from 'lucide-react'

interface PremiumLinkCardProps {
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

export default function PremiumLinkCard({ link, onClick, isClicked = false }: PremiumLinkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([])

  // Déterminer le type de contenu et les couleurs
  const getContentInfo = () => {
    const url = link.url.toLowerCase()
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return {
        type: 'video',
        icon: <Play className="w-5 h-5" />,
        gradient: 'from-red-500 via-red-600 to-red-700',
        shimmer: 'from-red-400/0 via-red-200/30 to-red-400/0',
        glow: 'shadow-red-500/25',
        platform: 'YouTube',
        emoji: '📺'
      }
    }
    if (url.includes('instagram.com')) {
      return {
        type: 'social',
        icon: <Instagram className="w-5 h-5" />,
        gradient: 'from-purple-500 via-pink-500 to-orange-500',
        shimmer: 'from-purple-400/0 via-pink-200/30 to-orange-400/0',
        glow: 'shadow-purple-500/25',
        platform: 'Instagram',
        emoji: '📸'
      }
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return {
        type: 'social',
        icon: <Twitter className="w-5 h-5" />,
        gradient: 'from-sky-400 via-sky-500 to-blue-600',
        shimmer: 'from-sky-400/0 via-sky-200/30 to-blue-400/0',
        glow: 'shadow-sky-500/25',
        platform: 'X',
        emoji: '🐦'
      }
    }
    if (url.includes('github.com')) {
      return {
        type: 'code',
        icon: <Github className="w-5 h-5" />,
        gradient: 'from-gray-700 via-gray-800 to-gray-900',
        shimmer: 'from-gray-400/0 via-gray-200/30 to-gray-400/0',
        glow: 'shadow-gray-500/25',
        platform: 'GitHub',
        emoji: '💻'
      }
    }
    if (url.includes('spotify.com')) {
      return {
        type: 'music',
        icon: <Music className="w-5 h-5" />,
        gradient: 'from-green-400 via-green-500 to-green-600',
        shimmer: 'from-green-400/0 via-green-200/30 to-green-400/0',
        glow: 'shadow-green-500/25',
        platform: 'Spotify',
        emoji: '🎵'
      }
    }
    if (url.endsWith('.pdf')) {
      return {
        type: 'document',
        icon: <FileText className="w-5 h-5" />,
        gradient: 'from-red-500 via-red-600 to-red-700',
        shimmer: 'from-red-400/0 via-red-200/30 to-red-400/0',
        glow: 'shadow-red-500/25',
        platform: 'PDF',
        emoji: '📄'
      }
    }
    
    return {
      type: 'website',
      icon: <Globe className="w-5 h-5" />,
      gradient: 'from-blue-500 via-purple-500 to-pink-500',
      shimmer: 'from-blue-400/0 via-purple-200/30 to-pink-400/0',
      glow: 'shadow-blue-500/25',
      platform: new URL(link.url).hostname,
      emoji: '🌐'
    }
  }

  const contentInfo = getContentInfo()

  const generateSparkles = () => {
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
    setSparkles(newSparkles)
    
    setTimeout(() => setSparkles([]), 1000)
  }

  const handleClick = () => {
    generateSparkles()
    onClick()
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    generateSparkles()
  }

  return (
    <motion.div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.02,
        y: -4
      }}
      whileTap={{ 
        scale: 0.98 
      }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
    >
      {/* Sparkles */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute pointer-events-none z-30"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
            }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              rotate: [0, 180, 360],
              y: [-20, -40, -60]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Glow effect */}
      <motion.div
        className={`absolute inset-0 rounded-2xl blur-xl ${contentInfo.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Main card */}
      <motion.div
        onClick={handleClick}
        className={`relative overflow-hidden bg-white rounded-2xl cursor-pointer transition-all duration-300 ${
          isClicked ? 'animate-pulse' : ''
        }`}
        style={{
          boxShadow: isHovered 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Background gradient animé */}
        <div className={`absolute inset-0 bg-gradient-to-br ${contentInfo.gradient} opacity-5`} />
        
        {/* Shimmer effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${contentInfo.shimmer}`}
          animate={isHovered ? { x: [-100, 400] } : {}}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Border gradient */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${contentInfo.gradient} p-px`}>
          <div className="h-full w-full rounded-2xl bg-white" />
        </div>

        {/* Content */}
        <div className="relative p-6">
          {/* Header avec emoji et icône */}
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className="flex items-center space-x-3"
              animate={isHovered ? { x: [0, 2, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="text-2xl"
                animate={isHovered ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.6 }}
              >
                {link.icon || contentInfo.emoji}
              </motion.div>
              
              <div className={`p-2 rounded-xl bg-gradient-to-br ${contentInfo.gradient} text-white shadow-lg`}>
                <motion.div
                  animate={isHovered ? { rotateY: 360 } : {}}
                  transition={{ duration: 0.8 }}
                >
                  {contentInfo.icon}
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-2"
              animate={isHovered ? { x: [0, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <ArrowUpRight className={`w-5 h-5 bg-gradient-to-r ${contentInfo.gradient} bg-clip-text text-transparent`} />
            </motion.div>
          </div>

          {/* Titre avec effet de typing */}
          <motion.h3
            className="text-xl font-bold text-gray-900 mb-2 leading-tight"
            animate={isHovered ? { 
              backgroundSize: ['0% 2px', '100% 2px', '0% 2px']
            } : {}}
            style={{
              backgroundImage: `linear-gradient(90deg, ${contentInfo.gradient})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'left bottom',
            }}
            transition={{ duration: 1 }}
          >
            {link.title}
          </motion.h3>

          {/* Description */}
          {link.description && (
            <motion.p
              className="text-gray-600 text-sm mb-4 line-clamp-2"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: isHovered ? 1 : 0.7 }}
            >
              {link.description}
            </motion.p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <motion.div
              className="flex items-center space-x-2"
              animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${contentInfo.gradient}`} />
              <span className="text-xs font-medium text-gray-500">{contentInfo.platform}</span>
            </motion.div>

            <motion.div
              className="flex items-center space-x-1 text-green-500"
              animate={{ 
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-xs font-medium">Live</span>
            </motion.div>
          </div>
        </div>

        {/* Effet de brillance au clic */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              initial={{ x: '-100%', skewX: -15 }}
              animate={{ x: '200%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}