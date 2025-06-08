'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Eye, EyeOff, Link2, Plus, Trash2, GripVertical, Upload, Image, Palette, Type, Smartphone } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { useLinks } from '@/contexts/LinksContext'
import { Link, MultiLink } from '@/types'
import LivePhonePreview from './LivePhonePreview'
import { useProfile } from '@/contexts/ProfileContext'

interface LinkData extends Link {
  multiLinks: MultiLink[]
  profileImage?: string
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
  const [linkData, setLinkData] = useState<LinkData | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
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

      if (response.ok) {
        refreshLinksContext()
        toast.success('Lien mis à jour!')
        onSuccess()
        onClose()
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleFileUpload(file)
  }

  const handleFileUpload = async (file: File, type: 'cover' | 'profile' = 'cover') => {
    if (!linkData) {
      toast.error('Erreur: données du lien manquantes')
      return
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image doit faire moins de 5MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Uploading file:', file.name, file.type, file.size)
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      })

      console.log('Upload response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Upload response data:', data)
        
        if (type === 'profile') {
          setLinkData({ ...linkData, profileImage: data.url })
        } else {
          setLinkData({ ...linkData, coverImage: data.url })
        }
        
        toast.success('Image téléchargée!')
      } else {
        const errorData = await response.text()
        console.error('Upload error:', response.status, errorData)
        toast.error('Erreur lors du téléchargement')
      }
    } catch (error) {
      console.error('Upload catch error:', error)
      toast.error('Erreur lors du téléchargement')
    } finally {
      setUploading(false)
    }
  }

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleFileUpload(file, 'profile')
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Link2 },
    { id: 'links', label: 'Liens', icon: Plus },
    { id: 'style', label: 'Style', icon: Palette },
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
            className="fixed inset-0 md:inset-auto md:top-0 md:left-0 md:h-full md:w-full lg:w-[600px] lg:left-[calc(50%-300px)] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Éditer le lien</h2>
                  <p className="text-sm text-gray-600">Modifications en temps réel</p>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    onClick={() => setShowPreview(!showPreview)}
                    className="xl:hidden p-2 hover:bg-white/50 rounded-full transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={showPreview ? "Masquer la prévisualisation" : "Afficher la prévisualisation"}
                  >
                    <Smartphone className="w-5 h-5" />
                  </motion.button>
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
              <div className="flex space-x-1 mt-4 bg-white/50 rounded-lg p-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-fit flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
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
                      {/* Photo de profil */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Photo de profil
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            {linkData.profileImage ? (
                              <div className="relative group">
                                <img
                                  src={linkData.profileImage}
                                  alt="Profile"
                                  className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-lg"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={handleProfileImageUpload}
                                      disabled={uploading}
                                    />
                                    <motion.div
                                      className="bg-white text-gray-900 p-2 rounded-full"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Upload className="w-4 h-4" />
                                    </motion.div>
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={handleProfileImageUpload}
                                  disabled={uploading}
                                />
                                <motion.div
                                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-blue-500 transition-colors"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {uploading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                                  ) : (
                                    <Upload className="w-6 h-6 text-gray-400" />
                                  )}
                                </motion.div>
                              </label>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              Ajoutez une photo de profil pour personnaliser votre page
                            </p>
                            {linkData.profileImage && (
                              <motion.button
                                onClick={() => setLinkData({ ...linkData, profileImage: '' })}
                                className="mt-2 text-red-500 text-sm hover:text-red-700"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Supprimer la photo
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Photo de couverture */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Photo de couverture
                        </label>
                        <div className="relative">
                          {linkData.coverImage ? (
                            <div className="relative group">
                              <img
                                src={linkData.coverImage}
                                alt="Cover"
                                className="w-full h-40 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                  />
                                  <motion.div
                                    className="bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center space-x-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Upload className="w-4 h-4" />
                                    <span>Changer</span>
                                  </motion.div>
                                </label>
                                <motion.button
                                  onClick={() => setLinkData({ ...linkData, coverImage: '' })}
                                  className="ml-2 bg-red-500 text-white p-2 rounded-lg"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <X className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                              />
                              <motion.div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                                }`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                              >
                                {uploading ? (
                                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                                ) : (
                                  <>
                                    <Image className={`w-12 h-12 mx-auto mb-2 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <p className={`text-sm ${dragActive ? 'text-blue-600' : 'text-gray-600'}`}>
                                      {dragActive ? 'Déposez votre image ici' : 'Cliquez ou glissez une image ici'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      JPG, PNG, GIF (max 5MB)
                                    </p>
                                  </>
                                )}
                              </motion.div>
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre du lien
                        </label>
                        <motion.input
                          type="text"
                          value={linkData.title}
                          onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Mon super lien"
                          whileFocus={{ scale: 1.02 }}
                        />
                      </div>

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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Icône
                        </label>
                        <motion.input
                          type="text"
                          value={linkData.icon || ''}
                          onChange={(e) => setLinkData({ ...linkData, icon: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="🔗"
                          whileFocus={{ scale: 1.02 }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slug (URL)
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                            localhost:3000/link/
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
                                          <div className="grid grid-cols-2 gap-2">
                                            <input
                                              type="text"
                                              value={multiLink.title}
                                              onChange={(e) => updateMultiLink(multiLink.id, 'title', e.target.value)}
                                              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
                                              placeholder="Titre"
                                            />
                                            <input
                                              type="text"
                                              value={multiLink.icon || ''}
                                              onChange={(e) => updateMultiLink(multiLink.id, 'icon', e.target.value)}
                                              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
                                              placeholder="🔗"
                                            />
                                          </div>
                                          
                                          <input
                                            type="url"
                                            value={multiLink.url}
                                            onChange={(e) => updateMultiLink(multiLink.id, 'url', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-sm"
                                            placeholder="https://example.com"
                                          />
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
                            <div className="flex items-center justify-center space-x-2">
                              <span>{linkData.icon || '🔗'}</span>
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
            {showPreview && (
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