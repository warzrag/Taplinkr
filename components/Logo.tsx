'use client'

import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  animated?: boolean
}

export default function Logo({ size = 'md', showText = true, animated = true }: LogoProps) {
  const sizeClasses = {
    sm: { container: 'w-8 h-8', text: 'text-lg', brand: 'text-base' },
    md: { container: 'w-10 h-10', text: 'text-xl', brand: 'text-xl' },
    lg: { container: 'w-12 h-12', text: 'text-2xl', brand: 'text-2xl' },
    xl: { container: 'w-16 h-16', text: 'text-3xl', brand: 'text-3xl' }
  }

  const { container, text, brand } = sizeClasses[size]

  return (
    <div className="flex items-center space-x-3">
      <motion.div 
        className="relative"
        whileHover={animated ? { scale: 1.05, rotate: 5 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* Effet de brillance animé */}
        {animated && (
          <motion.div
            className={`absolute inset-0 ${container} bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-xl blur-lg opacity-50`}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}
        
        {/* Logo principal */}
        <div className={`relative ${container} bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg overflow-hidden`}>
          {/* Effet de reflet */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent" />
          
          {/* Lignes animées */}
          {animated && (
            <>
              <motion.div
                className="absolute top-0 left-0 w-full h-[2px] bg-white/40"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-full h-[2px] bg-white/40"
                animate={{
                  x: ['100%', '-100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1
                }}
              />
            </>
          )}
          
          {/* Logo T avec flèche style lien */}
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <div className="relative w-full h-full">
              {/* Lettre T */}
              <div className="absolute inset-0">
                {/* Barre horizontale du T */}
                <div className="absolute top-[15%] left-[10%] right-[40%] h-[20%] bg-white rounded-sm" />
                {/* Barre verticale du T */}
                <div className="absolute top-[15%] bottom-[35%] left-[35%] w-[20%] bg-white rounded-sm" />
              </div>
              
              {/* Flèche de lien */}
              <div className="absolute bottom-[15%] right-[10%]">
                {/* Tige de la flèche */}
                <div className="absolute w-[35%] h-[15%] bg-white rounded-sm transform rotate-45 translate-x-[-8px] translate-y-[-8px]" />
                {/* Pointe de la flèche */}
                <div className="absolute w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-white border-b-[10px] border-b-transparent transform translate-x-[5px] translate-y-[-5px]" />
              </div>
            </div>
          </div>
          
          {/* Points lumineux animés */}
          {animated && (
            <>
              <motion.div
                className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </>
          )}
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