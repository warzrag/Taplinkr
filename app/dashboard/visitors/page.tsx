'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Link2, 
  Globe, 
  Monitor,
  Smartphone,
  Tablet,
  Users,
  Clock,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Visitor {
  id: string
  timestamp: string
  location: {
    city: string
    region: string
    country: string
    countryCode: string
  }
  linkSlug: string
  linkTitle: string
  browser: string
  os: string
  referrer: string
  referrerDomain: string
  device: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  status: 'success' | 'blocked' | 'bot'
  ip: string
  userAgent: string
}

export default function VisitorsPage() {
  const { data: session } = useSession()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'mobile' | 'desktop'>('all')

  const itemsPerPage = 20

  useEffect(() => {
    fetchVisitors()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchVisitors(true)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [currentPage, filter])

  const fetchVisitors = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      console.log('Fetching visitors with params:', { currentPage, itemsPerPage, filter })
      
      const response = await fetch(`/api/analytics/visitors?page=${currentPage}&limit=${itemsPerPage}&device=${filter}`)
      const data = await response.json()

      console.log('Response status:', response.status)
      console.log('Response data:', data)

      if (response.ok) {
        setVisitors(data.visitors || [])
        setTotalPages(Math.ceil(data.total / itemsPerPage))
      } else {
        console.error('Erreur API:', data.error)
        toast.error(data.error || 'Erreur lors du chargement des visiteurs')
      }
    } catch (error) {
      console.error('Erreur lors du chargement des visiteurs:', error)
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-4 h-4" />
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'blocked':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-full flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            Bloqué
          </span>
        )
      case 'bot':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
            Bot
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            Succès
          </span>
        )
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { locale: fr, addSuffix: true })
    } catch {
      return timestamp
    }
  }

  if (loading && !refreshing) {
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                100 derniers visiteurs
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Données en temps réel de vos visiteurs
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Device Filter */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilter('mobile')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </button>
                <button
                  onClick={() => setFilter('desktop')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === 'desktop'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </button>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchVisitors(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Actualiser</span>
            </button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {visitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Aucun visiteur pour le moment
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                Les visiteurs apparaîtront ici lorsque des personnes cliqueront sur vos liens.
              </p>
              <Link href="/dashboard">
                <button className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                  Retour au tableau de bord
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Temps
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Localisation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lien
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Navigateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      OS
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Référent
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Appareil
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {visitors.map((visitor, index) => (
                  <motion.tr
                    key={visitor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {formatTimeAgo(visitor.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {visitor.location.city || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {visitor.location.region}, {visitor.location.country}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {visitor.linkTitle}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            /{visitor.linkSlug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {visitor.browser}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {visitor.os}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {visitor.referrerDomain || 'Direct'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(visitor.deviceType)}
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {visitor.device}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(visitor.status)}
                    </td>
                  </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {visitors.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} sur {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}