'use client'

import { motion } from 'framer-motion'

interface LinkLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  animated?: boolean
}

export default function LinkLogo({ size = 'md', showText = true, animated = true }: LinkLogoProps) {
  const sizeClasses = {
    sm: { container: 'w-8 h-8', brand: 'text-base' },
    md: { container: 'w-10 h-10', brand: 'text-xl' },
    lg: { container: 'w-12 h-12', brand: 'text-2xl' },
    xl: { container: 'w-16 h-16', brand: 'text-3xl' }
  }

  const { container, brand } = sizeClasses[size]

  return (
    <div className="flex items-center space-x-3">
      <motion.div 
        className="relative"
        whileHover={animated ? { scale: 1.05 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className={`relative ${container}`}>
          {/* Conteneur avec dégradé */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Lettre T stylisée */}
            <g fill="url(#logoGradient)" filter={animated ? "url(#glow)" : ""}>
              {/* Barre horizontale du T avec coins arrondis */}
              <rect x="15" y="20" width="55" height="18" rx="9" />
              {/* Barre verticale du T */}
              <rect x="32" y="20" width="18" height="45" rx="9" />
            </g>
            
            {/* Flèche de lien */}
            <motion.g 
              fill="url(#logoGradient)" 
              filter={animated ? "url(#glow)" : ""}
              animate={animated ? {
                x: [0, 2, 0],
                y: [0, -2, 0],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Corps de la flèche */}
              <rect x="45" y="55" width="30" height="12" rx="6" transform="rotate(-45 60 61)" />
              {/* Pointe de la flèche - triangle */}
              <path d="M 70 45 L 85 60 L 70 75 L 70 65 L 60 65 L 60 55 L 70 55 Z" />
            </motion.g>
            
            {/* Effet de brillance animé */}
            {animated && (
              <motion.rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                rx="20"
                strokeDasharray="5,5"
                animate={{
                  strokeDashoffset: [0, -10],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            )}
          </svg>
        </div>
      </motion.div>

      {/* Texte TapLinkr */}
      {showText && (
        <motion.span 
          className={`font-bold ${brand} bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          TapLinkr
        </motion.span>
      )}
    </div>
  )
}