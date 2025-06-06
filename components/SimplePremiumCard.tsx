'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Globe, Shield, Play, FileText, Instagram, Twitter, Github, Music, Sparkles, ArrowUpRight, Star } from 'lucide-react'

interface SimplePremiumCardProps {
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

export default function SimplePremiumCard({ link, onClick, isClicked = false }: SimplePremiumCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Déterminer le type de contenu avec des styles premium
  const getContentInfo = () => {
    const url = link.url.toLowerCase()
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return {
        type: 'video',
        icon: <Play className="w-5 h-5" />,
        gradient: 'from-red-500 to-red-600',
        bgGradient: 'from-red-50 to-red-100',
        textColor: 'text-red-600',
        platform: 'YouTube',
        emoji: '🎬'
      }
    }
    if (url.includes('instagram.com')) {
      return {
        type: 'social',
        icon: <Instagram className="w-5 h-5" />,
        gradient: 'from-purple-500 via-pink-500 to-orange-500',
        bgGradient: 'from-purple-50 to-pink-100',
        textColor: 'text-purple-600',
        platform: 'Instagram',
        emoji: '📸'
      }
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return {
        type: 'social',
        icon: <Twitter className="w-5 h-5" />,
        gradient: 'from-sky-400 to-blue-600',
        bgGradient: 'from-sky-50 to-blue-100',
        textColor: 'text-sky-600',
        platform: 'X',
        emoji: '🐦'
      }
    }
    if (url.includes('github.com')) {
      return {
        type: 'code',
        icon: <Github className="w-5 h-5" />,
        gradient: 'from-gray-600 to-gray-900',
        bgGradient: 'from-gray-50 to-gray-100',
        textColor: 'text-gray-700',
        platform: 'GitHub',
        emoji: '💻'
      }
    }
    if (url.includes('spotify.com')) {
      return {
        type: 'music',
        icon: <Music className="w-5 h-5" />,
        gradient: 'from-green-400 to-green-600',
        bgGradient: 'from-green-50 to-green-100',
        textColor: 'text-green-600',
        platform: 'Spotify',
        emoji: '🎵'
      }
    }
    
    return {
      type: 'website',
      icon: <Globe className="w-5 h-5" />,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-100',
      textColor: 'text-blue-600',
      platform: new URL(link.url).hostname,
      emoji: '🌐'
    }
  }

  const contentInfo = getContentInfo()

  return (
    <motion.div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.03,
        y: -8
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
        className={`absolute -inset-1 rounded-3xl blur-xl bg-gradient-to-r ${contentInfo.gradient} opacity-0 group-hover:opacity-30 transition-all duration-500`}
        animate={isHovered ? {
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Sparkles */}
      <AnimatePresence>
        {isHovered && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute pointer-events-none z-30 text-yellow-400"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${10 + i * 10}%`,
                }}
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 360],
                  y: [-10, -30]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main card */}
      <motion.div
        onClick={onClick}
        className={`relative overflow-hidden bg-white rounded-3xl cursor-pointer transition-all duration-300 ${
          isClicked ? 'animate-pulse' : ''
        }`}
        style={{
          boxShadow: isHovered 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${contentInfo.bgGradient} opacity-50`} />
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={isHovered ? { x: '200%' } : {}}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Border gradient */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${contentInfo.gradient} p-px opacity-20 group-hover:opacity-60 transition-opacity duration-300`}>
          <div className="h-full w-full rounded-3xl bg-white" />
        </div>

        {/* Content */}
        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Emoji */}
              <motion.div
                className="text-4xl filter drop-shadow-lg"
                animate={isHovered ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.8 }}
              >
                {link.icon || contentInfo.emoji}
              </motion.div>
              
              {/* Platform icon */}
              <motion.div
                className={`p-3 rounded-2xl bg-gradient-to-br ${contentInfo.gradient} text-white shadow-lg`}
                animate={isHovered ? { rotateY: [0, 180, 360] } : {}}
                transition={{ duration: 1 }}
              >
                {contentInfo.icon}
              </motion.div>
            </div>

            <motion.div
              className="flex items-center space-x-2"
              animate={isHovered ? { x: [0, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <ArrowUpRight className={`w-6 h-6 ${contentInfo.textColor}`} />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h3
            className="text-2xl font-bold text-gray-900 leading-tight mb-3"
            animate={isHovered ? { 
              color: contentInfo.textColor.replace('text-', '#')
            } : {}}
          >
            {link.title}
          </motion.h3>

          {/* Underline */}
          <motion.div
            className={`h-1 bg-gradient-to-r ${contentInfo.gradient} rounded-full mb-4`}
            initial={{ width: '30%' }}
            animate={{ width: isHovered ? '100%' : '30%' }}
            transition={{ duration: 0.5 }}
          />

          {/* Description */}
          {link.description && (
            <p className="text-gray-600 text-base leading-relaxed mb-6 line-clamp-2">
              {link.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
            <div className="flex items-center space-x-3">
              <motion.div
                className={`w-3 h-3 rounded-full bg-gradient-to-r ${contentInfo.gradient}`}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">{contentInfo.platform}</p>
                <p className="text-xs text-gray-500">Lien premium</p>
              </div>
            </div>

            {/* Live badge */}
            <motion.div
              className="flex items-center space-x-2 bg-gradient-to-r from-green-400 to-green-600 text-white px-3 py-1.5 rounded-full shadow-lg"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(34, 197, 94, 0.4)',
                  '0 0 0 8px rgba(34, 197, 94, 0)',
                  '0 0 0 0 rgba(34, 197, 94, 0)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
              <span className="text-xs font-bold">LIVE</span>
            </motion.div>
          </div>
        </div>

        {/* Click effect */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
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