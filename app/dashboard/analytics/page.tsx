'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Activity, 
  Users, 
  Eye, 
  MousePointer,
  TrendingUp,
  ChevronLeft,
  Globe,
  Calendar,
  ArrowUpRight,
  Clock,
  Smartphone,
  Monitor,
  Link2,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts'
import DetailedAnalytics from '@/components/analytics/DetailedAnalytics'
import { fetchAnalyticsData } from '@/lib/analytics/api-wrapper'

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await fetchAnalyticsData(timeRange)
      setAnalyticsData(data)
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Analytics détaillées
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Analysez vos performances en détail
              </p>
            </div>
            
            {/* Quick Actions */}
            <Link href="/dashboard/visitors">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <Users className="w-4 h-4" />
                <span>Voir les visiteurs</span>
                <ArrowUpRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm w-fit">
            {[
              { value: '7', label: '7 jours' },
              { value: '30', label: '30 jours' },
              { value: '90', label: '90 jours' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <MousePointer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              {analyticsData?.growthRate !== undefined && (
                <span className={`text-sm font-medium ${
                  analyticsData.growthRate > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {analyticsData.growthRate > 0 ? '+' : ''}{analyticsData.growthRate}%
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {analyticsData?.totalClicks || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total clics</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {analyticsData?.totalViews || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total vues</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {analyticsData?.uniqueVisitors || 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Visiteurs uniques</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {analyticsData?.conversionRate || 0}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Taux de conversion</p>
          </motion.div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/visitors">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 cursor-pointer shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">100 derniers visiteurs</h3>
                  <p className="text-sm opacity-90">Voir qui visite vos liens en temps réel</p>
                </div>
                <Users className="w-8 h-8 opacity-80" />
              </div>
            </motion.div>
          </Link>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Temps moyen</h3>
                <p className="text-2xl font-bold">2m 34s</p>
              </div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Appareils</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-sm">{analyticsData?.deviceStats?.mobile || 65}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm">{analyticsData?.deviceStats?.desktop || 35}%</span>
                  </div>
                </div>
              </div>
              <Activity className="w-8 h-8 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        {analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AnalyticsCharts data={analyticsData} />
          </motion.div>
        )}

        {/* Detailed Analytics */}
        {analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <DetailedAnalytics data={analyticsData} />
          </motion.div>
        )}
      </div>
    </div>
  )
}