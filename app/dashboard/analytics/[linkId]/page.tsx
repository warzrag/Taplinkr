'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  MousePointer,
  Eye,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Chrome,
  Safari,
  Firefox,
  MapPin,
  Calendar,
  Clock,
  BarChart3,
  Users,
  Activity,
  Link2,
  ExternalLink,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'

interface LinkData {
  id: string
  title: string
  slug: string
  clicks: number
  views: number
  isActive: boolean
  createdAt: string
}

interface ClickData {
  id: string
  createdAt: string
  country: string
  city: string
  device: string
  browser: string
  os: string
  referer: string
  multiLinkId: string | null
}

interface Stats {
  totalClicks: number
  totalViews: number
  uniqueVisitors: number
  averageClickRate: number
  topCountry: string
  topDevice: string
  topBrowser: string
}

interface DeviceStats {
  mobile: number
  desktop: number
  tablet: number
}

interface CountryStats {
  [country: string]: number
}

export default function LinkAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const linkId = params.linkId as string

  const [linkData, setLinkData] = useState<LinkData | null>(null)
  const [clicks, setClicks] = useState<ClickData[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [linkId, dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch link data
      const linkResponse = await fetch(`/api/links/${linkId}`)
      if (!linkResponse.ok) {
        router.push('/dashboard/links')
        return
      }
      const link = await linkResponse.json()
      setLinkData(link)

      // Fetch clicks data
      const clicksResponse = await fetch(`/api/analytics/clicks?linkId=${linkId}&range=${dateRange}`)
      const clicksData = await clicksResponse.json()
      setClicks(clicksData.clicks || [])
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const stats: Stats = {
    totalClicks: linkData?.clicks || 0,
    totalViews: linkData?.views || 0,
    uniqueVisitors: new Set(clicks.map(c => c.id)).size,
    averageClickRate: linkData?.views ? ((linkData.clicks / linkData.views) * 100) : 0,
    topCountry: getTopValue(clicks.map(c => c.country)),
    topDevice: getTopValue(clicks.map(c => c.device)),
    topBrowser: getTopValue(clicks.map(c => c.browser))
  }

  const deviceStats: DeviceStats = {
    mobile: clicks.filter(c => c.device === 'mobile').length,
    desktop: clicks.filter(c => c.device === 'desktop').length,
    tablet: clicks.filter(c => c.device === 'tablet').length
  }

  const countryStats: CountryStats = clicks.reduce((acc, click) => {
    const country = click.country || 'Unknown'
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {} as CountryStats)

  const topCountries = Object.entries(countryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  function getTopValue(values: string[]): string {
    const counts = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]
    return top ? top[0] : '-'
  }

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return Smartphone
      case 'tablet': return Tablet
      default: return Monitor
    }
  }

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case 'chrome': return Chrome
      case 'safari': return Safari
      case 'firefox': return Firefox
      default: return Globe
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement des analytics...</p>
        </motion.div>
      </div>
    )
  }

  if (!linkData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/links">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {linkData.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Link2 className="w-4 h-4 text-gray-500" />
                  <a
                    href={`/${linkData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    taplinkr.com/{linkData.slug}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setDateRange('7d')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateRange === '7d'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                7 jours
              </button>
              <button
                onClick={() => setDateRange('30d')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateRange === '30d'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                30 jours
              </button>
              <button
                onClick={() => setDateRange('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  dateRange === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Tout
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MousePointer className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                +{stats.totalClicks}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Clics</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalClicks.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                +{stats.totalViews}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Vues</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Visiteurs Uniques</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.uniqueVisitors.toLocaleString()}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Taux de Clic</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageClickRate.toFixed(1)}%</p>
          </motion.div>
        </div>

        {/* Devices & Browsers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Devices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-600" />
              Appareils
            </h3>
            <div className="space-y-4">
              {Object.entries(deviceStats).map(([device, count]) => {
                const Icon = getDeviceIcon(device)
                const percentage = clicks.length > 0 ? (count / clicks.length) * 100 : 0
                return (
                  <div key={device}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {device === 'mobile' ? 'Mobile' : device === 'desktop' ? 'Desktop' : 'Tablette'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Top Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              Top Pays
            </h3>
            <div className="space-y-4">
              {topCountries.map(([country, count]) => {
                const percentage = clicks.length > 0 ? (count / clicks.length) * 100 : 0
                return (
                  <div key={country}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {country || 'Inconnu'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Recent Clicks Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Clics Récents
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Pays
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Appareil
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Navigateur
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {clicks.slice(0, 10).map((click) => (
                  <tr key={click.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {format(new Date(click.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {click.country || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {click.city || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {click.device || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {click.browser || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {clicks.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Aucun clic pour le moment</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
