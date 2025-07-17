'use client'

import { motion } from 'framer-motion'
import { 
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Music2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Github,
  Facebook
} from 'lucide-react'

interface SocialHeaderProps {
  socials: {
    twitterUrl?: string | null
    instagramUrl?: string | null
    linkedinUrl?: string | null
    youtubeUrl?: string | null
    tiktokUrl?: string | null
    githubUrl?: string | null
    facebookUrl?: string | null
    spotifyUrl?: string | null
    websiteUrl?: string | null
    email?: string | null
    phone?: string | null
    location?: string | null
  }
  style?: 'minimal' | 'glass' | 'rounded' | 'square'
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export default function SocialHeader({ socials, style = 'glass', size = 'md', color = '#ffffff' }: SocialHeaderProps) {
  const iconSize = size === 'sm' ? 18 : size === 'md' ? 20 : 24
  const buttonSize = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'
  
  const socialLinks = [
    { url: socials.instagramUrl, icon: Instagram, label: 'Instagram', gradient: 'from-purple-500 to-pink-500' },
    { url: socials.twitterUrl, icon: Twitter, label: 'Twitter', gradient: 'from-blue-400 to-blue-600' },
    { url: socials.linkedinUrl, icon: Linkedin, label: 'LinkedIn', gradient: 'from-blue-600 to-blue-800' },
    { url: socials.youtubeUrl, icon: Youtube, label: 'YouTube', gradient: 'from-red-500 to-red-700' },
    { url: socials.tiktokUrl, icon: Music2, label: 'TikTok', gradient: 'from-black to-gray-800' },
    { url: socials.githubUrl, icon: Github, label: 'GitHub', gradient: 'from-gray-700 to-gray-900' },
    { url: socials.facebookUrl, icon: Facebook, label: 'Facebook', gradient: 'from-blue-600 to-blue-700' },
    { url: socials.spotifyUrl, icon: Music2, label: 'Spotify', gradient: 'from-green-400 to-green-600' },
    { url: socials.websiteUrl, icon: Globe, label: 'Website', gradient: 'from-indigo-500 to-purple-600' },
    { url: socials.email ? `mailto:${socials.email}` : null, icon: Mail, label: 'Email', gradient: 'from-gray-600 to-gray-800' },
    { url: socials.phone ? `tel:${socials.phone}` : null, icon: Phone, label: 'Phone', gradient: 'from-green-500 to-green-700' },
  ].filter(social => social.url)

  if (socialLinks.length === 0) return null

  const getButtonStyle = () => {
    switch (style) {
      case 'minimal':
        return 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
      case 'glass':
        return 'bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20'
      case 'rounded':
        return 'bg-white/90 hover:bg-white text-gray-800 shadow-md'
      case 'square':
        return 'bg-white/90 hover:bg-white text-gray-800 shadow-md rounded-lg'
      default:
        return 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
    }
  }

  const borderRadius = style === 'square' ? 'rounded-lg' : 'rounded-full'

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex flex-wrap items-center justify-center gap-3 mb-6"
    >
      {socialLinks.map((social, index) => (
        <motion.a
          key={social.label}
          href={social.url!}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.1 + index * 0.05,
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`${buttonSize} ${borderRadius} ${getButtonStyle()} flex items-center justify-center transition-all duration-200 group relative overflow-hidden`}
          style={style === 'minimal' || style === 'glass' ? { color } : {}}
          title={social.label}
        >
          {/* Gradient background on hover */}
          <div 
            className={`absolute inset-0 bg-gradient-to-br ${social.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${borderRadius}`}
          />
          
          {/* Icon */}
          <social.icon 
            size={iconSize} 
            className="relative z-10 transition-colors duration-300 group-hover:text-white"
          />
          
          {/* Ripple effect */}
          <div className="absolute inset-0 -z-10">
            <div className={`absolute inset-0 ${borderRadius} bg-white opacity-0 group-hover:animate-ping`} />
          </div>
        </motion.a>
      ))}
    </motion.div>
  )
}