'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatUsageText, getUsageColor, getUsageBgColor } from '@/lib/usage'

interface UsageData {
  canCreateLink: boolean
  canReceiveClicks: boolean
  usage: {
    links: {
      current: number
      limit: number
      percentage: number
    }
    clicks: {
      current: number
      limit: number
      percentage: number
    }
  }
  plan: {
    name: string
    type: string
    features: string[]
  }
}

export function UsageLimits() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!usage) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Utilisation - Plan {usage.plan.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Suivez votre consommation mensuelle
          </p>
        </div>
        {usage.plan.type === 'FREE' && (
          <button
            onClick={() => router.push('/pricing')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex-shrink-0"
          >
            Passer au Pro
          </button>
        )}
      </div>

      {/* Usage bars */}
      <div className="space-y-6">
        {/* Links usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Liens créés
            </span>
            <span className={`text-sm font-medium ${getUsageColor(usage.usage.links.percentage)}`}>
              {formatUsageText(usage.usage.links.current, usage.usage.links.limit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageBgColor(usage.usage.links.percentage)}`}
              style={{ 
                width: usage.usage.links.limit === -1 ? '0%' : `${Math.min(usage.usage.links.percentage, 100)}%` 
              }}
            ></div>
          </div>
          {usage.usage.links.percentage >= 80 && usage.usage.links.limit !== -1 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              ⚠️ Vous approchez de la limite
            </p>
          )}
        </div>

        {/* Clicks usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Clics ce mois-ci
            </span>
            <span className={`text-sm font-medium ${getUsageColor(usage.usage.clicks.percentage)}`}>
              {formatUsageText(usage.usage.clicks.current, usage.usage.clicks.limit)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getUsageBgColor(usage.usage.clicks.percentage)}`}
              style={{ 
                width: usage.usage.clicks.limit === -1 ? '0%' : `${Math.min(usage.usage.clicks.percentage, 100)}%` 
              }}
            ></div>
          </div>
          {usage.usage.clicks.percentage >= 80 && usage.usage.clicks.limit !== -1 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              ⚠️ Vous approchez de la limite mensuelle
            </p>
          )}
        </div>
      </div>

      {/* Plan features preview */}
      {usage.plan.type === 'FREE' && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Fonctionnalités Premium :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100 liens
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              10K clics/mois
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Analytics avancées
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Domaines personnalisés
            </div>
          </div>
        </div>
      )}

      {/* Limit reached warning */}
      {(!usage.canCreateLink || !usage.canReceiveClicks) && (
        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Limite atteinte
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                {!usage.canCreateLink && "Vous avez atteint votre limite de liens. "}
                {!usage.canReceiveClicks && "Vous avez atteint votre limite de clics mensuelle. "}
                Passez au plan Pro pour continuer à utiliser LinkTracker.
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="mt-2 text-sm font-medium text-orange-800 dark:text-orange-200 hover:text-orange-900 dark:hover:text-orange-100 underline"
              >
                Voir les plans →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}