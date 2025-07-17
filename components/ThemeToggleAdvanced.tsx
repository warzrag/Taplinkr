'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'

export default function ThemeToggleAdvanced() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-24 h-12 rounded-full overflow-hidden shadow-2xl"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background gradient animation */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: theme === 'dark' 
            ? [
                'linear-gradient(to right, #1e3a8a, #312e81)',
                'linear-gradient(to right, #312e81, #1e3a8a)',
                'linear-gradient(to right, #1e3a8a, #312e81)'
              ]
            : [
                'linear-gradient(to right, #60a5fa, #fbbf24)',
                'linear-gradient(to right, #fbbf24, #60a5fa)',
                'linear-gradient(to right, #60a5fa, #fbbf24)'
              ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Day elements */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: theme === 'light' ? 1 : 0,
          scale: theme === 'light' ? 1 : 0.8
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Sun */}
        <motion.div
          className="absolute w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full"
          style={{ top: '50%', left: '25%', transform: 'translate(-50%, -50%)' }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <motion.div
              key={angle}
              className="absolute w-1 h-3 bg-gradient-to-t from-yellow-400 to-transparent"
              style={{
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-15px)`,
                transformOrigin: '50% 50%'
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scaleY: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: angle / 360
              }}
            />
          ))}
        </motion.div>

        {/* Clouds */}
        <motion.div
          className="absolute w-6 h-3 bg-white/70 rounded-full"
          style={{ top: '30%', right: '20%' }}
          animate={{ x: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Night elements */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: theme === 'dark' ? 1 : 0,
          scale: theme === 'dark' ? 1 : 0.8
        }}
        transition={{ duration: 0.5 }}
      >
        {/* Moon */}
        <motion.div
          className="absolute w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full overflow-hidden"
          style={{ top: '50%', right: '25%', transform: 'translate(50%, -50%)' }}
          animate={{
            rotate: [0, 10, 0, -10, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Moon craters */}
          <div className="absolute w-2 h-2 bg-gray-500/30 rounded-full" style={{ top: '20%', left: '30%' }} />
          <div className="absolute w-1.5 h-1.5 bg-gray-500/20 rounded-full" style={{ top: '50%', right: '25%' }} />
          <div className="absolute w-1 h-1 bg-gray-500/25 rounded-full" style={{ bottom: '25%', left: '40%' }} />
        </motion.div>

        {/* Stars */}
        {[
          { size: 1, top: '20%', left: '15%', delay: 0 },
          { size: 1.5, top: '70%', left: '25%', delay: 0.5 },
          { size: 1, top: '40%', left: '10%', delay: 1 },
          { size: 0.8, top: '60%', left: '30%', delay: 1.5 },
        ].map((star, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${star.size * 4}px`,
              height: `${star.size * 4}px`,
              top: star.top,
              left: star.left
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: star.delay
            }}
          />
        ))}
      </motion.div>

      {/* Indicator text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-3"
        animate={{
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          times: [0, 0.1, 0.9, 1]
        }}
      >
        <span className="text-xs font-medium text-white/80">
          {theme === 'dark' ? 'Night' : 'Day'}
        </span>
      </motion.div>
    </motion.button>
  )
}