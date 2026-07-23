'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { debounce } from 'lodash'
import {
  ArrowRight, BarChart3, Check, Eye, Globe2, Lock, MousePointerClick,
  Palette, ShieldCheck, Smartphone, Sparkles, X,
} from 'lucide-react'

import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SiteHeader } from '@/components/marketing/SiteHeader'
import { Container } from '@/components/ui/Container'

const benefits = [
  {
    icon: Smartphone,
    title: 'Une page qui vous ressemble',
    description: 'Personnalisez couleurs, visuels, liens et appels à l’action sans toucher au code.',
  },
  {
    icon: MousePointerClick,
    title: 'Des clics mieux orientés',
    description: 'Envoyez chaque visiteur vers la bonne offre grâce à des liens clairs et des deeplinks.',
  },
  {
    icon: BarChart3,
    title: 'Des résultats compréhensibles',
    description: 'Suivez vues, clics, sources, pays et appareils depuis un tableau de bord lisible.',
  },
]

const useCases = [
  ['Créateurs', 'Regroupez vos contenus, offres et réseaux dans une vitrine professionnelle.'],
  ['Contenus sensibles', 'Ajoutez un avertissement ou une protection lorsque votre audience en a besoin.'],
  ['Équipes et agences', 'Organisez plusieurs pages, campagnes, domaines et collaborateurs au même endroit.'],
]

export default function Home() {
  const { status } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') router.push('/dashboard')
  }, [status, router])

  const checkUsername = useMemo(() => debounce(async (value: string) => {
    if (value.length < 3) {
      setAvailable(null)
      setError('')
      return
    }

    setChecking(true)
    setError('')
    try {
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`)
      const data = await response.json()
      setAvailable(Boolean(data.available))
      if (!data.available && data.error) setError(data.error)
    } catch {
      setError('Vérification indisponible pour le moment')
    } finally {
      setChecking(false)
    }
  }, 400), [])

  useEffect(() => () => checkUsername.cancel(), [checkUsername])

  const onUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setUsername(sanitized)
    setAvailable(null)
    if (sanitized) checkUsername(sanitized)
  }

  const getStarted = () => {
    router.push(available && username ? `/auth/signup?username=${encodeURIComponent(username)}` : '/auth/signup')
  }

  if (status === 'authenticated') return null

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-neutral-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.16),transparent_34%),radial-gradient(circle_at_80%_40%,rgba(99,102,241,.18),transparent_30%)]" />
          <Container className="relative grid min-h-[calc(100svh-4rem)] gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80">
                <Sparkles className="h-4 w-4 text-cyan-300" /> Votre présence en ligne, simplement
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.03] tracking-tight sm:text-6xl">
                Un seul lien. Plus de clics qui convertissent.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                Créez une page élégante pour vos contenus, vos offres et vos réseaux. Partagez-la partout et comprenez enfin ce qui intéresse votre audience.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/signup" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-neutral-950 transition hover:bg-cyan-50">
                  Créer ma page gratuitement <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/demo" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Eye className="h-4 w-4" /> Voir un exemple réel
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" /> Gratuit, sans carte bancaire</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" /> Mise en ligne en quelques minutes</span>
              </div>
            </div>

            <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl shadow-cyan-950/40 backdrop-blur">
              <div className="rounded-[1.5rem] bg-gradient-to-b from-fuchsia-100 via-white to-cyan-100 p-6 text-neutral-950">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 p-1"><div className="h-full w-full rounded-full bg-neutral-900" /></div>
                <div className="mt-4 text-center"><p className="text-lg font-bold">Léa Martin</p><p className="text-sm text-neutral-600">Créatrice · design & lifestyle</p></div>
                <div className="mt-6 space-y-3">
                  {['Mon nouveau guide', 'Découvrir mon portfolio', 'Me suivre sur Instagram'].map((label, index) => (
                    <div key={label} className={`rounded-xl px-4 py-3 text-center text-sm font-semibold shadow-sm ${index === 0 ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-900'}`}>{label}</div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-neutral-500"><span>1 284 vues</span><span>42 % clics</span><span>+18 %</span></div>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-b border-neutral-200 bg-neutral-50 py-8 dark:border-white/10 dark:bg-white/[.03]">
          <Container>
            <div className="mx-auto max-w-3xl">
              <label htmlFor="username" className="mb-3 block text-center text-sm font-semibold">Choisissez votre adresse Taplinkr</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center rounded-xl border border-neutral-300 bg-white px-4 focus-within:border-brand-500 dark:border-white/15 dark:bg-white/5">
                  <span className="text-sm text-neutral-500">taplinkr.com/</span>
                  <input id="username" value={username} onChange={(event) => onUsernameChange(event.target.value)} placeholder="votre-nom" maxLength={30} aria-describedby="username-status" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" />
                  {checking && <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />}
                  {!checking && available === true && <Check className="h-4 w-4 text-emerald-500" />}
                  {!checking && available === false && <X className="h-4 w-4 text-rose-500" />}
                </div>
                <button type="button" onClick={getStarted} disabled={checking} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-neutral-950">Réserver mon URL <ArrowRight className="h-4 w-4" /></button>
              </div>
              <p id="username-status" aria-live="polite" className={`mt-2 min-h-5 text-center text-xs ${available ? 'text-emerald-600' : 'text-rose-600'}`}>
                {error || (available === true ? 'Cette adresse est disponible.' : '')}
              </p>
            </div>
          </Container>
        </section>

        <section id="features" className="py-16 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold uppercase tracking-[.16em] text-brand-600">L’essentiel, bien fait</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">De votre bio à une vraie vitrine</h2><p className="mt-4 text-neutral-600 dark:text-white/60">Une expérience rapide pour vos visiteurs, des outils utiles pour vous.</p></div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {benefits.map((item) => <div key={item.title} className="rounded-2xl border border-neutral-200 p-6 shadow-sm dark:border-white/10 dark:bg-white/5"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"><item.icon className="h-5 w-5" /></div><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/60">{item.description}</p></div>)}
            </div>
          </Container>
        </section>

        <section id="cas-usages" className="border-y border-neutral-200 bg-neutral-50 py-16 dark:border-white/10 dark:bg-white/[.03] sm:py-24">
          <Container className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div><p className="text-sm font-semibold uppercase tracking-[.16em] text-brand-600">Pour chaque activité</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Assez simple pour démarrer. Assez complet pour grandir.</h2><div className="mt-6 flex flex-wrap gap-2 text-sm text-neutral-600 dark:text-white/60"><span className="rounded-full border px-3 py-1"><Palette className="mr-1 inline h-4 w-4" /> Design</span><span className="rounded-full border px-3 py-1"><Globe2 className="mr-1 inline h-4 w-4" /> Domaine</span><span className="rounded-full border px-3 py-1"><ShieldCheck className="mr-1 inline h-4 w-4" /> Protection</span></div></div>
            <div className="grid gap-4 sm:grid-cols-3">{useCases.map(([title, text]) => <div key={title} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/60">{text}</p></div>)}</div>
          </Container>
        </section>

        <section className="py-16 sm:py-24"><Container><div className="rounded-3xl bg-neutral-950 p-8 text-center text-white sm:p-12"><Lock className="mx-auto h-6 w-6 text-cyan-300" /><h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Votre prochaine page peut être en ligne aujourd’hui.</h2><p className="mx-auto mt-4 max-w-xl text-white/65">Commencez gratuitement, ajoutez vos liens et améliorez votre page à partir de données réelles.</p><Link href="/auth/signup" className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-neutral-950">Créer ma page <ArrowRight className="h-4 w-4" /></Link></div></Container></section>
      </main>
      <SiteFooter />
    </div>
  )
}
