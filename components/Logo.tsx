'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  animated?: boolean
  className?: string
}

interface LogoMarkProps {
  size: number
  className?: string
  title?: string
}

function LogoMark({ size, className = '', title }: LogoMarkProps) {
  const gradientId = React.useId()
  const softGradientId = `${gradientId}-soft`
  const stemGradientId = `${gradientId}-stem`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={softGradientId} x1="7" y1="10" x2="55" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DDD6FE" />
        </linearGradient>
        <linearGradient id={stemGradientId} x1="25" y1="22" x2="53" y2="57" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="0.55" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
      </defs>

      {/* The violet loop sits behind the horizontal link, creating a true interlock. */}
      <path
        d="M28 25V42.5C28 50.5 32.8 55 39.5 55C46.2 55 51 50.4 51 42.5V30"
        stroke={`url(#${stemGradientId})`}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="7.5"
        y="9.5"
        width="49"
        height="23"
        rx="11.5"
        stroke="#5B4BC4"
        strokeOpacity="0.6"
        strokeWidth="10"
      />
      <rect
        x="7.5"
        y="9.5"
        width="49"
        height="23"
        rx="11.5"
        stroke={`url(#${softGradientId})`}
        strokeWidth="7"
      />
      {/* This short foreground segment makes the two links visibly woven together. */}
      <path
        d="M28 24.5V32.5"
        stroke={`url(#${stemGradientId})`}
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
  )
}

const sizes = {
  sm: { icon: 28, text: 17 },
  md: { icon: 36, text: 20 },
  lg: { icon: 44, text: 24 },
  xl: { icon: 56, text: 30 },
}

export default function Logo({ size = 'md', showText = true, animated = true, className = '' }: LogoProps) {
  const currentSize = sizes[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <motion.div
        className="relative shrink-0"
        initial={animated ? { opacity: 0, scale: 0.9 } : false}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={animated ? { scale: 1.04, y: -1 } : undefined}
        whileTap={animated ? { scale: 0.97 } : undefined}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <LogoMark size={currentSize.icon} title="TapLinkr" />
      </motion.div>

      {showText && (
        <motion.span
          className="select-none whitespace-nowrap font-bold tracking-[-0.045em] text-foreground"
          style={{ fontSize: currentSize.text, lineHeight: 1 }}
          initial={animated ? { opacity: 0, x: -5 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: animated ? 0.08 : 0 }}
        >
          <span>Tap</span>
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Linkr</span>
        </motion.span>
      )}
    </div>
  )
}

export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return <LogoMark size={size} className={className} title="TapLinkr" />
}
