'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Folder as FolderIcon, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Move
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Folder {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  isExpanded: boolean
  links: any[]
}

interface FolderManagerProps {
  folders: Folder[]
  onFoldersChange: (folders: Folder[]) => void
  onMoveLink: (linkId: string, folderId: string | null) => void
}

export default function FolderManager({ folders, onFoldersChange, onMoveLink }: FolderManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [newFolderData, setNewFolderData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '📁'
  })

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ]

  const icons = ['📁', '🔗', '💼', '📋', '🎯', '⭐', '🏠', '💡']

  const createFolder = async () => {
    if (!newFolderData.name.trim()) {
      toast.error('Le nom du dossier est requis')
      return
    }

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFolderData)
      })

      if (response.ok) {
        const folder = await response.json()
        onFoldersChange([...folders, folder])
        setNewFolderData({ name: '', description: '', color: '#3b82f6', icon: '📁' })
        setIsCreating(false)
        toast.success('Dossier créé!')
      } else {
        const errorData = await response.json()
        console.error('Erreur API:', errorData)
        toast.error(errorData.error || 'Erreur lors de la création du dossier')
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
      toast.error('Erreur réseau lors de la création')
    }
  }

  const updateFolder = async (folderId: string, updates: Partial<Folder>) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const updatedFolder = await response.json()
        const newFolders = folders.map(f => f.id === folderId ? updatedFolder : f)
        onFoldersChange(newFolders)
        setEditingFolder(null)
        toast.success('Dossier mis à jour!')
      } else {
        toast.error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Les liens seront déplacés vers "Sans dossier".')) {
      return
    }

    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const newFolders = folders.filter(f => f.id !== folderId)
        onFoldersChange(newFolders)
        toast.success('Dossier supprimé!')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const toggleFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId)
    if (folder) {
      updateFolder(folderId, { isExpanded: !folder.isExpanded })
    }
  }

  return (
    <div className="space-y-4">
      {/* Bouton créer dossier */}
      <motion.button
        onClick={() => setIsCreating(true)}
        className="w-full flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all duration-300 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg"
          whileHover={{ rotate: 90 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.div>
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Créer un dossier</span>
      </motion.button>

      {/* Formulaire de création */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 space-y-4"
          >
            <input
              type="text"
              placeholder="Nom du dossier"
              value={newFolderData.name}
              onChange={(e) => setNewFolderData({ ...newFolderData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <input
              type="text"
              placeholder="Description (optionnel)"
              value={newFolderData.description}
              onChange={(e) => setNewFolderData({ ...newFolderData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {/* Sélecteur de couleur */}
            <div className="flex space-x-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewFolderData({ ...newFolderData, color })}
                  className={`w-8 h-8 rounded-lg border-2 ${
                    newFolderData.color === color ? 'border-gray-900' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Sélecteur d'icône */}
            <div className="flex space-x-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setNewFolderData({ ...newFolderData, icon })}
                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                    newFolderData.icon === icon ? 'border-gray-900 bg-gray-100' : 'border-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={createFolder}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-all duration-200"
              >
                Créer
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des dossiers */}
      <div className="space-y-2">
        {folders.map((folder) => (
          <motion.div
            key={folder.id}
            className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            layout
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background gradient */}
            <div 
              className="absolute inset-0 opacity-90"
              style={{ 
                background: `linear-gradient(135deg, ${folder.color}15 0%, ${folder.color}30 100%)`
              }}
            />
            
            {/* Glass effect overlay */}
            <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm" />
            
            {/* En-tête du dossier */}
            <div className="relative flex items-center justify-between p-5 cursor-pointer">
              <div 
                className="flex items-center space-x-4 flex-1"
                onClick={() => toggleFolder(folder.id)}
              >
                {/* Folder icon with animation */}
                <motion.div
                  className="relative"
                  animate={{ rotate: folder.isExpanded ? 0 : -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: folder.color }}
                  >
                    <span className="text-2xl filter drop-shadow-sm">{folder.icon}</span>
                  </div>
                  {/* Chevron indicator */}
                  <motion.div
                    className="absolute -right-1 -bottom-1 w-6 h-6 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center"
                    animate={{ rotate: folder.isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                  </motion.div>
                </motion.div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {folder.name}
                  </h3>
                  {folder.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                      {folder.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${folder.color}20`,
                        color: folder.color
                      }}
                    >
                      {folder.links.length} {folder.links.length === 1 ? 'lien' : 'liens'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <motion.button
                  onClick={() => setEditingFolder(folder)}
                  className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </motion.button>
                <motion.button
                  onClick={() => deleteFolder(folder.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </motion.button>
              </div>
            </div>

            {/* Contenu du dossier */}
            <AnimatePresence>
              {folder.isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50"
                >
                  {folder.links.length === 0 ? (
                    <div className="text-center py-8">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FolderIcon className="w-8 h-8 text-gray-400" />
                      </motion.div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">Aucun lien dans ce dossier</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Glissez des liens ici pour les organiser</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {folder.links.map((link) => (
                        <motion.div 
                          key={link.id} 
                          className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.title}</span>
                          </div>
                          <motion.button
                            onClick={() => onMoveLink(link.id, null)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                            title="Sortir du dossier"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Move className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}