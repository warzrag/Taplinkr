'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Link } from '@/types'

interface EditLinkModalProps {
  isOpen: boolean
  editingLink: Link | null
  onClose: () => void
  onSuccess: () => void
}

export default function EditLinkModal({ isOpen, onClose }: EditLinkModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-20"
            onClick={onClose}
          />

          {/* Modal vide */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Modifier le lien</h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Contenu vide */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Contenu du modal</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
