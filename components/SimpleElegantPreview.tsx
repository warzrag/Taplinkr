'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Globe, Shield, Play, FileText, Instagram, Twitter, Github, Music, Eye, Sparkles } from 'lucide-react'

interface SimpleElegantPreviewProps {
  link: {
    title: string
    url: string
    description?: string | null
    imageUrl?: string | null
    isProtected?: boolean
  }
  children: React.ReactNode
  showOnHover?: boolean
}

export default function SimpleElegantPreview({ link, children, showOnHover = true }: SimpleElegantPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  const calculatePosition = (e: React.MouseEvent) => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const previewWidth = 400
    const previewHeight = 280

    let newX = 0
    let newY = 0

    // Toujours à gauche en priorité
    const spaceLeft = rect.left
    const spaceRight = viewportWidth - rect.right

    if (spaceLeft >= previewWidth + 20) {
      // À gauche
      newX = rect.left - previewWidth - 20
      newY = Math.max(10, Math.min(rect.top - 40, viewportHeight - previewHeight - 10))
    } else if (spaceRight >= previewWidth + 20) {
      // À droite
      newX = rect.right + 20
      newY = Math.max(10, Math.min(rect.top - 40, viewportHeight - previewHeight - 10))
    } else {
      // En dessous
      newX = Math.max(10, Math.min(rect.left, viewportWidth - previewWidth - 10))
      newY = rect.bottom + 15
    }

    setPosition({ x: newX, y: newY })
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!showOnHover) return
    calculatePosition(e)
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    if (!showOnHover) return
    setIsVisible(false)
  }

  // Déterminer le type de contenu
  const getContentInfo = () => {
    const url = link.url.toLowerCase()
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return {
        icon: <Play className="w-6 h-6" />,
        gradient: 'from-red-500 to-red-600',
        bgGradient: 'from-red-50 to-red-100',
        platform: 'YouTube',
        emoji: '🎬'
      }
    }
    if (url.includes('instagram.com')) {
      return {
        icon: <Instagram className="w-6 h-6" />,
        gradient: 'from-purple-500 via-pink-500 to-orange-500',
        bgGradient: 'from-purple-50 to-pink-100',
        platform: 'Instagram',
        emoji: '📸'
      }
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return {
        icon: <Twitter className="w-6 h-6" />,
        gradient: 'from-sky-400 to-blue-600',
        bgGradient: 'from-sky-50 to-blue-100',
        platform: 'X',
        emoji: '🐦'
      }
    }
    if (url.includes('github.com')) {
      return {
        icon: <Github className="w-6 h-6" />,
        gradient: 'from-gray-600 to-gray-900',
        bgGradient: 'from-gray-50 to-gray-100',
        platform: 'GitHub',
        emoji: '💻'
      }
    }
    if (url.includes('spotify.com')) {
      return {
        icon: <Music className="w-6 h-6" />,
        gradient: 'from-green-400 to-green-600',
        bgGradient: 'from-green-50 to-green-100',
        platform: 'Spotify',
        emoji: '🎵'
      }
    }
    
    return {
      icon: <Globe className="w-6 h-6" />,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-100',
      platform: new URL(link.url).hostname,
      emoji: '🌐'
    }
  }

  const contentInfo = getContentInfo()

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block w-full"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 pointer-events-none bg-black/10"
            />
            
            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                duration: 0.2, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                zIndex: 50,
              }}
              className="pointer-events-none select-none"
            >
              <div className="w-[400px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
                {/* Header */}
                <div className={`relative h-40 bg-gradient-to-br ${contentInfo.bgGradient} overflow-hidden`}>
                  {/* Sparkles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white/40 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [-5, -20, -5],
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 1.5 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}

                  {/* Icon */}
                  <div className="relative z-10 h-full flex items-center justify-center">
                    {link.imageUrl ? (
                      <div className="relative w-full h-full">
                        <img
                          src={link.imageUrl}
                          alt={link.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
                        className="flex items-center space-x-4"
                      >
                        <div className="text-4xl">{contentInfo.emoji}</div>
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${contentInfo.gradient} text-white shadow-lg`}>
                          {contentInfo.icon}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Protection badge */}
                  {link.isProtected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-full flex items-center space-x-1"
                    >
                      <Shield className="w-3 h-3" />
                      <span className="text-xs font-medium">Protégé</span>
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start justify-between"
                  >
                    <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 flex-1">
                      {link.title}
                    </h3>
                    <div className="ml-3 p-2 bg-blue-50 rounded-lg">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </div>
                  </motion.div>

                  {link.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-600 text-sm leading-relaxed line-clamp-2"
                    >
                      {link.description}
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between pt-3 border-t border-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${contentInfo.gradient}`} />
                      <div>
                        <p className="text-xs font-medium text-gray-900">{contentInfo.platform}</p>
                        <p className="text-xs text-gray-500">{new URL(link.url).hostname}</p>
                      </div>
                    </div>
                    
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      className="flex items-center space-x-1 text-green-500"
                    >
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-xs font-medium">Aperçu</span>
                    </motion.div>
                  </motion.div>

                  {/* Progress bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className={`h-0.5 bg-gradient-to-r ${contentInfo.gradient} rounded-full`}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}