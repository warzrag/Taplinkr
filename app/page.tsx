'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { debounce } from 'lodash'
import {
  ArrowRight,
  BarChart3,
  Check,
  ExternalLink,
  Folder,
  Globe2,
  Lock,
  MousePointerClick,
  Palette,
  Shield,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SiteHeader } from '@/components/marketing/SiteHeader'
import { Container } from '@/components/ui/Container'

const features = [
  {
    icon: ExternalLink,
    title: 'Pages createurs mobile-first',
    description: 'Publiez une vitrine rapide pour Instagram, TikTok, X, Reddit et toutes les audiences qui arrivent depuis votre bio.',
  },
  {
    icon: Shield,
    title: 'Deeplinks et garde 18+',
    description: 'Envoyez chaque fan vers la bonne destination avec des redirections propres, des avertissements et une protection pour les contenus sensibles.',
  },
  {
    icon: BarChart3,
    title: 'Analytics exploitables',
    description: 'Comprenez les vues, clics, sources, pays et appareils qui transforment vraiment votre audience en abonnements ou ventes.',
  },
  {
    icon: Palette,
    title: 'Identite de marque',
    description: 'Gardez une page coherente avec vos visuels, vos couleurs, vos icones, vos offres et vos appels a l action.',
  },
  {
    icon: Folder,
    title: 'Campagnes organisees',
    description: 'Classez vos pages, liens, lancements et offres pour savoir quoi pousser sans fouiller partout.',
  },
  {
    icon: Users,
    title: 'Domaines et agences',
    description: 'Pilotez plusieurs createurs, connectez vos domaines custom et gardez une vue claire sur les performances clients.',
  },
]

const workflow = [
  'Creez votre page',
  'Ajoutez vos deeplinks',
  'Activez la garde 18+',
  'Suivez les clics',
]

const useCases = [
  {
    title: 'Createurs',
    text: 'Une page claire pour transformer vos followers en visiteurs, abonnes ou clients.',
  },
  {
    title: 'Pages sensibles',
    text: 'Des redirections mieux controlees quand vos liens demandent un avertissement, une verification ou plus de prudence.',
  },
  {
    title: 'Agences',
    text: 'Un espace pour gerer plusieurs createurs, campagnes, domaines et performances au meme endroit.',
  },
]

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const checkUsername = useMemo(
    () =>
      debounce(async (value: string) => {
        if (!value || value.length < 3) {
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
          setError('Verification indisponible pour le moment')
        } finally {
          setChecking(false)
        }
      }, 450),
    []
  )

  useEffect(() => {
    return () => checkUsername.cancel()
  }, [checkUsername])

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setUsername(sanitized)
    setAvailable(null)
    if (sanitized) checkUsername(sanitized)
  }

  const handleGetStarted = () => {
    if (available && username) {
      router.push(`/auth/signup?username=${encodeURIComponent(username)}`)
    } else {
      router.push('/auth/signup')
    }
  }

  if (session) return null

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <SiteHeader />

      <main className="overflow-x-hidden">
        <section className="relative overflow-hidden bg-neutral-950 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.07)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent dark:from-neutral-950" />

          <Container className="relative z-10 flex min-h-[calc(100svh-4rem)] w-full max-w-full flex-col justify-center py-14 sm:py-20 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mx-auto w-full max-w-5xl text-center"
            >
              <div className="mx-auto mb-6 flex w-full max-w-[18rem] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-center text-xs font-medium text-white/80 backdrop-blur sm:inline-flex sm:max-w-full sm:px-4 sm:text-sm">
                <Sparkles className="h-4 w-4 flex-shrink-0 text-cyan-300" />
                <span className="min-w-0 whitespace-normal break-words">Pages createurs, deeplinks et protection 18+</span>
              </div>

              <h1 className="mx-auto max-w-[18rem] break-words text-3xl font-semibold leading-[1.08] text-white xs:text-4xl sm:max-w-4xl sm:text-5xl lg:text-6xl">
                Vendez plus avec une page createur qui guide chaque fan au bon lien
              </h1>

              <p className="mx-auto mt-6 max-w-[18rem] text-base leading-7 text-white/70 sm:max-w-2xl sm:text-lg">
                Taplinkr rassemble vos offres, contenus et deeplinks dans une page mobile rapide, avec garde 18+, domaines custom et analytics lisibles.
              </p>

              <div className="mx-auto mt-8 w-full max-w-[18rem] overflow-hidden rounded-2xl border border-white/12 bg-white/10 p-3 text-left shadow-2xl shadow-black/20 backdrop-blur-xl sm:max-w-2xl sm:p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/12 bg-black/20 px-3 py-3 focus-within:border-cyan-300/60">
                    <span className="shrink-0 text-sm text-white/45">taplinkr.com/</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => handleUsernameChange(event.target.value)}
                      placeholder="votre-nom"
                      maxLength={30}
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    />
                    {checking && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />}
                    {!checking && available === true && <Check className="h-4 w-4 text-emerald-300" />}
                    {!checking && available === false && <X className="h-4 w-4 text-rose-300" />}
                  </label>

                  <button
                    type="button"
                    onClick={handleGetStarted}
                    disabled={checking}
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-neutral-950 shadow-none transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Commencer
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-h-[24px] pt-2 text-xs">
                  {error && <span className="text-rose-200">{error}</span>}
                  {available === true && <span className="text-emerald-200">Disponible. Vous pouvez le reserver maintenant.</span>}
                  {available === false && !error && <span className="text-rose-200">Ce nom est deja pris.</span>}
                </div>
              </div>

              <div className="mx-auto mt-8 grid w-full max-w-[18rem] gap-3 text-left sm:max-w-4xl sm:grid-cols-4">
                {workflow.map((item, index) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                    <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-semibold text-neutral-950">
                      {index + 1}
                    </div>
                    <p className="text-sm font-medium text-white">{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </Container>
        </section>

        <section id="features" className="bg-white py-16 dark:bg-neutral-950 sm:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Produit</p>
              <h2 className="mt-3 text-3xl font-semibold text-neutral-950 dark:text-white sm:text-4xl">
                Bien plus qu une simple liste de liens dans votre bio
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-600 dark:text-white/60">
                Taplinkr se concentre sur ce qui manque aux pages generiques : conversion, deeplinks, protection 18+, domaines custom et suivi clair.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section id="cas-usages" className="border-y border-neutral-200 bg-neutral-50 py-16 dark:border-white/10 dark:bg-white/[0.03] sm:py-20">
          <Container className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Cas d’usage</p>
              <h2 className="mt-3 text-3xl font-semibold text-neutral-950 dark:text-white sm:text-4xl">
                Pense pour les createurs qui vivent de leurs clics
              </h2>
              <p className="mt-4 text-sm leading-7 text-neutral-600 dark:text-white/60">
                Cote visiteur, tout doit etre fluide. Cote dashboard, vous voyez quoi mettre en avant, quels deeplinks proteger et quelles campagnes meritent un domaine dedie.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {useCases.map((item) => (
                <div key={item.title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                  <h3 className="font-semibold text-neutral-950 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/60">{item.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-white py-16 dark:bg-neutral-950 sm:py-20">
          <Container>
            <div className="rounded-3xl bg-neutral-950 p-6 text-white sm:p-10 lg:p-12">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="mb-4 flex flex-wrap gap-2 text-xs text-white/65">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Globe2 className="h-3.5 w-3.5" /> Page publique</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><MousePointerClick className="h-3.5 w-3.5" /> Conversion</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Lock className="h-3.5 w-3.5" /> Protection</span>
                  </div>
                  <h2 className="text-3xl font-semibold sm:text-4xl">Passez d un lien bio a un vrai hub createur</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
                    Reservez votre URL, creez votre premiere page et voyez quels liens meritent vraiment la premiere place.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-neutral-950 shadow-none transition hover:bg-white/90"
                >
                  Creer mon Taplinkr
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
