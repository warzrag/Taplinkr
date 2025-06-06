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
        toast.error('Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur lors de la création')
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
        className="w-full flex items-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors text-gray-600 hover:text-blue-600"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="w-5 h-5" />
        <span>Créer un dossier</span>
      </motion.button>

      {/* Formulaire de création */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 p-4 rounded-lg space-y-3"
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
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
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
            className="border border-gray-200 rounded-lg overflow-hidden"
            layout
          >
            {/* En-tête du dossier */}
            <div 
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
              style={{ backgroundColor: `${folder.color}10` }}
            >
              <div className="flex items-center space-x-3" onClick={() => toggleFolder(folder.id)}>
                {folder.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span className="text-lg">{folder.icon}</span>
                <div>
                  <h3 className="font-semibold">{folder.name}</h3>
                  {folder.description && (
                    <p className="text-sm text-gray-600">{folder.description}</p>
                  )}
                  <p className="text-xs text-gray-500">{folder.links.length} lien(s)</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingFolder(folder)}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteFolder(folder.id)}
                  className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenu du dossier */}
            <AnimatePresence>
              {folder.isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 p-3 bg-gray-50/50"
                >
                  {folder.links.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Aucun lien dans ce dossier</p>
                  ) : (
                    <div className="space-y-2">
                      {folder.links.map((link) => (
                        <div key={link.id} className="flex items-center justify-between bg-white p-2 rounded border">
                          <span className="text-sm font-medium">{link.title}</span>
                          <button
                            onClick={() => onMoveLink(link.id, null)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Sortir du dossier"
                          >
                            <Move className="w-4 h-4" />
                          </button>
                        </div>
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