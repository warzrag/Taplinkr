import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'

import Logo from '@/components/Logo'
import { Container } from '@/components/ui/Container'

const sections = [
  {
    title: 'Produit',
    items: [
      { label: 'Fonctionnalités', href: '/#features' },
      { label: 'Tarifs', href: '/pricing' },
      { label: 'Témoignages', href: '/#temoignages' },
    ],
  },
  {
    title: 'Ressources',
    items: [
      { label: 'Documentation', href: 'https://github.com/warzrag/Taplinkr' },
      { label: 'Guide de déploiement', href: 'https://github.com/warzrag/Taplinkr/blob/main/GUIDE-DEPLOIEMENT-SIMPLE.md' },
      { label: 'Support', href: 'mailto:hello@taplinkr.com' },
    ],
  },
  {
    title: 'Entreprise',
    items: [
      { label: 'À propos', href: 'https://github.com/warzrag' },
      { label: 'Presse', href: 'mailto:press@taplinkr.com' },
      { label: 'Contact', href: 'mailto:hello@taplinkr.com' },
    ],
  },
]

const socials = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/warzrag/Taplinkr', label: 'GitHub' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-[hsl(var(--surface))]">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Logo size="sm" animated={false} />
            </Link>
            <p className="max-w-xs text-sm text-foreground/70">
              TapLinkr aide les créateurs et équipes à partager leurs univers avec un seul lien élégant et rapide.
            </p>
            <div className="flex items-center gap-3">
              {socials.map((item) => (
                <Link
                  key={item.label}
                  aria-label={item.label}
                  href={item.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 text-foreground/70 transition-colors hover:border-brand-500 hover:text-brand-600"
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  <item.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-4 text-sm">
              <p className="font-semibold text-foreground">{section.title}</p>
              <ul className="space-y-3">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-foreground/70 transition-colors hover:text-foreground"
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-border/70 pt-6 text-sm text-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} TapLinkr. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className="hover:text-foreground">
              Confidentialité
            </Link>
            <Link href="/legal/terms" className="hover:text-foreground">
              Conditions
            </Link>
            <Link href="/legal/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
