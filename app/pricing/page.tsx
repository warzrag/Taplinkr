'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { STRIPE_PLANS } from '@/lib/stripe'

export default function Pricing() {
  const { data: session } = useSession()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planType: 'PRO' | 'ENTERPRISE') => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/pricing')
      return
    }

    setLoading(planType)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType,
          billingCycle
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        if (data.code === 'STRIPE_NOT_CONFIGURED') {
          alert('Le système de paiement n\'est pas encore configuré. Pour tester l\'application, utilisez le plan gratuit.')
        } else {
          alert('Une erreur est survenue. Veuillez réessayer.')
        }
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      type: 'FREE' as const,
      name: STRIPE_PLANS.FREE.name,
      price: 0,
      originalPrice: 0,
      description: 'Parfait pour tester',
      features: STRIPE_PLANS.FREE.features,
      cta: 'Commencer gratuitement',
      popular: false,
      badge: 'Gratuit'
    },
    {
      type: 'PRO' as const,
      name: STRIPE_PLANS.PRO.name,
      price: billingCycle === 'monthly' ? 9.99 : 99.99,
      originalPrice: billingCycle === 'monthly' ? 9.99 : 119.88,
      description: 'Pour les créateurs ambitieux',
      features: STRIPE_PLANS.PRO.features,
      cta: 'Essai gratuit 7 jours',
      popular: true,
      badge: 'Le plus populaire'
    },
    {
      type: 'ENTERPRISE' as const,
      name: STRIPE_PLANS.ENTERPRISE.name,
      price: billingCycle === 'monthly' ? 29.99 : 299.99,
      originalPrice: billingCycle === 'monthly' ? 29.99 : 359.88,
      description: 'Pour les entreprises',
      features: STRIPE_PLANS.ENTERPRISE.features,
      cta: 'Essai gratuit 7 jours',
      popular: false,
      badge: 'Puissance maximale'
    }
  ]

  const yearlyDiscount = Math.round((1 - (99.99 * 12) / 119.88) * 100)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      {/* Hero Section - Mobile First */}
      <div className="pt-16 sm:pt-20 pb-8 sm:pb-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-16">
            <div className="mb-4 sm:mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                🚀 Créez des liens qui convertissent
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Tarifs simples,
              <br className="hidden sm:inline" />
              <span className="text-indigo-600 dark:text-indigo-400">résultats extraordinaires</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Choisissez le plan qui correspond à vos ambitions. Tous les plans incluent notre protection anti-ban révolutionnaire.
            </p>
            
            {/* Toggle billing cycle - Mobile optimized */}
            <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Annuel
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                  -{yearlyDiscount}%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid - Mobile First */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.type}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                  plan.popular
                    ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50 transform lg:scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                } p-6 sm:p-8`}
              >
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-xs sm:text-sm font-medium ${
                    plan.popular
                      ? 'bg-indigo-600 text-white'
                      : plan.type === 'FREE'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                {/* Plan Header */}
                <div className="text-center mb-6 sm:mb-8 pt-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
                    {plan.description}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                      {plan.price}€
                    </span>
                    <span className="text-lg text-gray-600 dark:text-gray-300 ml-2">
                      {plan.price > 0 ? (billingCycle === 'monthly' ? '/mois' : '/an') : ''}
                    </span>
                  </div>
                  
                  {/* Yearly savings */}
                  {billingCycle === 'yearly' && plan.price > 0 && (
                    <div className="text-sm text-green-600 dark:text-green-400">
                      <span className="line-through text-gray-400">
                        {plan.originalPrice}€
                      </span>
                      <span className="ml-2 font-medium">
                        Économisez {(plan.originalPrice - plan.price).toFixed(2)}€
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => {
                    if (plan.type === 'FREE') {
                      router.push('/auth/signup')
                    } else {
                      handleSubscribe(plan.type)
                    }
                  }}
                  disabled={loading === plan.type}
                  className={`w-full py-3 sm:py-4 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                      : plan.type === 'FREE'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {loading === plan.type ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Chargement...
                    </div>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Trust indicators - Mobile optimized */}
          <div className="mt-12 sm:mt-20 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Rejoignez plus de 10,000+ créateurs qui nous font confiance
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">Stripe</div>
              <div className="text-2xl font-bold text-gray-400">PayPal</div>
              <div className="text-2xl font-bold text-gray-400">Visa</div>
              <div className="text-2xl font-bold text-gray-400">Mastercard</div>
            </div>
          </div>

          {/* FAQ Section - Mobile First */}
          <div className="mt-16 sm:mt-24 max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-8 sm:mb-12">
              Questions fréquentes
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {[
                {
                  q: "Puis-je changer de plan à tout moment ?",
                  a: "Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements prennent effet immédiatement."
                },
                {
                  q: "Comment fonctionne l'essai gratuit ?",
                  a: "L'essai gratuit de 7 jours vous donne accès à toutes les fonctionnalités du plan choisi sans aucune limitation."
                },
                {
                  q: "Y a-t-il des frais cachés ?",
                  a: "Non, nos prix sont transparents. Aucun frais de configuration, aucune commission sur vos revenus."
                },
                {
                  q: "Puis-je annuler à tout moment ?",
                  a: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}