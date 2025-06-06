'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ExternalLink, Globe, Shield, Play, FileText, Instagram, Twitter, Github, Music, Sparkles, ArrowUpRight, Eye, Zap, Star } from 'lucide-react'

interface UltraElegantLinkCardProps {
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

export default function UltraElegantLinkCard({ link, onClick, isClicked = false }: UltraElegantLinkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]))
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]))

  // Déterminer le type de contenu avec des styles premium
  const getContentInfo = () => {
    const url = link.url.toLowerCase()
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return {
        type: 'video',
        icon: <Play className="w-6 h-6" />,
        primaryGradient: 'from-red-500 via-red-600 to-red-700',
        secondaryGradient: 'from-red-100 via-red-50 to-white',
        glowColor: 'shadow-red-500/30',
        accentColor: 'text-red-600',
        platform: 'YouTube',
        emoji: '🎬',
        particles: ['🔴', '▶️', '🎥']
      }
    }
    if (url.includes('instagram.com')) {
      return {
        type: 'social',
        icon: <Instagram className="w-6 h-6" />,
        primaryGradient: 'from-purple-500 via-pink-500 to-orange-500',
        secondaryGradient: 'from-purple-100 via-pink-50 to-orange-50',
        glowColor: 'shadow-purple-500/30',
        accentColor: 'text-purple-600',
        platform: 'Instagram',
        emoji: '📸',
        particles: ['💜', '📷', '✨']
      }
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return {
        type: 'social',
        icon: <Twitter className="w-6 h-6" />,
        primaryGradient: 'from-sky-400 via-sky-500 to-blue-600',
        secondaryGradient: 'from-sky-100 via-sky-50 to-blue-50',
        glowColor: 'shadow-sky-500/30',
        accentColor: 'text-sky-600',
        platform: 'X',
        emoji: '🐦',
        particles: ['🐦', '💙', '🌊']
      }
    }
    if (url.includes('github.com')) {
      return {
        type: 'code',
        icon: <Github className="w-6 h-6" />,
        primaryGradient: 'from-gray-600 via-gray-700 to-gray-900',
        secondaryGradient: 'from-gray-100 via-gray-50 to-white',
        glowColor: 'shadow-gray-500/30',
        accentColor: 'text-gray-700',
        platform: 'GitHub',
        emoji: '💻',
        particles: ['⚡', '🔧', '📦']
      }
    }
    if (url.includes('spotify.com')) {
      return {
        type: 'music',
        icon: <Music className="w-6 h-6" />,
        primaryGradient: 'from-green-400 via-green-500 to-green-600',
        secondaryGradient: 'from-green-100 via-green-50 to-white',
        glowColor: 'shadow-green-500/30',
        accentColor: 'text-green-600',
        platform: 'Spotify',
        emoji: '🎵',
        particles: ['🎵', '🎶', '💚']
      }
    }
    
    return {
      type: 'website',
      icon: <Globe className="w-6 h-6" />,
      primaryGradient: 'from-blue-500 via-purple-500 to-pink-500',
      secondaryGradient: 'from-blue-100 via-purple-50 to-pink-50',
      glowColor: 'shadow-blue-500/30',
      accentColor: 'text-blue-600',
      platform: new URL(link.url).hostname,
      emoji: '🌐',
      particles: ['🌟', '✨', '🔮']
    }
  }

  const contentInfo = getContentInfo()

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
    
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleClick = () => {
    onClick()
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative group perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Particules magiques */}
      <AnimatePresence>
        {isHovered && (
          <>
            {contentInfo.particles.map((particle, index) => (
              <motion.div
                key={index}
                className="absolute pointer-events-none text-lg z-30"
                style={{
                  left: `${20 + index * 25}%`,
                  top: `${10 + index * 15}%`,
                }}
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.2, 0],
                  rotate: [0, 360],
                  y: [-20, -60]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: index * 0.2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                {particle}
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Effet de halo dynamique */}
      <motion.div
        className={`absolute -inset-1 rounded-3xl blur-xl ${contentInfo.glowColor} opacity-0 group-hover:opacity-70 transition-opacity duration-500`}
        animate={isHovered ? {
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.7, 0.3]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Carte principale avec effet 3D */}
      <motion.div
        onClick={handleClick}
        className={`relative overflow-hidden bg-gradient-to-br ${contentInfo.secondaryGradient} rounded-3xl cursor-pointer transition-all duration-500 backdrop-blur-xl border border-white/20 ${
          isClicked ? 'animate-pulse' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: isHovered 
            ? `0 30px 60px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)` 
            : `0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)`
        }}
      >
        {/* Effet de lumière suivant la souris */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(255, 255, 255, 0.8) 0%, transparent 70%)`
          }}
        />

        {/* Bordure gradient animée */}
        <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${contentInfo.primaryGradient} p-px opacity-50 group-hover:opacity-100 transition-opacity duration-300`}>
          <div className={`h-full w-full rounded-3xl bg-gradient-to-br ${contentInfo.secondaryGradient}`} />
        </div>

        {/* Contenu de la carte */}
        <div className="relative p-8 h-full flex flex-col justify-between" style={{ transform: 'translateZ(50px)' }}>
          {/* Header avec icônes */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              className="flex items-center space-x-4"
              animate={isHovered ? { x: [0, 3, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              {/* Emoji principal */}
              <motion.div
                className="text-4xl filter drop-shadow-lg"
                animate={isHovered ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.8 }}
                style={{ transform: 'translateZ(20px)' }}
              >
                {link.icon || contentInfo.emoji}
              </motion.div>
              
              {/* Icône de la plateforme */}
              <motion.div
                className={`p-3 rounded-2xl bg-gradient-to-br ${contentInfo.primaryGradient} text-white shadow-xl`}
                animate={isHovered ? { rotateY: 360 } : {}}
                transition={{ duration: 1 }}
                style={{ transform: 'translateZ(30px)' }}
              >
                {contentInfo.icon}
              </motion.div>
            </motion.div>

            {/* Indicateur interactif */}
            <motion.div
              className="flex items-center space-x-2"
              animate={isHovered ? { x: [0, 5, 0] } : {}}
              transition={{ duration: 0.4 }}
              style={{ transform: 'translateZ(20px)' }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <ArrowUpRight className={`w-6 h-6 ${contentInfo.accentColor}`} />
              </motion.div>
            </motion.div>
          </div>

          {/* Titre principal */}
          <motion.div
            className="mb-4"
            style={{ transform: 'translateZ(40px)' }}
          >
            <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
              {link.title}
            </h3>
            
            {/* Barre de soulignement animée */}
            <motion.div
              className={`h-1 bg-gradient-to-r ${contentInfo.primaryGradient} rounded-full`}
              initial={{ width: '0%' }}
              animate={{ width: isHovered ? '100%' : '30%' }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>

          {/* Description */}
          {link.description && (
            <motion.p
              className="text-gray-600 text-base leading-relaxed mb-6 line-clamp-2"
              style={{ transform: 'translateZ(30px)' }}
              animate={{ opacity: isHovered ? 1 : 0.8 }}
            >
              {link.description}
            </motion.p>
          )}

          {/* Footer avec statistiques */}
          <motion.div
            className="flex items-center justify-between pt-4 border-t border-gray-200/50"
            style={{ transform: 'translateZ(20px)' }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                className={`w-3 h-3 rounded-full bg-gradient-to-r ${contentInfo.primaryGradient}`}
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

            {/* Badge "Live" animé */}
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
          </motion.div>
        </div>

        {/* Effet de brillance au clic */}
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