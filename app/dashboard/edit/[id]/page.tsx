'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Save, Eye, EyeOff, Palette, Upload, Link2, Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import LivePhonePreview from '@/components/LivePhonePreview'

interface MultiLink {
  id: string
  title: string
  url: string
  description?: string
  icon?: string
  order: number
}

interface LinkData {
  id: string
  title: string
  description?: string
  slug: string
  color?: string
  icon?: string
  coverImage?: string
  isActive: boolean
  multiLinks: MultiLink[]
}

export default function EditLinkPage() {
  const router = useRouter()
  const params = useParams()
  const linkId = params.id as string

  const [linkData, setLinkData] = useState<LinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // Charger les données du lien
  useEffect(() => {
    const fetchLink = async () => {
      try {
        const response = await fetch(`/api/links/${linkId}`)
        if (response.ok) {
          const data = await response.json()
          setLinkData(data)
        } else {
          toast.error('Erreur lors du chargement du lien')
          router.push('/dashboard')
        }
      } catch (error) {
        toast.error('Erreur lors du chargement du lien')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (linkId) {
      fetchLink()
    }
  }, [linkId, router])

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!linkData) return

    setSaving(true)
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(linkData)
      })

      if (response.ok) {
        toast.success('Lien mis à jour avec succès!')
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  // Ajouter un nouveau multi-lien
  const addMultiLink = () => {
    if (!linkData) return

    const newMultiLink: MultiLink = {
      id: Date.now().toString(),
      title: 'Nouveau lien',
      url: 'https://example.com',
      description: '',
      icon: '🔗',
      order: linkData.multiLinks.length
    }

    setLinkData({
      ...linkData,
      multiLinks: [...linkData.multiLinks, newMultiLink]
    })
  }

  // Supprimer un multi-lien
  const removeMultiLink = (id: string) => {
    if (!linkData) return

    setLinkData({
      ...linkData,
      multiLinks: linkData.multiLinks.filter(ml => ml.id !== id)
    })
  }

  // Mettre à jour un multi-lien
  const updateMultiLink = (id: string, field: keyof MultiLink, value: string) => {
    if (!linkData) return

    setLinkData({
      ...linkData,
      multiLinks: linkData.multiLinks.map(ml =>
        ml.id === id ? { ...ml, [field]: value } : ml
      )
    })
  }

  // Réorganiser les multi-liens
  const handleDragEnd = (result: any) => {
    if (!result.destination || !linkData) return

    const items = Array.from(linkData.multiLinks)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Mettre à jour l'ordre
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }))

    setLinkData({
      ...linkData,
      multiLinks: updatedItems
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!linkData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Lien non trouvé</div>
      </div>
    )
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Link2 },
    { id: 'links', label: 'Liens', icon: Plus },
    { id: 'style', label: 'Style', icon: Palette },
  ]

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar de navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Éditer le lien
          </h1>
          <p className="text-gray-600 text-sm">
            Modifiez votre lien en temps réel
          </p>
        </div>

        {/* Tabs */}
        <div className="p-6">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto p-6 border-t border-gray-200">
          <div className="space-y-3">
            <button
              onClick={() => setLinkData({ ...linkData, isActive: !linkData.isActive })}
              className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                linkData.isActive
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              {linkData.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span>{linkData.isActive ? 'Actif' : 'Inactif'}</span>
            </button>

            <motion.button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex">
        {/* Formulaire d'édition */}
        <div className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Informations générales</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre du lien
                      </label>
                      <input
                        type="text"
                        value={linkData.title}
                        onChange={(e) => setLinkData({ ...linkData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mon super lien"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={linkData.description || ''}
                        onChange={(e) => setLinkData({ ...linkData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Description de votre lien..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug (URL personnalisée)
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          localhost:3001/
                        </span>
                        <input
                          type="text"
                          value={linkData.slug}
                          onChange={(e) => setLinkData({ ...linkData, slug: e.target.value })}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="mon-lien"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icône
                      </label>
                      <input
                        type="text"
                        value={linkData.icon || ''}
                        onChange={(e) => setLinkData({ ...linkData, icon: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="🔗"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Gérer les liens</h2>
                    <motion.button
                      onClick={addMultiLink}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter un lien</span>
                    </motion.button>
                  </div>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="multilinks">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                          {linkData.multiLinks.map((multiLink, index) => (
                            <Draggable key={multiLink.id} draggableId={multiLink.id} index={index}>
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-white p-4 rounded-lg border border-gray-200 ${
                                    snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                  }`}
                                  layout
                                >
                                  <div className="flex items-start space-x-4">
                                    <div {...provided.dragHandleProps} className="mt-3">
                                      <GripVertical className="w-5 h-5 text-gray-400" />
                                    </div>
                                    
                                    <div className="flex-1 space-y-3">
                                      <div className="grid grid-cols-2 gap-4">
                                        <input
                                          type="text"
                                          value={multiLink.title}
                                          onChange={(e) => updateMultiLink(multiLink.id, 'title', e.target.value)}
                                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          placeholder="Titre du lien"
                                        />
                                        <input
                                          type="text"
                                          value={multiLink.icon || ''}
                                          onChange={(e) => updateMultiLink(multiLink.id, 'icon', e.target.value)}
                                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          placeholder="🔗"
                                        />
                                      </div>
                                      
                                      <input
                                        type="url"
                                        value={multiLink.url}
                                        onChange={(e) => updateMultiLink(multiLink.id, 'url', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com"
                                      />
                                      
                                      <input
                                        type="text"
                                        value={multiLink.description || ''}
                                        onChange={(e) => updateMultiLink(multiLink.id, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Description (optionnelle)"
                                      />
                                    </div>
                                    
                                    <button
                                      onClick={() => removeMultiLink(multiLink.id)}
                                      className="mt-3 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
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
                </div>
              )}

              {activeTab === 'style' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Style et apparence</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Couleur du lien
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {colors.map((color) => (
                        <motion.button
                          key={color}
                          onClick={() => setLinkData({ ...linkData, color })}
                          className={`w-full h-12 rounded-lg border-2 ${
                            linkData.color === color ? 'border-gray-900' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image de couverture (URL)
                    </label>
                    <input
                      type="url"
                      value={linkData.coverImage || ''}
                      onChange={(e) => setLinkData({ ...linkData, coverImage: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prévisualisation live à droite */}
        <LivePhonePreview 
          user={{
            name: 'Laura',
            username: 'laura',
            image: null,
            bio: 'gratuit pour les prochaines 24h'
          }}
          links={[linkData]}
        />
      </div>
    </div>
  )
}