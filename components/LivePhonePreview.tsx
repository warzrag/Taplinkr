'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, Twitter, MessageCircle, Globe, ExternalLink } from 'lucide-react'

interface LivePhonePreviewProps {
  user?: {
    name?: string
    username?: string
    image?: string
    bio?: string
  }
  links?: Array<{
    id: string
    title: string
    url?: string
    slug?: string
    description?: string
    icon?: string
    color?: string
    coverImage?: string
    profileImage?: string
    fontFamily?: string
    borderRadius?: string
    backgroundColor?: string
    textColor?: string
    isActive: boolean
    multiLinks?: Array<{
      id?: string
      title: string
      url: string
      icon?: string
      description?: string
      order?: number
      clicks?: number
      createdAt?: string
      updatedAt?: string
    }>
  }>
}

export default function LivePhonePreview({ user, links = [] }: LivePhonePreviewProps) {
  // Fonction pour obtenir la classe CSS de la police
  const getFontClass = (fontFamily?: string) => {
    const fontMap: { [key: string]: string } = {
      'system': 'font-sans',
      'inter': 'font-inter',
      'roboto': 'font-roboto', 
      'poppins': 'font-poppins',
      'montserrat': 'font-montserrat',
      'playfair': 'font-playfair',
      'mono': 'font-mono'
    }
    return fontMap[fontFamily || 'system'] || 'font-sans'
  }

  // Fonction pour obtenir la classe CSS du border radius
  const getBorderRadiusClass = (borderRadius?: string) => {
    return borderRadius || 'rounded-2xl'
  }

  // Pour l'édition, on affiche tous les liens (actifs ou non)
  const displayableLinks = links

  // Créer les liens pour l'affichage
  const displayLinks = displayableLinks.flatMap(link => {
    if (link.multiLinks && link.multiLinks.length > 0) {
      return link.multiLinks.map((multiLink, index) => ({
        id: `${link.id}-${index}`,
        title: multiLink.title,
        url: multiLink.url,
        icon: multiLink.icon || link.icon,
        description: null,
        isActive: link.isActive,
        coverImage: link.coverImage,
        fontFamily: link.fontFamily,
        borderRadius: link.borderRadius,
        backgroundColor: link.backgroundColor,
        textColor: link.textColor
      }))
    } else {
      return [{
        id: link.id,
        title: link.title,
        url: link.url || '#',
        icon: link.icon,
        description: link.description,
        isActive: link.isActive,
        coverImage: link.coverImage,
        fontFamily: link.fontFamily,
        borderRadius: link.borderRadius,
        backgroundColor: link.backgroundColor,
        textColor: link.textColor
      }]
    }
  }).slice(0, 4) // Limiter à 4 liens max pour l'affichage

  return (
    <div className="w-full xl:w-80 p-8 flex items-center justify-center h-full relative z-10"
    >
      <div className="relative">
        {/* iPhone Frame */}
        <div className="w-[300px] h-[620px] bg-gradient-to-b from-gray-700 to-gray-800 rounded-[40px] p-2 shadow-2xl border border-gray-600">
          {/* Camera Notch */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-full z-30 flex items-center justify-center">
            <div className="w-12 h-3 bg-gray-700 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
              <div className="w-6 h-1 bg-gray-600 rounded-full"></div>
            </div>
          </div>
          
          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[32px] overflow-hidden relative border border-gray-200">
            {/* Status Bar */}
            <div className="absolute top-8 left-0 right-0 h-8 flex items-center justify-between px-6 text-white text-xs z-20">
              <div className="flex items-center space-x-1">
                <span className="font-semibold">9:41</span>
                <div className="flex items-center ml-2">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                  <div className="w-2 h-1 bg-black rounded-full ml-1"></div>
                  <div className="w-3 h-1 bg-black rounded-full ml-1"></div>
                  <div className="w-3 h-1 bg-black rounded-full ml-1"></div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                  <path d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48L3.3 14.43l1.55.27.85-1.48zm3.7-6.42L8 5.05l1.15 1.48L10.7 5.8l-.85 1.48L11.4 8.76 10.25 10.24 8 8zm8 0L16 5.05l1.15 1.48L18.7 5.8l-.85 1.48L19.4 8.76 18.25 10.24 16 8zm3.7 6.42L20 11.47l.85 1.48 1.55-.27-.85 1.48 1.55.27L21.7 15.9 20 14.43z"/>
                </svg>
                <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                  <path d="M15.67 4H14V2c0-1.1-.9-2-2-2s-2 .9-2 2v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
                </svg>
              </div>
            </div>

            {/* Background Image */}
            <div className="absolute inset-0">
              {/* Priorité : image de couverture du lien, puis image utilisateur, puis dégradé */}
              {displayableLinks[0]?.coverImage ? (
                <img
                  src={displayableLinks[0].coverImage}
                  alt="Cover Image"
                  className="w-full h-full object-cover"
                />
              ) : user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.username || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500" />
              )}
              {/* No overlay - full image brightness */}
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col p-6 pt-20">
              {/* Profile Info - En haut */}
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                className="text-center mb-6"
              >
                {/* Photo de profil */}
                {(displayableLinks[0]?.profileImage || user?.image) && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={displayableLinks[0]?.profileImage || user?.image}
                      alt="Profile"
                      className="w-24 h-24 object-cover rounded-full shadow-lg"
                    />
                  </div>
                )}
                
                <h1 className="text-white text-2xl font-bold mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {displayableLinks[0]?.title || user?.name || user?.username || 'Laura'}
                </h1>
                {(displayableLinks[0]?.description || user?.bio || 'gratuit pour les prochaines 24h') && (
                  <p className="text-white/95 text-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                    {displayableLinks[0]?.description || user?.bio || 'gratuit pour les prochaines 24h'}
                  </p>
                )}
                
                {/* Instagram handle */}
                <div className="flex items-center justify-center mt-2">
                  <Instagram className="w-4 h-4 text-white mr-1" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
                  <span className="text-white/95 text-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>@{user?.username || 'laura'}</span>
                </div>
              </motion.div>

              {/* Links - Au centre/bas */}
              <div className="flex-1 flex flex-col justify-center space-y-3">
                <AnimatePresence mode="wait">
                  {displayLinks.length > 0 ? (
                    displayLinks.map((link, index) => (
                      <motion.div
                        key={link.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`backdrop-blur-md p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                          getBorderRadiusClass(link.borderRadius)} ${
                          link.isActive !== false ? '' : 'opacity-60'
                        } ${getFontClass(link.fontFamily)}`}
                        style={{
                          backgroundColor: link.backgroundColor || (link.isActive !== false ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)'),
                          color: link.textColor || '#1f2937'
                        }}
                      >
                        <div className="flex items-center">
                          {/* Icon */}
                          <div className="mr-3 text-2xl">
                            {link.icon || '🔗'}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="font-bold text-sm" style={{ color: 'inherit' }}>
                              {link.title}
                            </h3>
                            {link.description && (
                              <p className="text-xs mt-1 opacity-80" style={{ color: 'inherit' }}>
                                {link.description}
                              </p>
                            )}
                          </div>

                          {/* Arrow */}
                          <ExternalLink className="w-4 h-4 opacity-60" style={{ color: 'inherit' }} />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/90 backdrop-blur-md rounded-2xl p-4 text-center"
                    >
                      <div className="text-4xl mb-2">🔗</div>
                      <p className="text-gray-600 text-sm">
                        Aucun lien actif
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Créez un lien pour le voir ici
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <motion.div
                className="mt-6 flex items-center justify-center"
              >
                <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-900 rounded-full" />
                  </div>
                  <span className="text-white text-xs font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>LinkTracker</span>
                </div>
              </motion.div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full" />
            
            {/* Side Buttons */}
            <div className="absolute left-0 top-20 w-1 h-8 bg-gray-600 rounded-r-full"></div>
            <div className="absolute left-0 top-32 w-1 h-12 bg-gray-600 rounded-r-full"></div>
            <div className="absolute left-0 top-48 w-1 h-12 bg-gray-600 rounded-r-full"></div>
            
            {/* Right side button */}
            <div className="absolute right-0 top-28 w-1 h-16 bg-gray-600 rounded-l-full"></div>
          </div>
        </div>


        {/* Live indicator */}
        <motion.div
          className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 z-10"
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
          <span>LIVE</span>
        </motion.div>
      </div>
    </div>
  )
}