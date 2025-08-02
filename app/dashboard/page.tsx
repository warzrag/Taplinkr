'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Link2, 
  BarChart3, 
  Crown, 
  Shield, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Users, 
  Clock,
  Globe,
  Smartphone,
  ArrowUpRight,
  Activity,
  Target,
  Zap,
  Calendar,
  ChevronRight,
  Sparkles,
  Gift,
  EyeOff,
  Layers,
  Folder,
  FolderOpen
} from 'lucide-react'
import CreateLinkModal from '@/components/CreateLinkModal'
import Link from 'next/link'
import EditLinkModal from '@/components/EditLinkModal'
import EditPhonePreview from '@/components/EditPhonePreview'
import { useLinkUpdate } from '@/contexts/LinkUpdateContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useLinks } from '@/contexts/LinksContext'
import { Link as LinkType } from '@/types'
import DashboardChart from '@/components/analytics/DashboardChart'
import InteractiveWorldMap from '@/components/analytics/InteractiveWorldMap'
import CountryBarsChart from '@/components/analytics/CountryBarsChart'
import { fetchAnalyticsData } from '@/lib/analytics/api-wrapper'

interface QuickAction {
  label: string
  icon: any
  href?: string
  onClick?: () => void
  gradient: string
  description: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { updateLinkInPreview } = useLinkUpdate()
  const { profile: userProfile } = useProfile()
  const { links: contextLinks, loading: contextLoading, refreshLinks } = useLinks()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkType | null>(null)
  const [liveEditingLink, setLiveEditingLink] = useState<LinkType | null>(null)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7')
  const [folderStats, setFolderStats] = useState<any>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      refreshLinks()
      fetchDashboardStats()
      fetchFolderStats()
    }
  }, [status])

  const links = contextLinks

  const fetchDashboardStats = async () => {
    try {
      setAnalyticsLoading(true)
      
      // Récupérer les vraies données analytics
      const response = await fetch('/api/analytics/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data)
      } else {
        console.error('Erreur API:', response.status)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchFolderStats = async () => {
    try {
      const response = await fetch('/api/analytics/folders')
      if (response.ok) {
        const data = await response.json()
        // Formater les données pour l'affichage
        const formattedStats = {
          totalFolders: data.folders.length,
          organizedLinks: data.folders.reduce((sum: number, f: any) => sum + f.linksCount, 0),
          topFolders: data.folders.filter((f: any) => f.totalClicks > 0)
        }
        setFolderStats(formattedStats)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats dossiers:', error)
    }
  }

  const handleToggle = async (linkId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/links/toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId, isActive })
      })
      
      if (response.ok) {
        await refreshLinks()
        toast.success(isActive ? 'Lien activé' : 'Lien désactivé')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleEdit = (link: LinkType) => {
    setEditingLink(link)
    setLiveEditingLink(link)
    setShowEditModal(true)
  }

  const handleDelete = async (linkId: string) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await refreshLinks()
        toast.success('Lien supprimé')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const quickActions: QuickAction[] = [
    {
      label: 'Créer un lien',
      icon: Plus,
      onClick: () => setShowCreateModal(true),
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Ajouter un nouveau lien'
    },
    {
      label: 'Analytics',
      icon: Activity,
      href: '/dashboard/analytics',
      gradient: 'from-purple-500 to-pink-500',
      description: 'Voir les statistiques détaillées'
    },
    {
      label: 'Mes liens',
      icon: Link2,
      href: '/dashboard/links',
      gradient: 'from-emerald-500 to-teal-500',
      description: 'Gérer tous vos liens'
    },
    {
      label: userProfile?.plan === 'free' ? 'Passer Pro' : 'Abonnement',
      icon: userProfile?.plan === 'free' ? Crown : Zap,
      href: '/dashboard/billing',
      gradient: userProfile?.plan === 'free' ? 'from-yellow-500 to-orange-500' : 'from-gray-500 to-gray-600',
      description: userProfile?.plan === 'free' ? 'Débloquer toutes les fonctionnalités' : 'Gérer votre abonnement'
    }
  ]

  if (contextLoading) {
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
        {/* Header amélioré */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Bonjour {userProfile?.name || session?.user?.email?.split('@')[0]} ! 👋
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            {/* Actions rapides admin */}
            {((session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'manager') && (
              <motion.button
                onClick={() => router.push('/admin/users')}
                className="bg-gradient-to-r from-red-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Shield className="w-5 h-5" />
                Panel Admin
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {action.href ? (
                <Link href={action.href}>
                  <div className={`relative overflow-hidden bg-gradient-to-br ${action.gradient} p-6 rounded-2xl text-white cursor-pointer hover:shadow-xl transition-all group`}>
                    <div className="relative z-10">
                      <action.icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
                      <action.icon className="w-24 h-24" />
                    </div>
                    {action.label.includes('Pro') && userProfile?.plan === 'free' && (
                      <div className="absolute top-2 right-2 animate-pulse">
                        <Sparkles className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <button
                  onClick={action.onClick}
                  className={`relative overflow-hidden bg-gradient-to-br ${action.gradient} p-6 rounded-2xl text-white cursor-pointer hover:shadow-xl transition-all group w-full text-left`}
                >
                  <div className="relative z-10">
                    <action.icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
                    <action.icon className="w-24 h-24" />
                  </div>
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Statistiques principales */}
        <div className="mb-8">
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
                {dashboardStats?.growthRate !== undefined && (
                  <span className={`text-sm font-medium ${
                    dashboardStats.growthRate > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {dashboardStats.growthRate > 0 ? '+' : ''}{dashboardStats.growthRate}%
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {dashboardStats?.totalClicks || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total clics</p>
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
                {dashboardStats?.uniqueVisitors || 0}
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
                  <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {links.filter(l => l.isActive).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Liens actifs</p>
            </motion.div>
          </div>

          {/* Carte du monde interactive - Pleine largeur */}
          {!analyticsLoading && dashboardStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Répartition géographique des clics
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Carte mondiale interactive - Zoomez et déplacez pour explorer
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Globe className="w-4 h-4" />
                  <span>{dashboardStats?.topCountries?.length || 0} pays</span>
                </div>
              </div>
              <div className="h-96">
                <InteractiveWorldMap data={dashboardStats} />
              </div>
            </motion.div>
          )}

          {/* Graphiques secondaires */}
          {!analyticsLoading && dashboardStats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Graphique d'évolution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Évolution sur 7 jours
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Clics par jour</span>
                  </div>
                </div>
                <div className="h-64">
                  <DashboardChart data={dashboardStats} />
                </div>
              </motion.div>

              {/* Top pays - Barres */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Top 10 pays
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Détail des clics par pays
                  </p>
                </div>
                <div className="h-64 overflow-y-auto">
                  <CountryBarsChart data={dashboardStats} />
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Top liens performants */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Top liens
              </h2>
              <Link href="/dashboard/analytics">
                <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  Voir tout
                  <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </div>

            {dashboardStats?.topLinks && dashboardStats.topLinks.length > 0 ? (
              <div className="space-y-3">
                {dashboardStats.topLinks.slice(0, 5).map((link: any, index: number) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all cursor-pointer group"
                    onClick={() => handleEdit(link)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-blue-400 to-indigo-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {link.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          /{link.slug}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {link._count?.analyticsEvents || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">clics</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune donnée disponible</p>
                <p className="text-xs mt-1">Créez des liens pour voir les statistiques</p>
              </div>
            )}
          </motion.div>

          {/* Analyse des dossiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Analyse dossiers
              </h2>
              <Link href="/dashboard/folders">
                <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  Gérer
                  <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </div>

            {folderStats ? (
              <div className="space-y-4">
                {/* Stats globales des dossiers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Folder className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Total dossiers</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {folderStats.totalFolders || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Link2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Liens organisés</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {folderStats.organizedLinks || 0}
                    </p>
                  </div>
                </div>

                {/* Top dossiers par clics */}
                {folderStats.topFolders && folderStats.topFolders.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Performance par dossier
                    </p>
                    {folderStats.topFolders.slice(0, 3).map((folder: any, index: number) => (
                      <motion.div
                        key={folder.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.65 + index * 0.05 }}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="text-lg">{folder.icon || '📁'}</div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {folder.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {folder._count?.links || 0} liens
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {folder.totalClicks || 0}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">clics</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucun dossier créé</p>
                    <Link href="/dashboard/folders">
                      <button className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        Créer un dossier
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            )}
          </motion.div>

          {/* Insights et recommandations combinés */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 gap-6"
          >
            {/* Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Insights
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Globe className="w-10 h-10 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Portée globale
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dashboardStats?.topCountries?.length || 0} pays atteints
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <Smartphone className="w-10 h-10 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Mobile first
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dashboardStats?.deviceStats?.mobile || 65}% mobile
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <Clock className="w-10 h-10 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Pic d'activité
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      18h - 20h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">
                Recommandations
              </h2>
              <div className="space-y-3">
                {userProfile?.plan === 'free' && (
                  <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur rounded-xl">
                    <Crown className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Passez Premium</p>
                      <p className="text-sm opacity-90">
                        Analytics avancées + liens illimités
                      </p>
                    </div>
                  </div>
                )}
                
                {links.length < 5 && (
                  <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur rounded-xl">
                    <Link2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Ajoutez des liens</p>
                      <p className="text-sm opacity-90">
                        Créez {5 - links.length} liens de plus
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur rounded-xl">
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Optimisez vos liens</p>
                    <p className="text-sm opacity-90">
                      Utilisez des titres accrocheurs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>


        {/* Section Mes Liens - Design moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          {/* En-tête de section */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Mes liens
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {links.length} {links.length > 1 ? 'liens créés' : 'lien créé'}
                </p>
              </div>
            </div>
            <Link href="/dashboard/links">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Gérer tous les liens
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.button>
            </Link>
          </div>

          {links.length > 0 ? (
            <div className="space-y-4">
              {/* Grille de liens moderne */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {links.slice(0, 6).map((link, index) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                    onClick={() => handleEdit(link)}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                  >
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Statut */}
                    <div className="absolute top-4 right-4">
                      <div className={`w-3 h-3 rounded-full ${
                        link.isActive 
                          ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                          : 'bg-gray-400'
                      } ${link.isActive ? 'animate-pulse' : ''}`} />
                    </div>

                    {/* Contenu principal */}
                    <div className="relative">
                      {/* En-tête avec icône */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Icône/Image */}
                        <div className="flex-shrink-0">
                          {link.coverImage ? (
                            <div className="w-12 h-12 rounded-xl overflow-hidden">
                              <img
                                src={link.coverImage}
                                alt={link.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : link.icon ? (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                              <span className="text-xl">{link.icon}</span>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                              <Link2 className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Titre et URL */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {link.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Link2 className="w-3 h-3 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              taplinkr.com/{link.slug}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Statistiques */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MousePointer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Clics totaux</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {link.clicks || 0}
                        </p>
                      </div>

                      {/* Type de lien et actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {link.isDirect ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                              <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Direct</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                {link.multiLinks?.length || 0} liens
                              </span>
                            </div>
                          )}
                          {link.shieldEnabled && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/20 rounded-lg">
                              <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                              <span className="text-xs font-medium text-green-600 dark:text-green-400">Shield</span>
                            </div>
                          )}
                        </div>

                        {/* Bouton d'action */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggle(link.id, link.isActive)
                          }}
                          className={`p-2 rounded-lg transition-all ${
                            link.isActive 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          title={link.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {link.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Hover effect line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </motion.div>
                ))}
              </div>

              {/* Call to action si peu de liens */}
              {links.length < 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Créez plus de liens pour développer votre présence
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ajoutez tous vos réseaux sociaux, sites web et contenus importants
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Nouveau lien
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            /* État vide amélioré */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 rounded-3xl p-12 text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                  <Link2 className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Créez votre premier lien
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Commencez à partager tous vos contenus importants en un seul endroit
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20"
                >
                  Créer mon premier lien
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateLinkModal
            isOpen={showCreateModal}
            editingLink={null}
            onClose={() => setShowCreateModal(false)}
            onSuccess={async () => {
              setShowCreateModal(false)
              await refreshLinks()
              fetchDashboardStats()
            }}
          />
        )}
        
        {showEditModal && editingLink && (
          <>
            <EditLinkModal
              isOpen={showEditModal}
              editingLink={editingLink}
              onClose={() => {
                setShowEditModal(false)
                setEditingLink(null)
                setLiveEditingLink(null)
              }}
              onSuccess={async () => {
                setShowEditModal(false)
                setEditingLink(null)
                setLiveEditingLink(null)
                await refreshLinks()
                fetchDashboardStats()
              }}
              onLiveUpdate={(linkData) => {
                setLiveEditingLink({ ...linkData } as LinkType)
                if (updateLinkInPreview) updateLinkInPreview(linkData)
              }}
            />
            
            {!editingLink?.isDirect && (
              <div className="hidden xl:block">
                <EditPhonePreview
                  isVisible={showEditModal}
                  user={userProfile ? {
                    name: userProfile.name,
                    username: userProfile.username,
                    image: userProfile.image,
                    bio: userProfile.bio
                  } : {
                    name: 'Chargement...',
                    username: 'user',
                    image: null,
                    bio: ''
                  }}
                  links={liveEditingLink ? [liveEditingLink] : []}
                />
              </div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}