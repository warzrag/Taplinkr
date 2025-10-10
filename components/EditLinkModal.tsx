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
    isActive: true
  })
  const [multiLinks, setMultiLinks] = useState<Array<{
    id?: string
    title: string
    url: string
    icon?: string
    description?: string
  }>>([])

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
      // Charger le lien complet avec ses multiLinks depuis l'API
      const loadFullLink = async () => {
        try {
          const response = await fetch(`/api/links/${editingLink.id}`)
          if (response.ok) {
            const fullLink = await response.json()
            setLinkData({
              internalName: fullLink.internalName || '',
              title: fullLink.title || '',
              description: fullLink.description || '',
              slug: fullLink.slug || '',
              isActive: fullLink.isActive ?? true
            })
            // Charger les multiLinks complets
            if (fullLink.multiLinks && fullLink.multiLinks.length > 0) {
              setMultiLinks(fullLink.multiLinks)
            } else {
              setMultiLinks([])
            }
          }
        } catch (error) {
          console.error('Erreur chargement lien complet:', error)
          // Fallback sur editingLink
          setLinkData({
            internalName: editingLink.internalName || '',
            title: editingLink.title || '',
            description: editingLink.description || '',
            slug: editingLink.slug || '',
            isActive: editingLink.isActive ?? true
          })
          setMultiLinks([])
        }
      }

      loadFullLink()
    }
  }, [editingLink])

  // ⚡ Live preview update - appeler onLiveUpdate à chaque changement
  useEffect(() => {
    if (editingLink && onLiveUpdate) {
      const liveLink = {
        ...editingLink,
        ...linkData,
        multiLinks: multiLinks.map((ml, index) => ({
          ...ml,
          order: index,
          clicks: 0
        }))
      }
      onLiveUpdate(liveLink)
    }
  }, [linkData, multiLinks, editingLink, onLiveUpdate])

  const handleSave = async () => {
    if (!editingLink) return

    setSaving(true)
    try {
      const response = await fetch(`/api/links/${editingLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...linkData,
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
                  <div className="text-center py-12">
                    <Palette className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Options de design à venir</p>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="text-center py-12">
                    <Share2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Réseaux sociaux à venir</p>
                  </div>
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
