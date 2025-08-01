'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, X, Sparkles, Crown, Zap, Shield, BarChart3, Palette, Users, Clock, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePermissions } from '@/hooks/usePermissions'

interface PricingFeature {
  name: string
  free: boolean | string
  standard: boolean | string
  premium: boolean | string
  icon?: any
}

const features: PricingFeature[] = [
  { name: 'Pages', free: '1', standard: 'Illimitées', premium: 'Illimitées', icon: Sparkles },
  { name: 'Liens par page', free: '5', standard: '50', premium: 'Illimités', icon: Zap },
  { name: 'Animations', free: true, standard: true, premium: true },
  { name: 'Images de profil/couverture', free: true, standard: true, premium: true },
  { name: 'Statut en ligne', free: false, standard: true, premium: true },
  { name: 'Localisation', free: false, standard: true, premium: true },
  { name: 'Icônes personnalisées', free: false, standard: false, premium: true, icon: Palette },
  { name: 'Réseaux sociaux', free: false, standard: false, premium: true, icon: Users },
  { name: 'Polices personnalisées', free: false, standard: false, premium: true },
  { name: 'Thèmes personnalisés', free: false, standard: false, premium: true },
  { name: 'Liens directs', free: false, standard: true, premium: true },
  { name: 'Shield Protection', free: false, standard: true, premium: true, icon: Shield },
  { name: 'ULTRA LINK', free: false, standard: false, premium: true, icon: Zap },
  { name: 'Analytics', free: 'Basiques', standard: 'Avancées', premium: 'Temps réel', icon: BarChart3 },
  { name: 'Support', free: 'Email', standard: 'Prioritaire', premium: 'VIP 24/7', icon: Clock },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { hasPermission, userPlan } = usePermissions()
  const [loading, setLoading] = useState<'standard' | 'premium' | null>(null)

  const handleSubscribe = async (plan: 'standard' | 'premium') => {
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    setLoading(plan)
    
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la session')
      }

      // Rediriger vers Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: 'pour toujours',
      description: 'Parfait pour commencer',
      color: 'from-gray-400 to-gray-600',
      buttonText: userPlan === 'free' ? 'Plan actuel' : 'Rétrograder',
      buttonAction: () => {},
      disabled: userPlan === 'free',
      popular: false
    },
    {
      name: 'Standard',
      price: '9.99€',
      period: '/mois',
      description: 'Pour les créateurs sérieux',
      color: 'from-blue-500 to-indigo-600',
      buttonText: userPlan === 'standard' ? 'Plan actuel' : 'Choisir Standard',
      buttonAction: () => handleSubscribe('standard'),
      disabled: userPlan === 'standard',
      popular: true
    },
    {
      name: 'Premium',
      price: '24.99€',
      period: '/mois',
      description: 'Pour les professionnels',
      color: 'from-purple-500 to-pink-600',
      buttonText: userPlan === 'premium' ? 'Plan actuel' : 'Choisir Premium',
      buttonAction: () => handleSubscribe('premium'),
      disabled: userPlan === 'premium',
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 dark:from-gray-100 dark:to-blue-400 bg-clip-text text-transparent mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Débloquez toutes les fonctionnalités pour créer des liens extraordinaires
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl overflow-hidden ${
                plan.popular ? 'scale-105 shadow-2xl' : 'shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-bl-xl text-sm font-bold">
                  POPULAIRE
                </div>
              )}
              
              <div className={`bg-gradient-to-br ${plan.color} p-6 text-white`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-lg ml-2 opacity-80">{plan.period}</span>
                </div>
                <p className="opacity-90">{plan.description}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6">
                <motion.button
                  onClick={plan.buttonAction}
                  disabled={plan.disabled || loading !== null}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    plan.disabled
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : plan.name === 'Premium'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl'
                      : plan.name === 'Standard'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  whileHover={!plan.disabled ? { scale: 1.05 } : {}}
                  whileTap={!plan.disabled ? { scale: 0.95 } : {}}
                >
                  {loading === plan.name.toLowerCase() ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      {plan.name === 'Premium' && <Crown className="w-5 h-5" />}
                      {plan.name === 'Standard' && <Sparkles className="w-5 h-5" />}
                      {plan.buttonText}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tableau de comparaison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Comparaison détaillée
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-gray-100">
                    Fonctionnalités
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-600 dark:text-gray-400">
                    Gratuit
                  </th>
                  <th className="text-center p-4 font-semibold text-blue-600 dark:text-blue-400">
                    Standard
                  </th>
                  <th className="text-center p-4 font-semibold text-purple-600 dark:text-purple-400">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="p-4 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        {feature.icon && <feature.icon className="w-4 h-4 text-gray-500" />}
                        {feature.name}
                      </div>
                    </td>
                    <td className="text-center p-4">
                      {renderFeatureValue(feature.free)}
                    </td>
                    <td className="text-center p-4">
                      {renderFeatureValue(feature.standard, 'text-blue-600 dark:text-blue-400')}
                    </td>
                    <td className="text-center p-4">
                      {renderFeatureValue(feature.premium, 'text-purple-600 dark:text-purple-400')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Section de gestion d'abonnement */}
        {userPlan !== 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Gérer mon abonnement
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function renderFeatureValue(value: boolean | string, className = '') {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className={`w-5 h-5 mx-auto ${className || 'text-green-500'}`} />
    ) : (
      <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
    )
  }
  return <span className={`font-medium ${className || 'text-gray-700 dark:text-gray-300'}`}>{value}</span>
}