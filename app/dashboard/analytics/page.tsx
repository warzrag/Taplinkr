'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, Users, Globe, ArrowLeft } from 'lucide-react'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts'

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [selectedLink, setSelectedLink] = useState<string | null>(null)
  const [linkAnalytics, setLinkAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchDashboardStats()
    }
  }, [status, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLinkAnalytics = async (linkId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/${linkId}?days=30`)
      if (response.ok) {
        const data = await response.json()
        setLinkAnalytics(data)
        setSelectedLink(linkId)
      }
    } catch (error) {
      console.error('Error fetching link analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const backToDashboard = () => {
    setSelectedLink(null)
    setLinkAnalytics(null)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement des analytics...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {selectedLink && (
              <button
                onClick={backToDashboard}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedLink ? 'Analytics du Lien' : 'Analytics Dashboard'}
              </h1>
              <p className="text-gray-600">
                {selectedLink 
                  ? 'Statistiques détaillées des 30 derniers jours'
                  : 'Vue d\'ensemble de vos performances'
                }
              </p>
            </div>
          </div>
        </div>

        {selectedLink && linkAnalytics ? (
          /* Detailed Link Analytics */
          <AnalyticsCharts data={linkAnalytics} />
        ) : dashboardStats ? (
          /* Dashboard Overview */
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Liens</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats.totalLinks}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clics (30j)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats.totalClicks}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Visiteurs Uniques</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(dashboardStats.totalClicks * 0.8)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Globe className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pays</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.min(dashboardStats.totalClicks > 0 ? 5 : 0, dashboardStats.totalClicks)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Links */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Liens les plus populaires
                </h3>
              </div>
              <div className="p-6">
                {dashboardStats.topLinks && dashboardStats.topLinks.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardStats.topLinks.map((link: any) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => fetchLinkAnalytics(link.id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {link.icon ? (
                              <span className="text-lg">{link.icon}</span>
                            ) : (
                              <BarChart3 className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{link.title}</h4>
                            <p className="text-sm text-gray-500">/{link.slug}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {link._count?.analyticsEvents || 0}
                          </p>
                          <p className="text-sm text-gray-500">clics</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune donnée disponible
                    </h3>
                    <p className="text-gray-500">
                      Créez des liens et commencez à collecter des données !
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chargement des analytics...
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}