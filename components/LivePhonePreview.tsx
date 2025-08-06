'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, Twitter, MessageCircle, Globe, ExternalLink, Youtube } from 'lucide-react'

interface LivePhonePreviewProps {
  user?: {
    name?: string
    username?: string
    image?: string
    bio?: string
  }
  currentStep?: number
  links?: Array<{
    id: string
    title: string
    url?: string
    slug?: string
    description?: string
    icon?: string
    color?: string
    coverImage?: string
    coverImagePosition?: string
    profileImage?: string
    fontFamily?: string
    borderRadius?: string
    backgroundColor?: string
    textColor?: string
    isActive: boolean
    isOnline?: boolean
    city?: string
    country?: string
    instagramUrl?: string
    tiktokUrl?: string
    twitterUrl?: string
    youtubeUrl?: string
    multiLinks?: Array<{
      id?: string
      title: string
      url: string
      icon?: string
      iconImage?: string
      description?: string
      animation?: string
      order?: number
      clicks?: number
      createdAt?: string
      updatedAt?: string
    }>
  }>
}

export default function LivePhonePreview({ user, links = [], currentStep }: LivePhonePreviewProps) {
  // Debug
  console.log('LivePhonePreview - currentStep:', currentStep)
  console.log('LivePhonePreview - links[0]?.title:', links[0]?.title)
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

  // Fonction pour obtenir les animations Framer Motion
  const getAnimationVariants = (animationType?: string) => {
    switch (animationType) {
      case 'pulse':
        return {
          animate: {
            scale: [1, 1.02, 1],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatType: 'reverse'
            }
          }
        }
      case 'bounce':
        return {
          animate: {
            y: [0, -5, 0],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        }
      case 'shake':
        return {
          animate: {
            x: [0, -2, 2, -2, 2, 0],
            transition: {
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2
            }
          }
        }
      case 'wobble':
        return {
          animate: {
            rotate: [0, -2, 2, -2, 2, 0],
            transition: {
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        }
      case 'swing':
        return {
          animate: {
            rotate: [0, 15, -10, 5, -5, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        }
      case 'tada':
        return {
          animate: {
            scale: [1, 0.9, 1.1, 1.1, 1],
            rotate: [0, -3, 3, -3, 3, 0],
            transition: {
              duration: 1,
              repeat: Infinity,
              repeatDelay: 3
            }
          }
        }
      case 'flash':
        return {
          animate: {
            scale: [1, 1.1, 1],
            transition: {
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2
            }
          }
        }
      case 'rubberBand':
        return {
          animate: {
            scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1],
            scaleY: [1, 0.75, 1.25, 0.85, 1.05, 1],
            transition: {
              duration: 1,
              repeat: Infinity,
              repeatDelay: 3
            }
          }
        }
      default:
        return {}
    }
  }

  // Créer les liens pour l'affichage
  const displayLinks = displayableLinks.flatMap(link => {
    if (link.multiLinks && link.multiLinks.length > 0) {
      return link.multiLinks.map((multiLink, index) => ({
        id: `${link.id}-${index}`,
        title: multiLink.title,
        url: multiLink.url,
        icon: multiLink.icon || link.icon,
        iconImage: multiLink.iconImage,
        description: null,
        animation: multiLink.animation,
        isActive: link.isActive,
        coverImage: link.coverImage,
        coverImagePosition: link.coverImagePosition,
        fontFamily: link.fontFamily,
        borderRadius: link.borderRadius,
        backgroundColor: link.backgroundColor,
        textColor: link.textColor,
        isOnline: link.isOnline,
        city: link.city,
        country: link.country,
        instagramUrl: link.instagramUrl,
        tiktokUrl: link.tiktokUrl,
        twitterUrl: link.twitterUrl,
        youtubeUrl: link.youtubeUrl
      }))
    } else if (link.isDirect && link.directUrl) {
      // Pour les liens directs, on affiche seulement s'il y a une URL
      return [{
        id: link.id,
        title: link.title,
        url: link.directUrl,
        icon: link.icon,
        iconImage: undefined,
        description: link.description,
        animation: undefined,
        isActive: link.isActive,
        coverImage: link.coverImage,
        coverImagePosition: link.coverImagePosition,
        fontFamily: link.fontFamily,
        borderRadius: link.borderRadius,
        backgroundColor: link.backgroundColor,
        textColor: link.textColor,
        isOnline: link.isOnline,
        city: link.city,
        country: link.country,
        instagramUrl: link.instagramUrl,
        tiktokUrl: link.tiktokUrl,
        twitterUrl: link.twitterUrl,
        youtubeUrl: link.youtubeUrl
      }]
    } else {
      // Ne pas créer de lien si on n'a ni multiLinks ni directUrl
      return []
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
                <span className="font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>9:41</span>
                <div className="flex items-center ml-2">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-2 h-1 bg-white rounded-full ml-1"></div>
                  <div className="w-3 h-1 bg-white rounded-full ml-1"></div>
                  <div className="w-3 h-1 bg-white rounded-full ml-1"></div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48L3.3 14.43l1.55.27.85-1.48zm3.7-6.42L8 5.05l1.15 1.48L10.7 5.8l-.85 1.48L11.4 8.76 10.25 10.24 8 8zm8 0L16 5.05l1.15 1.48L18.7 5.8l-.85 1.48L19.4 8.76 18.25 10.24 16 8zm3.7 6.42L20 11.47l.85 1.48 1.55-.27-.85 1.48 1.55.27L21.7 15.9 20 14.43z"/>
                </svg>
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M15.67 4H14V2c0-1.1-.9-2-2-2s-2 .9-2 2v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
                </svg>
              </div>
            </div>

            {/* Background Image */}
            <div className="absolute inset-0">
              {/* Afficher uniquement l'image de couverture du lien si elle existe */}
              {links[0]?.coverImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={links[0].coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay gradient pour améliorer la lisibilité du texte */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500" />
              )}
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col p-6 pt-20">
              {/* Profile Info - En haut */}
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                className="text-center mb-6"
              >
                {/* Photo de profil */}
                {links[0]?.profileImage && links[0].profileImage !== '' && (
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <img
                        src={links[0].profileImage}
                        alt="Profile"
                        className="w-24 h-24 object-cover rounded-full shadow-lg"
                      />
                      {/* Indicateur en ligne discret à côté de la photo */}
                      {links[0]?.isOnline && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute bottom-1 right-1"
                        >
                          <div className="relative">
                            <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-md" />
                            <div className="absolute inset-0 w-6 h-6 bg-green-500 rounded-full animate-ping opacity-75" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Titre - s'affiche seulement à partir de l'étape 5 */}
                {(!currentStep || currentStep >= 5) && (
                  <h1 className="text-white text-2xl font-bold mb-1" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {links[0]?.title || user?.name || user?.username || 'Laura'}
                  </h1>
                )}
                {currentStep === 5 && !links[0]?.title && (
                  <p className="text-white/70 text-sm italic">En attente du titre...</p>
                )}
                
                {/* Description - s'affiche seulement à partir de l'étape 5 */}
                {(!currentStep || currentStep >= 5) && (links[0]?.description || user?.bio) && (
                  <p className="text-white/95 text-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                    {links[0]?.description || user?.bio}
                  </p>
                )}
                
                {/* Status en ligne et localisation - Design élégant */}
                <div className="mt-3 space-y-2">
                  {/* Status en ligne - seulement si pas de photo de profil */}
                  {links[0]?.isOnline && !links[0]?.profileImage && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-center"
                    >
                      <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-green-400 blur-xl opacity-40 animate-pulse" />
                        
                        {/* Main badge */}
                        <div className="relative bg-gradient-to-r from-green-400/90 to-emerald-400/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-white/20">
                          {/* Animated dot */}
                          <div className="relative">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            <div className="absolute inset-0 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                          </div>
                          <span className="text-white text-xs font-semibold tracking-wide uppercase">Live Now</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Localisation avec style moderne */}
                  {links[0]?.city && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex justify-center"
                    >
                      <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                        <svg className="w-3 h-3 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-white/90 text-xs font-medium">
                          {links[0].city}
                        </span>
                      </div>
                    </motion.div>
                  )}
                  
                </div>
              </motion.div>

              {/* Links - Au centre/bas */}
              <div className="flex-1 flex flex-col justify-center space-y-3">
                <AnimatePresence mode="wait">
                  {currentStep && currentStep < 5 ? (
                    /* Avant l'étape 4, on affiche un message d'attente ou rien */
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-full"
                    >
                      {currentStep === 1 && (
                        <div className="text-center">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="text-4xl mb-2"
                          >
                            ✨
                          </motion.div>
                          <p className="text-white/80 text-sm">
                            Commencez votre création...
                          </p>
                        </div>
                      )}
                      {currentStep === 2 && (
                        <div className="text-center">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-4xl mb-2"
                          >
                            📸
                          </motion.div>
                          <p className="text-white/80 text-sm">
                            Ajoutez votre photo...
                          </p>
                        </div>
                      )}
                      {currentStep === 3 && (
                        <div className="text-center">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-4xl mb-2"
                          >
                            🌐
                          </motion.div>
                          <p className="text-white/80 text-sm">
                            Connectez vos réseaux...
                          </p>
                        </div>
                      )}
                      {currentStep === 4 && (
                        <div className="text-center">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="text-4xl mb-2"
                          >
                            🎨
                          </motion.div>
                          <p className="text-white/80 text-sm">
                            Personnalisez vos liens...
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : displayLinks.length > 0 ? (
                    displayLinks.map((link, index) => {
                      const hasAnimation = link.animation && link.animation !== 'none'
                      const animationProps = hasAnimation ? getAnimationVariants(link.animation) : {}
                      
                      if (hasAnimation) {
                        return (
                          <motion.div
                            key={link.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <motion.div
                              animate={animationProps.animate}
                              transition={animationProps.animate?.transition}
                              className={`p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                                getBorderRadiusClass(link.borderRadius)} ${
                                link.isActive !== false ? '' : 'opacity-60'
                              } ${getFontClass(link.fontFamily)}`}
                              style={{
                                backgroundColor: link.backgroundColor || (link.isActive !== false ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)'),
                                color: link.textColor || '#1f2937'
                              }}
                            >
                        <div className="flex items-center">
                          {/* Icon */}
                          {link.iconImage && (
                            <div className="mr-3 flex-shrink-0">
                              <img
                                src={link.iconImage}
                                alt=""
                                className="w-12 h-12 object-cover rounded-xl"
                              />
                            </div>
                          )}

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
                          </motion.div>
                        )
                      } else {
                        return (
                          <motion.div
                            key={link.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${
                              getBorderRadiusClass(link.borderRadius)} ${
                              link.isActive !== false ? '' : 'opacity-60'
                            } ${getFontClass(link.fontFamily)}`}
                            style={{
                              backgroundColor: link.backgroundColor || (link.isActive !== false ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)'),
                              color: link.textColor || '#1f2937'
                            }}
                          >
                            <div className="flex items-center">
                              {/* Icon */}
                              <div className="mr-3 flex-shrink-0">
                                {link.iconImage ? (
                                  <img
                                    src={link.iconImage}
                                    alt=""
                                    className="w-8 h-8 object-cover rounded-lg"
                                  />
                                ) : (
                                  <span className="text-2xl">{link.icon || '🔗'}</span>
                                )}
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
                        )
                      }
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white/95 rounded-2xl p-4 text-center"
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

              {/* Social Media Icons */}
              {(links[0]?.instagramUrl || links[0]?.tiktokUrl || 
                links[0]?.twitterUrl || links[0]?.youtubeUrl) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 flex justify-center gap-4"
                >
                  {links[0]?.instagramUrl && (
                    <motion.a
                      href={links[0].instagramUrl.startsWith('@') 
                        ? `https://instagram.com/${links[0].instagramUrl.slice(1)}`
                        : links[0].instagramUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Instagram className="w-5 h-5 text-white" />
                    </motion.a>
                  )}
                  
                  {links[0]?.tiktokUrl && (
                    <motion.a
                      href={links[0].tiktokUrl.startsWith('@') 
                        ? `https://tiktok.com/${links[0].tiktokUrl.slice(1)}`
                        : links[0].tiktokUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </motion.a>
                  )}
                  
                  {links[0]?.twitterUrl && (
                    <motion.a
                      href={links[0].twitterUrl.startsWith('@') 
                        ? `https://twitter.com/${links[0].twitterUrl.slice(1)}`
                        : links[0].twitterUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Twitter className="w-5 h-5 text-white" />
                    </motion.a>
                  )}
                  
                  {links[0]?.youtubeUrl && (
                    <motion.a
                      href={links[0].youtubeUrl.startsWith('@') 
                        ? `https://youtube.com/${links[0].youtubeUrl.slice(1)}`
                        : links[0].youtubeUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white/30"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Youtube className="w-5 h-5 text-white" />
                    </motion.a>
                  )}
                </motion.div>
              )}

              {/* Footer */}
              <motion.div
                className="mt-6 flex items-center justify-center"
              >
                <div className="bg-white/25 rounded-full px-3 py-1 flex items-center space-x-2">
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