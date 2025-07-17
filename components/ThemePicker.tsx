'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Check, Sparkles } from 'lucide-react'
import { themes, Theme } from '@/lib/themes'

interface ThemePickerProps {
  currentTheme?: string
  onThemeSelect: (theme: Theme) => void
}

export default function ThemePicker({ currentTheme, onThemeSelect }: ThemePickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<Theme['category'] | 'all'>('all')
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null)
  
  const categories = [
    { id: 'all', name: 'Tous', icon: '🎨' },
    { id: 'minimal', name: 'Minimal', icon: '⚪' },
    { id: 'gradient', name: 'Gradient', icon: '🌈' },
    { id: 'modern', name: 'Moderne', icon: '✨' },
    { id: 'fun', name: 'Fun', icon: '🎉' },
    { id: 'professional', name: 'Pro', icon: '💼' }
  ]
  
  const filteredThemes = selectedCategory === 'all' 
    ? themes 
    : themes.filter(theme => theme.category === selectedCategory)
  
  const handleThemeClick = (theme: Theme) => {
    setPreviewTheme(theme)
    onThemeSelect(theme)
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
          <Palette className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Thèmes prédéfinis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Choisissez un thème pour personnaliser votre page</p>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </motion.button>
        ))}
      </div>
      
      {/* Themes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredThemes.map((theme) => (
            <motion.div
              key={theme.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
              className="relative group cursor-pointer"
              onClick={() => handleThemeClick(theme)}
            >
              {/* Theme Preview Card */}
              <div 
                className="relative h-48 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl"
                style={{
                  background: theme.styles.backgroundType === 'gradient' 
                    ? theme.styles.backgroundGradient 
                    : theme.styles.backgroundColor
                }}
              >
                {/* Preview Content */}
                <div className="absolute inset-0 p-4 flex flex-col items-center justify-center">
                  {/* Theme Icon */}
                  <div className="text-4xl mb-3">{theme.preview}</div>
                  
                  {/* Sample Links */}
                  <div className="w-full max-w-[150px] space-y-2">
                    <div 
                      className={`w-full py-2 px-3 ${theme.styles.linkBorderRadius} text-xs font-medium text-center`}
                      style={{
                        backgroundColor: theme.styles.linkBackgroundColor,
                        color: theme.styles.linkTextColor
                      }}
                    >
                      Mon lien
                    </div>
                    <div 
                      className={`w-full py-2 px-3 ${theme.styles.linkBorderRadius} text-xs font-medium text-center opacity-70`}
                      style={{
                        backgroundColor: theme.styles.linkBackgroundColor,
                        color: theme.styles.linkTextColor
                      }}
                    >
                      Autre lien
                    </div>
                  </div>
                </div>
                
                {/* Selected Indicator */}
                {currentTheme === theme.id && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
              
              {/* Theme Info */}
              <div className="mt-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {theme.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {theme.description}
                </p>
              </div>
              
              {/* Apply Animation */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-100 -z-10 blur-lg"
                animate={{
                  opacity: currentTheme === theme.id ? 0.3 : 0
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Preview Mode Indicator */}
      {previewTheme && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Aperçu du thème: {previewTheme.name}</span>
        </motion.div>
      )}
    </div>
  )
}