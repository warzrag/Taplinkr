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
  Youtube
} from 'lucide-react'
import { HexColorPicker } from 'react-colorful'

interface ProfileData {
  name: string
  bio: string
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
  { id: 'gradient', name: 'Dégradé', description: 'Arrière-plan dégradé coloré' },
  { id: 'solid', name: 'Couleur unie', description: 'Arrière-plan couleur unie' },
  { id: 'image', name: 'Image', description: 'Image de fond personnalisée' },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres du profil</h1>
              <p className="text-gray-600">Personnalisez votre page publique</p>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={`/${session.user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Eye size={16} />
                <span>Prévisualiser</span>
                <ExternalLink size={14} />
              </a>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          </div>
        </div>

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
                  Image de bannière (URL)
                </label>
                <input
                  type="url"
                  value={profile.bannerImage}
                  onChange={(e) => handleInputChange('bannerImage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/banner.jpg"
                />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Twitter size={16} className="text-blue-400" />
                    <span>Twitter</span>
                  </div>
                </label>
                <input
                  type="url"
                  value={profile.twitterUrl}
                  onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://twitter.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Instagram size={16} className="text-pink-500" />
                    <span>Instagram</span>
                  </div>
                </label>
                <input
                  type="url"
                  value={profile.instagramUrl}
                  onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://instagram.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Linkedin size={16} className="text-blue-600" />
                    <span>LinkedIn</span>
                  </div>
                </label>
                <input
                  type="url"
                  value={profile.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Youtube size={16} className="text-red-500" />
                    <span>YouTube</span>
                  </div>
                </label>
                <input
                  type="url"
                  value={profile.youtubeUrl}
                  onChange={(e) => handleInputChange('youtubeUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://youtube.com/@username"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}