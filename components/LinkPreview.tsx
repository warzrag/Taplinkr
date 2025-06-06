'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Globe, Image as ImageIcon, FileText, Shield } from 'lucide-react'

interface LinkPreviewProps {
  link: {
    id: string
    title: string
    url: string
    description?: string | null
    imageUrl?: string | null
    slug: string
    isProtected?: boolean
  }
  children: React.ReactNode
}

export default function LinkPreview({ link, children }: LinkPreviewProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [previewSide, setPreviewSide] = useState<'left' | 'right'>('right')

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const spaceOnRight = window.innerWidth - rect.right
    const spaceOnLeft = rect.left
    
    // Déterminer de quel côté afficher l'aperçu
    if (spaceOnRight < 400 && spaceOnLeft > 400) {
      setPreviewSide('left')
      setPosition({
        x: rect.left - 10,
        y: rect.top + window.scrollY
      })
    } else {
      setPreviewSide('right')
      setPosition({
        x: rect.right + 10,
        y: rect.top + window.scrollY
      })
    }
    
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  // Déterminer le type de contenu
  const getContentType = () => {
    if (link.imageUrl) return 'image'
    if (link.url.includes('youtube.com') || link.url.includes('youtu.be')) return 'video'
    if (link.url.endsWith('.pdf')) return 'pdf'
    return 'website'
  }

  const contentType = getContentType()

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: position.y,
              [previewSide]: previewSide === 'left' 
                ? window.innerWidth - position.x 
                : window.innerWidth - position.x - 380,
              zIndex: 9999,
            }}
            className="pointer-events-none"
          >
            <div className="w-96 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              {/* Header avec effet gradient */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 overflow-hidden">
                {link.imageUrl ? (
                  <img
                    src={link.imageUrl}
                    alt={link.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                      {contentType === 'video' && (
                        <div className="relative bg-red-500 text-white p-4 rounded-full">
                          <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                      )}
                      {contentType === 'pdf' && (
                        <FileText className="w-16 h-16 text-red-500 relative" />
                      )}
                      {contentType === 'website' && (
                        <Globe className="w-16 h-16 text-blue-500 relative" />
                      )}
                      {contentType === 'image' && (
                        <ImageIcon className="w-16 h-16 text-green-500 relative" />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Protection badge */}
                {link.isProtected && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span className="text-xs font-medium">Protégé</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {link.title}
                </h3>
                
                {link.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {link.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-xs truncate max-w-[200px]">
                      {new URL(link.url).hostname}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    /{link.slug}
                  </div>
                </div>

                {/* Live preview indicator */}
                <div className="mt-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Aperçu en direct
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}