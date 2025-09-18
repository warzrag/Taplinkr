'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Check,
  Globe,
  Palette,
  Shield,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { debounce } from 'lodash'

import { SiteHeader } from '@/components/marketing/SiteHeader'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Palette,
    title: 'Personnalisation avancée',
    description: 'Couleurs, typographies, animations et blocs interactifs pour composer une page unique.'
  },
  {
    icon: BarChart3,
    title: 'Analytics en temps réel',
    description: 'Visualisez les clics par canal, géolocalisation, conversions et tendances sur un seul tableau.'
  },
  {
    icon: Shield,
    title: 'Protection intelligente',
    description: 'Liens privés, mots de passe, expiration programmée et double authentification pour vos accès sensibles.'
  },
  {
    icon: Users,
    title: 'Collaboration d’équipe',
    description: 'Invitez votre équipe, attribuez des rôles et gérez les accès aux pages partagées en un clic.'
  },
  {
    icon: Zap,
    title: 'Performances optimisées',
    description: 'Chargements instantanés, SEO intégré et CDN mondial pour tous vos visiteurs.'
  },
  {
    icon: Globe,
    title: 'Intégrations globales',
    description: 'Ajoutez vos réseaux, vidéos, formulaires, calendriers et playlists préférées en quelques secondes.'
  }
]

const testimonials = [
  {
    name: 'Sophie Martin',
    role: 'Créatrice digitale',
    quote: 'TapLinkr est devenu mon hub officiel : je peux lancer des campagnes et mesurer mes performances en direct.',
    metric: '+38% de clics',
  },
  {
    name: 'Thomas Dubois',
    role: 'Entrepreneur',
    quote: 'L’onboarding est simple et le dashboard me permet de suivre tous nos liens stratégiques pour l’équipe.',
    metric: '4,9/5 note clients',
  },
  {
    name: 'Emma Laurent',
    role: 'Artiste & coach',
    quote: 'J’adore le niveau de personnalisation : ma page ressemble à mon univers, sur mobile comme sur desktop.',
    metric: 'x2 sur les leads',
  },
]

const stats = [
  { value: '50K+', label: 'créateurs actifs' },
  { value: '120M', label: 'clics suivis/an' },
  { value: '4,9/5', label: 'satisfaction moyenne' },
]

const popularUsers = [
  { name: 'studiozen', accent: 'from-brand-500 to-brand-300' },
  { name: 'agenceflow', accent: 'from-emerald-400 to-teal-400' },
  { name: 'creatrice', accent: 'from-rose-400 to-amber-300' },
  { name: 'collectifpro', accent: 'from-indigo-400 to-cyan-400' },
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
    () => debounce(async (value: string) => {
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
        setAvailable(data.available)
        if (!data.available && data.error) {
          setError(data.error)
        }
      } catch (err) {
        console.error('Erreur vérification:', err)
        setError('Erreur de vérification')
      } finally {
        setChecking(false)
      }
    }, 500), [])

  useEffect(() => {
    return () => {
      checkUsername.cancel()
    }
  }, [checkUsername])

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setUsername(sanitized)
    setAvailable(null)
    if (sanitized) {
      checkUsername(sanitized)
    }
  }

  const handleGetStarted = () => {
    if (available && username) {
      router.push(`/auth/signup?username=${encodeURIComponent(username)}`)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-x-0 -top-32 h-[420px] bg-gradient-radial from-brand-500/20 via-transparent to-transparent blur-3xl" />
          <div className="absolute right-1/2 top-64 h-72 w-72 rounded-full bg-brand-400/10 blur-[160px]" />
          <div className="absolute left-1/2 top-32 h-80 w-80 rounded-full bg-secondary-300/20 blur-[140px]" />
        </div>

        <section className="section-default pt-24 pb-20">
          <Container className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <span className="badge-pill bg-[hsl(var(--surface))]/80 text-brand-600 shadow-sm">
                <Sparkles className="h-4 w-4 text-brand-500" />
                TapLinkr 2.0 est arrivé
              </span>

              <div className="space-y-6">
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                  Centralisez et sublimez
                  <br className="hidden sm:block" />
                  votre présence en ligne
                </h1>
                <p className="max-w-xl text-base text-foreground/70 sm:text-lg">
                  Offrez une expérience cohérente à votre audience. Créez une page élégante, suivez chaque clic et adaptez-vous en temps réel grâce à nos outils professionnels.
                </p>
              </div>

              <div className="grid gap-6 rounded-3xl border border-border/80 bg-[hsl(var(--surface))] p-6 shadow-card backdrop-blur">
                <div>
                  <p className="text-sm font-medium text-foreground/70">
                    Réservez votre URL personnalisée
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-[hsl(var(--surface))] px-4 py-3 shadow-sm focus-within:border-brand-500">
                    <span className="text-sm text-foreground/60">taplinkr.com/</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => handleUsernameChange(event.target.value)}
                      placeholder="votre-nom"
                      maxLength={30}
                      className="flex-1 bg-transparent text-sm outline-none sm:text-base"
                    />
                    <AnimatePresence mode="wait">
                      {checking && (
                        <motion.span
                          key="checking"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
                        />
                      )}
                      {!checking && available === true && (
                        <motion.span
                          key="available"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-emerald-500"
                        >
                          <Check className="h-5 w-5" />
                        </motion.span>
                      )}
                      {!checking && available === false && (
                        <motion.span
                          key="taken"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-rose-500"
                        >
                          <X className="h-5 w-5" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <Button
                    onClick={handleGetStarted}
                    disabled={!available || checking}
                    className="sm:w-auto"
                  >
                    Commencer
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-sm text-rose-500"
                    >
                      {error}
                    </motion.p>
                  )}
                  {available === true && (
                    <motion.p
                      key="available-text"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="text-sm text-emerald-500"
                    >
                      Ce nom est disponible, verrouillez-le maintenant !
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">
                    Suggestions populaires
                  </span>
                  {popularUsers.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setUsername(item.name)
                        checkUsername(item.name)
                      }}
                      className={`group inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${item.accent} px-4 py-1.5 text-xs font-medium text-white transition-transform hover:-translate-y-0.5`}
                    >
                      taplinkr.com/{item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
                    <span className="text-sm text-foreground/60">{stat.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[32px] border border-white/40 bg-gradient-to-br from-brand-500/15 via-white to-blue-100 p-6 shadow-brand backdrop-blur">
                <div className="space-y-4 rounded-3xl bg-[hsl(var(--surface))]/80 p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground/60">taplinkr.com/you</p>
                      <h3 className="text-xl font-semibold">Votre hub créatif</h3>
                    </div>
                    <Sparkles className="h-6 w-6 text-brand-500" />
                  </div>

                  <div className="space-y-3">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-2xl border border-border/70 bg-[hsl(var(--surface))] px-4 py-3 shadow-sm"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {index === 1 ? 'Nouvelle vidéo YouTube' : index === 2 ? 'Programme premium' : 'Newsletter exclusive'}
                          </p>
                          <p className="text-xs text-foreground/50">{index === 1 ? '3,6K clics' : index === 2 ? '1,2K abonnés' : 'Ouverture 62%'}</p>
                        </div>
                        <button className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground/70">Voir</button>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-400 px-5 py-4 text-white shadow-brand">
                    <p className="text-sm font-medium">Mode campagne</p>
                    <p className="text-xs text-white/80">Analytiques détaillés sur les 24 dernières heures.</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-white/90">
                      <span>+18% clics</span>
                      <span>+9% abonnements</span>
                      <span>+32% ventes</span>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute -right-6 bottom-12 hidden h-32 w-32 rounded-full bg-brand-500/20 blur-2xl md:block" />
                <div className="pointer-events-none absolute -left-6 top-10 hidden h-28 w-28 rounded-full bg-secondary-400/20 blur-2xl md:block" />
              </div>
            </motion.div>
          </Container>
        </section>

        <section id="features" className="section-default bg-[hsl(var(--surface))]">
          <Container className="space-y-12">
            <div className="max-w-2xl space-y-4">
              <span className="badge-pill">Fonctionnalités</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">Pensé pour les créateurs ambitieux</h2>
              <p className="text-foreground/65">
                TapLinkr simplifie la gestion de vos liens tout en vous offrant des outils d’analyse et de design à la hauteur de vos projets.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-6 sm:p-7"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-foreground/65">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        <section className="section-default">
          <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:items-center">
            <div className="space-y-5">
              <span className="badge-pill">Workflow</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">Publiez, analysez, convertissez</h2>
              <p className="text-foreground/65">
                Une interface claire pour lancer vos campagnes, suivre vos statistiques et adapter votre page en direct. En quelques minutes, votre bio devient un véritable tunnel de conversion.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/pricing" className="btn-primary">
                  Voir les formules
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/auth/signup" className="btn-secondary">
                  Créer un compte gratuit
                </Link>
              </div>
            </div>

            <div className="grid gap-4 rounded-3xl border border-border bg-[hsl(var(--surface))]/80 p-6 shadow-card">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex gap-4 rounded-2xl bg-[hsl(var(--surface-muted))] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-sm font-semibold text-brand-600">
                    0{step}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {step === 1 ? 'Composez votre page en drag & drop' : step === 2 ? 'Activez le suivi intelligent des clics' : 'Optimisez grâce aux recommandations IA'}
                    </h3>
                    <p className="mt-1 text-sm text-foreground/60">
                      {step === 1
                        ? 'Ajoutez des liens, des blocs vidéo, des formulaires et personnalisez chaque section.'
                        : step === 2
                        ? 'Mesurez l’impact par canal et identifiez les sources de trafic les plus performantes.'
                        : 'Recevez des suggestions automatiques pour améliorer vos conversions et la cohérence visuelle.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section id="temoignages" className="section-default bg-[hsl(var(--surface))]">
          <Container className="space-y-12">
            <div className="max-w-2xl space-y-4">
              <span className="badge-pill">Ils nous font confiance</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">Des créateurs inspirants partagent déjà avec TapLinkr</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card flex h-full flex-col gap-6 p-6"
                >
                  <div className="space-y-3">
                    <p className="text-sm text-foreground/70">“{testimonial.quote}”</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-foreground/60">{testimonial.role}</p>
                    </div>
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600">
                      {testimonial.metric}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-500" />
          <Container className="relative z-10 py-20 text-white">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center gap-6">
              <h2 className="text-3xl font-semibold sm:text-4xl">
                Prêt à transformer votre bio en expérience immersive ?
              </h2>
              <p className="text-white/75">
                Créez gratuitement votre page, explorez nos templates et débloquez les fonctions avancées quand vous le souhaitez.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button onClick={handleGetStarted} disabled={!available || checking}>
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link href="/pricing" className="btn-secondary border-white/40 bg-white/10 text-white hover:border-white hover:bg-white/20">
                  Découvrir les offres
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

