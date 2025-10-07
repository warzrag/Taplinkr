import React from 'react'
import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  animated?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, animated = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 16 },
    md: { icon: 36, text: 18 },
    lg: { icon: 44, text: 22 },
    xl: { icon: 56, text: 28 }
  }

  const currentSize = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <motion.div
        className="relative"
        whileHover={animated ? { scale: 1.05 } : {}}
        whileTap={animated ? { scale: 0.95 } : {}}
      >
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Circle */}
          <motion.circle
            cx="32"
            cy="32"
            r="30"
            fill="url(#gradient)"
            initial={{ rotate: 0 }}
            animate={animated ? { rotate: 360 } : {}}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner Design */}
          <g transform="translate(32, 32)">
            {/* Central Node */}
            <motion.circle
              cx="0"
              cy="0"
              r="6"
              fill="white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            />
            
            {/* Connection Lines */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <motion.g
                key={angle}
                transform={`rotate(${angle})`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <line
                  x1="8"
                  y1="0"
                  x2="18"
                  y2="0"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="22"
                  cy="0"
                  r="4"
                  fill="white"
                />
              </motion.g>
            ))}
          </g>
          
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        </svg>

        {/* Animated Sparkle */}
        {animated && (
          <motion.div
            className="absolute -top-1 -right-1"
            initial={{ scale: 0, rotate: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 0L9.79 6.21L16 8L9.79 9.79L8 16L6.21 9.79L0 8L6.21 6.21L8 0Z"
                fill="#FCD34D"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>

      {/* Text */}
      {showText && (
        <motion.span
          className="font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent select-none"
          style={{ fontSize: currentSize.text }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          TapLinkr
        </motion.span>
      )}
    </div>
  )
}

// Variante simplifiée pour les favicons et petites tailles
export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="32" cy="32" r="30" fill="url(#icon-gradient)" />
      
      <g transform="translate(32, 32)">
        <circle cx="0" cy="0" r="6" fill="white" />
        {[0, 72, 144, 216, 288].map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <line x1="8" y1="0" x2="18" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="22" cy="0" r="4" fill="white" />
          </g>
        ))}
      </g>
      
      <defs>
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>
    </svg>
  )
}