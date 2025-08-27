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
import SocialHeader from './SocialHeader'
import EmbedLink from './EmbedLink'
import QRCodeGenerator from './QRCodeGenerator'

interface MultiLink {
  id: string
  title: string
  url: string
  description?: string | null
  icon?: string | null
  iconImage?: string | null
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
    profileImage?: string | null
    fontFamily?: string | null
    borderRadius?: string | null
    backgroundColor?: string | null
    textColor?: string | null
    isDirect?: boolean
    directUrl?: string | null
    isOnline?: boolean
    city?: string | null
    country?: string | null
    instagramUrl?: string | null
    tiktokUrl?: string | null
    twitterUrl?: string | null
    youtubeUrl?: string | null
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
  const [viewCount, setViewCount] = useState<number | null>(null)

  // Tracker la vue de la page lors du chargement
  useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch('/api/track-link-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            linkId: link.id,
            referrer: document.referrer,
            userAgent: navigator.userAgent
          })
        })

        if (response.ok) {
          const data = await response.json()
          setViewCount(data.views)
        }
      } catch (error) {
        console.error('Erreur lors du tracking de la vue:', error)
      }
    }

    // Ne tracker que si ce n'est pas un lien direct
    if (!link.isDirect) {
      trackView()
    }
  }, [link.id, link.isDirect])

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
            scale: [0.9, 1.05, 0.9],
            transition: {
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut'
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
      {/* Blurred background image for PC only */}
      <div className="absolute inset-0 hidden md:block">
        {link.coverImage ? (
          <>
            <img
              src={link.coverImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110"
            />
            <div className="absolute inset-0 bg-black/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 blur-3xl" />
        )}
      </div>
      
      {/* Mobile background (no blur) */}
      <div className="absolute inset-0 md:hidden bg-gradient-to-br from-gray-50 to-gray-100" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {/* Mobile Container - Max width like GetAllMyLinks */}
        <div className="w-full max-w-[414px] mx-auto">
          {/* Phone Frame Effect */}
          <div className="relative bg-black rounded-[3rem] p-1.5" style={{ boxShadow: '0 30px 60px -12px rgba(50, 50, 93, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.3)' }}>
            {/* Mobile Screen Container */}
            <div className="relative bg-white rounded-[2.75rem] overflow-hidden" style={{ minHeight: '844px' }}>
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
            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col min-h-[844px] p-6 pb-8 justify-between">
            
            {/* Top Section: Profile + Links */}
            <div>
        {/* Profile Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          {/* Profile Image */}
          {link.profileImage && (
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={link.profileImage}
                  alt={link.title}
                  className="w-32 h-32 object-cover rounded-full shadow-xl border-4 border-white/20"
                />
                {/* Online Status */}
                {link.isOnline && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute bottom-2 right-2"
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
          
          {/* Title & Description */}
          <h1 className="text-white text-3xl font-bold mb-2 drop-shadow-lg">
            {link.title}
          </h1>
          {link.description && (
            <p className="text-white/90 text-lg mb-4 drop-shadow-md max-w-md mx-auto">
              {link.description}
            </p>
          )}
          
          {/* Online Status Badge (when no profile image) */}
          {link.isOnline && !link.profileImage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-xl opacity-40 animate-pulse" />
                <div className="relative bg-gradient-to-r from-green-400/90 to-emerald-400/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-white/20">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                  </div>
                  <span className="text-white text-xs font-semibold tracking-wide uppercase">Live Now</span>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Location */}
          {link.city && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                <MapPin className="w-3 h-3 text-white/80" />
                <span className="text-white/90 text-sm font-medium">
                  {link.city}{link.country ? `, ${link.country}` : ''}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Removed SocialHeader - will be replaced with custom social icons at the bottom */}

        {/* Links Section */}
        <div className="flex-1 flex flex-col justify-center space-y-3 mb-6">
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
                    <motion.div
                      animate={animationProps.animate}
                      transition={animationProps.animate?.transition}
                    >
                      <div
                        onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                        className={`w-full px-4 py-3 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${getBorderRadiusClass(link.borderRadius)}`}
                        style={{
                          backgroundColor: link.backgroundColor || '#ffffff',
                          color: link.textColor || '#1f2937'
                        }}
                      >
                        <div className="flex items-center">
                          {/* Icon/Logo */}
                          {multiLink.iconImage && (
                            <div className="mr-3 flex-shrink-0">
                              <img
                                src={multiLink.iconImage}
                                alt=""
                                className="w-8 h-8 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          {/* Content */}
                          <div className="flex-1 min-w-0 text-center px-4">
                            <h3 className="font-semibold text-sm leading-tight break-words" style={{ color: 'inherit' }}>
                              {multiLink.title}
                            </h3>
                            {multiLink.description && (
                              <p className="text-xs mt-1 opacity-75 leading-relaxed break-words" style={{ color: 'inherit' }}>
                                {multiLink.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )
              } else {
                return (
                  <EmbedLink
                    key={multiLink.id}
                    url={multiLink.url}
                    title={multiLink.title}
                    description={multiLink.description}
                    icon={multiLink.icon}
                    onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                    className={`w-full p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${getBorderRadiusClass(link.borderRadius)}`}
                    style={{
                      backgroundColor: link.backgroundColor || '#ffffff',
                      color: link.textColor || '#1f2937'
                    }}
                  />
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

        {/* Social Media Icons and LinkTracker Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 mb-4 flex justify-center items-center gap-4"
        >
            {link.instagramUrl && (
              <motion.a
                href={link.instagramUrl.startsWith('@') 
                  ? `https://instagram.com/${link.instagramUrl.slice(1)}`
                  : link.instagramUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white/30 shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="w-6 h-6 text-white" />
              </motion.a>
            )}
            
            {link.tiktokUrl && (
              <motion.a
                href={link.tiktokUrl.startsWith('@') 
                  ? `https://tiktok.com/@${link.tiktokUrl.slice(1)}`
                  : link.tiktokUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white/30 shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </motion.a>
            )}
            
            {link.twitterUrl && (
              <motion.a
                href={link.twitterUrl.startsWith('@') 
                  ? `https://twitter.com/${link.twitterUrl.slice(1)}`
                  : link.twitterUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white/30 shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Twitter className="w-6 h-6 text-white" />
              </motion.a>
            )}
            
            {link.youtubeUrl && (
              <motion.a
                href={link.youtubeUrl.startsWith('@') 
                  ? `https://youtube.com/@${link.youtubeUrl.slice(1)}`
                  : link.youtubeUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:bg-white/30 shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Youtube className="w-6 h-6 text-white" />
              </motion.a>
            )}
          </motion.div>

        {/* Action Buttons - Mobile only */}
        <div className="flex items-center justify-center gap-3 md:hidden mt-4">
          {/* Share Button */}
          <motion.button
            onClick={handleShare}
            className="p-3 bg-white/20 backdrop-blur-md rounded-2xl hover:bg-white/30 transition-all duration-300 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
          </motion.button>
          
          {/* QR Code Generator */}
          <QRCodeGenerator 
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={`${link.user.name || link.user.username} - ${link.title}`}
            logo={link.user.image}
            primaryColor={link.user.primaryColor}
            secondaryColor={link.user.secondaryColor}
          />
        </div>
            </div>
            
            {/* Statistics Section - Views Counter */}
            {viewCount !== null && !link.isDirect && (
              <motion.div
                className="flex items-center justify-center mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg">
                  <Eye className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                    {viewCount.toLocaleString()} vue{viewCount > 1 ? 's' : ''}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Bottom Section: LinkTracker Badge */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-white/25 rounded-full px-3 py-1 flex items-center space-x-2">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-900 rounded-full" />
                </div>
                <span className="text-white text-xs font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>LinkTracker</span>
              </div>
            </motion.div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
