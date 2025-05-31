'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { STRIPE_PLANS } from '@/lib/stripe'

interface SubscriptionData {
  id: string
  status: string
  planType: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}

interface BillingData {
  subscription: SubscriptionData | null
  usage: {
    links: { current: number; limit: number }
    clicks: { current: number; limit: number }
  }
  plan: {
    name: string
    type: string
  }
}

export default function Billing() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [billing, setBilling] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchBillingData()
  }, [session, status, router])

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/billing')
      if (response.ok) {
        const data = await response.json()
        setBilling(data)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) return

    setActionLoading('cancel')
    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchBillingData()
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReactivateSubscription = async () => {
    setActionLoading('reactivate')
    try {
      const response = await fetch('/api/billing/reactivate', {
        method: 'POST'
      })
      
      if (response.ok) {
        await fetchBillingData()
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpgrade = (planType: string) => {
    router.push(`/pricing?upgrade=${planType}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'TRIALING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'PAST_DUE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Actif'
      case 'TRIALING': return 'Période d\'essai'
      case 'CANCELLED': return 'Annulé'
      case 'PAST_DUE': return 'Paiement en retard'
      default: return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="pt-16 sm:pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Facturation et abonnement
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Gérez votre abonnement et consultez votre utilisation
            </p>
          </div>

          {/* Current Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Plan actuel
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {billing?.plan.name}
                  </span>
                  {billing?.subscription && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(billing.subscription.status)}`}>
                      {getStatusText(billing.subscription.status)}
                    </span>
                  )}
                </div>
              </div>
              
              {billing?.plan.type === 'FREE' && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="mt-4 sm:mt-0 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Passer au Pro
                </button>
              )}
            </div>

            {/* Subscription details */}
            {billing?.subscription && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Période actuelle
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(billing.subscription.currentPeriodStart).toLocaleDateString('fr-FR')} - {' '}
                    {new Date(billing.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Renouvellement
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {billing.subscription.cancelAtPeriodEnd 
                      ? 'Annulé à la fin de la période' 
                      : 'Automatique'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Plan features */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Fonctionnalités incluses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {billing && STRIPE_PLANS[billing.plan.type as keyof typeof STRIPE_PLANS].features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            {billing?.subscription && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  {billing.subscription.cancelAtPeriodEnd ? (
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading === 'reactivate'}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {actionLoading === 'reactivate' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Réactivation...
                        </>
                      ) : (
                        'Réactiver l\'abonnement'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={actionLoading === 'cancel'}
                      className="px-4 py-2 border border-red-300 text-red-700 dark:text-red-400 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {actionLoading === 'cancel' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Annulation...
                        </>
                      ) : (
                        'Annuler l\'abonnement'
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Usage Stats */}
          {billing && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Utilisation ce mois-ci
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Liens créés
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {billing.usage.links.current} / {billing.usage.links.limit === -1 ? '∞' : billing.usage.links.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ 
                        width: billing.usage.links.limit === -1 
                          ? '0%' 
                          : `${Math.min((billing.usage.links.current / billing.usage.links.limit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Clics reçus
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {billing.usage.clicks.current} / {billing.usage.clicks.limit === -1 ? '∞' : billing.usage.clicks.limit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 bg-green-600 rounded-full transition-all duration-300"
                      style={{ 
                        width: billing.usage.clicks.limit === -1 
                          ? '0%' 
                          : `${Math.min((billing.usage.clicks.current / billing.usage.clicks.limit) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Options */}
          {billing?.plan.type !== 'ENTERPRISE' && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Besoin de plus ?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Débloquez plus de fonctionnalités avec nos plans premium
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {billing?.plan.type === 'FREE' && (
                  <button
                    onClick={() => handleUpgrade('PRO')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Passer au Pro - 9.99€/mois
                  </button>
                )}
                <button
                  onClick={() => handleUpgrade('ENTERPRISE')}
                  className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors font-medium"
                >
                  Plan Enterprise - 29.99€/mois
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}