'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit, Eye, Smartphone, Sparkles, Monitor, ArrowRight } from 'lucide-react'

interface PreviewEditButtonProps {
  onClick: () => void
  variant?: 'option1' | 'option2' | 'option3' | 'option4' | 'option5'
}

export default function PreviewEditButton({ onClick, variant = 'option1' }: PreviewEditButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Option 1: Bouton avec texte qui change au survol
  if (variant === 'option1') {
    return (
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Edit size={16} />
              <span className="text-sm font-medium">Modifier</span>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <Eye size={16} />
              <span className="text-sm font-medium">Prévisualiser</span>
              <Smartphone size={14} className="opacity-70" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    )
  }

  // Option 2: Bouton split avec deux zones
  if (variant === 'option2') {
    return (
      <div className="flex">
        <button
          onClick={onClick}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors flex items-center gap-2"
        >
          <Edit size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Modifier</span>
        </button>
        <button
          onClick={onClick}
          className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-r-xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 border-l-0"
        >
          <Eye size={16} />
          <span className="text-sm font-medium">Live</span>
        </button>
      </div>
    )
  }

  // Option 3: Bouton avec animation d'icône
  if (variant === 'option3') {
    return (
      <motion.button
        onClick={onClick}
        className="group relative px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              animate={{ rotate: isHovered ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Edit size={16} />
            </motion.div>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Eye size={16} />
            </motion.div>
          </div>
          <span className="text-sm font-medium">
            Modifier & Prévisualiser
          </span>
          <motion.div
            animate={{ x: isHovered ? 0 : -10, opacity: isHovered ? 1 : 0 }}
            className="absolute right-3"
          >
            <Smartphone size={14} />
          </motion.div>
        </div>
      </motion.button>
    )
  }

  // Option 4: Bouton minimaliste avec badge
  if (variant === 'option4') {
    return (
      <button
        onClick={onClick}
        className="relative group"
      >
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 flex items-center gap-2">
          <Edit size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Modifier</span>
        </div>
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium animate-pulse">
          LIVE
        </div>
      </button>
    )
  }

  // Option 5: Bouton futuriste avec effet glow
  if (variant === 'option5') {
    return (
      <motion.button
        onClick={onClick}
        className="relative group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
        
        {/* Button content */}
        <div className="relative px-4 py-2.5 bg-black dark:bg-white backdrop-blur-sm rounded-xl border border-white/20 dark:border-black/20">
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Edit size={12} className="text-white" />
              </div>
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Eye size={12} className="text-white" />
              </div>
            </div>
            <span className="text-sm font-medium text-white dark:text-black">
              Éditer en direct
            </span>
            <Sparkles size={14} className="text-purple-400 dark:text-purple-600 animate-pulse" />
          </div>
        </div>
      </motion.button>
    )
  }

  return null
}