'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

import Logo from '@/components/Logo'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

// La page d'accueil se demontre elle-meme : plus de page "Demo" a part, ni de
// sections "Features" et "Use cases", remplacees par le telephone qui raconte.
const links = [
  { label: 'How it works', href: '/#how' },
  { label: 'Pricing', href: '/pricing' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Sur ce site, c'est <body> qui defile (html et body a 100 % de haut) :
    // window.scrollY reste a 0 et l'evenement n'atteint jamais window, si bien
    // que l'en-tete ne changeait jamais d'aspect. On ecoute donc tout
    // defilement de la page, en capture, et on lit aussi la position du body.
    const onScroll = () => setScrolled(Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop) > 16)
    onScroll()
    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', onScroll, { capture: true })
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className={cn('sticky top-0 z-50 border-b text-white backdrop-blur-lg transition-all', scrolled ? 'border-[#1b1b24] bg-[#09090f]/90 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]' : 'border-transparent bg-[#09090f]/70')}>
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" aria-label="TapLinkr home"><Logo size="sm" animated={false} /></Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm font-medium md:flex">
          {links.map((item) => <Link key={item.href} href={item.href} className={cn('transition-colors hover:text-white', pathname === item.href ? 'text-white' : 'text-white/70')}>{item.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/auth/signin" className="text-sm font-medium text-white/70 hover:text-white">Log in</Link>
          <Link href="/auth/signup" className="inline-flex h-11 items-center rounded-xl bg-[#7c3aed] px-5 text-sm font-semibold text-[#ffffff] transition hover:bg-[#8b5cf6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]">Start for free</Link>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 md:hidden" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </Container>
      <AnimatePresence>
        {open && <motion.div id="mobile-navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[#1b1b24] bg-[#09090f]/95 md:hidden"><Container className="flex flex-col gap-4 py-6">{links.map((item) => <Link key={item.href} href={item.href} className="text-base font-medium text-white/80">{item.label}</Link>)}<div className="mt-2 grid gap-3"><Link href="/auth/signin" className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#2a2a38] text-[15px] font-semibold text-[#f7f7fb] transition hover:bg-[#ffffff]/[0.04]">Log in</Link><Link href="/auth/signup" className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#7c3aed] text-[15px] font-semibold text-[#ffffff] transition hover:bg-[#8b5cf6]">Create my account</Link></div></Container></motion.div>}
      </AnimatePresence>
    </header>
  )
}
