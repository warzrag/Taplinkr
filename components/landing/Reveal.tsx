'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { motion, useInView } from 'framer-motion'
import type { Variants } from 'framer-motion'

/**
 * Apparitions au defilement de la page d'accueil.
 *
 * Visibles par defaut : le serveur et le premier rendu montrent le contenu, si
 * bien qu'un script en echec ne cache jamais rien. Juste apres le montage,
 * seul ce qui est encore sous le bas de l'ecran est masque (d'un coup, sans
 * transition), puis revele quand il arrive. Ce qui est deja a l'ecran ne bouge
 * pas. Animations reduites : MotionConfig (app/page.tsx) supprime les
 * deplacements, il reste le fondu.
 */

const EASE = [0.16, 1, 0.3, 1] as const
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function useReveal<T extends HTMLElement>(amount: number) {
  const ref = useRef<T>(null)
  const [armed, setArmed] = useState(false)
  const inView = useInView(ref, { once: true, amount })

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (element && element.getBoundingClientRect().top > window.innerHeight * 0.92) setArmed(true)
  }, [])

  return { ref, state: armed && !inView ? 'hidden' : 'shown' }
}

/** Un bloc qui monte et apparait. */
export function Reveal({ children, className, delay = 0, y = 24 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const { ref, state } = useReveal<HTMLDivElement>(0.3)
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={state}
      variants={{
        hidden: { opacity: 0, y, transition: { duration: 0 } },
        shown: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  )
}

const WORD: Variants = {
  hidden: { opacity: 0, y: '0.4em', filter: 'blur(8px)', transition: { duration: 0 } },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } },
}

/** Un titre dont les mots montent l'un apres l'autre, comme celui du haut de page. */
export function RevealTitle({ text, className }: { text: string; className?: string }) {
  const { ref, state } = useReveal<HTMLHeadingElement>(0.6)
  const words = text.split(' ')
  return (
    <motion.h2
      ref={ref}
      className={className}
      initial={false}
      animate={state}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.06 } } }}
    >
      {words.map((word, index) => (
        <span key={index}>
          <motion.span className="inline-block" variants={WORD}>{word}</motion.span>
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </motion.h2>
  )
}

/** Un element d'une liste qui arrive en liste (pastilles, offres). */
export const revealItem: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.96, transition: { duration: 0 } },
  shown: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
}

/**
 * Une liste dont les elements (motion.* avec variants={revealItem}) arrivent
 * l'un apres l'autre. `lift` fait aussi monter le conteneur lui-meme.
 */
export function RevealGroup({
  as = 'div',
  children,
  className,
  delay = 0,
  stagger = 0.07,
  lift,
}: {
  as?: 'div' | 'ul'
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  lift?: number
}) {
  const { ref, state } = useReveal<HTMLDivElement>(0.3)
  const variants: Variants = {
    hidden: lift ? { opacity: 0, y: lift, transition: { duration: 0 } } : {},
    shown: {
      ...(lift ? { opacity: 1, y: 0 } : {}),
      transition: { duration: 0.6, ease: EASE, delayChildren: delay, staggerChildren: stagger },
    },
  }
  if (as === 'ul') {
    return (
      <motion.ul ref={ref as unknown as RefObject<HTMLUListElement>} className={className} initial={false} animate={state} variants={variants}>
        {children}
      </motion.ul>
    )
  }
  return (
    <motion.div ref={ref} className={className} initial={false} animate={state} variants={variants}>
      {children}
    </motion.div>
  )
}
