'use client'

import { motion, AnimatePresence } from 'framer-motion'
import LivePhonePreview from './LivePhonePreview'
import { useEffect, useState } from 'react'

interface EditPhonePreviewProps {
  isVisible: boolean
  user?: any
  links?: any[]
}

export default function EditPhonePreview({ isVisible, user, links }: EditPhonePreviewProps) {
  const [screenHeight, setScreenHeight] = useState(0)

  useEffect(() => {
    const updateHeight = () => {
      setScreenHeight(window.innerHeight)
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  // Calculer la position optimale en fonction de la hauteur de l'écran
  const getTopPosition = () => {
    if (screenHeight > 900) return 'top-8' // Grands écrans - plus haut
    if (screenHeight > 800) return 'top-6' // Écrans moyens
    if (screenHeight > 700) return 'top-4'  // Petits écrans
    return 'top-2' // Très petits écrans
  }

  // Ajuster la position horizontale selon la largeur
  const getRightPosition = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width > 1920) return 'right-20' // Très grands écrans - plus proche
      if (width > 1536) return 'right-16' // Grands écrans
      if (width > 1280) return 'right-12' // Écrans moyens
      return 'right-8' // Petits écrans larges
    }
    return 'right-16'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 30,
            stiffness: 300,
            mass: 0.8
          }}
          className={`hidden xl:flex fixed ${getTopPosition()} ${getRightPosition()} h-[calc(100vh-2rem)] items-start justify-center pointer-events-none`}
          style={{ zIndex: 9999 }}
        >
          {/* Conteneur avec ombre et effet de profondeur */}
          <div className="pointer-events-auto relative">
            {/* Effet de lumière ambiante */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl scale-150 opacity-50" />

            {/* Ombre portée élégante */}
            <div className="absolute inset-0 bg-black/20 blur-2xl translate-y-8 scale-95" />

            {/* Le téléphone */}
            <div className="relative">
              <LivePhonePreview user={user} links={links} />
            </div>

            {/* Label flottant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Aperçu en temps réel
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Vos modifications apparaissent instantanément
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}