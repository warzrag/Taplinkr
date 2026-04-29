'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { ArrowRight, Check, HelpCircle, Loader2 } from 'lucide-react'

import { SiteFooter } from '@/components/marketing/SiteFooter'
import { SiteHeader } from '@/components/marketing/SiteHeader'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/Container'

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    period: 'pour toujours',
    description: 'Pour lancer une première page et tester le produit.',
    cta: 'Créer mon compte',
    features: [
      '1 page publique',
      '5 liens actifs',
      'Statistiques essentielles',
      'Personnalisation de base',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '9,99€',
    period: '/ mois',
    description: 'Pour les créateurs qui publient et optimisent régulièrement.',
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
    description: 'Pour les pros qui veulent tout centraliser avec le maximum de contrôle.',
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

const faqs = [
  {
    question: 'Puis-je commencer gratuitement ?',
    answer: 'Oui. Le plan gratuit permet de créer une première page et de vérifier que TapLinkr correspond à votre usage.',
  },
  {
    question: 'Comment fonctionne le paiement ?',
    answer: 'Les paiements payants passent par Stripe Checkout. Vous pouvez gérer votre abonnement depuis le dashboard.',
  },
  {
    question: 'Les liens directs sont-ils inclus ?',
    answer: 'Oui, à partir du plan Standard. Le plan Premium ajoute les options les plus avancées.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleSelectPlan = async (planId: string) => {
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
    <div className="min-h-screen bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white">
      <SiteHeader />

      <main>
        <section className="border-b border-neutral-200 bg-neutral-50 py-10 dark:border-white/10 dark:bg-white/[0.03] sm:py-12">
          <Container className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">
              Tarifs
            </p>
            <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold leading-tight text-neutral-950 dark:text-white sm:text-4xl">
              Choisissez un plan simple, aligné avec votre usage réel
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-600 dark:text-white/60">
              Commencez gratuitement, puis passez à Standard ou Premium quand vos liens, vos analytics ou votre équipe ont besoin de plus de marge.
            </p>
            <div className="mx-auto mt-10 grid max-w-6xl gap-5 text-left lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex h-full flex-col rounded-2xl border p-6 shadow-sm ${
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

                <div>
                  <h2 className={`text-xl font-semibold ${plan.highlighted ? 'text-white dark:text-neutral-950' : 'text-neutral-950 dark:text-white'}`}>
                    {plan.name}
                  </h2>
                  <p className={`mt-2 text-sm leading-6 ${plan.highlighted ? 'text-white/70 dark:text-neutral-600' : 'text-neutral-600 dark:text-white/60'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className={plan.highlighted ? 'text-white/60 dark:text-neutral-500' : 'text-neutral-500 dark:text-white/50'}>
                    {plan.period}
                  </span>
                </div>

                <Button
                  fullWidth
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loadingPlan !== null}
                  className={`mt-6 rounded-xl shadow-none ${
                    plan.highlighted
                      ? 'bg-white !text-neutral-950 hover:bg-white/90 dark:bg-neutral-950 dark:!text-white dark:hover:bg-neutral-900'
                      : 'bg-neutral-950 !text-white hover:bg-neutral-800 dark:bg-white dark:!text-neutral-950 dark:hover:bg-white/90'
                  }`}
                >
                  {loadingPlan === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {plan.cta}
                </Button>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm">
                      <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${plan.highlighted ? 'text-emerald-300 dark:text-emerald-600' : 'text-emerald-600'}`} />
                      <span className={plan.highlighted ? 'text-white/75 dark:text-neutral-700' : 'text-neutral-700 dark:text-white/65'}>
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

        <section className="border-t border-neutral-200 bg-neutral-50 py-14 dark:border-white/10 dark:bg-white/[0.03]">
          <Container className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h2 className="text-3xl font-semibold text-neutral-950 dark:text-white">Questions fréquentes</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600 dark:text-white/60">
                Les plans restent volontairement courts : le bon plan est celui qui correspond à votre volume de liens et à votre besoin d’analytics.
              </p>
              <Link href="mailto:hello@taplinkr.com" className="mt-5 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-500">
                Contacter le support
              </Link>
            </div>

            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-neutral-950">
                  <h3 className="font-semibold text-neutral-950 dark:text-white">{faq.question}</h3>
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
