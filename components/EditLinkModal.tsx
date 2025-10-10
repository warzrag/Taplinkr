'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Link2, Settings, Palette, Share2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useLinks } from '@/contexts/LinksContext'
import { Link } from '@/types'

interface EditLinkModalProps {
  isOpen: boolean
  editingLink: Link | null
  onClose: () => void
  onSuccess: () => void
  onLiveUpdate?: (linkData: any) => void
}

export default function EditLinkModal({ isOpen, editingLink, onClose, onSuccess, onLiveUpdate }: EditLinkModalProps) {
  const { refreshAll, updateLinkOptimistic } = useLinks()
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [linkData, setLinkData] = useState({
    internalName: '',
    title: '',
    description: '',
    slug: '',
    icon: '',
    isActive: true
  })
  const [designData, setDesignData] = useState({
    profileImage: '',
    profileStyle: 'circle' as 'circle' | 'beacon',
    coverImage: '',
    animation: 'none',
    borderRadius: 'rounded-xl',
    fontFamily: 'system',
    backgroundColor: '#ffffff',
    textColor: '#1f2937'
  })
  const [socialData, setSocialData] = useState({
    instagramUrl: '',
    tiktokUrl: '',
    twitterUrl: '',
    youtubeUrl: ''
  })
  const [multiLinks, setMultiLinks] = useState<Array<{
    id?: string
    title: string
    url: string
    icon?: string
    iconImage?: string
    description?: string
  }>>([])
  const [fullLink, setFullLink] = useState<Link | null>(null)

  const addMultiLink = () => {
    setMultiLinks([...multiLinks, { title: '', url: '', icon: '🔗' }])
  }

  const removeMultiLink = (index: number) => {
    setMultiLinks(multiLinks.filter((_, i) => i !== index))
  }

  const updateMultiLink = (index: number, field: string, value: string) => {
    const updated = [...multiLinks]
    updated[index] = { ...updated[index], [field]: value }
    setMultiLinks(updated)
  }

  useEffect(() => {
    if (editingLink) {
      // Initialiser fullLink immédiatement avec editingLink pour la preview
      setFullLink(editingLink)

      // Charger le lien complet avec ses multiLinks depuis l'API
      const loadFullLink = async () => {
        try {
          const response = await fetch(`/api/links/${editingLink.id}`)
          if (response.ok) {
            const loadedFullLink = await response.json()
            console.log('🔍 Lien complet chargé:', loadedFullLink)
            setFullLink(loadedFullLink)
            setLinkData({
              internalName: loadedFullLink.internalName || '',
              title: loadedFullLink.title || '',
              description: loadedFullLink.description || '',
              slug: loadedFullLink.slug || '',
              icon: loadedFullLink.icon || '',
              isActive: loadedFullLink.isActive ?? true
            })
            setDesignData({
              profileImage: loadedFullLink.profileImage || '',
              profileStyle: loadedFullLink.profileStyle || 'circle',
              coverImage: loadedFullLink.coverImage || '',
              animation: loadedFullLink.animation || 'none',
              borderRadius: loadedFullLink.borderRadius || 'rounded-xl',
              fontFamily: loadedFullLink.fontFamily || 'system',
              backgroundColor: loadedFullLink.backgroundColor || '#ffffff',
              textColor: loadedFullLink.textColor || '#1f2937'
            })
            setSocialData({
              instagramUrl: loadedFullLink.instagramUrl || '',
              tiktokUrl: loadedFullLink.tiktokUrl || '',
              twitterUrl: loadedFullLink.twitterUrl || '',
              youtubeUrl: loadedFullLink.youtubeUrl || ''
            })
            // Charger les multiLinks complets
            if (loadedFullLink.multiLinks && loadedFullLink.multiLinks.length > 0) {
              setMultiLinks(loadedFullLink.multiLinks)
            } else {
              setMultiLinks([])
            }
          }
        } catch (error) {
          console.error('Erreur chargement lien complet:', error)
          // Fallback sur editingLink
          setFullLink(editingLink)
          setLinkData({
            internalName: editingLink.internalName || '',
            title: editingLink.title || '',
            description: editingLink.description || '',
            slug: editingLink.slug || '',
            icon: editingLink.icon || '',
            isActive: editingLink.isActive ?? true
          })
          setDesignData({
            profileImage: editingLink.profileImage || '',
            profileStyle: editingLink.profileStyle || 'circle',
            coverImage: editingLink.coverImage || '',
            animation: editingLink.animation || 'none',
            borderRadius: editingLink.borderRadius || 'rounded-xl',
            fontFamily: editingLink.fontFamily || 'system',
            backgroundColor: editingLink.backgroundColor || '#ffffff',
            textColor: editingLink.textColor || '#1f2937'
          })
          setSocialData({
            instagramUrl: editingLink.instagramUrl || '',
            tiktokUrl: editingLink.tiktokUrl || '',
            twitterUrl: editingLink.twitterUrl || '',
            youtubeUrl: editingLink.youtubeUrl || ''
          })
          setMultiLinks([])
        }
      }

      loadFullLink()
    }
  }, [editingLink])

  // ⚡ Live preview update - appeler onLiveUpdate à chaque changement
  useEffect(() => {
    if (fullLink && onLiveUpdate) {
      const liveLink = {
        ...fullLink,
        ...linkData,
        ...designData,
        ...socialData,
        multiLinks: multiLinks.map((ml, index) => ({
          ...ml,
          order: index,
          clicks: 0
        }))
      }
      console.log('📱 Envoi à la preview:', liveLink)
      onLiveUpdate(liveLink)
    }
  }, [linkData, designData, socialData, multiLinks, fullLink, onLiveUpdate])

  const handleSave = async () => {
    if (!editingLink) return

    setSaving(true)
    try {
      const response = await fetch(`/api/links/${editingLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...linkData,
          ...designData,
          ...socialData,
          multiLinks: multiLinks
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      const updatedLink = await response.json()

      // ⚡ METTRE À JOUR LE STATE IMMÉDIATEMENT avec les données du serveur
      updateLinkOptimistic(editingLink.id, updatedLink)

      toast.success('Lien mis à jour !')

      // Fermer immédiatement - le changement est déjà visible !
      onSuccess()
      onClose()

      // Vider le cache - pas besoin de refresh, la mise à jour optimiste suffit !
      localStorage.removeItem('links-cache')
      localStorage.removeItem('dashboard-stats')
      localStorage.removeItem('folder-stats')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'links', label: 'Liens', icon: Link2 },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'social', label: 'Réseaux', icon: Share2 }
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end sm:items-center justify-center min-h-screen">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: window.innerWidth < 640 ? '100%' : 0, scale: window.innerWidth < 640 ? 1 : 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: window.innerWidth < 640 ? '100%' : 0, scale: window.innerWidth < 640 ? 1 : 0.95 }}
          className="relative bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg lg:max-w-2xl max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Modifier le lien
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {linkData.title || 'Sans titre'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {activeTab === 'general' && (
                  <>
                    {/* Titre du lien (nom interne) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Titre du lien
                      </label>
                      <input
                        type="text"
                        value={linkData.internalName}
                        onChange={(e) => setLinkData({ ...linkData, internalName: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Ex: Lien Laura 🌶️ (visible uniquement dans le dashboard)"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Nom visible uniquement dans votre dashboard pour vous organiser
                      </p>
                    </div>

                    {/* Titre de la page */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Titre de la page
                      </label>
                      <input
                        type="text"
                        value={linkData.title}
                        onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Ex: Laura Twitter lauraa_bpts (visible par les visiteurs)"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Titre visible par vos visiteurs sur la page publique
                      </p>
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        URL personnalisée
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">taplinkr.com/</span>
                        <input
                          type="text"
                          value={linkData.slug}
                          onChange={(e) => setLinkData({ ...linkData, slug: e.target.value })}
                          className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="mon-lien"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={linkData.description}
                        onChange={(e) => setLinkData({ ...linkData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                        placeholder="Une courte description..."
                      />
                    </div>

                    {/* Icône / Favicon */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Icône / Favicon
                      </label>
                      <input
                        type="text"
                        value={linkData.icon}
                        onChange={(e) => setLinkData({ ...linkData, icon: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="🔗 ou URL d'une image"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Emoji (ex: 🔗 🌟 💎) ou URL d'une image pour l'icône de votre page
                      </p>
                    </div>
                  </>
                )}

                {activeTab === 'links' && (
                  <>
                    {multiLinks.map((link, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3 bg-gray-50 dark:bg-gray-800">
                        {/* Titre et URL */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Titre
                            </label>
                            <input
                              type="text"
                              value={link.title}
                              onChange={(e) => updateMultiLink(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Mon lien"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              URL
                            </label>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => updateMultiLink(index, 'url', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        {/* Icon et Description */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Icône
                            </label>
                            <input
                              type="text"
                              value={link.icon || ''}
                              onChange={(e) => updateMultiLink(index, 'icon', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="🔗"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={link.description || ''}
                              onChange={(e) => updateMultiLink(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              placeholder="Courte description"
                            />
                          </div>
                        </div>

                        {/* Bouton supprimer */}
                        <button
                          onClick={() => removeMultiLink(index)}
                          className="w-full py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer ce lien
                        </button>
                      </div>
                    ))}

                    {/* Bouton ajouter */}
                    <button
                      onClick={addMultiLink}
                      className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Ajouter un lien
                    </button>

                    {multiLinks.length === 0 && (
                      <div className="text-center py-12">
                        <Link2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun lien pour le moment</p>
                        <button
                          onClick={addMultiLink}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
                        >
                          Créer le premier lien
                        </button>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'design' && (
                  <>
                    {/* Style d'affichage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Style d'affichage
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDesignData({ ...designData, profileStyle: 'circle' })}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            designData.profileStyle === 'circle'
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">⭕</div>
                            <div className="text-sm font-medium">Minimal</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Photo ronde classique</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesignData({ ...designData, profileStyle: 'beacon' })}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            designData.profileStyle === 'beacon'
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">🖼️</div>
                            <div className="text-sm font-medium">Immersif</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Image plein écran</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Animation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Animation des liens
                      </label>
                      <select
                        value={designData.animation}
                        onChange={(e) => setDesignData({ ...designData, animation: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="none">Aucune</option>
                        <option value="pulse">Pulse 💗</option>
                        <option value="rotate">Rotate 🔄</option>
                        <option value="lift">Lift 🚀</option>
                      </select>
                    </div>

                    {/* Forme des boutons */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Forme des boutons
                      </label>
                      <select
                        value={designData.borderRadius}
                        onChange={(e) => setDesignData({ ...designData, borderRadius: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="rounded">Léger</option>
                        <option value="rounded-xl">Moyen</option>
                        <option value="rounded-2xl">Arrondi</option>
                        <option value="rounded-3xl">Très arrondi</option>
                        <option value="rounded-full">Pilule</option>
                        <option value="rounded-none">Carré</option>
                      </select>
                    </div>

                    {/* Police */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Police de caractères
                      </label>
                      <select
                        value={designData.fontFamily}
                        onChange={(e) => setDesignData({ ...designData, fontFamily: e.target.value })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="system">Système</option>
                        <option value="inter">Inter</option>
                        <option value="roboto">Roboto</option>
                        <option value="poppins">Poppins</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="playfair">Playfair</option>
                        <option value="mono">Mono</option>
                      </select>
                    </div>

                    {/* Couleurs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Couleur de fond
                        </label>
                        <input
                          type="color"
                          value={designData.backgroundColor}
                          onChange={(e) => setDesignData({ ...designData, backgroundColor: e.target.value })}
                          className="w-full h-12 rounded-xl border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Couleur du texte
                        </label>
                        <input
                          type="color"
                          value={designData.textColor}
                          onChange={(e) => setDesignData({ ...designData, textColor: e.target.value })}
                          className="w-full h-12 rounded-xl border border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* TODO: Ajouter uploads d'images dans une prochaine version */}
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        💡 Les uploads de photos de profil et de couverture seront disponibles prochainement.
                      </p>
                    </div>
                  </>
                )}

                {activeTab === 'social' && (
                  <>
                    {/* Instagram */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Instagram
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">@</span>
                        <input
                          type="text"
                          value={socialData.instagramUrl}
                          onChange={(e) => setSocialData({ ...socialData, instagramUrl: e.target.value })}
                          className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="votrecompte"
                        />
                      </div>
                    </div>

                    {/* TikTok */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        TikTok
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">@</span>
                        <input
                          type="text"
                          value={socialData.tiktokUrl}
                          onChange={(e) => setSocialData({ ...socialData, tiktokUrl: e.target.value })}
                          className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="votrecompte"
                        />
                      </div>
                    </div>

                    {/* Twitter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter / X
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">@</span>
                        <input
                          type="text"
                          value={socialData.twitterUrl}
                          onChange={(e) => setSocialData({ ...socialData, twitterUrl: e.target.value })}
                          className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="votrecompte"
                        />
                      </div>
                    </div>

                    {/* YouTube */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        YouTube
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400">@</span>
                        <input
                          type="text"
                          value={socialData.youtubeUrl}
                          onChange={(e) => setSocialData({ ...socialData, youtubeUrl: e.target.value })}
                          className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="votrecompte"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        💡 Ces liens apparaîtront en bas de votre page publique comme icônes cliquables.
                      </p>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 lg:p-8 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
