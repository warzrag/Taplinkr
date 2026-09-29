'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

/**
 * Le mouvement de l'espace membre (Florent, 29 sept. 2026 : "je parlais quand
 * on rentre dans taplinkr"). Des gestes courts, qui disent ce qui se passe :
 * un chiffre qui monte jusqu'a sa valeur, une fenetre qui sort du bouton qui
 * l'appelle, une coche qui confirme une copie, un chargement qui scintille.
 *
 * Animations reduites : MotionConfig (components/DashboardLayout.tsx) retire
 * les deplacements et les zooms ; les fondus et les chiffres restent.
 */

export const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Un nombre qui monte jusqu'a sa valeur, puis glisse d'une valeur a l'autre
 * quand elle change. Le texte est ecrit par framer-motion, sans refaire le
 * rendu de la page a chaque image.
 */
export function CountUp({
  value,
  decimals = 0,
  suffix = '',
  duration = 1,
  className,
}: {
  value: number
  decimals?: number
  suffix?: string
  duration?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const count = useMotionValue(0)
  const text = useTransform(count, latest => {
    const shown = decimals ? latest : Math.round(latest)
    return `${shown.toLocaleString('en-US', { maximumFractionDigits: decimals })}${suffix}`
  })

  useEffect(() => {
    const controls = animate(count, value, { duration: reduce ? 0.35 : duration, ease: EASE })
    return () => controls.stop()
  }, [count, duration, reduce, value])

  return <motion.span className={className}>{text}</motion.span>
}

// ---------------------------------------------------------------------------
// Les fenetres qui sortent du bouton qui les appelle.

// Le dernier clic ou toucher de la page. Une fenetre qui s'ouvre juste apres
// part de ce point ; au clavier (ou apres plus d'une seconde et demie), elle
// part du centre.
const lastPointer = { x: 0, y: 0, at: 0 }

/** A monter une fois (DashboardLayout) : retient la position de chaque clic. */
export function useTrackPointer() {
  useEffect(() => {
    const note = (event: PointerEvent) => {
      lastPointer.x = event.clientX
      lastPointer.y = event.clientY
      lastPointer.at = Date.now()
    }
    window.addEventListener('pointerdown', note, true)
    return () => window.removeEventListener('pointerdown', note, true)
  }, [])
}

/**
 * Le panneau d'une fenetre centree a l'ecran : il grandit depuis le point du
 * dernier clic, puis se referme vite. Le point est lu une seule fois, a
 * l'ouverture. Hypothese : le panneau est centre dans la fenetre du
 * navigateur (grille place-items-center sur un fond fixe), donc un ecart au
 * centre de l'ecran est le meme ecart au centre du panneau.
 */
export function PopPanel({ children, style, ...props }: HTMLMotionProps<'div'> & { children: ReactNode }) {
  const [origin] = useState(() => {
    if (typeof window === 'undefined' || Date.now() - lastPointer.at > 1500) return '50% 50%'
    const dx = Math.round(lastPointer.x - window.innerWidth / 2)
    const dy = Math.round(lastPointer.y - window.innerHeight / 2)
    return `calc(50% + ${dx}px) calc(50% + ${dy}px)`
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.35 }}
      animate={{ opacity: 1, scale: 1, transition: { scale: { type: 'spring', stiffness: 240, damping: 26, mass: 1 }, opacity: { duration: 0.22 } } }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.16 } }}
      style={{ transformOrigin: origin, ...(style as CSSProperties) }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------

/** Une coche qui se dessine, pour confirmer une copie. */
export function DrawnCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.32, ease: EASE, delay: 0.05 }}
      />
    </svg>
  )
}

/**
 * Un bloc gris de chargement, balaye par un reflet (dash-shimmer, globals.css).
 * Animations reduites : le bloc reste simplement gris.
 */
export function Shimmer({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`dash-shimmer rounded-xl bg-white/[0.045] ${className}`} />
}
