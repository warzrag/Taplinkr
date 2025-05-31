'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { AnalyticsCharts } from '@/components/AnalyticsCharts'
import { AnalyticsStats } from '@/components/AnalyticsStats'
import { RecentClicks } from '@/components/RecentClicks'
import { useSearchParams } from 'next/navigation'

interface AnalyticsData {
  totalClicks: number
  uniqueLinks: number
  clicksByDay: Record<string, number>
  topLinks: any[]
  browsers: Record<string, number>
  devices: Record<string, number>
  topReferrers: { url: string; count: number }[]
  recentClicks: any[]
}

export default function Analytics() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const linkId = searchParams.get('linkId')
  
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(7)
  const [error, setError] = useState('')

  // Rediriger si pas connecté
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams({ days: period.toString() })
      if (linkId) params.append('linkId', linkId)
      
      const response = await fetch(`/api/analytics?${params}`)
      const analyticsData = await response.json()
      
      if (!response.ok) {
        throw new Error(analyticsData.error || 'Erreur lors du chargement')
      }
      
      setData(analyticsData)
    } catch (error: any) {
      console.error('Erreur lors du chargement des analytics:', error)
      setError(error.message)
      if (error.message.includes('Non autorisé')) {
        router.push('/auth/signin')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchAnalytics()
    }
  }, [period, linkId, session])

  const exportData = () => {
    if (!data) return

    const csvContent = [
      ['Date', 'Clics'],
      ...Object.entries(data.clicksByDay).map(([date, clicks]) => [date, clicks])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {linkId ? 'Statistiques détaillées pour votre lien' : 'Vue d\'ensemble de tous vos liens'}
            </p>
            {session.user?.role === 'ADMIN' && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                👑 Mode Admin - Toutes les données
              </div>
            )}
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Période et Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Période:</span>
              <div className="flex gap-2">
                {[7, 30, 90].map((days) => (
                  <button
                    key={days}
                    onClick={() => setPeriod(days)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all ${
                      period === days
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {days}j
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={exportData}
              disabled={!data || loading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporter CSV
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
                <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute inset-0"></div>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Stats Cards */}
              <AnalyticsStats data={data} />
              
              {/* Charts */}
              <AnalyticsCharts data={data} />
              
              {/* Recent Clicks */}
              <RecentClicks clicks={data.recentClicks} />
            </div>
          ) : (
            <div className="text-center py-32 text-gray-500 dark:text-gray-400">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>
    </div>
  )
}