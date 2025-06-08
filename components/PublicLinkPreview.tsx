'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExternalLink, 
  Globe, 
  Image as ImageIcon, 
  FileText, 
  Shield, 
  Play, 
  Download,
  Heart,
  Share2,
  User,
  Calendar,
  Eye,
  Link2,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Sparkles
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface MultiLink {
  id: string
  title: string
  url: string
  description?: string | null
  icon?: string | null
  animation?: string | null
  order: number
  clicks: number
}

interface PublicLinkPreviewProps {
  link: {
    id: string
    slug: string
    title: string
    description?: string | null
    color?: string | null
    icon?: string | null
    coverImage?: string | null
    clicks: number
    isActive: boolean
    createdAt: string
    multiLinks: MultiLink[]
    user: {
      id: string
      username: string
      name?: string | null
      email?: string | null
      image?: string | null
      bio?: string | null
      bannerImage?: string | null
      theme?: string | null
      primaryColor?: string | null
      secondaryColor?: string | null
      backgroundImage?: string | null
      twitterUrl?: string | null
      instagramUrl?: string | null
      linkedinUrl?: string | null
      youtubeUrl?: string | null
      tiktokUrl?: string | null
    }
  }
}

export default function PublicLinkPreview({ link }: PublicLinkPreviewProps) {
  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set())

  const handleLinkClick = async (multiLinkId: string, url: string) => {
    setClickedLinks(prev => new Set(prev).add(multiLinkId))

    try {
      await fetch('/api/track-multilink-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ multiLinkId })
      })
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du clic:', error)
    }

    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer')
    }, 200)
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          text: link.description || undefined,
          url: url,
        })
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        toast.success('Lien copié dans le presse-papiers!')
      } catch (error) {
        toast.error('Impossible de copier le lien')
      }
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5" />
      case 'twitter':
        return <Twitter className="w-5 h-5" />
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />
      case 'youtube':
        return <Youtube className="w-5 h-5" />
      default:
        return <Globe className="w-5 h-5" />
    }
  }

  const getPlatformInfo = (url: string) => {
    if (url.includes('instagram.com')) return { name: 'Instagram', color: 'from-purple-500 to-pink-500', icon: 'instagram' }
    if (url.includes('twitter.com') || url.includes('x.com')) return { name: 'Twitter', color: 'from-blue-400 to-blue-600', icon: 'twitter' }
    if (url.includes('linkedin.com')) return { name: 'LinkedIn', color: 'from-blue-600 to-blue-800', icon: 'linkedin' }
    if (url.includes('youtube.com')) return { name: 'YouTube', color: 'from-red-500 to-red-700', icon: 'youtube' }
    if (url.includes('github.com')) return { name: 'GitHub', color: 'from-gray-700 to-gray-900', icon: 'github' }
    if (url.includes('spotify.com')) return { name: 'Spotify', color: 'from-green-400 to-green-600', icon: 'spotify' }
    if (url.includes('tiktok.com')) return { name: 'TikTok', color: 'from-black to-gray-800', icon: 'tiktok' }
    return { name: 'Website', color: 'from-blue-500 to-indigo-600', icon: 'website' }
  }

  // Fonction pour obtenir les animations Framer Motion
  const getAnimationVariants = (animationType?: string | null) => {
    switch (animationType) {
      case 'pulse':
        return {
          animate: {
            scale: [1, 1.05, 1.1, 1.05, 1, 0.9, 0.8, 0.7, 0.8, 0.9, 1],
            transition: {
              duration: 0.8,
              repeat: Infinity,
              ease: [0.23, 1, 0.32, 1],
              times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
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

  // Fonction pour obtenir la classe CSS du border radius
  const getBorderRadiusClass = (borderRadius?: string) => {
    return borderRadius || 'rounded-2xl'
  }

  const backgroundColor = link.user.primaryColor || '#1f2937'
  const accentColor = link.user.secondaryColor || '#3b82f6'

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        {link.coverImage ? (
          <img
            src={link.coverImage}
            alt={link.title}
            className="w-full h-full object-cover"
          />
        ) : link.user.backgroundImage ? (
          <img
            src={link.user.backgroundImage}
            alt="Background"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500" />
        )}
        {/* Light overlay for text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Profile Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          {/* Profile Image */}
          {link.user.image && (
            <div className="flex justify-center mb-4">
              <img
                src={link.user.image}
                alt={link.user.name || link.user.username}
                className="w-40 h-40 object-cover rounded-full shadow-lg"
              />
            </div>
          )}
          
          {/* User Bio */}
          {link.user.bio && (
            <p className="text-white/90 text-lg mb-4 drop-shadow-md max-w-md mx-auto">
              {link.user.bio}
            </p>
          )}
          
          {/* Instagram handle */}
          <div className="flex items-center justify-center">
            <Instagram className="w-4 h-4 text-white mr-1" />
            <span className="text-white/90 text-sm">@{link.user.username}</span>
          </div>
        </motion.div>

        {/* Links Section */}
        <div className="w-full max-w-sm space-y-4">
          {link.multiLinks.length > 0 ? (
            link.multiLinks.map((multiLink, index) => {
              const hasAnimation = multiLink.animation && multiLink.animation !== 'none'
              const animationProps = hasAnimation ? getAnimationVariants(multiLink.animation) : {}
              
              if (hasAnimation) {
                return (
                  <motion.div
                    key={multiLink.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.button
                      animate={animationProps.animate}
                      transition={animationProps.animate?.transition}
                      onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                      className={`w-full backdrop-blur-md p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${getBorderRadiusClass(link.borderRadius)}`}
                      style={{
                        backgroundColor: link.backgroundColor || multiLink.backgroundColor || 'rgba(255, 255, 255, 0.9)',
                        color: link.textColor || multiLink.textColor || '#1f2937'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                >
                <div className="flex items-center">
                  {/* Icon */}
                  <div className="mr-3 text-2xl">
                    {multiLink.icon || '🔗'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-sm" style={{ color: 'inherit' }}>
                      {multiLink.title}
                    </h3>
                    {multiLink.description && (
                      <p className="text-xs mt-1 opacity-80" style={{ color: 'inherit' }}>
                        {multiLink.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <ExternalLink className="w-4 h-4 opacity-60" style={{ color: 'inherit' }} />
                </div>
                    </motion.button>
                  </motion.div>
                )
              } else {
                return (
                  <motion.button
                    key={multiLink.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                    className={`w-full backdrop-blur-md p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${getBorderRadiusClass(link.borderRadius)}`}
                    style={{
                      backgroundColor: link.backgroundColor || multiLink.backgroundColor || 'rgba(255, 255, 255, 0.9)',
                      color: link.textColor || multiLink.textColor || '#1f2937'
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      {/* Icon */}
                      <div className="mr-3 text-2xl">
                        {multiLink.icon || '🔗'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-sm" style={{ color: 'inherit' }}>
                          {multiLink.title}
                        </h3>
                        {multiLink.description && (
                          <p className="text-xs mt-1 opacity-80" style={{ color: 'inherit' }}>
                            {multiLink.description}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <ExternalLink className="w-4 h-4 opacity-60" style={{ color: 'inherit' }} />
                    </div>
                  </motion.button>
                )
              }
            })
          ) : (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2">🔗</div>
              <p className="text-gray-600 text-sm">Aucun lien disponible</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <motion.div
          className="mt-8 flex items-center justify-center"
        >
          <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 flex items-center space-x-2">
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-900 rounded-full" />
            </div>
            <span className="text-white text-xs font-medium">LinkTracker</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
