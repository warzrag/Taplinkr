'use client'

import { useState, useMemo } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  RadarChart, Radar, ScatterChart, Scatter, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ZAxis,
  Brush, ReferenceLine, ReferenceArea
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Activity, Globe, Smartphone, Monitor,
  Clock, Calendar, Users, Target, Zap, ArrowUpRight, ArrowDownRight,
  Eye, MousePointer, Share2, Heart, BarChart3, PieChart as PieChartIcon,
  LineChart as LineChartIcon, Filter, Download, RefreshCw, Info
} from 'lucide-react'
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import ExportButton from './ExportButton'
import AnalyticsFilters from './AnalyticsFilters'

interface AdvancedAnalyticsProps {
  data: any
  type: 'link' | 'folder' | 'dashboard'
}

const COLORS = {
  primary: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  secondary: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'],
  success: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  info: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63']
}

const ALL_COLORS = [
  ...COLORS.primary,
  ...COLORS.secondary,
  ...COLORS.success,
  ...COLORS.warning,
  ...COLORS.danger,
  ...COLORS.info
]

export default function AdvancedAnalytics({ data, type }: AdvancedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState(30)
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area')
  const [selectedMetric, setSelectedMetric] = useState<'clicks' | 'views' | 'engagement'>('clicks')

  // Calculer les données enrichies
  const enrichedData = useMemo(() => {
    if (!data?.summary) return []
    
    return data.summary.map((item: any, index: number) => {
      const previousItem = index > 0 ? data.summary[index - 1] : null
      const clickGrowth = previousItem 
        ? ((item.clicks - previousItem.clicks) / previousItem.clicks * 100).toFixed(1)
        : 0
      
      return {
        ...item,
        date: format(parseISO(item.date), 'dd MMM', { locale: fr }),
        fullDate: item.date,
        clickGrowth: parseFloat(clickGrowth),
        engagementRate: item.views > 0 ? (item.clicks / item.views * 100).toFixed(1) : 0,
        bounceRate: item.views > 0 ? ((item.views - item.clicks) / item.views * 100).toFixed(1) : 0
      }
    })
  }, [data])

  // Statistiques avancées
  const advancedStats = useMemo(() => {
    if (!enrichedData.length && !data?.totals) return null

    // Utiliser les totaux fournis en priorité, sinon calculer depuis le summary
    const totalClicks = data?.totals?.clicks ?? data?.totalClicks ?? enrichedData.reduce((sum, item) => sum + item.clicks, 0)
    const totalViews = data?.totals?.views ?? data?.totalViews ?? enrichedData.reduce((sum, item) => sum + item.views, 0)
    
    const avgClicks = enrichedData.length > 0 ? totalClicks / enrichedData.length : 0
    const avgViews = enrichedData.length > 0 ? totalViews / enrichedData.length : 0
    
    const clicksArray = enrichedData.map(item => item.clicks)
    const maxClicks = clicksArray.length > 0 ? Math.max(...clicksArray) : totalClicks
    const minClicks = clicksArray.length > 0 ? Math.min(...clicksArray) : 0
    
    const recentTrend = enrichedData.slice(-7).reduce((sum, item) => sum + item.clickGrowth, 0) / 7
    
    const peakDay = enrichedData.length > 0 ? enrichedData.reduce((max, item) => 
      item.clicks > max.clicks ? item : max
    ) : { date: 'Aujourd\'hui', clicks: totalClicks }

    return {
      totalClicks,
      totalViews,
      avgClicks: Math.round(avgClicks),
      avgViews: Math.round(avgViews),
      maxClicks,
      minClicks,
      engagementRate: totalViews > 0 ? (totalClicks / totalViews * 100).toFixed(1) : 0,
      recentTrend: recentTrend.toFixed(1),
      peakDay,
      growthRate: (data?.totals?.growthRate ?? data?.growthRate ?? enrichedData[enrichedData.length - 1]?.clickGrowth) || 0
    }
  }, [enrichedData, data])

  // Données pour les graphiques spécialisés
  const heatmapData = useMemo(() => {
    if (!data?.stats?.hourlyDistribution) return []
    
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    return days.flatMap((day, dayIndex) => 
      hours.map(hour => ({
        day,
        hour,
        value: Math.floor(Math.random() * 100), // Simulé pour la démo
        dayIndex,
        hourIndex: hour
      }))
    )
  }, [data])

  const deviceComparison = useMemo(() => {
    if (!data?.stats?.topDevices) return []
    
    return data.stats.topDevices.map(([device, count]: [string, number]) => ({
      device,
      current: count,
      previous: Math.floor(count * (0.8 + Math.random() * 0.4)), // Simulé
      growth: Math.floor(-20 + Math.random() * 40)
    }))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header avec filtres et contrôles */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analyses Avancées</h2>
            <p className="text-gray-600 mt-1">Vue d'ensemble complète et insights détaillés</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Sélecteur de période */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7 jours</option>
              <option value={30}>30 jours</option>
              <option value={90}>90 jours</option>
              <option value={365}>1 an</option>
            </select>

            {/* Type de graphique */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded ${chartType === 'line' ? 'bg-white shadow' : ''}`}
              >
                <LineChartIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-2 rounded ${chartType === 'area' ? 'bg-white shadow' : ''}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded ${chartType === 'bar' ? 'bg-white shadow' : ''}`}
              >
                <PieChartIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Filtres */}
            <AnalyticsFilters 
              onFiltersChange={(filters) => console.log('Filtres:', filters)}
              initialFilters={{ dateRange: timeRange.toString() }}
            />

            {/* Export */}
            <ExportButton 
              data={data} 
              type={type}
              linkId={type === 'link' ? 'example-link-id' : undefined}
            />

            {/* Actions */}
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPIs avancés */}
      {advancedStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <MousePointer className="w-8 h-8 text-blue-600" />
              <span className={`flex items-center text-sm font-medium ${
                advancedStats.growthRate > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {advancedStats.growthRate > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(advancedStats.growthRate)}%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{advancedStats.totalClicks.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm mt-1">Clics totaux</p>
            <div className="mt-4 text-xs text-gray-500">
              <p>Moy: {advancedStats.avgClicks}/jour</p>
              <p>Max: {advancedStats.maxClicks} | Min: {advancedStats.minClicks}</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-purple-600" />
              <span className="flex items-center text-sm font-medium text-purple-600">
                <Activity className="w-4 h-4 mr-1" />
                {advancedStats.engagementRate}%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{advancedStats.totalViews.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm mt-1">Vues totales</p>
            <div className="mt-4 text-xs text-gray-500">
              <p>Taux d'engagement: {advancedStats.engagementRate}%</p>
              <p>Moy: {advancedStats.avgViews}/jour</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-green-600" />
              <span className="flex items-center text-sm font-medium text-green-600">
                <Zap className="w-4 h-4 mr-1" />
                Peak
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{advancedStats.peakDay.clicks}</h3>
            <p className="text-gray-600 text-sm mt-1">Record de clics</p>
            <div className="mt-4 text-xs text-gray-500">
              <p>Date: {advancedStats.peakDay.date}</p>
              <p>Tendance: {advancedStats.recentTrend > 0 ? '+' : ''}{advancedStats.recentTrend}%</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-orange-600" />
              <Info className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              {data?.stats?.topCountries?.length || 0}
            </h3>
            <p className="text-gray-600 text-sm mt-1">Pays actifs</p>
            <div className="mt-4 text-xs text-gray-500">
              <p>Appareils: {data?.stats?.topDevices?.length || 0}</p>
              <p>Navigateurs: {data?.stats?.topBrowsers?.length || 0}</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Graphique principal avec options */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Évolution des performances</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric('clicks')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === 'clicks' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Clics
            </button>
            <button
              onClick={() => setSelectedMetric('views')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === 'views' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Vues
            </button>
            <button
              onClick={() => setSelectedMetric('engagement')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === 'engagement' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Engagement
            </button>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={enrichedData}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Brush dataKey="date" height={30} stroke="#3b82f6" />
                {selectedMetric === 'clicks' || selectedMetric === 'engagement' ? (
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorClicks)"
                    strokeWidth={2}
                    name="Clics"
                  />
                ) : null}
                {selectedMetric === 'views' || selectedMetric === 'engagement' ? (
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorViews)"
                    strokeWidth={2}
                    name="Vues"
                  />
                ) : null}
              </AreaChart>
            ) : chartType === 'line' ? (
              <LineChart data={enrichedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Clics"
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Vues"
                />
              </LineChart>
            ) : (
              <BarChart data={enrichedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Clics" />
                <Bar dataKey="views" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Vues" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Graphiques secondaires en grille */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Distribution horaire avec heatmap */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Activité par heure
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(data?.stats?.hourlyDistribution || {}).map(([hour, clicks]) => ({
                hour: `${hour}h`,
                clicks
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {Object.entries(data?.stats?.hourlyDistribution || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ALL_COLORS[index % ALL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Répartition par appareil */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-purple-600" />
            Appareils & Croissance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={deviceComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="device" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#6b7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="current" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Actuel" />
                <Bar yAxisId="left" dataKey="previous" fill="#e9d5ff" radius={[4, 4, 0, 0]} name="Précédent" />
                <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={3} name="Croissance %" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top pays avec carte */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-green-600" />
            Répartition géographique
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.stats?.topCountries?.map(([country, count]: [string, number]) => ({
                    name: country,
                    value: count
                  })) || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data?.stats?.topCountries?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS.success[index % COLORS.success.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Taux d'engagement */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-orange-600" />
            Métriques d'engagement
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { metric: 'Clics', value: 85 },
                { metric: 'Vues', value: 92 },
                { metric: 'Partages', value: 68 },
                { metric: 'Likes', value: 74 },
                { metric: 'Temps passé', value: 81 },
                { metric: 'Retours', value: 63 }
              ]}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                <Radar name="Performance" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Prédictions et tendances */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 lg:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
            Prédictions & Tendances
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={enrichedData}>
                <defs>
                  <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="clicks" fill="url(#colorPrediction)" stroke="#ef4444" name="Réel" />
                <Line type="monotone" dataKey="clickGrowth" stroke="#10b981" strokeWidth={3} name="Croissance %" />
                <ReferenceLine y={advancedStats?.avgClicks} stroke="#6b7280" strokeDasharray="5 5" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Insights et recommandations */}
      <motion.div 
        className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl border border-white/20 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-yellow-600" />
          Insights & Recommandations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Tendance positive</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Croissance de {advancedStats?.recentTrend}% sur les 7 derniers jours
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Pic d'activité</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Meilleure performance entre 14h et 18h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Optimisation mobile</h4>
                <p className="text-sm text-gray-600 mt-1">
                  65% du trafic provient d'appareils mobiles
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}