'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative w-20 h-10 rounded-full p-1 transition-all duration-500
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-500'
        }
        shadow-lg hover:shadow-xl transform hover:scale-105
      `}
      whileTap={{ scale: 0.95 }}
      aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {/* Background elements */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {theme === 'light' && (
          <>
            {/* Clouds for day mode */}
            <motion.div
              className="absolute w-4 h-2 bg-white/40 rounded-full"
              initial={{ x: -20 }}
              animate={{ x: 60 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              style={{ top: '20%', left: '10%' }}
            />
            <motion.div
              className="absolute w-3 h-1.5 bg-white/30 rounded-full"
              initial={{ x: -20 }}
              animate={{ x: 60 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ top: '60%', left: '20%' }}
            />
          </>
        )}
        {theme === 'dark' && (
          <>
            {/* Stars for night mode */}
            <motion.div
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ top: '20%', left: '20%' }}
            />
            <motion.div
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              style={{ top: '40%', left: '70%' }}
            />
            <motion.div
              className="absolute w-0.5 h-0.5 bg-white rounded-full"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              style={{ top: '70%', left: '40%' }}
            />
          </>
        )}
      </div>

      {/* Sliding circle */}
      <motion.div
        className={`
          absolute w-8 h-8 rounded-full shadow-md
          ${theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-200 to-gray-300' 
            : 'bg-gradient-to-br from-white to-yellow-100'
          }
          flex items-center justify-center
        `}
        animate={{
          x: theme === 'dark' ? 40 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        <AnimatePresence mode="wait">
          {theme === 'dark' ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-4 h-4 text-indigo-600" fill="currentColor" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-4 h-4 text-orange-500" fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className={`
          absolute inset-0 rounded-full
          ${theme === 'dark' 
            ? 'bg-purple-400' 
            : 'bg-yellow-300'
          }
          blur-xl opacity-30
        `}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  )
}