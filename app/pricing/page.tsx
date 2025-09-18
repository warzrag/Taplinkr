'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Sparkles } from 'lucide-react'

import { SiteHeader } from '@/components/marketing/SiteHeader'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/button'

const plans = [
  {
    id: 'free',
    name: 'Starter',
    description: 'Idéal pour découvrir TapLinkr et publier une première page.',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '1 page de liens personnalisable',
      '10 liens actifs avec statistiques de base',
      'Templates essentiels responsives',
      'Tracking UTM et exports simples',
    ],
    highlight: false,
    badge: 'Commencez gratuitement',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Toutes les fonctionnalités pour optimiser votre audience.',
    priceMonthly: 12,
    priceYearly: 10,
    features: [
      'Pages et liens illimités',
      'Analytics avancés et heatmaps',
      'Protection par mot de passe et domaines custom',
      'Automations Zapier & intégrations premium',
      'Recommandations IA et A/B testing',
    ],
    highlight: true,
    badge: 'Le plus populaire',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Pensé pour les équipes, agences et marques exigeantes.',
    priceMonthly: 29,
    priceYearly: 24,
    features: [
      'Gestion d’équipes (10 membres)',
      'Rapports personnalisés & exports CRM',
      'SLA 99.9%, support prioritaire 24/7',
      'Espaces collaboratifs & approbations',
      'Onboarding dédié et white-label complet',
    ],
    highlight: false,
    badge: 'Pour les équipes',
  },
] as const

const faqs = [
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer: 'Oui. La mise à niveau est instantanée et la facturation est ajustée au prorata. Vous pouvez également rétrograder ou annuler quand vous le souhaitez.'
  },
  {
    question: 'Proposez-vous un essai gratuit ?',
    answer: 'Vous pouvez créer un compte gratuitement et tester toutes les fonctionnalités Pro pendant 14 jours, sans carte bancaire. Ensuite, choisissez le plan qui vous convient.'
  },
  {
    question: 'Comment fonctionne la facturation annuelle ?',
    answer: 'Le paiement annuel vous fait économiser environ 20% par rapport au paiement mensuel. Le montant est prélevé en une seule fois et couvre 12 mois.'
  },
  {
    question: 'Offrez-vous des réductions pour les associations ou étudiants ?',
    answer: 'Oui, contactez notre équipe à hello@taplinkr.com avec une preuve de votre statut et nous appliquerons une remise personnalisée.'
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)
  const router = useRouter()

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      router.push('/auth/signup')
    } else {
      router.push(`/checkout?plan=${planId}&billing=${billingCycle}`)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-[hsl(var(--surface))] py-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-brand-500/25 via-brand-500/10 to-transparent blur-3xl" />
          </div>
          <Container className="relative z-10 flex flex-col items-center gap-8 text-center">
            <span className="badge-pill bg-[hsl(var(--surface))]/85 text-brand-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-brand-500" />
              Tarifs transparents, croissance illimitée
            </span>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold sm:text-5xl">Choisissez le plan adapté à votre rythme</h1>
              <p className="mx-auto max-w-2xl text-foreground/65">
                Commencez gratuitement, développez-vous avec le plan Pro et accompagnez vos équipes avec Business. Les fonctionnalités avancées sont à portée de clic.
              </p>
            </div>

            <div className="flex items-center justify-center rounded-full border border-border/60 bg-[hsl(var(--surface))]/75 p-1 shadow-sm backdrop-blur">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-brand-500 text-white shadow-brand'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`ml-1 inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-brand-500 text-white shadow-brand'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                Annuel
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                  -20%
                </span>
              </button>
            </div>

            <p className="text-xs text-foreground/50">
              Les prix affichés sont en EUR. Les taxes peuvent s’appliquer en fonction de votre pays.
            </p>
          </Container>
        </section>

        <section className="section-default">
          <Container className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const monthly = plan.priceMonthly
              const yearly = plan.priceYearly
              const price = billingCycle === 'monthly' ? monthly : yearly
              const isFree = price === 0

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex h-full flex-col gap-6 rounded-3xl border p-8 shadow-soft transition-transform hover:-translate-y-1 ${
                    plan.highlight
                      ? 'border-brand-500 bg-[hsl(var(--surface))] shadow-brand'
                      : 'border-border bg-[hsl(var(--surface))]/85'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-4 left-6 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-brand">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
                    <p className="text-sm text-foreground/60">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-semibold text-foreground">
                      {isFree ? 'Gratuit' : `${price}€`}
                    </span>
                    {!isFree && (
                      <span className="text-sm text-foreground/50">
                        / {billingCycle === 'monthly' ? 'mois' : 'mois (facturation annuelle)'}
                      </span>
                    )}
                  </div>

                  <Button
                    fullWidth
                    variant={plan.highlight ? 'primary' : 'secondary'}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {plan.id === 'free' ? 'Créer mon compte' : 'Choisir ce plan'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm text-foreground/70">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {!isFree && billingCycle === 'yearly' && (
                    <p className="text-xs text-emerald-600">
                      Économisez {(plan.priceMonthly - plan.priceYearly) * 12}€ par an comparé au mensuel.
                    </p>
                  )}
                </motion.div>
              )
            })}
          </Container>
        </section>

        <section className="section-default bg-[hsl(var(--surface))]">
          <Container className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-start">
            <div className="space-y-5">
              <span className="badge-pill">Questions fréquentes</span>
              <h2 className="text-3xl font-semibold sm:text-4xl">Tout ce qu’il faut savoir avant de vous lancer</h2>
              <p className="text-foreground/65">
                Notre équipe vous accompagne à chaque étape. Si vous ne trouvez pas la réponse, contactez-nous et nous vous répondons sous 24h.
              </p>
              <Link href="mailto:hello@taplinkr.com" className="btn-secondary w-fit">
                Contacter un conseiller
              </Link>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = expandedFaq === index
                return (
                  <div key={faq.question} className="rounded-2xl border border-border/60 bg-[hsl(var(--surface))]/85 p-5 shadow-sm">
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-foreground">{faq.question}</span>
                      <span className="text-xs text-foreground/50">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-sm text-foreground/65">{faq.answer}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

