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
  name: "",
  username: "@sarahanderson",
  bio: "",
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

  // Debug pour voir les données des réseaux sociaux
  if (firstLink) {
    console.log('🔍 Debug réseaux sociaux:', {
      instagram: firstLink.instagramUrl,
      twitter: firstLink.twitterUrl,
      youtube: firstLink.youtubeUrl,
      tiktok: firstLink.tiktokUrl,
      profileStyle: firstLink.profileStyle
    })
  }

  const displayName = firstLink?.title || user?.name || defaultDemoData.name
  const displayBio = firstLink?.description || user?.bio || defaultDemoData.bio
  const displayImage = firstLink?.profileImage || user?.image || (links.length === 0 ? defaultDemoData.profileImage : null)
  const profileStyle = firstLink?.profileStyle || 'circle'
  const borderRadius = firstLink?.borderRadius || 'rounded-xl'
  const displayLocation = firstLink?.city || firstLink?.country ?
    `${firstLink.city || ''}${firstLink.city && firstLink.country ? ', ' : ''}${firstLink.country || ''}` :
    defaultDemoData.location

  // TODO: Nouveau système de liens à créer

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
        <div className="relative w-[320px] h-[692px] bg-black rounded-[50px] p-2.5 shadow-2xl overflow-hidden">
          {/* Reflet sur le cadre */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[50px] pointer-events-none" />

          {/* Encoche Dynamic Island */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50" />

          {/* Écran */}
          <div className="relative w-full h-full rounded-[42px] overflow-hidden" style={{ backgroundColor: profileStyle === 'beacon' && displayImage ? 'transparent' : backgroundColor }}>
            {/* Barre de statut iOS */}
            <div className="absolute top-2 left-0 right-0 z-40 flex justify-between items-center px-6 text-[10px] font-medium"
                 style={{ color: profileStyle === 'beacon' && displayImage ? 'white' : textColor }}>
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

            {/* Photo style Beacon/Immersif - PLEIN ÉCRAN COMME UN VRAI IPHONE */}
            {displayImage && profileStyle === 'beacon' && (
              <div className="absolute inset-0 w-full h-full z-10 rounded-[42px] overflow-hidden">
                {/* Image en plein écran qui remplit tout l'iPhone */}
                <img
                  src={displayImage}
                  alt={displayName}
                  className="w-full h-full"
                  style={{
                    objectFit: 'cover'
                  }}
                />

                {/* Dégradé noir professionnel style premium - remonté */}
                <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black via-black/80 via-black/40 to-transparent" />

                {/* Couche supplémentaire pour intensifier le noir */}
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black via-black/90 to-transparent" />

                {/* Dégradé du haut pour la lisibilité de la barre de statut */}
                <div className="absolute top-0 left-0 right-0 h-[20%] bg-gradient-to-b from-black/50 to-transparent" />

                {/* Texte overlay sur l'image - position haute */}
                <div className="absolute bottom-64 left-0 right-0 text-center px-6 z-40">
                  <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {displayName}
                  </h1>
                  {displayBio && (
                    <p className="text-base text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                      {displayBio}
                    </p>
                  )}
                </div>


                {/* Boutons réseaux sociaux */}
                {firstLink?.instagramUrl && firstLink.instagramUrl.trim() !== '' && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <div className="bg-white/20 backdrop-blur-md rounded-full px-6 py-3">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contenu principal - Toujours visible */}
            <div className="relative h-full flex flex-col pt-[60px] pb-6">
              {/* Section Profil - Seulement en mode Minimal */}
              {profileStyle === 'circle' && (
                <motion.div
                  className="flex flex-col items-center px-6 mb-6 z-20"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Photo de profil - Style cercle */}
                  {displayImage && (
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
                        <div className="relative inline-block rounded-lg shadow-xl">
                          <img
                            src={displayImage}
                            alt={displayName}
                            className="max-w-[200px] h-auto rounded-lg"
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

                  {/* Nom et bio */}
                  <h1 className="text-xl font-bold mb-3" style={{ color: textColor }}>
                    {displayName}
                  </h1>

                  {displayLocation && (
                    <div className="flex items-center gap-1 text-sm mb-2 opacity-70" style={{ color: textColor }}>
                      <MapPin className="w-3 h-3" />
                      <span>{displayLocation}</span>
                    </div>
                  )}

                  <p className="text-sm text-center opacity-80 px-4 mb-4" style={{ color: textColor }}>
                    {displayBio}
                  </p>

                  {/* Icônes réseaux sociaux */}
                  {((firstLink?.instagramUrl && firstLink.instagramUrl.trim() !== '') ||
                    (firstLink?.twitterUrl && firstLink.twitterUrl.trim() !== '') ||
                    (firstLink?.youtubeUrl && firstLink.youtubeUrl.trim() !== '') ||
                    (firstLink?.tiktokUrl && firstLink.tiktokUrl.trim() !== '')) && (
                    <div className="flex gap-4 mt-4">
                      {firstLink.instagramUrl && firstLink.instagramUrl.trim() !== '' && (
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-11 h-11 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl"
                          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                        >
                          <Instagram className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                      {firstLink.twitterUrl && firstLink.twitterUrl.trim() !== '' && (
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-11 h-11 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl"
                          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                        >
                          <Twitter className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                      {firstLink.youtubeUrl && firstLink.youtubeUrl.trim() !== '' && (
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-11 h-11 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl"
                          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                        >
                          <Youtube className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                      {firstLink.tiktokUrl && firstLink.tiktokUrl.trim() !== '' && (
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-11 h-11 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl"
                          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                        >
                          <Music className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Titre et description - Toujours visibles */}
              {profileStyle === 'beacon' && (
                <div className="text-center px-6 mb-4">
                  <h1 className="text-xl font-bold mb-2" style={{ color: textColor }}>
                    {displayName}
                  </h1>
                  {displayBio && (
                    <p className="text-sm opacity-80" style={{ color: textColor }}>
                      {displayBio}
                    </p>
                  )}
                </div>
              )}

              {/* Icônes réseaux sociaux - Toujours visibles peu importe le style */}
              {((firstLink?.instagramUrl && firstLink.instagramUrl.trim() !== '') ||
                (firstLink?.twitterUrl && firstLink.twitterUrl.trim() !== '') ||
                (firstLink?.youtubeUrl && firstLink.youtubeUrl.trim() !== '') ||
                (firstLink?.tiktokUrl && firstLink.tiktokUrl.trim() !== '')) && (
                <div className="flex justify-center gap-4 px-6 mb-4 relative z-30">
                  {firstLink.instagramUrl && firstLink.instagramUrl.trim() !== '' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                    >
                      <Instagram className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  {firstLink.twitterUrl && firstLink.twitterUrl.trim() !== '' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                    >
                      <Twitter className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  {firstLink.youtubeUrl && firstLink.youtubeUrl.trim() !== '' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                    >
                      <Youtube className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  {firstLink.tiktokUrl && firstLink.tiktokUrl.trim() !== '' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.15, rotate: -5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-11 h-11 rounded-2xl bg-black/90 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl"
                      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                    >
                      <Music className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>
              )}

              {/* Zone pour les liens */}
              <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto min-h-[200px] relative z-20">
                {/* Zone de debug supprimée - on affiche directement les liens */}
                {false && (
                <div className="p-4 bg-red-600 text-white font-bold text-center text-xl border-4 border-black">
                  🔥 DEBUG v2 - ÉTAPE {currentStep} 🔥
                  <br/>
                  {currentStep >= 5 ? '⚠️ LIENS MANQUANTS ICI ⚠️' : '⏳ PAS ENCORE'}
                  <br/>
                  {new Date().toLocaleTimeString()}
                </div>
                )}
                {/* Affichage des multiLinks à partir de l'étape 5 (intégrée) */}
                {(() => {
                  console.log('🔍 LivePhonePreview - Step:', currentStep, 'FirstLink:', firstLink);
                  if (currentStep === 5) {
                    console.log('📱 Preview à l\'étape 5 - multiLinks:', firstLink?.multiLinks);
                    if (firstLink?.multiLinks?.length > 0) {
                      console.log('✅ Preview affiche', firstLink.multiLinks.length, 'liens');
                    } else {
                      console.log('❌ Pas de multiLinks dans firstLink');
                    }
                  }
                  return null;
                })()}
                {((!currentStep || currentStep >= 5) && firstLink?.multiLinks && firstLink.multiLinks.length > 0) ? (
                  <AnimatePresence>
                    {firstLink.multiLinks.map((link, index) => (
                      <motion.div
                        key={link.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-full p-4 ${borderRadius} transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-lg`}
                        style={{
                          backgroundColor: backgroundColor || '#6366f1',
                          color: textColor || '#ffffff',
                          border: '2px solid rgba(0,0,0,0.1)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Icône */}
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            {link.iconImage || link.icon ? (
                              <img src={link.iconImage || link.icon} className="w-6 h-6" alt="" />
                            ) : (
                              <Link className="w-5 h-5 text-white" />
                            )}
                          </div>
                          {/* Texte */}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg truncate" style={{ color: textColor || '#ffffff' }}>{link.title || 'Titre du lien'}</p>
                            <p className="text-sm truncate" style={{ color: textColor || '#ffffff', opacity: 0.8 }}>{link.url || 'https://example.com'}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : currentStep && currentStep < 5 ? (
                  /* Message avant l'étape 5 */
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-400 text-center px-4">
                      Vos liens apparaîtront ici
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Footer avec branding */}
              {profileStyle === 'beacon' && displayImage ? (
                <motion.div
                  className="absolute bottom-6 left-0 right-0 px-8 z-30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="bg-white/95 backdrop-blur rounded-3xl py-3 px-6 text-center shadow-xl">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <span className="text-sm font-bold text-gray-900">
                        TapLinkr
                      </span>
                      <span className="text-sm text-gray-600">
                        Try for free!
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
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
              )}
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