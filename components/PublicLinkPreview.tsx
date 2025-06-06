'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Globe, Image as ImageIcon, FileText, Shield, Play, Download } from 'lucide-react'

interface PublicLinkPreviewProps {
  link: {
    title: string
    url: string
    description?: string | null
    imageUrl?: string | null
    isProtected?: boolean
  }
  children: React.ReactNode
  className?: string
  multiLinkId?: string
  onLinkClick?: (multiLinkId: string, url: string) => void
}

export default function PublicLinkPreview({ link, children, className = '', multiLinkId, onLinkClick }: PublicLinkPreviewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Déterminer le type de contenu
  const getContentType = () => {
    if (link.imageUrl) return 'image'
    if (link.url.includes('youtube.com') || link.url.includes('youtu.be')) return 'video'
    if (link.url.includes('instagram.com')) return 'instagram'
    if (link.url.includes('twitter.com') || link.url.includes('x.com')) return 'twitter'
    if (link.url.includes('linkedin.com')) return 'linkedin'
    if (link.url.includes('github.com')) return 'github'
    if (link.url.endsWith('.pdf')) return 'pdf'
    if (link.url.includes('spotify.com')) return 'spotify'
    return 'website'
  }

  const contentType = getContentType()

  const getIcon = () => {
    switch (contentType) {
      case 'video':
        return <Play className="w-8 h-8 text-red-500" />
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />
      case 'instagram':
        return <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">IG</div>
      case 'twitter':
        return <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">X</div>
      case 'linkedin':
        return <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">in</div>
      case 'github':
        return <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">GH</div>
      case 'spotify':
        return <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">♪</div>
      case 'image':
        return <ImageIcon className="w-8 h-8 text-green-500" />
      default:
        return <Globe className="w-8 h-8 text-blue-500" />
    }
  }

  const getGradient = () => {
    switch (contentType) {
      case 'video':
        return 'from-red-500/20 to-red-600/20'
      case 'instagram':
        return 'from-purple-500/20 to-pink-500/20'
      case 'twitter':
        return 'from-sky-500/20 to-blue-500/20'
      case 'linkedin':
        return 'from-blue-600/20 to-blue-700/20'
      case 'github':
        return 'from-gray-700/20 to-gray-900/20'
      case 'spotify':
        return 'from-green-500/20 to-green-600/20'
      default:
        return 'from-blue-500/20 to-purple-500/20'
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    
    // Utiliser la fonction de callback si fournie
    if (onLinkClick && multiLinkId) {
      setTimeout(() => {
        onLinkClick(multiLinkId, link.url)
        setIsLoading(false)
      }, 300)
    } else {
      // Comportement par défaut
      setTimeout(() => {
        window.open(link.url, '_blank', 'noopener,noreferrer')
        setIsLoading(false)
      }, 300)
    }
  }

  return (
    <div
      className={`group relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ 
          scale: 1.02,
          y: -2
        }}
        whileTap={{ 
          scale: 0.98
        }}
        transition={{ 
          duration: 0.2,
          ease: 'easeOut'
        }}
        onClick={handleClick}
        className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300"
      >
        {/* Header avec gradient dynamique */}
        <div className={`relative h-32 bg-gradient-to-br ${getGradient()} overflow-hidden`}>
          {link.imageUrl ? (
            <img
              src={link.imageUrl}
              alt={link.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative">
                <motion.div
                  animate={{ 
                    rotate: isHovered ? 360 : 0,
                    scale: isHovered ? 1.1 : 1
                  }}
                  transition={{ 
                    duration: 0.6,
                    ease: 'easeInOut'
                  }}
                >
                  {getIcon()}
                </motion.div>
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: -100, opacity: 0 }}
                  animate={isHovered ? { x: 100, opacity: 1 } : { x: -100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          )}
          
          {/* Overlay avec effet glassmorphism */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Badge de protection */}
          {link.isProtected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg flex items-center space-x-1"
            >
              <Shield className="w-3 h-3" />
              <span className="text-xs font-medium">Protégé</span>
            </motion.div>
          )}
          
          {/* Indicateur de chargement */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
            {link.title}
          </h3>
          
          {link.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
              {link.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs truncate max-w-[150px]">
                {new URL(link.url).hostname}
              </span>
            </div>
            
            <motion.div
              animate={{ 
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? 5 : 0
              }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          </div>
        </div>

        {/* Effet de brillance au survol */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={isHovered ? { x: '100%' } : { x: '-100%' }}
          transition={{ duration: 0.6 }}
        />
      </motion.div>

      {children}
    </div>
  )
}