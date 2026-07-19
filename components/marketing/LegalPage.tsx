import Link from 'next/link'

import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'
import { Container } from '@/components/ui/Container'

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white"><SiteHeader /><main><Container className="max-w-3xl py-14 sm:py-20"><Link href="/" className="text-sm text-brand-600 hover:underline">← Retour à l’accueil</Link><h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1><p className="mt-5 text-lg leading-8 text-neutral-600 dark:text-white/65">{intro}</p><p className="mt-3 text-sm text-neutral-500">Dernière mise à jour : 16 juillet 2026</p><article className="prose prose-neutral mt-10 max-w-none dark:prose-invert [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:leading-7 [&_li]:my-2">{children}</article></Container></main><SiteFooter /></div>
}
