'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ThemeToggleMinimal() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 shadow-lg overflow-hidden"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      style={{
        boxShadow: theme === 'dark' 
          ? 'inset 0 2px 10px rgba(0,0,0,0.5), 0 5px 20px rgba(79, 70, 229, 0.3)' 
          : 'inset 0 2px 10px rgba(255,255,255,0.5), 0 5px 20px rgba(251, 191, 36, 0.3)'
      }}
    >
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Sun core */}
            <motion.div
              className="relative w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(251, 191, 36, 0.5)',
                  '0 0 40px rgba(251, 191, 36, 0.8)',
                  '0 0 20px rgba(251, 191, 36, 0.5)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Animated sun rays */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {[0, 60, 120, 180, 240, 300].map((angle) => (
                  <div
                    key={angle}
                    className="absolute w-1 h-8 -top-8 left-1/2 -translate-x-1/2"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <div className="w-full h-2 bg-gradient-to-t from-yellow-400 to-transparent rounded-full" />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Moon */}
            <motion.div
              className="relative w-8 h-8"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Moon shape with gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full" />
              
              {/* Moon glow */}
              <motion.div
                className="absolute -inset-2 bg-blue-400 rounded-full blur-xl opacity-50"
                animate={{
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Crescent shadow */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute -right-1 -top-1 w-8 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full" />
              </div>
            </motion.div>

            {/* Floating stars */}
            {[
              { x: -20, y: -15, delay: 0 },
              { x: 15, y: -10, delay: 0.5 },
              { x: -15, y: 10, delay: 1 },
              { x: 20, y: 5, delay: 1.5 },
            ].map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{ left: '50%', top: '50%' }}
                animate={{
                  x: [pos.x - 5, pos.x + 5, pos.x - 5],
                  y: [pos.y - 5, pos.y + 5, pos.y - 5],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: pos.delay
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corner accent */}
      <motion.div
        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-tl-xl ${
          theme === 'dark' ? 'bg-indigo-500' : 'bg-orange-400'
        }`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5]
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