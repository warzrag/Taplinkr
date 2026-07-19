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
  { label: 'Démonstration', href: '/demo' },
  { label: 'Tarifs', href: '/pricing' },
  { label: 'Cas d’usage', href: '/#cas-usages' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className={cn('sticky top-0 z-50 border-b text-white backdrop-blur-lg transition-all', scrolled ? 'border-white/15 bg-slate-950/95 shadow-lg' : 'border-white/10 bg-slate-950/80')}>
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" aria-label="Accueil TapLinkr"><Logo size="sm" animated={false} /></Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm font-medium md:flex">
          {links.map((item) => <Link key={item.href} href={item.href} className={cn('transition-colors hover:text-white', pathname === item.href ? 'text-white' : 'text-white/70')}>{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/auth/signin" className="text-sm font-medium text-white/70 hover:text-white">Connexion</Link>
          <Link href="/auth/signup" className="btn-primary h-11 px-5 text-sm">Créer gratuitement</Link>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 md:hidden" aria-label={open ? 'Fermer la navigation' : 'Ouvrir la navigation'} aria-expanded={open} aria-controls="mobile-navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>
      <AnimatePresence>
        {open && <motion.div id="mobile-navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/10 bg-slate-950/95 md:hidden"><Container className="flex flex-col gap-4 py-6">{links.map((item) => <Link key={item.href} href={item.href} className="text-base font-medium text-white/80">{item.label}</Link>)}<div className="mt-2 grid gap-3"><Link href="/auth/signin" className="btn-secondary w-full justify-center">Connexion</Link><Link href="/auth/signup" className="btn-primary w-full justify-center">Créer mon compte</Link></div></Container></motion.div>}
      </AnimatePresence>
    </header>
  )
}
