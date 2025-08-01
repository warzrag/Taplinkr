'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    toggleTheme()
    setTimeout(() => setIsAnimating(false), 800)
  }

  return (
    <motion.button
      onClick={handleToggle}
      className={`
        relative w-20 h-10 rounded-full p-1 transition-all duration-700 ease-in-out
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-r from-sky-400 via-yellow-400 to-orange-500'
        }
        shadow-lg hover:shadow-2xl transform hover:scale-105
        ring-2 ring-offset-2 transition-all duration-300
        ${theme === 'dark' 
          ? 'ring-purple-400/50 ring-offset-gray-900' 
          : 'ring-yellow-400/50 ring-offset-white'
        }
      `}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {/* Background elements with transition */}
      <motion.div 
        className="absolute inset-0 rounded-full overflow-hidden"
        animate={{
          background: theme === 'dark' 
            ? 'linear-gradient(45deg, rgba(30,27,75,0.8), rgba(88,28,135,0.8))' 
            : 'linear-gradient(45deg, rgba(56,189,248,0.3), rgba(251,191,36,0.3))'
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {theme === 'light' ? (
            <motion.div
              key="day-scene"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2, rotate: 180 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Animated sun rays */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-0.5 h-3 bg-yellow-300/60 rounded-full"
                    style={{
                      top: '10%',
                      left: '50%',
                      transformOrigin: '50% 200%',
                      transform: `rotate(${i * 45}deg)`,
                    }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>
              {/* Floating clouds */}
              <motion.div
                className="absolute w-4 h-2 bg-white/40 rounded-full"
                animate={{ x: [-10, 70, -10] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{ top: '25%', left: '5%' }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="night-scene"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, rotate: -180 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Twinkling stars */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-white rounded-full"
                  style={{
                    width: Math.random() * 2 + 1 + 'px',
                    height: Math.random() * 2 + 1 + 'px',
                    top: Math.random() * 60 + 10 + '%',
                    left: Math.random() * 60 + 20 + '%',
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeInOut"
                  }}
                />
              ))}
              {/* Crescent moon shadow */}
              <motion.div
                className="absolute w-2 h-2 bg-slate-700/40 rounded-full"
                style={{ top: '30%', right: '25%' }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced sliding circle */}
      <motion.div
        className={`
          absolute w-8 h-8 rounded-full shadow-2xl border-2
          ${theme === 'dark' 
            ? 'bg-gradient-to-br from-slate-100 via-white to-gray-100 border-purple-200/50' 
            : 'bg-gradient-to-br from-white via-yellow-50 to-orange-50 border-yellow-200/50'
          }
          flex items-center justify-center backdrop-blur-sm
        `}
        animate={{
          x: theme === 'dark' ? 40 : 0,
          rotate: isAnimating ? (theme === 'dark' ? 360 : -360) : 0,
        }}
        transition={{
          x: {
            type: "spring",
            stiffness: 400,
            damping: 25
          },
          rotate: {
            duration: 0.8,
            ease: "easeInOut"
          }
        }}
      >
        <AnimatePresence mode="wait">
          {theme === 'dark' ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{ 
                duration: 0.4,
                ease: "easeOut",
                scale: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <Moon className="w-4 h-4 text-slate-600 drop-shadow-sm" fill="currentColor" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 180, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: [180, 0, 15, 0], 
                opacity: 1 
              }}
              exit={{ scale: 0, rotate: -180, opacity: 0 }}
              transition={{ 
                duration: 0.6,
                ease: "easeOut",
                scale: { type: "spring", stiffness: 300, damping: 20 },
                rotate: { duration: 0.8, ease: "easeOut" }
              }}
            >
              <Sun className="w-4 h-4 text-orange-600 drop-shadow-sm" fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Enhanced glow effect */}
      <motion.div
        className={`
          absolute inset-0 rounded-full blur-xl -z-10
          ${theme === 'dark' 
            ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
            : 'bg-gradient-to-r from-yellow-400 to-orange-400'
          }
        `}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Transition overlay effect */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 100, opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}