'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Globe, Shield, Play, FileText, Instagram, Twitter, Github, Music, Eye } from 'lucide-react'

interface ElegantLinkPreviewProps {
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

export default function ElegantLinkPreview({ link, children, showOnHover = true }: ElegantLinkPreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [side, setSide] = useState<'left' | 'right' | 'top' | 'bottom'>('right')
  const triggerRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const calculatePosition = (e: React.MouseEvent) => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const previewWidth = 420
    const previewHeight = 300

    let newX = 0
    let newY = 0
    let newSide: 'left' | 'right' | 'top' | 'bottom' = 'right'

    // Toujours positionner à gauche en priorité
    const spaceLeft = rect.left
    const spaceRight = viewportWidth - rect.right
    const spaceBottom = viewportHeight - rect.bottom
    const spaceTop = rect.top

    if (spaceLeft >= previewWidth) {
      newSide = 'left'
      newX = rect.left - previewWidth - 20
      newY = Math.max(10, Math.min(rect.top - 50, viewportHeight - previewHeight - 10))
    } else if (spaceRight >= previewWidth) {
      newSide = 'right'
      newX = rect.right + 20
      newY = Math.max(10, Math.min(rect.top - 50, viewportHeight - previewHeight - 10))
    } else if (spaceBottom >= previewHeight) {
      newSide = 'bottom'
      newX = Math.max(10, Math.min(rect.left, viewportWidth - previewWidth - 10))
      newY = rect.bottom + 15
    } else {
      newSide = 'top'
      newX = Math.max(10, Math.min(rect.left, viewportWidth - previewWidth - 10))
      newY = rect.top - previewHeight - 15
    }

    setPosition({ x: newX, y: newY })
    setSide(newSide)
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

  // Déterminer le type de contenu et les couleurs
  const getContentInfo = () => {
    const url = link.url.toLowerCase()
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return {
        type: 'video',
        icon: <Play className="w-6 h-6" />,
        gradient: 'from-red-500 to-red-600',
        bgGradient: 'from-red-50 to-red-100',
        platform: 'YouTube'
      }
    }
    if (url.includes('instagram.com')) {
      return {
        type: 'social',
        icon: <Instagram className="w-6 h-6" />,
        gradient: 'from-purple-500 via-pink-500 to-orange-500',
        bgGradient: 'from-purple-50 to-pink-100',
        platform: 'Instagram'
      }
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return {
        type: 'social',
        icon: <Twitter className="w-6 h-6" />,
        gradient: 'from-sky-400 to-blue-600',
        bgGradient: 'from-sky-50 to-blue-100',
        platform: 'X (Twitter)'
      }
    }
    if (url.includes('github.com')) {
      return {
        type: 'code',
        icon: <Github className="w-6 h-6" />,
        gradient: 'from-gray-700 to-gray-900',
        bgGradient: 'from-gray-50 to-gray-100',
        platform: 'GitHub'
      }
    }
    if (url.includes('spotify.com')) {
      return {
        type: 'music',
        icon: <Music className="w-6 h-6" />,
        gradient: 'from-green-400 to-green-600',
        bgGradient: 'from-green-50 to-green-100',
        platform: 'Spotify'
      }
    }
    if (url.endsWith('.pdf')) {
      return {
        type: 'document',
        icon: <FileText className="w-6 h-6" />,
        gradient: 'from-red-500 to-red-600',
        bgGradient: 'from-red-50 to-red-100',
        platform: 'PDF'
      }
    }
    
    return {
      type: 'website',
      icon: <Globe className="w-6 h-6" />,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-100',
      platform: new URL(link.url).hostname
    }
  }

  const contentInfo = getContentInfo()

  const getAnimationVariants = () => {
    const distance = 20
    
    switch (side) {
      case 'left':
        return {
          initial: { opacity: 0, x: distance, scale: 0.9 },
          animate: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: distance, scale: 0.9 }
        }
      case 'right':
        return {
          initial: { opacity: 0, x: -distance, scale: 0.9 },
          animate: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: -distance, scale: 0.9 }
        }
      case 'top':
        return {
          initial: { opacity: 0, y: distance, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: distance, scale: 0.9 }
        }
      case 'bottom':
        return {
          initial: { opacity: 0, y: -distance, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -distance, scale: 0.9 }
        }
    }
  }

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
              className="fixed inset-0 z-40 pointer-events-none"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
            />
            
            {/* Preview Card */}
            <motion.div
              ref={previewRef}
              {...getAnimationVariants()}
              transition={{ 
                duration: 0.3, 
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
              <div className="w-[420px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                {/* Header avec effet gradient animé */}
                <div className={`relative h-48 bg-gradient-to-br ${contentInfo.bgGradient} overflow-hidden`}>
                  {/* Effet de particules flottantes */}
                  <div className="absolute inset-0">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [-10, -30, -10],
                          opacity: [0.3, 0.8, 0.3],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>

                  {/* Image ou icône */}
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
                        transition={{ delay: 0.2, duration: 0.5, ease: 'backOut' }}
                        className={`relative p-6 rounded-2xl bg-gradient-to-br ${contentInfo.gradient} text-white shadow-xl`}
                      >
                        <motion.div
                          animate={{ 
                            rotateY: [0, 360],
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear'
                          }}
                        >
                          {contentInfo.icon}
                        </motion.div>
                        
                        {/* Effet de brillance */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                          }}
                          animate={{ x: [-100, 200] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Badge de protection avec animation */}
                  {link.isProtected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                      className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Shield className="w-3.5 h-3.5" />
                      </motion.div>
                      <span className="text-xs font-medium">Protégé</span>
                    </motion.div>
                  )}
                </div>

                {/* Contenu avec animations décalées */}
                <div className="p-6 space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 flex-1">
                        {link.title}
                      </h3>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="ml-3 p-2 bg-blue-50 rounded-lg flex-shrink-0"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {link.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-600 text-sm leading-relaxed line-clamp-3"
                    >
                      {link.description}
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between pt-2 border-t border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${contentInfo.gradient}`} />
                      <div>
                        <p className="text-xs font-medium text-gray-900">{contentInfo.platform}</p>
                        <p className="text-xs text-gray-500">{new URL(link.url).hostname}</p>
                      </div>
                    </div>
                    
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
                      className="flex items-center space-x-1 text-green-500"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs font-medium">Aperçu live</span>
                    </motion.div>
                  </motion.div>

                  {/* Barre de progression animée */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full"
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