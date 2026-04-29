'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { ArrowRight, Check, HelpCircle, Loader2 } from 'lucide-react'

import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SiteHeader } from '@/components/marketing/SiteHeader'
import { Container } from '@/components/ui/Container'

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    period: 'pour toujours',
    description: 'Pour publier une page propre et valider votre premier tunnel social.',
    cta: 'Créer mon compte',
    features: [
      '1 page publique',
      '5 liens actifs',
      'Stats essentielles',
      'Personnalisation de base',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '9,99€',
    period: '/ mois',
    description: 'Pour convertir plus de fans avec des liens directs, du tracking et une protection solide.',
    cta: 'Choisir Standard',
    highlighted: true,
    features: [
      'Pages et liens étendus',
      'Liens directs',
      'Shield Protection',
      'Analytics avancées',
      'Équipe jusqu’à 10 membres',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '24,99€',
    period: '/ mois',
    description: 'Pour les agences et créateurs qui pilotent plusieurs pages, offres et campagnes.',
    cta: 'Choisir Premium',
    features: [
      'Liens illimités',
      'Icônes et thèmes personnalisés',
      'ULTRA LINK',
      'Analytics temps réel',
      'Support prioritaire',
    ],
  },
] as const

type PlanId = (typeof plans)[number]['id']

const faqs = [
  {
    question: 'Puis-je commencer gratuitement ?',
    answer: 'Oui. Le plan gratuit permet de créer une première page, partager quelques liens et vérifier que TapLinkr correspond à votre audience.',
  },
  {
    question: 'Comment fonctionne le paiement ?',
    answer: 'Les paiements payants passent par Stripe Checkout. Vous pouvez gérer votre abonnement depuis le dashboard.',
  },
  {
    question: 'Les liens directs sont-ils inclus ?',
    answer: 'Oui, à partir du plan Standard. Le plan Premium ajoute les options les plus avancées pour les pages sensibles, les agences et les gros volumes.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)

  const handleSelectPlan = async (planId: PlanId) => {
    if (planId === 'free') {
      router.push('/auth/signup')
      return
    }

    if (!session?.user) {
      router.push(`/auth/signup?plan=${planId}`)
      return
    }

    setLoadingPlan(planId)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await response.json()

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Impossible de créer la session Stripe')
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur de paiement')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <SiteHeader />

      <main className="overflow-x-hidden">
        <section className="overflow-x-hidden border-b border-neutral-200 bg-neutral-50 py-8 dark:border-white/10 dark:bg-white/[0.03] sm:py-12">
          <Container padding="sm" className="mx-auto w-full max-w-full text-center sm:max-w-6xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
              Tarifs
            </p>
            <h1 className="mx-auto mt-3 w-full max-w-[18rem] break-words text-2xl font-semibold leading-tight text-neutral-950 dark:text-white sm:max-w-3xl sm:text-4xl">
              Choisissez le plan qui convertit vraiment vos clics
            </h1>
            <p className="mx-auto mt-4 w-full max-w-[18rem] text-sm leading-7 text-neutral-600 dark:text-white/60 sm:max-w-2xl">
              Commencez gratuitement, puis passez à Standard ou Premium quand vos pages, vos protections et vos analytics doivent suivre le rythme.
            </p>

            <div className="mx-auto mt-8 grid w-full max-w-[18rem] gap-4 text-left sm:max-w-xl md:max-w-2xl lg:max-w-6xl lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex h-full min-w-0 flex-col rounded-2xl border p-4 shadow-sm sm:p-6 ${
                    plan.highlighted
                      ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950'
                      : 'border-neutral-200 bg-white dark:border-white/10 dark:bg-white/5'
                  }`}
                >
                  {plan.highlighted && (
                    <span className="mb-5 w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white dark:bg-neutral-950/10 dark:text-neutral-950">
                      Le plus choisi
                    </span>
                  )}

                  <div className="min-w-0">
                    <h2 className={`text-xl font-semibold ${plan.highlighted ? 'text-white dark:text-neutral-950' : 'text-neutral-950 dark:text-white'}`}>
                      {plan.name}
                    </h2>
                    <p className={`mt-2 text-sm leading-6 ${plan.highlighted ? 'text-white/70 dark:text-neutral-600' : 'text-neutral-600 dark:text-white/60'}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span className={plan.highlighted ? 'text-white/60 dark:text-neutral-500' : 'text-neutral-500 dark:text-white/50'}>
                      {plan.period}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingPlan !== null}
                    className={`mt-6 inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold shadow-none transition disabled:cursor-not-allowed disabled:opacity-60 sm:px-5 ${
                      plan.highlighted
                        ? 'bg-white text-neutral-950 hover:bg-white/90 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900'
                        : 'bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-white/90'
                    }`}
                  >
                    {loadingPlan === plan.id ? (
                      <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="min-w-0 truncate">{plan.cta}</span>
                  </button>

                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex min-w-0 items-start gap-3 text-sm">
                        <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${plan.highlighted ? 'text-emerald-300 dark:text-emerald-600' : 'text-emerald-600'}`} />
                        <span className={`min-w-0 break-words ${plan.highlighted ? 'text-white/75 dark:text-neutral-700' : 'text-neutral-700 dark:text-white/65'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="overflow-x-hidden border-t border-neutral-200 bg-neutral-50 py-12 dark:border-white/10 dark:bg-white/[0.03] sm:py-14">
          <Container padding="sm" className="grid w-full max-w-full gap-8 sm:max-w-6xl lg:grid-cols-[0.8fr_1.2fr]">
            <div className="min-w-0">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h2 className="max-w-[18rem] break-words text-3xl font-semibold text-neutral-950 dark:text-white sm:max-w-none">
                Questions fréquentes
              </h2>
              <p className="mt-3 max-w-[18rem] text-sm leading-7 text-neutral-600 dark:text-white/60 sm:max-w-xl">
                Les plans restent courts : le bon plan est celui qui correspond à votre volume de liens, à votre besoin de protection et à votre niveau d’analytics.
              </p>
              <Link href="mailto:hello@taplinkr.com" className="mt-5 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-500">
                Contacter le support
              </Link>
            </div>

            <div className="w-full min-w-0 max-w-[18rem] space-y-3 sm:max-w-none">
              {faqs.map((faq) => (
                <div key={faq.question} className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950">
                  <h3 className="break-words font-semibold text-neutral-950 dark:text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-white/60">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
