import React from 'react'
import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  animated?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, animated = true, className = '' }: LogoProps) {
  const gradientId = React.useId()
  const outerGradientId = `${gradientId}-outer`
  const surfaceGradientId = `${gradientId}-surface`
  const strokeGradientId = `${gradientId}-stroke`
  const linkGradientId = `${gradientId}-link`
  const glowGradientId = `${gradientId}-glow`

  const sizes = {
    sm: { icon: 28, text: 16 },
    md: { icon: 36, text: 18 },
    lg: { icon: 44, text: 22 },
    xl: { icon: 56, text: 28 }
  }

  const currentSize = sizes[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
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
          <defs>
            <linearGradient id={outerGradientId} x1="8" y1="8" x2="56" y2="56">
              <stop offset="0%" stopColor="#4338CA" />
              <stop offset="45%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <linearGradient id={surfaceGradientId} x1="16" y1="14" x2="48" y2="50">
              <stop offset="0%" stopColor="#0F172A" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#1E293B" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id={strokeGradientId} x1="16" y1="16" x2="48" y2="48">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id={linkGradientId} x1="20" y1="20" x2="46" y2="44">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
            <radialGradient id={glowGradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </radialGradient>
          </defs>

          <motion.rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="18"
            fill={`url(#${outerGradientId})`}
            initial={{ rotate: 0 }}
            animate={animated ? { rotate: [0, 2, -2, 0] } : { rotate: 0 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.rect
            x="12"
            y="12"
            width="40"
            height="40"
            rx="14"
            fill={`url(#${surfaceGradientId})`}
            stroke={`url(#${strokeGradientId})`}
            strokeWidth="1.5"
            initial={animated ? { opacity: 0, scale: 0.92 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
          />

          <motion.circle
            cx="32"
            cy="32"
            r="12.5"
            fill={`url(#${glowGradientId})`}
            initial={{ opacity: animated ? 0 : 0.4, scale: animated ? 0.85 : 1 }}
            animate={animated ? { opacity: [0.25, 0.55, 0.25], scale: [0.9, 1.05, 0.9] } : { opacity: 0.4, scale: 1 }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.g
            initial={animated ? { opacity: 0, y: 4 } : { opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
          >
            <motion.path
              d="M23 26c0-4.418 3.582-8 8-8h6c4.418 0 8 3.582 8 8s-3.582 8-8 8h-3.2"
              stroke={`url(#${linkGradientId})`}
              strokeWidth="3.4"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: animated ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
            />
            <motion.path
              d="M41 38c0 4.418-3.582 8-8 8h-6c-4.418 0-8-3.582-8-8s3.582-8 8-8h3.2"
              stroke={`url(#${linkGradientId})`}
              strokeWidth="3.4"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: animated ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
            />
            <motion.path
              d="M27.2 30.8L36.8 39.2"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeOpacity="0.55"
              initial={{ pathLength: animated ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
            />
            <motion.circle
              cx="32"
              cy="32"
              r="3.2"
              fill="#F8FAFC"
              initial={{ scale: animated ? 0 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.5 }}
            />
          </motion.g>

          {animated && (
            <motion.circle
              cx="48"
              cy="18"
              r="4"
              fill="#FDE68A"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
            />
          )}
        </svg>
      </motion.div>

      {showText && (
        <motion.span
          className="font-bold bg-gradient-to-r from-indigo-200 via-sky-300 to-emerald-200 dark:from-indigo-300 dark:via-sky-400 dark:to-cyan-300 bg-clip-text text-transparent tracking-tight select-none"
          style={{ fontSize: currentSize.text }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          TapLinkr
        </motion.span>
      )}
    </div>
  )
}

// Variante simplifiee pour les favicons et petites tailles
export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  const gradientId = React.useId()
  const outerGradientId = `${gradientId}-outer`
  const surfaceGradientId = `${gradientId}-surface`
  const strokeGradientId = `${gradientId}-stroke`
  const linkGradientId = `${gradientId}-link`
  const glowGradientId = `${gradientId}-glow`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={outerGradientId} x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id={surfaceGradientId} x1="16" y1="14" x2="48" y2="50">
          <stop offset="0%" stopColor="#111827" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#1E293B" stopOpacity="0.68" />
        </linearGradient>
        <linearGradient id={strokeGradientId} x1="16" y1="16" x2="48" y2="48">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={linkGradientId} x1="20" y1="20" x2="46" y2="44">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>
        <radialGradient id={glowGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="6" y="6" width="52" height="52" rx="18" fill={`url(#${outerGradientId})`} />
      <rect
        x="12"
        y="12"
        width="40"
        height="40"
        rx="14"
        fill={`url(#${surfaceGradientId})`}
        stroke={`url(#${strokeGradientId})`}
        strokeWidth="1.5"
      />
      <circle cx="32" cy="32" r="12.5" fill={`url(#${glowGradientId})`} opacity="0.7" />
      <path
        d="M23 26c0-4.418 3.582-8 8-8h6c4.418 0 8 3.582 8 8s-3.582 8-8 8h-3.2"
        stroke={`url(#${linkGradientId})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M41 38c0 4.418-3.582 8-8 8h-6c-4.418 0-8-3.582-8-8s3.582-8 8-8h3.2"
        stroke={`url(#${linkGradientId})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M27.2 30.8L36.8 39.2"
        stroke="#F8FAFC"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
      <circle cx="32" cy="32" r="3.2" fill="#F8FAFC" />
    </svg>
  )
}
