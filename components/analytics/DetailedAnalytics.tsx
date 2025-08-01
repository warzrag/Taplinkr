'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Globe,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  Link2,
  TrendingUp,
  Eye,
  MousePointer,
  BarChart3,
  MapPin,
  Share2,
  Clock,
  Filter
} from 'lucide-react'
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface DetailedAnalyticsProps {
  linkId?: string
}

export default function DetailedAnalytics({ linkId }: DetailedAnalyticsProps) {
  const [period, setPeriod] = useState('7days')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [period, linkId])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period })
      if (linkId) params.append('linkId', linkId)
      
      const response = await fetch(`/api/analytics/detailed?${params}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    )
  }

  const { analytics, recentClicks } = data

  // Données pour le graphique timeline
  const timelineData = {
    labels: analytics.timeline.map(t => new Date(t.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: 'Clics',
        data: analytics.timeline.map(t => t.clicks),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3
      },
      {
        label: 'Vues',
        data: analytics.timeline.map(t => t.views),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.3
      }
    ]
  }

  // Données pour le graphique des pays
  const countryData = {
    labels: analytics.geography.topCountries.map(c => c.country),
    datasets: [
      {
        data: analytics.geography.topCountries.map(c => c.clicks),
        backgroundColor: [
          '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981',
          '#F97316', '#06B6D4', '#6366F1', '#84CC16', '#14B8A6'
        ]
      }
    ]
  }

  // Données pour les appareils
  const deviceData = {
    labels: Object.keys(analytics.devices.types),
    datasets: [
      {
        data: Object.values(analytics.devices.types),
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B']
      }
    ]
  }

  // Données pour les sources de trafic
  const sourceData = {
    labels: analytics.traffic.topSources.map(s => s.source),
    datasets: [
      {
        label: 'Clics par source',
        data: analytics.traffic.topSources.map(s => s.clicks),
        backgroundColor: 'rgba(59, 130, 246, 0.7)'
      }
    ]
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
      case 'iphone':
      case 'samsung':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
      case 'ipad':
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case 'chrome':
        return <Chrome className="w-4 h-4" />
      case 'safari':
        return <Globe className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics détaillées</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="24hours">24 dernières heures</option>
          <option value="7days">7 derniers jours</option>
          <option value="30days">30 derniers jours</option>
          <option value="90days">90 derniers jours</option>
        </select>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MousePointer className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{analytics.overview.totalClicks}</h3>
          <p className="text-sm text-gray-500 mt-1">Clics totaux</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{analytics.overview.totalViews}</h3>
          <p className="text-sm text-gray-500 mt-1">Vues totales</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{analytics.overview.uniqueVisitors}</h3>
          <p className="text-sm text-gray-500 mt-1">Visiteurs uniques</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{analytics.overview.conversionRate}%</h3>
          <p className="text-sm text-gray-500 mt-1">Taux de conversion</p>
        </motion.div>
      </div>

      {/* Graphique timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution du trafic</h3>
        <div className="h-64">
          <Line
            data={timelineData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition géographique */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Répartition géographique
          </h3>
          <div className="h-64">
            <Doughnut
              data={countryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  }
                }
              }}
            />
          </div>
          <div className="mt-4 space-y-2">
            {analytics.geography.topCountries.slice(0, 5).map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{country.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{country.clicks}</span>
                  <span className="text-xs text-gray-500">({country.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sources de trafic */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-600" />
            Sources de trafic
          </h3>
          <div className="h-64">
            <Bar
              data={sourceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {Object.entries(analytics.traffic.mediums).map(([medium, count]) => (
              <div key={medium} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 capitalize">{medium}</span>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Appareils et navigateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Types d'appareils</h3>
          <div className="h-48">
            <Pie
              data={deviceData}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigateurs</h3>
          <div className="space-y-3">
            {Object.entries(analytics.devices.browsers).map(([browser, count]) => (
              <div key={browser} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getBrowserIcon(browser)}
                  <span className="text-sm text-gray-700">{browser}</span>
                </div>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Systèmes d'exploitation</h3>
          <div className="space-y-3">
            {Object.entries(analytics.devices.os).map(([os, count]) => (
              <div key={os} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{os}</span>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Clics récents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-600" />
          Activité récente
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3">Heure</th>
                <th className="pb-3">Lien</th>
                <th className="pb-3">Pays</th>
                <th className="pb-3">Ville</th>
                <th className="pb-3">Appareil</th>
                <th className="pb-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentClicks.slice(0, 10).map((click) => (
                <tr key={click.id} className="hover:bg-gray-50">
                  <td className="py-3 text-sm text-gray-600">
                    {new Date(click.createdAt).toLocaleString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{click.linkTitle}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{click.country}</td>
                  <td className="py-3 text-sm text-gray-600">{click.city}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {getDeviceIcon(click.device)}
                      <span className="text-sm text-gray-600">{click.device}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{click.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}