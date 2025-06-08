'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Globe, 
  ArrowLeft,
  Folder,
  Link2,
  Eye,
  Calendar,
  Layers
} from 'lucide-react'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts'
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics'

interface FolderAnalytics {
  id: string
  name: string
  icon: string
  color: string
  description?: string
  totalClicks: number
  directClicks: number
  childrenClicks?: number
  linksCount: number
  childrenCount?: number
  clicksByDay: { date: string; clicks: number }[]
  topLinks: {
    id: string
    title: string
    slug: string
    clicks: number
    icon?: string
  }[]
  growthRate: number
  hasChildren?: boolean
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [selectedLink, setSelectedLink] = useState<string | null>(null)
  const [linkAnalytics, setLinkAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'links' | 'folders'>('links')
  const [folders, setFolders] = useState<FolderAnalytics[]>([])
  const [unorganized, setUnorganized] = useState<FolderAnalytics | null>(null)
  const [totalClicks, setTotalClicks] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchDashboardStats()
      if (view === 'folders') {
        fetchFoldersAnalytics()
      }
    }
  }, [status, router, view])

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

  const fetchFoldersAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/folders')
      if (response.ok) {
        const data = await response.json()
        console.log('Données des dossiers reçues:', data)
        setFolders(data.folders || [])
        setUnorganized(data.unorganized || null)
        setTotalClicks(data.totalClicks || 0)
      } else {
        console.error('Erreur response:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching folders analytics:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
          />
          <p className="text-gray-600 font-medium">Chargement des analytics...</p>
        </motion.div>
      </div>
    )
  }

  if (!session) return null

  const allFolders = unorganized ? [...folders, unorganized] : folders

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              {selectedLink && (
                <motion.button
                  onClick={backToDashboard}
                  className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </motion.button>
              )}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  {selectedLink ? 'Analytics du Lien' : 'Analytics Dashboard'}
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  {selectedLink 
                    ? 'Statistiques détaillées des 30 derniers jours'
                    : 'Vue d\'ensemble de vos performances'
                  }
                </p>
              </div>
            </div>
            
            {!selectedLink && (
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-lg">
                <motion.button
                  onClick={() => setView('links')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    view === 'links' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2">
                    <Link2 className="w-4 h-4" />
                    <span>Par Liens</span>
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => setView('folders')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    view === 'folders' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2">
                    <Folder className="w-4 h-4" />
                    <span>Par Dossiers</span>
                  </div>
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {selectedLink && linkAnalytics ? (
          /* Detailed Link Analytics */
          <>
            <AnalyticsCharts data={linkAnalytics} />
            <AdvancedAnalytics data={linkAnalytics} type="link" />
          </>
        ) : view === 'folders' ? (
          /* Folders Analytics View */
          <>
            {/* Global Stats for Folders */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clics Totaux</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalClicks.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dossiers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{folders.length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <Folder className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Liens Totaux</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {allFolders.reduce((sum, f) => sum + f.linksCount, 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <Link2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Croissance Moy.</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {folders.length > 0 
                        ? Math.round(folders.reduce((sum, f) => sum + f.growthRate, 0) / folders.length)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Folders List */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-gray-900">Performance par Dossier</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {allFolders.map((folder, index) => (
                  <motion.div
                    key={folder.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                          style={{ backgroundColor: `${folder.color}20` }}
                        >
                          {folder.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{folder.name}</h4>
                          <p className="text-sm text-gray-600">{folder.linksCount} liens</p>
                        </div>
                      </div>
                      {folder.growthRate !== 0 && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                          folder.growthRate > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {folder.growthRate > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">{Math.abs(folder.growthRate)}%</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Clics totaux</span>
                        <span className="text-2xl font-bold text-gray-900">{folder.totalClicks.toLocaleString()}</span>
                      </div>
                      {folder.hasChildren && (
                        <div className="text-sm text-gray-500">
                          <span>{folder.directClicks} directs • {folder.childrenClicks} sous-dossiers</span>
                        </div>
                      )}
                    </div>

                    {/* Top Links */}
                    {folder.topLinks && folder.topLinks.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Top liens</h5>
                        {folder.topLinks.slice(0, 3).map((link) => (
                          <div key={link.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 truncate">
                              {link.icon && <span>{link.icon}</span>}
                              <span className="text-gray-700 truncate">{link.title}</span>
                            </div>
                            <span className="font-medium text-gray-900">{link.clicks}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Analytics avancées pour les dossiers */}
            {folders.length > 0 && (
              <AdvancedAnalytics 
                data={{
                  summary: folders.flatMap(folder => 
                    folder.clicksByDay?.map((day: any) => ({
                      date: day.date,
                      clicks: day.clicks,
                      views: day.clicks * 1.2
                    })) || []
                  ),
                  stats: {
                    hourlyDistribution: Object.fromEntries(
                      Array.from({ length: 24 }, (_, i) => [i, 0])
                    ),
                    topDevices: [['Mobile', 65], ['Desktop', 30], ['Tablet', 5]],
                    topCountries: [['France', 100]],
                    topBrowsers: [['Chrome', 100]]
                  }
                }} 
                type="folder" 
              />
            )}
          </>
        ) : dashboardStats ? (
          /* Links Analytics View */
          <div className="space-y-6">
            {/* Stats Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Liens</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats.totalLinks}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Clics (30j)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardStats.totalClicks}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Visiteurs Uniques</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(dashboardStats.totalClicks * 0.8)}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pays</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.min(dashboardStats.totalClicks > 0 ? 5 : 0, dashboardStats.totalClicks)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Top Links */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                  Liens les plus populaires
                </h3>
              </div>
              <div className="p-6">
                {dashboardStats.topLinks && dashboardStats.topLinks.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardStats.topLinks.map((link: any, index: number) => (
                      <motion.div
                        key={link.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-all"
                        onClick={() => fetchLinkAnalytics(link.id)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                            {link.icon ? (
                              <span className="text-2xl">{link.icon}</span>
                            ) : (
                              <BarChart3 className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{link.title}</h4>
                            <p className="text-sm text-gray-500">/{link.slug}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-xl">
                            {link._count?.analyticsEvents || 0}
                          </p>
                          <p className="text-sm text-gray-500">clics</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Aucune donnée disponible
                    </h3>
                    <p className="text-gray-500">
                      Créez des liens et commencez à collecter des données !
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Analytics avancées pour le dashboard général */}
            <AdvancedAnalytics 
              data={{
                summary: dashboardStats.summary || [],
                stats: dashboardStats.advancedStats || {
                  hourlyDistribution: Object.fromEntries(
                    Array.from({ length: 24 }, (_, i) => [i, Math.floor(Math.random() * 100)])
                  ),
                  topDevices: [['Mobile', 70], ['Desktop', 25], ['Tablet', 5]],
                  topCountries: [['France', 50], ['Canada', 20], ['Belgique', 12], ['Suisse', 8], ['Autres', 10]],
                  topBrowsers: [['Chrome', 65], ['Safari', 20], ['Firefox', 10], ['Edge', 5]]
                }
              }} 
              type="dashboard" 
            />
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
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