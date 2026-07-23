import Link from 'next/link'
import { Mail } from 'lucide-react'

import Logo from '@/components/Logo'
import { Container } from '@/components/ui/Container'

const sections = [
  { title: 'Produit', items: [['Fonctionnalités', '/#features'], ['Démonstration', '/demo'], ['Tarifs', '/pricing']] },
  { title: 'Compte', items: [['Créer un compte', '/auth/signup'], ['Se connecter', '/auth/signin']] },
  { title: 'Informations', items: [['Confidentialité', '/legal/privacy'], ['Conditions', '/legal/terms'], ['Cookies', '/legal/cookies']] },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-[hsl(var(--surface))]">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4"><Link href="/" aria-label="Accueil TapLinkr" className="inline-flex"><Logo size="sm" animated={false} /></Link><p className="max-w-xs text-sm leading-6 text-foreground/70">La page de liens simple, rapide et mesurable pour présenter tout ce que vous créez.</p><a href="mailto:hello@taplinkr.com" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground"><Mail className="h-4 w-4" /> hello@taplinkr.com</a></div>
          {sections.map((section) => <div key={section.title} className="space-y-4 text-sm"><p className="font-semibold">{section.title}</p><ul className="space-y-3">{section.items.map(([label, href]) => <li key={href}><Link href={href} className="text-foreground/70 hover:text-foreground">{label}</Link></li>)}</ul></div>)}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border/70 pt-6 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} TapLinkr. Tous droits réservés.</p><p>Fait pour être utile, pas compliqué.</p></div>
      </Container>
    </footer>
  )
}
