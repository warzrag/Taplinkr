'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inbox, Move, X } from 'lucide-react'
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
      toast.error('Unable to load groups')
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#2a2a38] bg-[#0e0e17] p-6 text-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <Move className="w-5 h-5" />
              <span>Move to a group</span>
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-[#8d8d9f] transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Ungrouped option */}
              {currentFolderId && (
                <button
                  onClick={() => handleMove(null)}
                  className="flex w-full items-center space-x-3 rounded-xl border border-[#2b2b39] p-3 text-left transition-colors hover:border-violet-400/35 hover:bg-violet-500/10"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-[#a0a0b2]">
                    <Inbox className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Ungrouped</p>
                    <p className="text-sm text-[#7f7f91]">Remove from the current group</p>
                  </div>
                </button>
              )}

              {/* Liste des dossiers */}
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleMove(folder.id)}
                  disabled={folder.id === currentFolderId}
                  className={`flex w-full items-center space-x-3 rounded-xl border p-3 text-left transition-colors ${
                    folder.id === currentFolderId
                      ? 'cursor-not-allowed border-violet-400/20 bg-violet-500/10 opacity-50'
                      : 'border-[#2b2b39] hover:border-violet-400/35 hover:bg-violet-500/10'
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
                      <p className="text-sm text-[#7f7f91]">Current group</p>
                    )}
                  </div>
                </button>
              ))}

              {folders.length === 0 && (
                <p className="py-8 text-center text-[#7f7f91]">
                  No groups yet. Create one from the Links page.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
