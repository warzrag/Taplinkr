'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link, Shield, Globe, Palette, Plus, Trash2, Sparkles } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { Link as LinkType } from '@/types'

interface CreateLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingLink?: LinkType | null
}

interface FormData {
  title: string
  description?: string
  color?: string
  icon?: string
  coverImage?: string
}

interface MultiLinkData {
  title: string
  url: string
  description?: string
  icon?: string
}

const POPULAR_ICONS = [
  '🔗', '🌐', '📱', '💼', '🎵', '📧', '📷', '🎮', '📺', '🛒',
  '📚', '✏️', '🎨', '🏠', '⚡', '🔥', '💡', '🎯', '🚀', '💎',
  '📺', '🎬', '🎪', '🌟', '💫', '🎊', '🎉', '🎈', '🎁', '💌'
]

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
]

export default function CreateLinkModal({ isOpen, onClose, onSuccess, editingLink }: CreateLinkModalProps) {
  const [loading, setLoading] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [selectedColor, setSelectedColor] = useState(editingLink?.color || '#3b82f6')
  const [selectedIcon, setSelectedIcon] = useState(editingLink?.icon || '')
  const [multiLinks, setMultiLinks] = useState<MultiLinkData[]>(
    editingLink?.multiLinks && editingLink.multiLinks.length > 0
      ? editingLink.multiLinks.map(ml => ({
          title: ml.title,
          url: ml.url,
          description: ml.description || '',
          icon: ml.icon || ''
        }))
      : [{ title: '', url: '', description: '', icon: '' }]
  )
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    defaultValues: editingLink ? {
      title: editingLink.title,
      description: editingLink.description || '',
      color: editingLink.color || '',
      icon: editingLink.icon || '',
      coverImage: editingLink.coverImage || ''
    } : {
      title: '',
      description: '',
      color: '',
      icon: '',
      coverImage: ''
    }
  })

  // Réinitialiser les états quand editingLink change
  useEffect(() => {
    if (isOpen) {
      if (editingLink) {
        // Mode édition
        reset({
          title: editingLink.title,
          description: editingLink.description || '',
          color: editingLink.color || '#3b82f6',
          icon: editingLink.icon || '',
          coverImage: editingLink.coverImage || ''
        })
        setSelectedColor(editingLink.color || '#3b82f6')
        setSelectedIcon(editingLink.icon || '')
        setMultiLinks(
          editingLink.multiLinks && editingLink.multiLinks.length > 0
            ? editingLink.multiLinks.map(ml => ({
                title: ml.title,
                url: ml.url,
                description: ml.description || '',
                icon: ml.icon || ''
              }))
            : [{ title: '', url: '', description: '', icon: '' }]
        )
      } else {
        // Mode création
        reset({
          title: '',
          description: '',
          color: '#3b82f6',
          icon: '',
          coverImage: ''
        })
        setSelectedColor('#3b82f6')
        setSelectedIcon('')
        setMultiLinks([{ title: '', url: '', description: '', icon: '' }])
      }
    }
  }, [isOpen, editingLink, reset])

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setValue('color', color)
  }

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon)
    setValue('icon', icon)
  }

  const addMultiLink = () => {
    setMultiLinks(prev => [...prev, { title: '', url: '', description: '', icon: '' }])
  }

  const removeMultiLink = (index: number) => {
    setMultiLinks(prev => prev.filter((_, i) => i !== index))
  }

  const updateMultiLink = (index: number, field: keyof MultiLinkData, value: string) => {
    setMultiLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ))
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    
    // Validation des liens
    if (multiLinks.length === 0) {
      toast.error('Veuillez ajouter au moins un lien')
      setLoading(false)
      return
    }
    
    const invalidLinks = multiLinks.filter(link => !link.title.trim() || !link.url.trim())
    if (invalidLinks.length > 0) {
      toast.error('Tous les liens doivent avoir un titre et une URL')
      setLoading(false)
      return
    }
    
    try {
      const payload = {
        ...data,
        color: selectedColor,
        icon: selectedIcon,
        multiLinks: multiLinks
      }

      const url = editingLink ? `/api/links/${editingLink.id}` : '/api/links'
      const method = editingLink ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast.success(editingLink ? 'Lien modifié avec succès!' : 'Lien créé avec succès!')
        handleClose()
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedColor('#3b82f6')
    setSelectedIcon('')
    setShowColorPicker(false)
    setMultiLinks([{ title: '', url: '', description: '', icon: '' }]) // Reset avec 1 lien vide
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingLink ? 'Modifier le lien' : 'Créer un nouveau lien'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {editingLink ? 'Modifiez votre lien personnalisé' : 'Ajoutez un nouveau lien à votre page'}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={handleClose}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            {/* Form Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
                {/* Preview Section */}
                <motion.div 
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">Aperçu du lien</span>
                  </div>
                  <motion.div 
                    className="p-4 rounded-xl text-white font-medium text-center shadow-lg"
                    style={{ backgroundColor: selectedColor }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {selectedIcon && <span className="text-xl">{selectedIcon}</span>}
                      <span>{watch('title') || 'Titre de votre lien'}</span>
                    </div>
                    {watch('description') && (
                      <p className="text-sm text-white/80 mt-1">{watch('description')}</p>
                    )}
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Titre du lien *</label>
                  <input
                    type="text"
                    {...register('title', { required: 'Le titre est requis' })}
                    className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.title ? 'border-red-500 ring-2 ring-red-200' : ''}`}
                    placeholder="Mon lien génial"
                  />
                  {errors.title && (
                    <motion.p 
                      className="text-red-500 text-sm mt-2 flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.title.message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Description (optionnelle)</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Description de votre lien..."
                  />
                </motion.div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du bouton</label>
            <div className="space-y-3">
              {/* Preset colors */}
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <Palette size={14} />
                </button>
              </div>

              {/* Color picker */}
              {showColorPicker && (
                <div className="p-3 border rounded-md">
                  <HexColorPicker color={selectedColor} onChange={handleColorSelect} />
                  <div className="mt-2 text-center text-sm text-gray-600">
                    {selectedColor}
                  </div>
                </div>
              )}

              {/* Selected color preview */}
              <div 
                className="w-full h-12 rounded-md flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: selectedColor }}
              >
                Aperçu du bouton
              </div>
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icône (optionnel)</label>
            <div className="grid grid-cols-10 gap-2 mb-3">
              {POPULAR_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleIconSelect(icon)}
                  className={`w-8 h-8 flex items-center justify-center rounded border transition-all ${
                    selectedIcon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={selectedIcon}
              onChange={(e) => handleIconSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ou tapez votre propre émoji/icône"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image de couverture (URL)</label>
            <input
              type="url"
              {...register('coverImage')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Liens de destination */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Liens de destination
              </label>
              <button
                type="button"
                onClick={addMultiLink}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                + Ajouter un lien
              </button>
            </div>
              
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {multiLinks.map((link, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Lien #{index + 1}
                        </span>
                        {multiLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMultiLink(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateMultiLink(index, 'title', e.target.value)}
                          placeholder="Titre du lien *"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateMultiLink(index, 'url', e.target.value)}
                          placeholder="https://example.com *"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={link.description || ''}
                            onChange={(e) => updateMultiLink(index, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={link.icon || ''}
                            onChange={(e) => updateMultiLink(index, 'icon', e.target.value)}
                            placeholder="🔗 Icône"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>

                {/* Submit Button */}
                <motion.div 
                  className="flex space-x-3 pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Enregistrement...' : (editingLink ? 'Modifier' : 'Créer')}
                  </motion.button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}