'use client'

import { useState, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface CustomLinkEditorProps {
  link: any
  onSave: (customization: any) => void
  onCancel: () => void
}

interface Customization {
  profileImage?: string
  backgroundType: 'color' | 'gradient' | 'image'
  backgroundColor: string
  backgroundGradient: {
    from: string
    to: string
    direction: string
  }
  backgroundImage?: string
  theme: 'light' | 'dark' | 'auto'
  fontFamily: string
  buttonStyle: 'rounded' | 'square' | 'pill'
  buttonColor: string
  textColor: string
  description?: string
  socialLinks?: Array<{
    platform: string
    url: string
    icon: string
  }>
}

const defaultCustomization: Customization = {
  backgroundType: 'gradient',
  backgroundColor: '#1e293b',
  backgroundGradient: {
    from: '#1e293b',
    to: '#334155',
    direction: 'to-br'
  },
  theme: 'auto',
  fontFamily: 'Inter',
  buttonStyle: 'rounded',
  buttonColor: '#6366f1',
  textColor: '#ffffff',
  socialLinks: []
}

export function CustomLinkEditor({ link, onSave, onCancel }: CustomLinkEditorProps) {
  const { theme } = useTheme()
  const [customization, setCustomization] = useState<Customization>(
    link.customization || defaultCustomization
  )
  const [activeTab, setActiveTab] = useState('general')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'background') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (type === 'profile') {
          setCustomization(prev => ({ ...prev, profileImage: result }))
        } else {
          setCustomization(prev => ({ ...prev, backgroundImage: result, backgroundType: 'image' }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const addSocialLink = () => {
    setCustomization(prev => ({
      ...prev,
      socialLinks: [
        ...(prev.socialLinks || []),
        { platform: 'instagram', url: '', icon: '📸' }
      ]
    }))
  }

  const updateSocialLink = (index: number, field: string, value: string) => {
    setCustomization(prev => ({
      ...prev,
      socialLinks: prev.socialLinks?.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      ) || []
    }))
  }

  const removeSocialLink = (index: number) => {
    setCustomization(prev => ({
      ...prev,
      socialLinks: prev.socialLinks?.filter((_, i) => i !== index) || []
    }))
  }

  const getPreviewBackground = () => {
    if (customization.backgroundType === 'color') {
      return { backgroundColor: customization.backgroundColor }
    } else if (customization.backgroundType === 'gradient') {
      return {
        background: `linear-gradient(${customization.backgroundGradient.direction}, ${customization.backgroundGradient.from}, ${customization.backgroundGradient.to})`
      }
    } else if (customization.backgroundType === 'image' && customization.backgroundImage) {
      return {
        backgroundImage: `url(${customization.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    }
    return {}
  }

  const socialPlatforms = [
    { name: 'instagram', icon: '📸', placeholder: 'https://instagram.com/username' },
    { name: 'twitter', icon: '🐦', placeholder: 'https://twitter.com/username' },
    { name: 'tiktok', icon: '🎵', placeholder: 'https://tiktok.com/@username' },
    { name: 'youtube', icon: '📺', placeholder: 'https://youtube.com/channel' },
    { name: 'linkedin', icon: '💼', placeholder: 'https://linkedin.com/in/username' },
    { name: 'facebook', icon: '📘', placeholder: 'https://facebook.com/username' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Éditeur */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Personnaliser la page
            </h2>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => onSave(customization)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'general', label: 'Général' },
              { id: 'background', label: 'Arrière-plan' },
              { id: 'style', label: 'Style' },
              { id: 'social', label: 'Réseaux sociaux' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu des tabs */}
          <div className="space-y-6">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Photo de profil
                  </label>
                  <div className="flex items-center gap-4">
                    {customization.profileImage ? (
                      <img
                        src={customization.profileImage}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-2xl">👤</span>
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Changer
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profile')}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={customization.description || ''}
                    onChange={(e) => setCustomization(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez-vous en quelques mots..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {activeTab === 'background' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type d'arrière-plan
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'color', label: 'Couleur unie' },
                      { type: 'gradient', label: 'Dégradé' },
                      { type: 'image', label: 'Image' }
                    ].map(option => (
                      <button
                        key={option.type}
                        onClick={() => setCustomization(prev => ({ ...prev, backgroundType: option.type as any }))}
                        className={`p-3 rounded-lg border ${
                          customization.backgroundType === option.type
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {customization.backgroundType === 'color' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Couleur
                    </label>
                    <input
                      type="color"
                      value={customization.backgroundColor}
                      onChange={(e) => setCustomization(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-full h-12 rounded-lg"
                    />
                  </div>
                )}

                {customization.backgroundType === 'gradient' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Couleur de début
                        </label>
                        <input
                          type="color"
                          value={customization.backgroundGradient.from}
                          onChange={(e) => setCustomization(prev => ({
                            ...prev,
                            backgroundGradient: { ...prev.backgroundGradient, from: e.target.value }
                          }))}
                          className="w-full h-10 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Couleur de fin
                        </label>
                        <input
                          type="color"
                          value={customization.backgroundGradient.to}
                          onChange={(e) => setCustomization(prev => ({
                            ...prev,
                            backgroundGradient: { ...prev.backgroundGradient, to: e.target.value }
                          }))}
                          className="w-full h-10 rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {customization.backgroundType === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image d'arrière-plan
                    </label>
                    <button
                      onClick={() => backgroundInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-indigo-500"
                    >
                      {customization.backgroundImage ? (
                        <img
                          src={customization.backgroundImage}
                          alt="Background"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <>
                          <span className="text-3xl mb-2">🖼️</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Cliquez pour ajouter une image
                          </span>
                        </>
                      )}
                    </button>
                    <input
                      ref={backgroundInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'background')}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Style des boutons
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'rounded', label: 'Arrondis' },
                      { type: 'square', label: 'Carrés' },
                      { type: 'pill', label: 'Pilules' }
                    ].map(option => (
                      <button
                        key={option.type}
                        onClick={() => setCustomization(prev => ({ ...prev, buttonStyle: option.type as any }))}
                        className={`p-3 rounded-lg border ${
                          customization.buttonStyle === option.type
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Couleur des boutons
                  </label>
                  <input
                    type="color"
                    value={customization.buttonColor}
                    onChange={(e) => setCustomization(prev => ({ ...prev, buttonColor: e.target.value }))}
                    className="w-full h-12 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Couleur du texte
                  </label>
                  <input
                    type="color"
                    value={customization.textColor}
                    onChange={(e) => setCustomization(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-full h-12 rounded-lg"
                  />
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Liens des réseaux sociaux
                  </h3>
                  <button
                    onClick={addSocialLink}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    + Ajouter
                  </button>
                </div>

                {customization.socialLinks?.map((socialLink, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <select
                      value={socialLink.platform}
                      onChange={(e) => {
                        const platform = socialPlatforms.find(p => p.name === e.target.value)
                        updateSocialLink(index, 'platform', e.target.value)
                        updateSocialLink(index, 'icon', platform?.icon || '🔗')
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    >
                      {socialPlatforms.map(platform => (
                        <option key={platform.name} value={platform.name}>
                          {platform.icon} {platform.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="url"
                      value={socialLink.url}
                      onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                      placeholder={socialPlatforms.find(p => p.name === socialLink.platform)?.placeholder}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    />
                    <button
                      onClick={() => removeSocialLink(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Aperçu */}
        <div className="w-80 bg-gray-50 dark:bg-gray-900 p-6 border-l border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Aperçu
          </h3>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              className="h-48 flex flex-col items-center justify-center text-center p-4"
              style={getPreviewBackground()}
            >
              {customization.profileImage ? (
                <img
                  src={customization.profileImage}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <span className="text-2xl">👤</span>
                </div>
              )}
              <h4 
                className="font-bold text-lg mb-1"
                style={{ color: customization.textColor }}
              >
                {link.title}
              </h4>
              {customization.description && (
                <p 
                  className="text-sm opacity-90"
                  style={{ color: customization.textColor }}
                >
                  {customization.description}
                </p>
              )}
            </div>
            <div className="p-4 space-y-3">
              <button
                className={`w-full py-3 px-4 text-white font-medium transition-colors ${
                  customization.buttonStyle === 'rounded' ? 'rounded-lg' :
                  customization.buttonStyle === 'square' ? 'rounded-none' : 'rounded-full'
                }`}
                style={{ backgroundColor: customization.buttonColor }}
              >
                Accéder au lien
              </button>
              
              {customization.socialLinks && customization.socialLinks.length > 0 && (
                <div className="flex justify-center gap-3 pt-2">
                  {customization.socialLinks.map((social, index) => (
                    <button
                      key={index}
                      className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}