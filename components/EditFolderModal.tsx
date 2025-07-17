'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Smile } from 'lucide-react'
import { toast } from 'react-hot-toast'

const FOLDER_ICONS = [
  '📁', '📂', '📋', '📊', '📈', '📉', '📝', '📄', '📑', '📒', 
  '📓', '📔', '📕', '📗', '📘', '📙', '📚', '🗂️', '🗃️', '🗄️',
  '💼', '👔', '🎯', '🚀', '⭐', '🔥', '💎', '🎨', '🎵', '🎬',
  '🏠', '🏢', '🏪', '🏫', '🏥', '🚗', '✈️', '🌟', '❤️', '💚',
  '💙', '💜', '🧡', '💛', '🤍', '🖤', '🔴', '🟠', '🟡', '🟢'
]

const FOLDER_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald  
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
  '#14b8a6', // teal
  '#a855f7', // purple
  '#eab308', // yellow
  '#22c55e', // green
  '#f43f5e', // rose
  '#64748b'  // slate
]

interface Folder {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  isExpanded: boolean
  links: any[]
  order: number
  parentId?: string | null
  children?: Folder[]
}

interface EditFolderModalProps {
  isOpen: boolean
  folder: Folder | null
  onClose: () => void
  onSave: (folderData: Partial<Folder>) => void
}

export default function EditFolderModal({ isOpen, folder, onClose, onSave }: EditFolderModalProps) {
  const [name, setName] = useState(folder?.name || '')
  const [description, setDescription] = useState(folder?.description || '')
  const [selectedIcon, setSelectedIcon] = useState(folder?.icon || '📁')
  const [selectedColor, setSelectedColor] = useState(folder?.color || '#3b82f6')
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleSave = () => {
    console.log('📁 [EDIT_FOLDER_MODAL] Bouton Créer/Enregistrer cliqué')
    console.log('📁 [EDIT_FOLDER_MODAL] Données du formulaire:', {
      name: name,
      description: description,
      icon: selectedIcon,
      color: selectedColor,
      isNewFolder: !folder
    })
    
    if (!name.trim()) {
      console.log('❌ [EDIT_FOLDER_MODAL] Erreur: nom vide')
      toast.error('Le nom du dossier est requis')
      return
    }

    const folderData = {
      name: name.trim(),
      description: description.trim() || null,
      icon: selectedIcon,
      color: selectedColor
    }
    
    console.log('📁 [EDIT_FOLDER_MODAL] Appel de onSave avec:', folderData)
    onSave(folderData)

    onClose()
  }

  const handleClose = () => {
    setName(folder?.name || '')
    setDescription(folder?.description || '')
    setSelectedIcon(folder?.icon || '📁')
    setSelectedColor(folder?.color || '#3b82f6')
    setShowIconPicker(false)
    setShowColorPicker(false)
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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {folder ? 'Modifier le dossier' : 'Nouveau dossier'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Preview */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                <div 
                  className="text-3xl flex-shrink-0"
                  style={{ filter: `drop-shadow(0 2px 4px ${selectedColor}40)` }}
                >
                  {selectedIcon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {name || 'Nom du dossier'}
                  </h3>
                  {description && (
                    <p className="text-sm text-gray-600 truncate">{description}</p>
                  )}
                </div>
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: selectedColor }}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du dossier
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Entrez le nom du dossier"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du dossier"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Icon & Color */}
              <div className="grid grid-cols-2 gap-4">
                {/* Icon Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icône
                  </label>
                  <button
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="w-full flex items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl mr-2">{selectedIcon}</span>
                    <Smile className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Icon Picker */}
                  {showIconPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                    >
                      <div className="grid grid-cols-6 gap-2">
                        {FOLDER_ICONS.map((icon) => (
                          <button
                            key={icon}
                            onClick={() => {
                              setSelectedIcon(icon)
                              setShowIconPicker(false)
                            }}
                            className={`p-2 text-xl hover:bg-gray-100 rounded-lg transition-colors ${
                              selectedIcon === icon ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Couleur
                  </label>
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-full flex items-center justify-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div 
                      className="w-6 h-6 rounded-lg mr-2 border border-gray-300"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <Palette className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Color Picker */}
                  {showColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-lg"
                    >
                      <div className="grid grid-cols-4 gap-2">
                        {FOLDER_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color)
                              setShowColorPicker(false)
                            }}
                            className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform ${
                              selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100">
              <button
                onClick={handleClose}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-colors shadow-lg"
              >
                {folder ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}