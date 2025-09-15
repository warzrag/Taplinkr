'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Settings as SettingsIcon,
  ArrowLeft,
  X
} from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import Link from 'next/link'

interface ProfileData {
  name: string
  bio: string
  image: string
  bannerImage: string
  theme: string
  primaryColor: string
  secondaryColor: string
  backgroundImage: string
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
    description: 'Arrière-plan dégradé coloré'
  },
  { 
    id: 'solid', 
    name: 'Couleur unie', 
    description: 'Arrière-plan couleur unie'
  },
  { 
    id: 'image', 
    name: 'Image', 
    description: 'Image de fond personnalisée'
  },
]

export default function Settings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false)
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false)
  
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    bio: '',
    image: '',
    bannerImage: '',
    theme: 'gradient',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    backgroundImage: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

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
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        toast.success('Profil mis à jour avec succès!')
        await fetchProfile()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">Paramètres du profil</h1>
                <p className="text-gray-600">Personnalisez votre page publique</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link href="/dashboard">
                <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Retour</span>
                </button>
              </Link>
              
              <a
                href={`/${session.user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                <span>Prévisualiser</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations générales */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Informations générales</h2>
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
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo de profil (URL)
                </label>
                <input
                  type="url"
                  value={profile.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/avatar.jpg"
                />
                {profile.image && (
                  <img 
                    src={profile.image} 
                    alt="Aperçu" 
                    className="mt-2 w-20 h-20 rounded-full object-cover"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de bannière (URL)
                </label>
                <input
                  type="url"
                  value={profile.bannerImage}
                  onChange={(e) => handleInputChange('bannerImage', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/banner.jpg"
                />
                {profile.bannerImage && (
                  <img 
                    src={profile.bannerImage} 
                    alt="Aperçu bannière" 
                    className="mt-2 w-full h-24 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Apparence */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Palette className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Apparence</h2>
            </div>

            <div className="space-y-6">
              {/* Thème */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Thème
                </label>
                <div className="space-y-2">
                  {THEMES.map((theme) => (
                    <label key={theme.id} className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        value={theme.id}
                        checked={profile.theme === theme.id}
                        onChange={(e) => handleInputChange('theme', e.target.value)}
                        className="mr-3"
                      />
                      <div>
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
                      className="w-full h-10 rounded border flex items-center justify-center"
                      style={{ backgroundColor: profile.primaryColor }}
                    >
                      <span className="text-white font-medium">{profile.primaryColor}</span>
                    </button>
                    {showPrimaryPicker && (
                      <div className="absolute top-12 left-0 z-10 bg-white border rounded p-3 shadow-lg">
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
                      className="w-full h-10 rounded border flex items-center justify-center"
                      style={{ backgroundColor: profile.secondaryColor }}
                    >
                      <span className="text-white font-medium">{profile.secondaryColor}</span>
                    </button>
                    {showSecondaryPicker && (
                      <div className="absolute top-12 right-0 z-10 bg-white border rounded p-3 shadow-lg">
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
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/background.jpg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <ExternalLink className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold">Réseaux sociaux</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: 'instagramUrl', icon: Instagram, name: 'Instagram', placeholder: '@votre_username' },
                { field: 'tiktokUrl', icon: ImageIcon, name: 'TikTok', placeholder: '@votre_username' },
                { field: 'twitterUrl', icon: Twitter, name: 'Twitter / X', placeholder: '@votre_username' },
                { field: 'youtubeUrl', icon: Youtube, name: 'YouTube', placeholder: '@votre_chaine' },
                { field: 'linkedinUrl', icon: Linkedin, name: 'LinkedIn', placeholder: 'votre-profil' }
              ].map((social) => {
                const Icon = social.icon
                const value = profile[social.field as keyof ProfileData]
                
                return (
                  <div key={social.field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{social.name}</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleInputChange(social.field as keyof ProfileData, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={social.placeholder}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}