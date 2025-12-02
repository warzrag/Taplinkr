'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Check,
  Globe,
  Palette,
  Shield,
  Users,
  X,
  Zap,
  TrendingUp,
  Lock,
  Eye,
  Clock,
} from 'lucide-react'
import { debounce } from 'lodash'

// Lazy loading des composants lourds
const SiteHeader = dynamic(() => import('@/components/marketing/SiteHeader').then(mod => ({ default: mod.SiteHeader })), {
  loading: () => <div className="h-16 bg-white dark:bg-gray-900" />,
  ssr: false
})
const SiteFooter = dynamic(() => import('@/components/marketing/SiteFooter').then(mod => ({ default: mod.SiteFooter })), {
  loading: () => <div className="h-32" />,
  ssr: false
})

import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: BarChart3,
    title: 'Analytics en temps réel',
    description: 'Suivez vos performances avec des tableaux de bord intuitifs. Mesurez chaque interaction, identifiez les tendances et optimisez votre ROI en continu.'
  },
  {
    icon: Palette,
    title: 'Personnalisation professionnelle',
    description: 'Créez une présence digitale alignée avec votre identité de marque. Templates personnalisables, charte graphique et expérience utilisateur optimale.'
  },
  {
    icon: Users,
    title: 'Collaboration d\'équipe avancée',
    description: 'Gérez vos équipes efficacement avec des rôles granulaires, permissions personnalisées et workflows collaboratifs sécurisés.'
  },
  {
    icon: Shield,
    title: 'Sécurité & Protection',
    description: 'Protection renforcée avec chiffrement end-to-end, authentification à deux facteurs et conformité RGPD garantie pour vos données sensibles.'
  },
  {
    icon: Zap,
    title: 'Performance optimisée',
    description: 'Infrastructure CDN mondiale, temps de chargement < 200ms, uptime 99.9% et optimisation SEO intégrée pour maximiser votre visibilité.'
  },
  {
    icon: Globe,
    title: 'Intégrations professionnelles',
    description: 'Connectez vos outils métiers : CRM, analytics, marketing automation et plateformes de communication via notre API REST complète.'
  }
]

const metrics = [
  { value: '99.9%', label: 'Uptime garanti', icon: TrendingUp },
  { value: '<200ms', label: 'Temps de réponse', icon: Zap },
  { value: '256-bit', label: 'Chiffrement SSL', icon: Lock },
  { value: '24/7', label: 'Support entreprise', icon: Clock },
]

const testimonials = [
  {
    name: 'Marie Dubois',
    role: 'CEO, TechVision SAS',
    company: 'TechVision',
    quote: 'TapLinkr a transformé notre stratégie digitale. Nous avons augmenté notre taux de conversion de 47% en trois mois grâce à leurs analytics précis.',
    metric: '+47% conversion',
    avatar: 'MD'
  },
  {
    name: 'Pierre Lefort',
    role: 'Marketing Director',
    company: 'InnovateCorp',
    quote: 'La solution parfaite pour centraliser nos campagnes. Le ROI est mesurable, les rapports sont clairs et notre équipe gagne 15h/semaine.',
    metric: '15h économisées/sem',
    avatar: 'PL'
  },
  {
    name: 'Sophie Martin',
    role: 'Head of Growth',
    company: 'ScaleUp Partners',
    quote: 'Sécurité, performance et simplicité. TapLinkr répond à tous nos critères enterprise avec un support réactif et une plateforme fiable.',
    metric: '99.9% satisfaction',
    avatar: 'SM'
  },
]

const stats = [
  { value: '500K+', label: 'Professionnels actifs' },
  { value: '2.4Mds', label: 'Interactions trackées/an' },
  { value: '150+', label: 'Pays couverts' },
  { value: 'SOC 2', label: 'Certification sécurité' },
]

const trustedBy = [
  'Fortune 500',
  'Scale-ups',
  'Agences digitales',
  'Entreprises tech',
  'Consultants',
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
    <div className="min-h-screen bg-white dark:bg-gray-950 text-foreground">
      <SiteHeader />

      <main className="relative overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
          </div>

          <Container>
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-8"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-1.5 text-sm font-medium">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-gray-700 dark:text-gray-300">Plateforme de gestion de liens professionnelle</span>
                </div>

                <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  <span className="text-gray-900 dark:text-white">Centralisez votre</span>
                  <br />
                  <span className="text-gray-900 dark:text-white">présence digitale</span>
                </h1>

                <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Solution enterprise pour centraliser, sécuriser et optimiser vos liens stratégiques.
                  Analytics avancés, collaboration d'équipe et performance garantie.
                </p>

                <div className="mx-auto max-w-2xl">
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Réclamez votre URL professionnelle
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
                          <span className="text-sm text-gray-500 dark:text-gray-400">taplinkr.com/</span>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            placeholder="votre-entreprise"
                            maxLength={30}
                            className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                          />
                          <AnimatePresence mode="wait">
                            {checking && (
                              <motion.div
                                key="checking"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
                              />
                            )}
                            {!checking && available === true && (
                              <motion.div
                                key="available"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <Check className="h-4 w-4 text-emerald-500" />
                              </motion.div>
                            )}
                            {!checking && available === false && (
                              <motion.div
                                key="taken"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <X className="h-4 w-4 text-rose-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <Button
                          onClick={handleGetStarted}
                          disabled={!available || checking}
                          className="sm:w-auto whitespace-nowrap bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900"
                        >
                          Démarrer maintenant
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-rose-500"
                          >
                            {error}
                          </motion.p>
                        )}
                        {available === true && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-emerald-600 dark:text-emerald-400"
                          >
                            ✓ Disponible - Sécurisez votre nom dès maintenant
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-gray-600 dark:text-gray-400">Sans engagement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-gray-600 dark:text-gray-400">Installation en 2 minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-gray-600 dark:text-gray-400">Support premium inclus</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Trust Bar */}
        <section className="border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-8">
          <Container>
            <div className="flex flex-col items-center gap-6">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Ils nous font confiance
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8">
                {trustedBy.map((company) => (
                  <div key={company} className="text-sm font-semibold text-gray-400 dark:text-gray-600">
                    {company}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Stats Section */}
        <section className="py-20 lg:py-28">
          <Container>
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 dark:bg-gray-900/50 py-20 lg:py-28">
          <Container>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-1.5 text-sm font-medium mb-6">
                <Eye className="h-4 w-4 text-brand-500" />
                <span className="text-gray-700 dark:text-gray-300">Fonctionnalités</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl">
                Tout ce dont votre entreprise a besoin
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Une plateforme complète conçue pour les professionnels exigeants
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 transition-all hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors group-hover:bg-brand-500 group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* Metrics Section */}
        <section className="py-20 lg:py-28">
          <Container>
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl">
                  Performance garantie
                </h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                  Des métriques qui comptent pour votre activité
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center"
                  >
                    <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                      <metric.icon className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-50 dark:bg-gray-900/50 py-20 lg:py-28">
          <Container>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl">
                Ce que disent nos clients
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Des résultats mesurables pour des entreprises de toutes tailles
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8"
                >
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      "{testimonial.quote}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/20 text-sm font-semibold text-brand-600 dark:text-brand-400">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {testimonial.metric}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-28">
          <Container>
            <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-12 lg:p-16 text-center">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl">
                Prêt à transformer votre présence digitale ?
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Rejoignez plus de 500 000 professionnels qui centralisent et optimisent leurs liens avec TapLinkr
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={handleGetStarted}
                  disabled={!available || checking}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900"
                >
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 text-sm font-medium text-gray-900 dark:text-white transition-colors hover:border-gray-400 dark:hover:border-gray-600"
                >
                  Voir les tarifs entreprise
                </Link>
              </div>
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                Installation en moins de 2 minutes • Sans carte bancaire • Support dédié
              </p>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
