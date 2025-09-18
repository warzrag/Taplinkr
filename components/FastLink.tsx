'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, MouseEvent, useCallback, useEffect } from 'react'

interface FastLinkProps {
  href: string
  children: ReactNode
  className?: string
  prefetch?: boolean
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void
}

// Composant Link ultra-optimisé avec prefetch agressif et navigation instantanée
export default function FastLink({
  href,
  children,
  className = '',
  prefetch = true,
  onClick
}: FastLinkProps) {
  const router = useRouter()

  // Précharger la route dès que le composant est monté si c'est une route importante
  useEffect(() => {
    if (prefetch && href.startsWith('/dashboard')) {
      router.prefetch(href)
    }
  }, [href, prefetch, router])

  // Navigation optimisée avec transition immédiate
  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e)

    // Si c'est une navigation interne, utiliser router.push pour une transition plus rapide
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && href.startsWith('/')) {
      e.preventDefault()

      // Ajouter une classe de loading immédiate pour feedback instantané
      document.body.classList.add('navigating')

      // Navigation avec priorité haute
      router.push(href)

      // Retirer la classe après transition
      setTimeout(() => {
        document.body.classList.remove('navigating')
      }, 150)
    }
  }, [href, router, onClick])

  // Précharger au survol pour les liens moins importants
  const handleMouseEnter = useCallback(() => {
    if (!prefetch && href.startsWith('/')) {
      router.prefetch(href)
    }
  }, [href, prefetch, router])

  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Link>
  )
}