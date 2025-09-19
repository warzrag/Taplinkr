'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Instagram, Twitter, MessageCircle, Youtube,
  Music, ShoppingBag, Mail, Phone, MapPin,
  Link, Calendar, Globe, Camera, Heart,
  Star, Coffee, Book, Briefcase
} from 'lucide-react'

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
    profileStyle?: 'circle' | 'beacon'
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

// Données de démonstration par défaut
const defaultDemoData = {
  name: "Sarah Anderson",
  username: "@sarahanderson",
  bio: "Digital Creator • Photographer • Travel Enthusiast",
  profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  location: "Paris, France",
  links: [
    {
      title: "📸 Mon Portfolio",
      icon: "camera",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "🛍️ Ma Boutique",
      icon: "shopping",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "📧 Me Contacter",
      icon: "mail",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "📅 Prendre RDV",
      icon: "calendar",
      gradient: "from-orange-500 to-red-500"
    }
  ]
}

export default function LivePhonePreview({ user, links = [], currentStep }: LivePhonePreviewProps) {
  const [time, setTime] = useState(new Date())
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const timeString = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  // Utiliser les données du premier lien ou les données par défaut
  const firstLink = links[0]
  const displayName = firstLink?.title || user?.name || defaultDemoData.name
  const displayBio = firstLink?.description || user?.bio || defaultDemoData.bio
  const displayImage = firstLink?.profileImage || user?.image || (links.length === 0 ? defaultDemoData.profileImage : null)
  const profileStyle = firstLink?.profileStyle || 'circle'
  const displayLocation = firstLink?.city || firstLink?.country ?
    `${firstLink.city || ''}${firstLink.city && firstLink.country ? ', ' : ''}${firstLink.country || ''}` :
    defaultDemoData.location

  // Créer les liens à afficher
  const displayLinks = links.length > 0 && links[0].multiLinks && links[0].multiLinks.length > 0 ?
    links[0].multiLinks.slice(0, 4).map(ml => ({
      title: ml.title,
      url: ml.url,
      icon: ml.icon,
      gradient: null
    })) :
    defaultDemoData.links

  const backgroundColor = firstLink?.backgroundColor || '#ffffff'
  const textColor = firstLink?.textColor || '#1F2937'

  return (
    <div className="flex items-center justify-center" style={{ transformOrigin: 'center top' }}>
      <motion.div
        className="relative scale-95"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 0.95, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Effet de lueur derrière le téléphone */}
        <div className="absolute -inset-8 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-blue-400/20 blur-3xl" />

        {/* Cadre iPhone réaliste */}
        <div className="relative w-[320px] h-[692px] bg-black rounded-[50px] p-2.5 shadow-2xl">
          {/* Reflet sur le cadre */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[50px] pointer-events-none" />

          {/* Encoche Dynamic Island */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50" />

          {/* Écran */}
          <div className="relative w-full h-full bg-white rounded-[42px] overflow-hidden" style={{ backgroundColor }}>
            {/* Barre de statut iOS */}
            <div className="absolute top-2 left-0 right-0 z-40 flex justify-between items-center px-6 text-[10px] font-medium"
                 style={{ color: textColor }}>
              <span>{timeString}</span>
              <div className="flex items-center gap-1">
                {/* Signal bars */}
                <div className="flex gap-[2px]">
                  <div className="w-[3px] h-[8px] bg-current rounded-[1px] opacity-40" />
                  <div className="w-[3px] h-[10px] bg-current rounded-[1px] opacity-60" />
                  <div className="w-[3px] h-[12px] bg-current rounded-[1px] opacity-80" />
                  <div className="w-[3px] h-[14px] bg-current rounded-[1px]" />
                </div>
                <span className="ml-1">5G</span>
                {/* Battery */}
                <div className="ml-1 w-6 h-3.5 border border-current rounded-sm relative">
                  <div className="absolute inset-[1px] right-[30%] bg-current rounded-[1px]" />
                  <div className="absolute -right-[1.5px] top-1 w-[1.5px] h-1.5 bg-current rounded-r-[1px]" />
                </div>
              </div>
            </div>

            {/* Photo style Beacon en haut si sélectionné */}
            {displayImage && profileStyle === 'beacon' && (
              <motion.div
                className="absolute top-0 left-0 right-0 h-[480px] z-10 rounded-t-[42px] overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={displayImage}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay pour transition douce */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80" />
                {/* Second gradient pour assombrir le bas */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />
              </motion.div>
            )}

            {/* Contenu principal */}
            <div className={`relative h-full flex flex-col ${profileStyle === 'beacon' && displayImage ? 'pt-[120px]' : 'pt-[60px]'} pb-6`}>
              {/* Section Profil */}
              <motion.div
                className="flex flex-col items-center px-6 mb-6 z-20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {/* Photo de profil - Style selon le choix */}
                {displayImage && profileStyle === 'circle' && (
                  <motion.div
                    className="relative mb-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.2
                    }}
                  >
                    {/* Style cercle classique */}
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-xl scale-110" />

                      {/* Photo principale */}
                      <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-white/50 shadow-xl">
                        <img
                          src={displayImage}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay subtle */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                      </div>

                      {/* Badge online */}
                      {firstLink?.isOnline && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center"
                        >
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Photo style Beacon - Photo ronde avec arrière-plan */}
                {displayImage && profileStyle === 'beacon' && (
                  <motion.div
                    className="relative mb-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.2
                    }}
                  >
                    {/* Photo de profil ronde */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full overflow-hidden ring-3 ring-white shadow-2xl bg-white">
                        <img
                          src={displayImage}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Badge online */}
                      {firstLink?.isOnline && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                        >
                          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Nom et bio */}
                <h1 className="text-xl font-bold mb-1" style={{ color: profileStyle === 'beacon' && displayImage ? '#ffffff' : textColor }}>
                  {displayName}
                </h1>

                {displayLocation && (
                  <div className="flex items-center gap-1 text-sm mb-2 opacity-70" style={{ color: profileStyle === 'beacon' && displayImage ? '#ffffff' : textColor }}>
                    <MapPin className="w-3 h-3" />
                    <span>{displayLocation}</span>
                  </div>
                )}

                <p className="text-sm text-center opacity-80 px-4" style={{ color: profileStyle === 'beacon' && displayImage ? '#ffffff' : textColor }}>
                  {displayBio}
                </p>

                {/* Icônes réseaux sociaux */}
                {(firstLink?.instagramUrl || firstLink?.twitterUrl || firstLink?.youtubeUrl || firstLink?.tiktokUrl) && (
                  <div className="flex gap-3 mt-4">
                    {firstLink.instagramUrl && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center"
                      >
                        <Instagram className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                    {firstLink.twitterUrl && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center"
                      >
                        <Twitter className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                    {firstLink.youtubeUrl && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center"
                      >
                        <Youtube className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                    {firstLink.tiktokUrl && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-10 h-10 rounded-full bg-black flex items-center justify-center"
                      >
                        <Music className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Liens */}
              <div className="flex-1 px-6 space-y-2.5 overflow-y-auto">
                <AnimatePresence mode="sync">
                  {displayLinks.map((link, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 50, opacity: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative"
                    >
                      {/* Carte de lien avec gradient ou couleur unie */}
                      <div className={`
                        relative w-full p-3.5 rounded-xl
                        ${link.gradient ? `bg-gradient-to-r ${link.gradient}` : 'bg-gray-100'}
                        shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer
                        overflow-hidden group
                      `}>
                        {/* Effet de brillance au survol */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                                      -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                        {/* Contenu du lien */}
                        <div className="relative flex items-center justify-center">
                          <span className={`text-sm font-semibold ${link.gradient ? 'text-white' : 'text-gray-800'}`}>
                            {link.title}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Message si pas de liens */}
                {displayLinks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <p className="text-gray-400 text-sm">Aucun lien ajouté</p>
                  </motion.div>
                )}
              </div>

              {/* Footer avec branding TapLinkr */}
              <motion.div
                className="px-6 pt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-center gap-2 opacity-50">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                  <span className="text-xs font-medium" style={{ color: textColor }}>
                    Powered by TapLinkr
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Barre de navigation iOS (home indicator) */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-800 rounded-full opacity-30" />
          </div>

          {/* Boutons physiques iPhone */}
          <div className="absolute -left-1 top-24 w-1 h-6 bg-gray-700 rounded-l-full" />
          <div className="absolute -left-1 top-36 w-1 h-10 bg-gray-700 rounded-l-full" />
          <div className="absolute -left-1 top-48 w-1 h-10 bg-gray-700 rounded-l-full" />
          <div className="absolute -right-1 top-32 w-1 h-16 bg-gray-700 rounded-r-full" />
        </div>

        {/* Badge LIVE animé */}
        <motion.div
          className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg z-50"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <motion.div
            className="w-2 h-2 bg-white rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span>APERÇU LIVE</span>
        </motion.div>
      </motion.div>
    </div>
  )
}