'use client'

import { motion } from 'framer-motion'

export default function LinkLogoHero() {
  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Cercles d'arrière-plan animés */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute w-56 h-56 rounded-full border-2 border-blue-500/20" />
        <div className="absolute w-64 h-64 rounded-full border-2 border-purple-500/20" />
        <div className="absolute w-72 h-72 rounded-full border-2 border-cyan-500/20" />
      </motion.div>

      {/* Logo central */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          duration: 1.5 
        }}
      >
        <div className="relative w-48 h-48">
          {/* Effet de lueur */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-500 rounded-2xl blur-2xl opacity-50 animate-pulse" />
          
          {/* Container principal */}
          <div className="relative w-48 h-48 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-3xl overflow-hidden shadow-2xl">
            {/* Grille de fond */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }} />
            
            {/* Logo SVG */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-4">
              <defs>
                <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6">
                    <animate attributeName="stop-color" values="#3B82F6;#8B5CF6;#06B6D4;#3B82F6" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#8B5CF6">
                    <animate attributeName="stop-color" values="#8B5CF6;#06B6D4;#3B82F6;#8B5CF6" dur="4s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#06B6D4">
                    <animate attributeName="stop-color" values="#06B6D4;#3B82F6;#8B5CF6;#06B6D4" dur="4s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
                <filter id="heroGlow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Lettre T */}
              <g fill="url(#heroGradient)" filter="url(#heroGlow)">
                {/* Barre horizontale avec effet 3D */}
                <rect x="15" y="15" width="50" height="20" rx="10" opacity="0.9" />
                <rect x="15" y="15" width="50" height="18" rx="9" />
                
                {/* Barre verticale avec effet 3D */}
                <rect x="30" y="15" width="20" height="50" rx="10" opacity="0.9" />
                <rect x="30" y="15" width="20" height="48" rx="9" />
              </g>
              
              {/* Flèche de lien animée */}
              <motion.g
                animate={{
                  x: [0, 3, 0],
                  y: [0, -3, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <g fill="url(#heroGradient)" filter="url(#heroGlow)">
                  {/* Corps de la flèche avec effet 3D */}
                  <rect x="45" y="50" width="35" height="15" rx="7.5" transform="rotate(-45 62.5 57.5)" opacity="0.9" />
                  <rect x="45" y="50" width="35" height="13" rx="6.5" transform="rotate(-45 62.5 57.5)" />
                  
                  {/* Pointe de la flèche */}
                  <path d="M 65 40 L 80 55 L 80 50 L 90 60 L 80 70 L 80 65 L 65 50 Z" opacity="0.9" />
                  <path d="M 65 42 L 78 55 L 78 52 L 86 60 L 78 68 L 78 65 L 65 52 Z" />
                </g>
              </motion.g>
              
              {/* Particules flottantes */}
              {[...Array(4)].map((_, i) => (
                <motion.circle
                  key={i}
                  r="1.5"
                  fill="url(#heroGradient)"
                  initial={{
                    cx: 50 + (Math.random() - 0.5) * 60,
                    cy: 50 + (Math.random() - 0.5) * 60,
                  }}
                  animate={{
                    cy: [null, "-20", null],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.7,
                    ease: "easeOut"
                  }}
                />
              ))}
            </svg>
            
            {/* Effet de scan */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent h-1/3"
              animate={{
                y: ['0%', '200%', '0%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Texte TapLinkr */}
      <motion.div
        className="absolute -bottom-12 left-0 right-0 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <h1 className="text-6xl font-black">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(147,51,234,0.5))'
            }}
          >
            TapLinkr
          </span>
        </h1>
      </motion.div>
    </div>
  )
}