'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Palette, 
  Image as ImageIcon, 
  ExternalLink,
  Save,
  Eye,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Settings,
  Sparkles,
  Check,
  ArrowLeft,
  Globe,
  Shield,
  Bell,
  Moon,
  Sun,
  X
} from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import ThemePicker from '@/components/ThemePicker'
import { themes as predefinedThemes, Theme } from '@/lib/themes'
import Link from 'next/link'
import FileUpload from '@/components/upload/FileUpload'
import { useProfile } from '@/contexts/ProfileContext'

interface ProfileData {
  name: string
  bio: string
  image: string
  bannerImage: string
  avatarId: string
  bannerId: string
  theme: string
  primaryColor: string
  secondaryColor: string
  backgroundImage: string
  backgroundGradient?: string
  backgroundColor?: string
  selectedThemeId?: string
  twitterUrl: string
  instagramUrl: string
  linkedinUrl: string
  youtubeUrl: string
  tiktokUrl: string
}

const THEMES = [
  { 
    id: 'gradient', 
    name: 'Dégradé', 
    description: 'Arrière-plan dégradé coloré',
    preview: 'bg-gradient-to-br from-blue-500 to-purple-600'
  },
  { 
    id: 'solid', 
    name: 'Couleur unie', 
    description: 'Arrière-plan couleur unie',
    preview: 'bg-blue-600'
  },
  { 
    id: 'image', 
    name: 'Image', 
    description: 'Image de fond personnalisée',
    preview: 'bg-gradient-to-br from-gray-600 to-gray-800'
  },
]

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

export default function Settings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { profile: contextProfile, updateProfile, forceRefresh } = useProfile()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false)
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false)
  const [tempAvatar, setTempAvatar] = useState<string | null>(null)
  const [tempBanner, setTempBanner] = useState<string | null>(null)
  const [avatarKey, setAvatarKey] = useState(0)
  const [bannerKey, setBannerKey] = useState(0)
  
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    bio: '',
    image: '',
    bannerImage: '',
    avatarId: '',
    bannerId: '',
    theme: 'gradient',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    backgroundImage: '',
    backgroundGradient: '',
    backgroundColor: '',
    selectedThemeId: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && contextProfile) {
      // Charger les données depuis le Context
      setProfile({
        name: contextProfile.name || '',
        bio: contextProfile.bio || '',
        image: contextProfile.image || '',
        bannerImage: contextProfile.bannerImage || '',
        avatarId: contextProfile.avatarId || '',
        bannerId: contextProfile.bannerId || '',
        theme: contextProfile.theme || 'gradient',
        primaryColor: contextProfile.primaryColor || '#3b82f6',
        secondaryColor: contextProfile.secondaryColor || '#8b5cf6',
        backgroundImage: contextProfile.backgroundImage || '',
        twitterUrl: contextProfile.twitterUrl || '',
        instagramUrl: contextProfile.instagramUrl || '',
        linkedinUrl: contextProfile.linkedinUrl || '',
        youtubeUrl: contextProfile.youtubeUrl || '',
        tiktokUrl: contextProfile.tiktokUrl || '',
      })
      setTempAvatar(contextProfile.image || null)
      setTempBanner(contextProfile.bannerImage || null)
      setLoading(false)
    }
  }, [status, router, contextProfile])

  // Debug: surveiller les changements du profile
  useEffect(() => {
    console.log('👀 Profile a changé:', {
      image: profile.image,
      bannerImage: profile.bannerImage,
      avatarId: profile.avatarId,
      bannerId: profile.bannerId
    })
  }, [profile.image, profile.bannerImage, profile.avatarId, profile.bannerId])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile({
          name: data.name || '',
          bio: data.bio || '',
          image: data.image || '',
          bannerImage: data.bannerImage || '',
          avatarId: data.avatarId || '',
          bannerId: data.bannerId || '',
          theme: data.theme || 'gradient',
          primaryColor: data.primaryColor || '#3b82f6',
          secondaryColor: data.secondaryColor || '#8b5cf6',
          backgroundImage: data.backgroundImage || '',
          twitterUrl: data.twitterUrl || '',
          instagramUrl: data.instagramUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          youtubeUrl: data.youtubeUrl || '',
          tiktokUrl: data.tiktokUrl || '',
        })
        // Synchroniser les états temporaires
        setTempAvatar(data.image || null)
        setTempBanner(data.bannerImage || null)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    console.log('💾 Sauvegarde du profil avec les données:', profile)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Profil sauvegardé, réponse:', data)
        toast.success('Profil mis à jour avec succès! Actualiser la page pour voir les changements.')
        
        // Recharger les données
        await fetchProfile()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = async (file: any) => {
    console.log('🎯 handleAvatarUpload appelé avec:', file)
    
    // Affichage immédiat avec l'état temporaire
    setTempAvatar(file.url)
    
    // Mise à jour de l'état du profil local
    setProfile(prev => ({ 
      ...prev, 
      image: file.url,
      avatarId: file.id
    }))
    
    // Sauvegarde immédiate via le Context
    const success = await updateProfile({
      image: file.url,
      avatarId: file.id
    })
    
    if (success) {
      toast.success('Photo de profil uploadée et sauvegardée!')
      forceRefresh() // Force la mise à jour partout
    } else {
      toast.error('Erreur lors de la sauvegarde')
    }
    
    setAvatarKey(prev => prev + 1)
  }

  const handleBannerUpload = async (file: any) => {
    console.log('🎯 handleBannerUpload appelé avec:', file)
    
    // Affichage immédiat avec l'état temporaire
    setTempBanner(file.url)
    
    // Mise à jour de l'état du profil local
    setProfile(prev => ({ 
      ...prev, 
      bannerImage: file.url,
      bannerId: file.id
    }))
    
    // Sauvegarde immédiate via le Context
    const success = await updateProfile({
      bannerImage: file.url,
      bannerId: file.id
    })
    
    if (success) {
      toast.success('Image de bannière uploadée et sauvegardée!')
      forceRefresh() // Force la mise à jour partout
    } else {
      toast.error('Erreur lors de la sauvegarde')
    }
    
    setBannerKey(prev => prev + 1)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
          />
          <p className="text-gray-600 font-medium">Chargement de vos paramètres...</p>
        </motion.div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px), radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative z-10 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Settings className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    Paramètres du profil
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">Personnalisez votre page publique et votre expérience</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <Link href="/dashboard">
                  <motion.button
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour au dashboard</span>
                  </motion.button>
                </Link>
                
                <motion.a
                  href={`/link/${session.user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Eye className="w-4 h-4" />
                  <span>Prévisualiser</span>
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
                
                <motion.button
                  onClick={fetchProfile}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🔄 Recharger</span>
                </motion.button>
                
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                >
                  {saving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Informations générales</h2>
                <p className="text-sm text-gray-500">Votre nom et description</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom affiché
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biographie
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de profil
                </label>
                <FileUpload 
                  key={`avatar-upload-${avatarKey}`}
                  onFileUploaded={handleAvatarUpload}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  className="mb-2"
                />
                {(tempAvatar || profile.image) && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Photo actuelle :</p>
                    <div className="relative inline-block">
                      <img 
                        key={tempAvatar || profile.image}
                        src={tempAvatar || profile.image} 
                        alt="Photo de profil" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          setProfile(prev => ({ ...prev, image: '', avatarId: '' }))
                          setTempAvatar(null)
                          
                          // Supprimer via le Context
                          const success = await updateProfile({
                            image: '',
                            avatarId: ''
                          })
                          
                          if (success) {
                            toast.success('Photo supprimée définitivement!')
                            forceRefresh() // Force la mise à jour partout
                          } else {
                            toast.error('Erreur lors de la suppression')
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Ou entrez une URL directement
                  </label>
                  <input
                    type="url"
                    value={profile.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de bannière
                </label>
                <FileUpload 
                  key={`banner-upload-${bannerKey}`}
                  onFileUploaded={handleBannerUpload}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024}
                  className="mb-2"
                />
                {(tempBanner || profile.bannerImage) && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Bannière actuelle :</p>
                    <div className="relative">
                      <img 
                        key={tempBanner || profile.bannerImage}
                        src={tempBanner || profile.bannerImage} 
                        alt="Image de bannière" 
                        className="w-full h-32 rounded-lg object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          setProfile(prev => ({ ...prev, bannerImage: '', bannerId: '' }))
                          setTempBanner(null)
                          
                          // Supprimer via le Context
                          const success = await updateProfile({
                            bannerImage: '',
                            bannerId: ''
                          })
                          
                          if (success) {
                            toast.success('Bannière supprimée définitivement!')
                            forceRefresh() // Force la mise à jour partout
                          } else {
                            toast.error('Erreur lors de la suppression')
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    Ou entrez une URL directement
                  </label>
                  <input
                    type="url"
                    value={profile.bannerImage}
                    onChange={(e) => handleInputChange('bannerImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Apparence */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Apparence</h2>
                <p className="text-sm text-gray-500">Thème et couleurs</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Thème */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Thème d'arrière-plan
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {THEMES.map((theme) => (
                    <label key={theme.id} className="relative">
                      <input
                        type="radio"
                        name="theme"
                        value={theme.id}
                        checked={profile.theme === theme.id}
                        onChange={(e) => handleInputChange('theme', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        profile.theme === theme.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="font-medium">{theme.name}</div>
                        <div className="text-sm text-gray-500">{theme.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Couleurs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur principale
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                      className="w-full h-10 rounded-md border border-gray-300 flex items-center justify-center"
                      style={{ backgroundColor: profile.primaryColor }}
                    >
                      <span className="text-white font-medium">{profile.primaryColor}</span>
                    </button>
                    {showPrimaryPicker && (
                      <div className="absolute top-12 left-0 z-10 bg-white border rounded-md p-3 shadow-lg">
                        <HexColorPicker 
                          color={profile.primaryColor} 
                          onChange={(color) => handleInputChange('primaryColor', color)} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur secondaire
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
                      className="w-full h-10 rounded-md border border-gray-300 flex items-center justify-center"
                      style={{ backgroundColor: profile.secondaryColor }}
                    >
                      <span className="text-white font-medium">{profile.secondaryColor}</span>
                    </button>
                    {showSecondaryPicker && (
                      <div className="absolute top-12 left-0 z-10 bg-white border rounded-md p-3 shadow-lg">
                        <HexColorPicker 
                          color={profile.secondaryColor} 
                          onChange={(color) => handleInputChange('secondaryColor', color)} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image de fond */}
              {profile.theme === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de fond (URL)
                  </label>
                  <input
                    type="url"
                    value={profile.backgroundImage}
                    onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/background.jpg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Thèmes prédéfinis */}
          <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
            <ThemePicker 
              currentTheme={profile.selectedThemeId}
              onThemeSelect={(theme: Theme) => {
                // Appliquer les styles du thème
                handleInputChange('theme', theme.styles.backgroundType)
                if (theme.styles.backgroundType === 'gradient') {
                  handleInputChange('backgroundGradient', theme.styles.backgroundGradient)
                } else if (theme.styles.backgroundType === 'solid') {
                  handleInputChange('backgroundColor', theme.styles.backgroundColor)
                }
                handleInputChange('primaryColor', theme.styles.primaryColor)
                handleInputChange('secondaryColor', theme.styles.secondaryColor)
                handleInputChange('selectedThemeId', theme.id)
                toast.success(`Thème "${theme.name}" appliqué!`)
              }}
            />
          </div>

          {/* Réseaux sociaux */}
          <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Réseaux sociaux</h2>
                <p className="text-sm text-gray-500">Liens vers vos profils sociaux</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { 
                  field: 'twitterUrl', 
                  icon: Twitter, 
                  name: 'Twitter', 
                  color: 'text-blue-400', 
                  bg: 'from-blue-400 to-blue-600',
                  placeholder: 'https://twitter.com/username'
                },
                { 
                  field: 'instagramUrl', 
                  icon: Instagram, 
                  name: 'Instagram', 
                  color: 'text-pink-500', 
                  bg: 'from-purple-500 to-pink-500',
                  placeholder: 'https://instagram.com/username'
                },
                { 
                  field: 'linkedinUrl', 
                  icon: Linkedin, 
                  name: 'LinkedIn', 
                  color: 'text-blue-600', 
                  bg: 'from-blue-600 to-blue-800',
                  placeholder: 'https://linkedin.com/in/username'
                },
                { 
                  field: 'youtubeUrl', 
                  icon: Youtube, 
                  name: 'YouTube', 
                  color: 'text-red-500', 
                  bg: 'from-red-500 to-red-700',
                  placeholder: 'https://youtube.com/@username'
                }
              ].map((social, index) => {
                const Icon = social.icon
                return (
                  <motion.div 
                    key={social.field}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${social.bg} rounded-xl flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span>{social.name}</span>
                      </div>
                    </label>
                    <motion.input
                      type="url"
                      value={profile[social.field as keyof ProfileData] as string}
                      onChange={(e) => handleInputChange(social.field as keyof ProfileData, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      placeholder={social.placeholder}
                      whileFocus={{ scale: 1.01 }}
                    />
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}