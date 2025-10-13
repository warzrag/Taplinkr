'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { MousePointer, TrendingUp, Clock, Sparkles } from 'lucide-react'

interface LinkClickData {
  id: string
  name: string
  slug: string
  todayClicks: number
  totalClicks: number
}

interface TodayClicksData {
  startOfToday: string
  endOfToday: string
  links: LinkClickData[]
  hasClicksToday: boolean
  totalLinks: number
}

export default function TodayClicksChart() {
  const [data, setData] = useState<TodayClicksData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodayClicks()
  }, [])

  const fetchTodayClicks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics/today-clicks')

      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
          />
        </div>
      </motion.div>
    )
  }

  if (!data || data.links.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <MousePointer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Clics d'aujourd'hui
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aucun lien trouvé
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Créez des liens pour voir vos statistiques ici
          </p>
        </div>
      </motion.div>
    )
  }

  // Calculer le total des clics d'aujourd'hui
  const totalTodayClicks = data.links.reduce((sum, link) => sum + link.todayClicks, 0)

  // Préparer les données pour le graphique (top 10 max)
  const chartData = data.links
    .sort((a, b) => b.todayClicks - a.todayClicks)
    .slice(0, 10)
    .map(link => ({
      name: link.name.length > 20 ? link.name.substring(0, 20) + '...' : link.name,
      clics: link.todayClicks,
      fullName: link.name,
      slug: link.slug,
    }))

  // Couleurs du gradient
  const COLORS = [
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#f43f5e', // rose
    '#14b8a6', // teal
    '#a855f7', // violet
    '#ef4444', // red
  ]

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {payload[0].payload.fullName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            /{payload[0].payload.slug}
          </p>
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-2">
            {payload[0].value} clic{payload[0].value > 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <MousePointer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {data.hasClicksToday ? "Clics d'aujourd'hui" : "Vos meilleurs liens"}
                {data.hasClicksToday && <Sparkles className="w-4 h-4 text-yellow-500" />}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {data.hasClicksToday
                  ? "Statistiques en temps réel"
                  : "Pas de clics aujourd'hui - Historique total"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {totalTodayClicks}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {data.hasClicksToday ? "Total aujourd'hui" : "Clics aujourd'hui"}
            </p>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
            <Bar
              dataKey="clics"
              radius={[8, 8, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Légende avec les liens */}
        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
            {data.hasClicksToday
              ? `Top ${chartData.length} liens aujourd'hui`
              : `Top ${chartData.length} liens (historique)`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {chartData.map((link, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {link.fullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    /{link.slug}
                  </p>
                </div>
                <span className="text-sm font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                  {link.clics}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
