'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Sparkles, Zap, Crown, ArrowRight, Star, Shield, Clock, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    description: 'Parfait pour débuter',
    price: 0,
    priceLabel: 'Gratuit',
    icon: Sparkles,
    color: 'from-gray-500 to-gray-600',
    features: [
      '1 page de liens',
      '1 lien maximum',
      '1 multi-link maximum',
      'Statistiques de base',
      'Personnalisation limitée',
      'Support par email',
      'QR Code basique'
    ],
    limitations: [
      'Pas de domaine personnalisé',
      'Bannière TapLinkr',
      'Pas d\'analytics avancés',
      'Pas de priorité support'
    ],
    popular: false,
    cta: 'Commencer gratuitement'
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les créateurs ambitieux',
    price: 9,
    priceLabel: '9€/mois',
    icon: Zap,
    color: 'from-blue-500 to-indigo-600',
    features: [
      'Pages illimitées',
      'Liens illimités',
      'Analytics avancés',
      'Personnalisation complète',
      'Support prioritaire 24/7',
      'QR Codes personnalisés',
      'Suppression de la bannière',
      'Thèmes premium',
      'Animations avancées',
      'Intégrations (Spotify, YouTube)',
      'Export des données',
      'A/B Testing'
    ],
    limitations: [],
    popular: true,
    cta: 'Passer au Pro',
    badge: 'Plus populaire'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Pour les entreprises',
    price: 29,
    priceLabel: '29€/mois',
    icon: Crown,
    color: 'from-purple-500 to-pink-600',
    features: [
      'Tout du plan Pro',
      'Domaine personnalisé',
      'Analytics en temps réel',
      'API Access',
      'Équipe (5 utilisateurs)',
      'Support dédié',
      'Formations personnalisées',
      'Intégrations custom',
      'Priorité maximale',
      'SLA garanti 99.9%',
      'Backup automatique',
      'White label complet'
    ],
    limitations: [],
    popular: false,
    cta: 'Contacter les ventes',
    badge: 'Entreprise'
  }
]

const faqs = [
  {
    question: 'Puis-je changer de plan à tout moment ?',
    answer: 'Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements sont effectifs immédiatement.'
  },
  {
    question: 'Y a-t-il un engagement ?',
    answer: 'Non, tous nos plans sont sans engagement. Vous pouvez annuler à tout moment.'
  },
  {
    question: 'Comment fonctionne la période d\'essai ?',
    answer: 'Nous offrons 14 jours d\'essai gratuit sur les plans Pro et Business. Aucune carte bancaire requise.'
  },
  {
    question: 'Puis-je obtenir un remboursement ?',
    answer: 'Nous offrons une garantie de remboursement de 30 jours si vous n\'êtes pas satisfait.'
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStripeCheckout = async (planId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId === 'pro' ? 'standard' : 'premium',
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Erreur checkout:', data.error)
        alert('Erreur lors de la création de la session de paiement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la redirection vers le paiement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      router.push('/auth/signup')
    } else {
      // Rediriger vers Stripe checkout
      handleStripeCheckout(planId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Commencez gratuitement, évoluez quand vous voulez
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg flex items-center">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annuel
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className={`relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border ${
                plan.popular ? 'border-blue-500' : 'border-white/20'
              } p-8 h-full flex flex-col`}>
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`px-4 py-1 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${
                      plan.popular ? 'from-blue-600 to-indigo-600' : 'from-purple-600 to-pink-600'
                    } shadow-lg`}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>

                {/* Plan Info */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Gratuit' : billingCycle === 'yearly' ? `${Math.floor(plan.price * 0.8)}€` : `${plan.price}€`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 ml-2">/mois</span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && plan.price > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      Économisez {Math.floor(plan.price * 12 * 0.2)}€ par an
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? 'Chargement...' : plan.cta}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <span className="text-gray-700 font-medium">4.9/5 (2,000+ avis)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Support 24/7</span>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Questions fréquentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-4">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à booster vos liens ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez plus de 10,000 créateurs qui utilisent TapLinkr
          </p>
          <motion.button
            onClick={() => router.push('/auth/signup')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all inline-flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Commencer gratuitement
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}

