'use client'

import { motion } from 'framer-motion'

export default function LogoHero() {
  return (
    <div className="relative w-64 h-64 mx-auto">
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
        <div className="absolute w-48 h-48 rounded-full border-2 border-blue-500/20" />
        <div className="absolute w-56 h-56 rounded-full border-2 border-purple-500/20" />
        <div className="absolute w-64 h-64 rounded-full border-2 border-pink-500/20" />
      </motion.div>

      {/* Logo central avec effet néon */}
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
        <div className="relative">
          {/* Effet de lueur néon */}
          <div className="absolute inset-0 w-32 h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-50 animate-pulse" />
          
          {/* Container principal */}
          <div className="relative w-32 h-32 bg-black rounded-2xl overflow-hidden">
            {/* Gradient de fond */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90" />
            
            {/* Grille de points lumineux */}
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 1px)`,
              backgroundSize: '10px 10px'
            }} />
            
            {/* Lettre T avec effet métallique */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <span className="text-6xl font-black text-white" style={{
                  textShadow: `
                    0 0 10px rgba(255,255,255,0.9),
                    0 0 20px rgba(59,130,246,0.8),
                    0 0 30px rgba(147,51,234,0.6),
                    0 0 40px rgba(236,72,153,0.4),
                    0 4px 4px rgba(0,0,0,0.3)
                  `,
                  letterSpacing: '-0.05em'
                }}>
                  T
                </span>
              </motion.div>
            </div>
            
            {/* Lignes de scan animées */}
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
            
            {/* Coins lumineux */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/50" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/50" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/50" />
          </div>
          
          {/* Particules flottantes */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Texte TapLinkr */}
      <motion.div
        className="absolute -bottom-8 left-0 right-0 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <h1 className="text-5xl font-black">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
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