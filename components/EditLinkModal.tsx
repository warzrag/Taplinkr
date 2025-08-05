'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Eye, EyeOff, Link2, Plus, Trash2, GripVertical, Upload, Image, Palette, Type, Smartphone, ExternalLink, Share2, Instagram, Twitter, Youtube } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useLinks } from '@/contexts/LinksContext'
import { Link, MultiLink } from '@/types'
import LivePhonePreview from './LivePhonePreview'
import { useProfile } from '@/contexts/ProfileContext'
import ImageUpload from './upload/ImageUpload'
import CoverImageUpload from './upload/CoverImageUpload'
import IconImageUpload from './upload/IconImageUpload'
import { usePermissions } from '@/hooks/usePermissions'

interface LinkData extends Link {
  multiLinks: MultiLink[]
  profileImage?: string
  instagramUrl?: string
  tiktokUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
}

interface EditLinkModalProps {
  isOpen: boolean
  editingLink: Link | null
  onClose: () => void
  onSuccess: () => void
  onLiveUpdate?: (linkData: LinkData) => void
}

export default function EditLinkModal({ isOpen, editingLink, onClose, onSuccess, onLiveUpdate }: EditLinkModalProps) {
  const { refreshAll: refreshLinksContext } = useLinks()
  const { profile: userProfile } = useProfile()
  const { hasPermission, requirePermission, requireLimit } = usePermissions()
  const [linkData, setLinkData] = useState<LinkData | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Effet pour déclencher la mise à jour en temps réel
  useEffect(() => {
    if (linkData && onLiveUpdate) {
      // Déclencher la mise à jour seulement si les données ont changé
      const timeoutId = setTimeout(() => {
        onLiveUpdate(linkData)
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [linkData])

  useEffect(() => {
    if (editingLink) {
      setLinkData({ 
        ...editingLink, 
        multiLinks: editingLink.multiLinks || [] 
      })
    }
  }, [editingLink])

  const handleSave = async () => {
    if (!linkData) return

    setSaving(true)
    try {
      const response = await fetch(`/api/links/${linkData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Erreur de sauvegarde:', errorData)
        toast.error(errorData.error || 'Erreur lors de la sauvegarde')
        return
      }
      
      refreshLinksContext()
      toast.success('Lien mis à jour!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addMultiLink = () => {
    if (!linkData) return

    const newMultiLink: MultiLink = {
      id: Date.now().toString(),
      title: 'Nouveau lien',
      url: 'https://example.com',
      description: '',
      icon: '🔗',
      animation: 'none',
      order: linkData.multiLinks?.length || 0,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setLinkData({
      ...linkData,
      multiLinks: [...(linkData.multiLinks || []), newMultiLink]
    })
  }

  const removeMultiLink = (id: string) => {
    if (!linkData) return
    setLinkData({
      ...linkData,
      multiLinks: (linkData.multiLinks || []).filter(ml => ml.id !== id)
    })
  }

  const updateMultiLink = (id: string, field: keyof MultiLink, value: string) => {
    if (!linkData) return
    setLinkData({
      ...linkData,
      multiLinks: (linkData.multiLinks || []).map(ml =>
        ml.id === id ? { ...ml, [field]: value } : ml
      )
    })
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination || !linkData) return

    const items = Array.from(linkData.multiLinks || [])
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }))

    setLinkData({
      ...linkData,
      multiLinks: updatedItems
    })
  }

  // Les fonctions d'upload ont été remplacées par le composant ImageUpload

  const tabs = linkData?.isDirect 
    ? [{ id: 'general', label: 'Général', icon: Link2 }]
    : [
        { id: 'general', label: 'Général', icon: Link2 },
        { id: 'links', label: 'Liens', icon: Plus },
        { id: 'style', label: 'Style', icon: Palette },
        ...(hasPermission('hasSocialMedia') ? [{ id: 'social', label: 'Réseaux', icon: Share2 }] : []),
      ]

  // Options de polices
  const fontOptions = [
    { id: 'system', name: 'System Default', class: 'font-sans', preview: 'Aa' },
    { id: 'inter', name: 'Inter', class: 'font-inter', preview: 'Aa' },
    { id: 'roboto', name: 'Roboto', class: 'font-roboto', preview: 'Aa' },
    { id: 'poppins', name: 'Poppins', class: 'font-poppins', preview: 'Aa' },
    { id: 'montserrat', name: 'Montserrat', class: 'font-montserrat', preview: 'Aa' },
    { id: 'playfair', name: 'Playfair Display', class: 'font-playfair', preview: 'Aa' },
    { id: 'mono', name: 'Monospace', class: 'font-mono', preview: 'Aa' },
  ]

  // Options de formes
  const shapeOptions = [
    { id: 'rounded-sm', name: 'Légèrement arrondi', preview: 'rounded-sm', radius: '2px' },
    { id: 'rounded-md', name: 'Arrondi moyen', preview: 'rounded-md', radius: '6px' },
    { id: 'rounded-lg', name: 'Bien arrondi', preview: 'rounded-lg', radius: '8px' },
    { id: 'rounded-xl', name: 'Très arrondi', preview: 'rounded-xl', radius: '12px' },
    { id: 'rounded-2xl', name: 'Ultra arrondi', preview: 'rounded-2xl', radius: '16px' },
    { id: 'rounded-full', name: 'Complètement rond', preview: 'rounded-full', radius: '50px' },
    { id: 'rounded-none', name: 'Carré (aucun arrondi)', preview: 'rounded-none', radius: '0px' },
  ]

  // Couleurs prédéfinies pour les liens
  const linkColors = [
    { id: '#3b82f6', name: 'Bleu', hex: '#3b82f6' },
    { id: '#ef4444', name: 'Rouge', hex: '#ef4444' },
    { id: '#10b981', name: 'Vert', hex: '#10b981' },
    { id: '#f59e0b', name: 'Orange', hex: '#f59e0b' },
    { id: '#8b5cf6', name: 'Violet', hex: '#8b5cf6' },
    { id: '#ec4899', name: 'Rose', hex: '#ec4899' },
    { id: '#06b6d4', name: 'Cyan', hex: '#06b6d4' },
    { id: '#84cc16', name: 'Lime', hex: '#84cc16' },
    { id: '#1f2937', name: 'Gris foncé', hex: '#1f2937' },
    { id: '#ffffff', name: 'Blanc', hex: '#ffffff' },
  ]

  // Couleurs pour le texte
  const textColors = [
    { id: '#ffffff', name: 'Blanc', hex: '#ffffff' },
    { id: '#000000', name: 'Noir', hex: '#000000' },
    { id: '#374151', name: 'Gris foncé', hex: '#374151' },
    { id: '#6b7280', name: 'Gris', hex: '#6b7280' },
    { id: '#3b82f6', name: 'Bleu', hex: '#3b82f6' },
    { id: '#ef4444', name: 'Rouge', hex: '#ef4444' },
    { id: '#10b981', name: 'Vert', hex: '#10b981' },
    { id: '#8b5cf6', name: 'Violet', hex: '#8b5cf6' },
  ]


  if (!linkData) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - only covers left side, not phone area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ 
              type: 'spring',
              damping: 25,
              stiffness: 200
            }}
            className="fixed inset-0 md:inset-auto md:top-0 md:left-[40%] md:-translate-x-1/2 md:bottom-0 md:h-full md:w-full md:max-w-xl lg:max-w-2xl bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">Éditer le lien</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {linkData?.isDirect ? 'Configuration du lien direct' : 'Modifications en temps réel'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!linkData?.isDirect && (
                    <motion.button
                      onClick={() => setShowPreview(!showPreview)}
                      className="xl:hidden p-2 hover:bg-white/50 rounded-full transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={showPreview ? "Masquer la prévisualisation" : "Afficher la prévisualisation"}
                    >
                      <Smartphone className="w-5 h-5" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={onClose}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mt-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {activeTab === 'general' && (
                    <>
                      {/* Message pour les liens directs */}
                      {linkData.isDirect && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium text-blue-900 mb-1">
                                Lien Direct {linkData.isUltraLink ? 'ULTRA' : linkData.shieldEnabled ? 'avec Shield' : ''}
                              </p>
                              <p className="text-blue-700">
                                Les visiteurs seront redirigés directement vers votre URL cible. 
                                Les photos de profil et de couverture ne sont pas nécessaires pour ce type de lien.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Photos uniquement pour les multi-liens */}
                      {!linkData.isDirect && (
                        <>
                          {/* Photo de profil */}
                          <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Photo de profil
                        </label>
                        <div className="space-y-2">
                          <ImageUpload
                            value={linkData.profileImage}
                            onChange={(url) => setLinkData({ ...linkData, profileImage: url })}
                            type="profile"
                            aspectRatio="square"
                          />
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Photo de profil pour personnaliser votre page. Format carré recommandé.
                          </p>
                        </div>
                      </div>

                          {/* Photo de couverture */}
                          <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Photo de couverture
                        </label>
                        <CoverImageUpload
                          value={linkData.coverImage}
                          onChange={(url) => setLinkData({ ...linkData, coverImage: url })}
                        />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre du lien
                        </label>
                        <motion.input
                          type="text"
                          value={linkData.title}
                          onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          placeholder="Mon super lien"
                          whileFocus={{ scale: 1.02 }}
                        />
                      </div>

                      {/* Status en ligne et localisation - seulement pour multi-link */}
                      {!linkData.isDirect && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 p-4 sm:p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-indigo-100 dark:border-gray-700"
                        >
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="text-lg">✨</span> Présence & Localisation
                          </h3>
                          
                          {/* Status en ligne avec design moderne */}
                          {hasPermission('hasOnlineStatus') ? (
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                                  linkData.isOnline ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
                                }`}>
                                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                                    linkData.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                  }`} />
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                    Statut en ligne
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {linkData.isOnline ? 'Actuellement disponible' : 'Hors ligne'}
                                  </p>
                                </div>
                              </div>
                              <motion.button
                                type="button"
                                onClick={() => setLinkData({ ...linkData, isOnline: !linkData.isOnline })}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${
                                  linkData.isOnline 
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/25' 
                                    : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <motion.span
                                  layout
                                  className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg"
                                  animate={{ x: linkData.isOnline ? 32 : 4 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                              </motion.button>
                            </div>
                          ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-600 mb-2">
                                🔒 Statut en ligne disponible avec le plan Standard
                              </p>
                              <button
                                type="button"
                                onClick={() => requirePermission('hasOnlineStatus')}
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                              >
                                Débloquer cette fonctionnalité
                              </button>
                            </div>
                          )}

                          {/* Localisation avec icône moderne */}
                          {hasPermission('hasLocationDisplay') ? (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                Localisation
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={linkData.city || ''}
                                  onChange={(e) => setLinkData({ ...linkData, city: e.target.value })}
                                  className="w-full px-4 py-3 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 transition-all"
                                  placeholder="Paris, France"
                                />
                                <div className="absolute left-3 top-3.5 text-gray-400">
                                  📍
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                💡 Les fans locaux sont 3x plus susceptibles de s'abonner
                              </p>
                            </div>
                          ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                              <p className="text-sm text-gray-600 mb-2">
                                🔒 Localisation disponible avec le plan Standard
                              </p>
                              <button
                                type="button"
                                onClick={() => requirePermission('hasLocationDisplay')}
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                              >
                                Débloquer cette fonctionnalité
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* URL de destination pour les liens directs */}
                      {linkData.isDirect && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL de destination
                          </label>
                          <motion.input
                            type="url"
                            value={linkData.directUrl || ''}
                            onChange={(e) => setLinkData({ ...linkData, directUrl: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="https://example.com"
                            required
                            whileFocus={{ scale: 1.02 }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            L'URL vers laquelle les visiteurs seront redirigés
                          </p>
                        </div>
                      )}

                      {/* Description et icône uniquement pour les multi-liens */}
                      {!linkData.isDirect && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <motion.textarea
                              value={linkData.description || ''}
                              onChange={(e) => setLinkData({ ...linkData, description: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              placeholder="Description de votre lien..."
                              whileFocus={{ scale: 1.02 }}
                            />
                          </div>

                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug (URL)
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            localhost:3000{linkData.isDirect ? '/' : '/link/'}
                          </span>
                          <motion.input
                            type="text"
                            value={linkData.slug}
                            onChange={(e) => setLinkData({ ...linkData, slug: e.target.value })}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="mon-lien"
                            whileFocus={{ scale: 1.02 }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'links' && (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Gérer les liens</h3>
                        <motion.button
                          onClick={addMultiLink}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Ajouter</span>
                        </motion.button>
                      </div>

                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="multilinks">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                              {(linkData.multiLinks || []).map((multiLink, index) => (
                                <Draggable key={multiLink.id} draggableId={multiLink.id} index={index}>
                                  {(provided, snapshot) => (
                                    <motion.div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`bg-gray-50 p-4 rounded-lg border ${
                                        snapshot.isDragging ? 'shadow-lg border-blue-300' : 'border-gray-200'
                                      }`}
                                      layout
                                      whileHover={{ scale: 1.01 }}
                                    >
                                      <div className="flex items-start space-x-3">
                                        <div {...provided.dragHandleProps} className="mt-2">
                                          <GripVertical className="w-4 h-4 text-gray-400" />
                                        </div>
                                        
                                        <div className="flex-1 space-y-2">
                                          <div className="space-y-3">
                                            <input
                                              type="text"
                                              value={multiLink.title}
                                              onChange={(e) => updateMultiLink(multiLink.id, 'title', e.target.value)}
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
                                              placeholder="Titre du lien"
                                            />
                                            
                                            {/* Upload d'icône personnalisée */}
                                            {hasPermission('hasCustomIcons') ? (
                                              <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                  Logo
                                                </label>
                                                <IconImageUpload
                                                  value={multiLink.iconImage}
                                                  onChange={(url) => updateMultiLink(multiLink.id, 'iconImage', url)}
                                                />
                                              </div>
                                            ) : (
                                              <div className="text-center py-2">
                                                <button
                                                  type="button"
                                                  onClick={() => requirePermission('hasCustomIcons')}
                                                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                                                >
                                                  🔒 Plan Standard pour icônes
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                          
                                          <input
                                            type="url"
                                            value={multiLink.url}
                                            onChange={(e) => updateMultiLink(multiLink.id, 'url', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
                                            placeholder="https://example.com"
                                          />
                                          
                                          <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div>
                                              <label className="block text-xs text-gray-600 mb-1">Animation</label>
                                              <select
                                                value={multiLink.animation || 'none'}
                                                onChange={(e) => updateMultiLink(multiLink.id, 'animation', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
                                              >
                                                <option value="none">Aucune</option>
                                                <option value="pulse">Pulse</option>
                                                <option value="bounce">Bounce</option>
                                                <option value="shake">Shake</option>
                                                <option value="wobble">Wobble</option>
                                                <option value="swing">Swing</option>
                                                <option value="tada">Tada</option>
                                                <option value="flash">Flash</option>
                                                <option value="rubberBand">Rubber Band</option>
                                              </select>
                                            </div>
                                            <input
                                              type="text"
                                              value={multiLink.description || ''}
                                              onChange={(e) => updateMultiLink(multiLink.id, 'description', e.target.value)}
                                              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
                                              placeholder="Description"
                                            />
                                          </div>
                                        </div>
                                        
                                        <motion.button
                                          onClick={() => removeMultiLink(multiLink.id)}
                                          className="mt-2 p-1 text-red-500 hover:bg-red-50 rounded-md"
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                      </div>
                                    </motion.div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </>
                  )}

                  {activeTab === 'style' && (
                    <>
                      {/* Police */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <Type className="w-4 h-4 inline mr-2" />
                          Police des liens
                        </label>
                        {hasPermission('hasCustomFonts') ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {fontOptions.map((font) => (
                              <motion.button
                                key={font.id}
                                onClick={() => setLinkData({ 
                                  ...linkData, 
                                  fontFamily: font.id 
                                })}
                                className={`p-3 border-2 rounded-lg text-center transition-all ${
                                  (linkData.fontFamily || 'system') === font.id 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className={`text-2xl ${font.class} mb-1`}>
                                  {font.preview}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {font.name}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                            <Type className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 mb-3">
                              🔒 Polices personnalisées disponibles avec le plan Standard
                            </p>
                            <button
                              type="button"
                              onClick={() => requirePermission('hasCustomFonts')}
                              className="text-sm text-blue-600 hover:text-blue-700 underline"
                            >
                              Débloquer les polices premium
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Couleur de fond du lien */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <Palette className="w-4 h-4 inline mr-2" />
                          Couleur de fond du lien
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {linkColors.map((color) => (
                            <motion.button
                              key={color.id}
                              onClick={() => setLinkData({ 
                                ...linkData, 
                                backgroundColor: color.id 
                              })}
                              className={`w-full h-12 rounded-lg border-2 transition-all relative ${
                                (linkData.backgroundColor || '#3b82f6') === color.id 
                                  ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: color.hex }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title={color.name}
                            >
                              {(linkData.backgroundColor || '#3b82f6') === color.id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-3 h-3 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                  </div>
                                </div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Couleur du texte */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <Type className="w-4 h-4 inline mr-2" />
                          Couleur du texte
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {textColors.map((color) => (
                            <motion.button
                              key={color.id}
                              onClick={() => setLinkData({ 
                                ...linkData, 
                                textColor: color.id 
                              })}
                              className={`w-full h-12 rounded-lg border-2 transition-all relative ${
                                (linkData.textColor || '#ffffff') === color.id 
                                  ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                              style={{ backgroundColor: color.hex }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title={color.name}
                            >
                              {(linkData.textColor || '#ffffff') === color.id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                    color.hex === '#ffffff' ? 'bg-black bg-opacity-20' : 'bg-white bg-opacity-20'
                                  }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                      color.hex === '#ffffff' ? 'bg-black' : 'bg-white'
                                    }`} />
                                  </div>
                                </div>
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Forme des liens */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          📐 Forme des liens
                        </label>
                        <div className="space-y-2">
                          {shapeOptions.map((shape) => (
                            <motion.button
                              key={shape.id}
                              onClick={() => setLinkData({ 
                                ...linkData, 
                                borderRadius: shape.id 
                              })}
                              className={`w-full p-3 border-2 rounded-lg flex items-center justify-between transition-all ${
                                (linkData.borderRadius || 'rounded-lg') === shape.id 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <div className="flex items-center space-x-3">
                                <div 
                                  className={`w-8 h-8 bg-blue-500 ${shape.preview}`}
                                  style={{ borderRadius: shape.radius }}
                                />
                                <span className="text-sm font-medium">
                                  {shape.name}
                                </span>
                              </div>
                              {(linkData.borderRadius || 'rounded-lg') === shape.id && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Prévisualisation du style */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Aperçu du style
                        </label>
                        <div className="bg-gray-100 p-4 rounded-lg">
                          <motion.div
                            className={`
                              p-4 text-center cursor-pointer transition-all
                              ${fontOptions.find(f => f.id === (linkData.fontFamily || 'system'))?.class || 'font-sans'}
                              ${linkData.borderRadius || 'rounded-lg'}
                            `}
                            style={{
                              backgroundColor: linkData.backgroundColor || '#3b82f6',
                              color: linkData.textColor || '#ffffff'
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center justify-center">
                              <span>{linkData.title || 'Mon super lien'}</span>
                            </div>
                            {linkData.description && (
                              <div className="text-sm opacity-90 mt-1">
                                {linkData.description}
                              </div>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'social' && (
                    <>
                      {!hasPermission('hasSocialMedia') ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                          <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Réseaux sociaux verrouillés
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            🔒 Connectez vos réseaux sociaux pour augmenter votre engagement avec le plan Standard
                          </p>
                          <button
                            type="button"
                            onClick={() => requirePermission('hasSocialMedia')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                          >
                            Débloquer cette fonctionnalité
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                            <p className="text-sm text-purple-800 flex items-center gap-2">
                              <Share2 className="w-4 h-4" />
                              <span className="font-medium">Connectez vos réseaux sociaux pour augmenter votre engagement!</span>
                            </p>
                          </div>

                        {/* Instagram */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-xl flex items-center justify-center">
                              <Instagram className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">Instagram</h3>
                              <p className="text-xs text-gray-500">Partagez vos moments</p>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={linkData.instagramUrl || ''}
                            onChange={(e) => {
                              let value = e.target.value
                              if (value && !value.startsWith('@') && !value.startsWith('http')) {
                                value = '@' + value
                              }
                              setLinkData({ ...linkData, instagramUrl: value })
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="@votre_username"
                          />
                        </div>

                        {/* TikTok */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">TikTok</h3>
                              <p className="text-xs text-gray-500">Créez du contenu viral</p>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={linkData.tiktokUrl || ''}
                            onChange={(e) => {
                              let value = e.target.value
                              if (value && !value.startsWith('@') && !value.startsWith('http')) {
                                value = '@' + value
                              }
                              setLinkData({ ...linkData, tiktokUrl: value })
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="@votre_username"
                          />
                        </div>

                        {/* Twitter */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                              <Twitter className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">Twitter / X</h3>
                              <p className="text-xs text-gray-500">Partagez vos pensées</p>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={linkData.twitterUrl || ''}
                            onChange={(e) => {
                              let value = e.target.value
                              if (value && !value.startsWith('@') && !value.startsWith('http')) {
                                value = '@' + value
                              }
                              setLinkData({ ...linkData, twitterUrl: value })
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="@votre_username"
                          />
                        </div>

                        {/* YouTube */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                              <Youtube className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">YouTube</h3>
                              <p className="text-xs text-gray-500">Partagez vos vidéos</p>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={linkData.youtubeUrl || ''}
                            onChange={(e) => {
                              let value = e.target.value
                              if (value && !value.startsWith('@') && !value.startsWith('http')) {
                                value = '@' + value
                              }
                              setLinkData({ ...linkData, youtubeUrl: value })
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="@votre_chaine"
                          />
                        </div>
                        </div>
                      )}
                    </>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <motion.button
                  onClick={() => setLinkData({ ...linkData, isActive: !linkData.isActive })}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    linkData.isActive
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {linkData.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{linkData.isActive ? 'Actif' : 'Inactif'}</span>
                </motion.button>

                <div className="flex space-x-2">
                  <motion.button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Prévisualisation mobile - Affichée en overlay */}
          <AnimatePresence>
            {showPreview && !linkData?.isDirect && (
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="xl:hidden fixed inset-y-0 right-0 w-full md:w-96 bg-gray-100 z-60 overflow-y-auto shadow-2xl"
              >
                <div className="p-4">
                  <motion.button
                    onClick={() => setShowPreview(false)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                  <LivePhonePreview 
                    user={userProfile ? {
                      name: userProfile.name,
                      username: userProfile.username,
                      image: userProfile.image,
                      bio: userProfile.bio
                    } : {
                      name: 'Chargement...',
                      username: 'user',
                      image: null,
                      bio: ''
                    }}
                    links={linkData ? [linkData] : []}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}