'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { X, Link, Shield, Globe, Palette } from 'lucide-react'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Link className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingLink ? 'Modifier le lien' : 'Créer un nouveau lien'}
              </h2>
              <p className="text-sm text-gray-500">
                {editingLink ? 'Modifiez votre lien personnalisé' : 'Ajoutez un nouveau lien à votre page'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
            <input
              type="text"
              {...register('title', { required: 'Le titre est requis' })}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : ''}`}
              placeholder="Mon lien génial"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>


          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description optionnelle..."
            />
          </div>

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
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : (editingLink ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}