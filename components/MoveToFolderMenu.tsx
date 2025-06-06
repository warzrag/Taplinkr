'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, Move, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Folder {
  id: string
  name: string
  color: string
  icon: string
}

interface MoveToFolderMenuProps {
  linkId: string
  currentFolderId?: string
  onClose: () => void
  onMove: (linkId: string, folderId: string | null) => void
}

export default function MoveToFolderMenu({ linkId, currentFolderId, onClose, onMove }: MoveToFolderMenuProps) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des dossiers')
    } finally {
      setLoading(false)
    }
  }

  const handleMove = (folderId: string | null) => {
    onMove(linkId, folderId)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <Move className="w-5 h-5" />
              <span>Déplacer vers un dossier</span>
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Option "Sans dossier" */}
              {currentFolderId && (
                <button
                  onClick={() => handleMove(null)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left border border-gray-200"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sans dossier</p>
                    <p className="text-sm text-gray-500">Retirer du dossier actuel</p>
                  </div>
                </button>
              )}

              {/* Liste des dossiers */}
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleMove(folder.id)}
                  disabled={folder.id === currentFolderId}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left border ${
                    folder.id === currentFolderId
                      ? 'border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${folder.color}20` }}
                  >
                    <span className="text-lg">{folder.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium">{folder.name}</p>
                    {folder.id === currentFolderId && (
                      <p className="text-sm text-gray-500">Dossier actuel</p>
                    )}
                  </div>
                </button>
              ))}

              {folders.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  Aucun dossier créé. Créez un dossier depuis l'onglet "Dossiers".
                </p>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}