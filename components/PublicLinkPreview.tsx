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

  const backgroundColor = link.user.primaryColor || '#1f2937'
  const accentColor = link.user.secondaryColor || '#3b82f6'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${accentColor} 2px, transparent 2px), radial-gradient(circle at 75% 75%, ${accentColor} 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 rounded-full"
        style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)` }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-24 h-24 rounded-full"
        style={{ background: `linear-gradient(135deg, ${backgroundColor}30, ${backgroundColor}15)` }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <Link2 className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-white font-semibold">{link.title}</h1>
                <p className="text-white/60 text-sm">by @{link.user.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={handleLike}
                className={`p-2 rounded-xl transition-all ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button
                onClick={handleShare}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* Profile Section */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Avatar */}
              <motion.div
                className="relative w-24 h-24 mx-auto mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                  {link.user.image ? (
                    <img
                      src={link.user.image}
                      alt={link.user.name || link.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {(link.user.name || link.user.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <motion.div
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3 text-white" />
                </motion.div>
              </motion.div>

              {/* Name and Bio */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {link.user.name || link.user.username}
              </h2>
              {(link.user.bio || link.description) && (
                <p className="text-white/80 text-sm leading-relaxed max-w-xs mx-auto">
                  {link.user.bio || link.description}
                </p>
              )}

              {/* Social Links */}
              <div className="flex justify-center space-x-2 mt-4">
                {link.user.instagramUrl && (
                  <motion.a
                    href={link.user.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Instagram className="w-4 h-4" />
                  </motion.a>
                )}
                {link.user.twitterUrl && (
                  <motion.a
                    href={link.user.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Twitter className="w-4 h-4" />
                  </motion.a>
                )}
                {link.user.linkedinUrl && (
                  <motion.a
                    href={link.user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Linkedin className="w-4 h-4" />
                  </motion.a>
                )}
                {link.user.youtubeUrl && (
                  <motion.a
                    href={link.user.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Youtube className="w-4 h-4" />
                  </motion.a>
                )}
              </div>
            </motion.div>

            {/* Links Section */}
            <div className="space-y-3">
              {link.multiLinks && link.multiLinks.length > 0 ? (
                link.multiLinks
                  .sort((a, b) => a.order - b.order)
                  .map((multiLink, index) => {
                    const platformInfo = getPlatformInfo(multiLink.url)
                    const isClicked = clickedLinks.has(multiLink.id)
                    
                    return (
                      <motion.div
                        key={multiLink.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleLinkClick(multiLink.id, multiLink.url)}
                        className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 ${
                          isClicked ? 'animate-pulse' : ''
                        }`}
                      >
                        <div className="p-4 flex items-center space-x-4">
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${platformInfo.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                            {multiLink.icon ? (
                              <span className="text-xl">{multiLink.icon}</span>
                            ) : (
                              getSocialIcon(platformInfo.icon)
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-lg leading-tight">
                              {multiLink.title}
                            </h3>
                            {multiLink.description && (
                              <p className="text-white/70 text-sm mt-1 line-clamp-2">
                                {multiLink.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-3 mt-2">
                              <span className="text-white/50 text-xs flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {multiLink.clicks} vues
                              </span>
                              <span className="text-white/50 text-xs">
                                {platformInfo.name}
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <motion.div
                            className="text-white/60 group-hover:text-white transition-colors"
                            animate={{ x: isClicked ? 5 : 0 }}
                          >
                            <ExternalLink className="w-5 h-5" />
                          </motion.div>
                        </div>

                        {/* Hover effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                      </motion.div>
                    )
                  })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 inline-block">
                    <Link2 className="w-8 h-8 text-white/60 mx-auto mb-2" />
                    <p className="text-white/80 text-sm">Aucun lien disponible</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          className="text-center py-6 text-white/40 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="w-3 h-3" />
            <span>Créé le {new Date(link.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>
          <div className="flex items-center justify-center space-x-2 mt-1">
            <Eye className="w-3 h-3" />
            <span>{link.clicks} vues au total</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}