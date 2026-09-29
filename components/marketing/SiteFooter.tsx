import Link from 'next/link'
import { Mail } from 'lucide-react'

import Logo from '@/components/Logo'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

const sections = [
  { title: 'Product', items: [['How it works', '/#how'], ['Pricing', '/pricing']] },
  { title: 'Account', items: [['Create an account', '/auth/signup'], ['Log in', '/auth/signin']] },
  { title: 'Information', items: [['Privacy', '/legal/privacy'], ['Terms', '/legal/terms'], ['Cookies', '/legal/cookies']] },
]

// "home" : la page d'accueil reste sombre quel que soit le theme, sur #09090f.
// La surface du theme y faisait une bande bleu nuit sous la page.
const TONES = {
  default: {
    footer: 'border-border/80 bg-[hsl(var(--surface))]',
    text: 'text-foreground/70',
    link: 'text-foreground/70 hover:text-foreground',
    title: '',
    bottom: 'border-border/70 text-foreground/60',
  },
  home: {
    footer: 'border-[#1b1b24] bg-[#09090f]',
    text: 'text-[#9292a5]',
    link: 'text-[#9292a5] hover:text-[#f7f7fb]',
    title: 'text-[#d6d6e0]',
    bottom: 'border-[#1b1b24] text-[#8a8a9c]',
  },
}

export function SiteFooter({ tone = 'default' }: { tone?: keyof typeof TONES }) {
  const colors = TONES[tone]
  return (
    <footer className={cn('border-t', colors.footer)}>
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4"><Link href="/" aria-label="TapLinkr home" className="inline-flex"><Logo size="sm" animated={false} /></Link><p className={cn('max-w-xs text-sm leading-6', colors.text)}>A simple, fast, measurable link page for everything you create.</p><a href="mailto:hello@taplinkr.com" className={cn('inline-flex items-center gap-2 text-sm font-medium', colors.link)}><Mail className="h-4 w-4" /> hello@taplinkr.com</a></div>
          {sections.map((section) => <div key={section.title} className="space-y-4 text-sm"><p className={cn('font-semibold', colors.title)}>{section.title}</p><ul className="space-y-3">{section.items.map(([label, href]) => <li key={href}><Link href={href} className={colors.link}>{label}</Link></li>)}</ul></div>)}
        </div>
        <div className={cn('mt-10 flex flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between', colors.bottom)}><p>© {new Date().getFullYear()} TapLinkr. All rights reserved.</p><p>Built to be useful, not complicated.</p></div>
      </Container>
    </footer>
  )
}
