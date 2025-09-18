'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

import Logo from '@/components/Logo'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

const links = [
  { label: 'Fonctionnalités', href: '/#features' },
  { label: 'Tarifs', href: '/pricing' },
  { label: 'Témoignages', href: '/#temoignages' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16)
    }

    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all border-b border-border/60 bg-[hsl(var(--surface))]/80 backdrop-blur',
        scrolled
          ? 'bg-[hsl(var(--surface))] border-b border-border shadow-sm'
          : 'bg-[hsl(var(--surface))]/80 border-b border-border/60'
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold">
          <Logo size="sm" animated={false} />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/70">
          {links.map((item) => {
            const isCurrent = item.href === pathname || (item.href.startsWith('/#') && pathname === '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-foreground',
                  isCurrent ? 'text-foreground' : 'text-foreground/70'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Connexion
          </Link>
          <Link
            href="/auth/signup"
            className="btn-primary h-11 px-5 text-sm"
          >
            Essayer gratuitement
          </Link>
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/80 text-foreground transition-colors md:hidden"
          aria-label="Ouvrir la navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/70 bg-white/95 shadow-sm md:hidden"
          >
            <Container className="flex flex-col gap-4 py-6">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-medium text-foreground/80"
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-2 flex flex-col gap-3">
                <Link href="/auth/signin" className="btn-secondary w-full justify-center">
                  Connexion
                </Link>
                <Link href="/auth/signup" className="btn-primary w-full justify-center">
                  Créer mon compte
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
