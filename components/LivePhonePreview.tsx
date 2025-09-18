'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, Twitter, MessageCircle, Globe, Youtube } from 'lucide-react'

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
    isDirect?: boolean
    directUrl?: string
    animation?: string
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

  const getBorderRadiusClass = (borderRadius?: string) => {
    return borderRadius || 'rounded-2xl'
  }

  const displayableLinks = links || []

  const getAnimationVariants = (animationType?: string) => {
    switch (animationType) {
      case 'pulse':
        return {
          animate: {
            scale: [0.9, 1.05, 0.9],
            transition: {
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        }
      case 'rotate':
        return {
          animate: {
            rotate: [0, 5, -5, 0],
            scale: [1, 1.02, 1.02, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        }
      case 'shake':
        return {
          animate: {
            x: [0, -4, 4, -4, 4, 0],
            transition: {
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut'
            }
          }
        }
      case 'bounce':
        return {
          animate: {
            y: [0, -10, 0],
            transition: {
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        }
      case 'glow':
        return {
          animate: {
            boxShadow: [
              '0 0 20px rgba(59, 130, 246, 0.0)',
              '0 0 20px rgba(59, 130, 246, 0.8)',
              '0 0 20px rgba(59, 130, 246, 0.0)'
            ],
            transition: {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }
        }
      default:
        return {}
    }
  }

  const firstLink = displayableLinks[0]
  const backgroundColor = firstLink?.backgroundColor || '#ffffff'
  const textColor = firstLink?.textColor || '#1F2937'
  const fontClass = getFontClass(firstLink?.fontFamily)
  const borderRadiusClass = getBorderRadiusClass(firstLink?.borderRadius)

  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const timeString = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const multiLinks = displayableLinks.flatMap(link => {
    if (link.multiLinks && link.multiLinks.length > 0) {
      return link.multiLinks.map(ml => ({
        title: ml.title,
        url: ml.url,
        animation: ml.animation || link.animation,
        parentTitle: link.title
      }))
    } else if (link.isDirect && link.directUrl) {
      return [{
        title: link.title,
        url: link.directUrl,
        animation: link.animation
      }]
    }
    return []
  }).slice(0, 4)

  return (
    <div className="flex items-center justify-center p-4 transform scale-90 xl:scale-100 2xl:scale-110" style={{ transformOrigin: 'center top' }}>
      <div className="relative transform hover:scale-[1.02] transition-transform duration-500 ease-out">
        {/* Reflet lumineux */}
        <div className="absolute -inset-4 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[44px] pointer-events-none" />

        {/* iPhone Frame avec design moderne */}
        <div className="w-[320px] h-[650px] bg-gradient-to-b from-gray-800 via-gray-900 to-black rounded-[44px] p-[3px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-gray-700/50 relative">
          {/* Reflet métallique */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-[44px] pointer-events-none" />

          {/* Dynamic Island moderne */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black rounded-full z-30 flex items-center justify-center shadow-inner">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
            <div className="text-[10px] text-gray-400 font-medium tracking-wider">LIVE PREVIEW</div>
          </div>

          {/* Screen */}
          <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative" style={{ backgroundColor }}>
            {/* Cover Image */}
            {firstLink?.coverImage && (
              <div
                className="absolute top-0 left-0 right-0 h-48 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${firstLink.coverImage})`,
                  backgroundPosition: firstLink.coverImagePosition || 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
              </div>
            )}

            {/* Status Bar */}
            <div className="absolute top-1 left-0 right-0 z-20 flex justify-between items-center px-6 py-1 text-xs" style={{ color: firstLink?.coverImage ? '#ffffff' : textColor }}>
              <span className="font-medium">{timeString}</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-[2px]">
                  <div className="w-[3px] h-[10px] bg-current rounded-[1px] opacity-40"></div>
                  <div className="w-[3px] h-[10px] bg-current rounded-[1px] opacity-60"></div>
                  <div className="w-[3px] h-[10px] bg-current rounded-[1px] opacity-80"></div>
                  <div className="w-[3px] h-[10px] bg-current rounded-[1px]"></div>
                </div>
                <span className="ml-1 text-current">5G</span>
                <div className="ml-1 w-5 h-3 border border-current rounded-sm relative">
                  <div className="absolute inset-0.5 bg-current rounded-[1px]"></div>
                  <div className="absolute -right-0.5 top-1 w-[1px] h-1 bg-current"></div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className={`relative z-10 h-full flex flex-col ${firstLink?.coverImage ? 'pt-32' : 'pt-20'} pb-20 px-6 ${fontClass}`}>
              {/* Profile */}
              <div className="flex flex-col items-center mb-6">
                {(firstLink?.profileImage || user?.image) && (
                  <div className="relative mb-4">
                    <img
                      src={firstLink?.profileImage || user?.image}
                      alt={firstLink?.title || user?.name || 'Profile'}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-xl"
                    />
                    {firstLink?.isOnline && (
                      <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white"></div>
                    )}
                  </div>
                )}

                <h1 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
                  {firstLink?.title || user?.name || 'Nom'}
                </h1>

                {(firstLink?.city || firstLink?.country) && (
                  <p className="text-sm opacity-70 mb-2" style={{ color: textColor }}>
                    📍 {[firstLink?.city, firstLink?.country].filter(Boolean).join(', ')}
                  </p>
                )}

                {(firstLink?.description || user?.bio) && (
                  <p className="text-sm text-center opacity-80" style={{ color: textColor }}>
                    {firstLink?.description || user?.bio}
                  </p>
                )}

                {/* Social Icons */}
                {(firstLink?.instagramUrl || firstLink?.tiktokUrl || firstLink?.twitterUrl || firstLink?.youtubeUrl) && (
                  <div className="flex gap-4 mt-4">
                    {firstLink?.instagramUrl && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {firstLink?.tiktokUrl && (
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {firstLink?.twitterUrl && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <Twitter className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {firstLink?.youtubeUrl && (
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                        <Youtube className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide">
                <AnimatePresence mode="sync">
                  {multiLinks.map((link, index) => (
                    <motion.div
                      key={`${link.title}-${index}`}
                      className={`w-full py-4 px-4 ${borderRadiusClass} transition-all duration-200 hover:scale-[1.02] cursor-pointer relative overflow-hidden`}
                      style={{
                        backgroundColor: textColor + '10',
                        color: textColor,
                        border: `1px solid ${textColor}20`
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      {...getAnimationVariants(link.animation)}
                    >
                      <p className="text-sm font-medium text-center">{link.title}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full" />
          </div>

          {/* Side Buttons */}
          <div className="absolute left-0 top-20 w-1 h-8 bg-gray-600 rounded-r-full"></div>
          <div className="absolute left-0 top-32 w-1 h-12 bg-gray-600 rounded-r-full"></div>
          <div className="absolute left-0 top-48 w-1 h-12 bg-gray-600 rounded-r-full"></div>

          {/* Right side button */}
          <div className="absolute right-0 top-28 w-1 h-16 bg-gray-600 rounded-l-full"></div>
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