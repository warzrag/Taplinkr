'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, Calendar, CheckCircle, XCircle, Loader2, ArrowLeft, ExternalLink, AlertCircle, Tag, Crown, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { usePermissions } from '@/hooks/usePermissions'
import PromoCodeInput from '@/components/PromoCodeInput'

export default function BillingPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userPlan } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [selectedPromo, setSelectedPromo] = useState<any>(null)
  
  // Debug
  useEffect(() => {
    console.log('Debug Billing - userPlan:', userPlan)
    console.log('Debug Billing - session.user.plan:', (session?.user as any)?.plan)
  }, [userPlan, session])

  useEffect(() => {
    // Vérifier si on revient de Stripe avec succès
    const success = searchParams.get('success')
    const plan = searchParams.get('plan')
    
    if (success === 'true' && plan) {
      toast.success(`Abonnement ${plan} activé avec succès !`)
      // Forcer la mise à jour de la session
      update()
      // Nettoyer l'URL
      router.replace('/dashboard/billing')
    }
    
    fetchSubscription()
  }, [searchParams, update, router])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error)
    }
  }

  const handleManageSubscription = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST'
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du portail')
      }

      // Rediriger vers le portail Stripe
      window.location.href = data.url
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Vous conserverez l\'accès jusqu\'à la fin de la période de facturation actuelle.')) {
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/stripe/cancel', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation')
      }

      toast.success('Abonnement annulé. Vous conservez l\'accès jusqu\'à la fin de la période.')
      fetchSubscription()
      update()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (!session || userPlan === 'free') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Aucun abonnement actif
          </h1>
          <button
            onClick={() => router.push('/dashboard/pricing')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            Voir les plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gestion de l'abonnement
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez votre abonnement et vos informations de facturation
          </p>
        </motion.div>

        {/* Code promo */}
        {userPlan === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Tag className="w-6 h-6 text-purple-600" />
              Vous avez un code promo ?
            </h3>
            <PromoCodeInput onApply={(code, discount) => setSelectedPromo(discount)} />
            
            {selectedPromo && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={async () => {
                  setLoading(true)
                  try {
                    const response = await fetch('/api/promo-codes/redeem', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ code: selectedPromo.code })
                    })

                    const data = await response.json()

                    if (response.ok) {
                      toast.success(data.message)
                      router.refresh()
                      setTimeout(() => {
                        router.push('/dashboard')
                      }, 2000)
                    } else {
                      toast.error(data.error || 'Erreur lors de l\'utilisation du code')
                    }
                  } catch (error) {
                    toast.error('Erreur de connexion')
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 font-semibold"
              >
                {loading ? 'Application...' : 'Utiliser ce code promo'}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Abonnement actuel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Abonnement actuel
          </h2>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                {userPlan === 'standard' ? 'Standard' : userPlan === 'premium' ? 'Premium' : 'Gratuit'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                (Debug: userPlan = {userPlan})
              </p>
            </div>
            
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${
              subscription?.cancel_at_period_end
                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            }`}>
              {subscription?.cancel_at_period_end ? (
                <>
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Annulé</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Actif</span>
                </>
              )}
            </div>
          </div>

          {subscription?.current_period_end && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <span>Prochaine facturation</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString('fr-FR')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <CreditCard className="w-5 h-5" />
                  <span>Montant</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {userPlan === 'standard' ? '9.99€' : userPlan === 'premium' ? '24.99€' : '0€'} / mois
                </span>
              </div>
            </div>
          )}

          {subscription?.cancel_at_period_end && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                    Abonnement annulé
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Vous conservez l'accès à votre plan {userPlan} jusqu'au{' '}
                    {new Date(subscription.current_period_end * 1000).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={handleManageSubscription}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Gérer la facturation
                </>
              )}
            </motion.button>
            
            {!subscription?.cancel_at_period_end && (
              <motion.button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Annuler l'abonnement
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Plan actuel Premium */}
        {userPlan === 'premium' && (session?.user as any)?.planExpiresAt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Vous êtes Premium !</h2>
                </div>
                <p className="opacity-90">
                  Profitez de toutes les fonctionnalités avancées de TapLinkr
                </p>
                <p className="text-sm opacity-75 mt-2">
                  Expire le {new Date((session.user as any).planExpiresAt).toLocaleDateString()}
                </p>
              </div>
              <Zap className="w-16 h-16 opacity-20" />
            </div>
          </motion.div>
        )}

        {/* Informations importantes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6"
        >
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Informations importantes
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            <li>• Vos données sont conservées même si vous annulez votre abonnement</li>
            <li>• Vous pouvez réactiver votre abonnement à tout moment</li>
            <li>• Les changements de plan prennent effet immédiatement</li>
            <li>• La facturation est effectuée mensuellement</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}