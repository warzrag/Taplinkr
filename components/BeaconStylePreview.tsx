'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, Twitter, MessageCircle, Globe, ExternalLink } from 'lucide-react'

interface BeaconStylePreviewProps {
  link: {
    title: string
    url: string
    description?: string | null
    imageUrl?: string | null
    isProtected?: boolean
  }
  user?: {
    name?: string
    username?: string
    image?: string
  }
  children: React.ReactNode
  showOnHover?: boolean
}

export default function BeaconStylePreview({ 
  link, 
  user, 
  children, 
  showOnHover = true 
}: BeaconStylePreviewProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)

  const calculatePosition = (e: React.MouseEvent) => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const previewWidth = 280
    const previewHeight = 500

    let newX = 0
    let newY = 0

    // Toujours à gauche en priorité
    const spaceLeft = rect.left
    const spaceRight = viewportWidth - rect.right
    
    if (spaceLeft >= previewWidth + 20) {
      // À gauche
      newX = rect.left - previewWidth - 20
    } else if (spaceRight >= previewWidth + 20) {
      // À droite si pas de place à gauche
      newX = rect.right + 20
    } else {
      // Centré si pas de place
      newX = Math.max(10, (viewportWidth - previewWidth) / 2)
    }
    
    // Centrer verticalement par rapport à l'élément
    newY = Math.max(10, Math.min(rect.top - 100, viewportHeight - previewHeight - 10))

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

  // Liens de démonstration basés sur l'image
  const demoLinks = [
    {
      title: 'MON ONLY FANS GRATUIT',
      platform: 'onlyfans',
      icon: '💎',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      title: 'MON TELEGRAM PRIVÉ',
      platform: 'telegram',
      icon: '✈️',
      gradient: 'from-gray-400 to-gray-600'
    },
    {
      title: 'Try for free!',
      platform: 'beacons',
      icon: '🔗',
      gradient: 'from-purple-400 to-purple-600'
    }
  ]

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
              className="fixed inset-0 z-40 pointer-events-none bg-black/5"
            />
            
            {/* Mobile Preview Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -50 }}
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
              {/* iPhone Frame */}
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-[280px] h-[500px] bg-black rounded-[30px] p-1 shadow-2xl">
                  {/* Screen */}
                  <div className="w-full h-full bg-gray-900 rounded-[26px] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center justify-between px-4 text-white text-xs z-20">
                      <span>9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-2 border border-white rounded-sm">
                          <div className="w-3 h-1 bg-white rounded-xs m-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Background Image */}
                    <div className="absolute inset-0">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={user.name || user.username || 'Profile'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500" />
                      )}
                      {/* Dark overlay */}
                      <div className="absolute inset-0 bg-black/40" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-6 pt-12">
                      {/* Profile Info */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-6"
                      >
                        <h1 className="text-white text-3xl font-bold mb-1 drop-shadow-lg">
                          {user?.name || user?.username || link.title}
                        </h1>
                        {link.description && (
                          <p className="text-white/90 text-sm drop-shadow-md">
                            {link.description}
                          </p>
                        )}
                        
                        {/* Instagram handle */}
                        <div className="flex items-center justify-center mt-2">
                          <Instagram className="w-4 h-4 text-white mr-1" />
                          <span className="text-white/90 text-sm">@{user?.username || 'laura'}</span>
                        </div>
                      </motion.div>

                      {/* Links */}
                      <div className="space-y-3">
                        {demoLinks.map((demoLink, index) => (
                          <motion.div
                            key={index}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={`bg-white/90 backdrop-blur-md rounded-2xl p-4 hover:bg-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
                          >
                            <div className="flex items-center">
                              {/* Icon */}
                              <div className="mr-3 text-2xl">
                                {demoLink.icon}
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-sm">
                                  {demoLink.title}
                                </h3>
                                {index < 2 && (
                                  <p className="text-gray-600 text-xs mt-1">
                                    {index === 0 ? '💝🔥' : '💝🔐'}
                                  </p>
                                )}
                              </div>

                              {/* Arrow */}
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Footer */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6 flex items-center justify-center"
                      >
                        <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center space-x-2">
                          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-900 rounded-full" />
                          </div>
                          <span className="text-white text-xs font-medium">Beacons</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Phone UI Elements */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full"
                    />
                  </div>
                </div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-[30px]"
                  animate={{ x: [-300, 300] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: 'easeInOut'
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}