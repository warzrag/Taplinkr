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
// Lazy load des modales pour améliorer le temps de chargement initial
import dynamic from 'next/dynamic'
import FastLink from '@/components/FastLink'
const CreateLinkModal = dynamic(() => import('@/components/CreateLinkModal'), {
  loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" /></div>,
  ssr: false
})
import { useLinkUpdate } from '@/contexts/LinkUpdateContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useLinks } from '@/contexts/LinksContext'
import { Link as LinkType } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'

// Lazy load des composants analytics lourds
const DashboardChart = dynamic(() => import('@/components/analytics/DashboardChart'), {
  loading: () => <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />,
  ssr: false
})
const InteractiveWorldMap = dynamic(() => import('@/components/analytics/InteractiveWorldMap'), {
  loading: () => <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />,
  ssr: false
})
const CountryBarsChart = dynamic(() => import('@/components/analytics/CountryBarsChart'), {
  loading: () => <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />,
  ssr: false
})

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
  const { requireLimit } = usePermissions()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [dashboardStats, setDashboardStats] = useState<any>({
    totalLinks: 0,
    totalClicks: 0,
    totalViews: 0,
    uniqueVisitors: 0,
    topLinks: [],
    topCountries: [],
    summary: []
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [folderStatsLoading, setFolderStatsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7')
  const [folderStats, setFolderStats] = useState<any>({
    totalFolders: 0,
    organizedLinks: 0,
    topFolders: []
  })
  const [teamLeaderboard, setTeamLeaderboard] = useState<any>(null)
  const [teamLoading, setTeamLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      // ⚡ INSTANT: Charger depuis le cache localStorage d'abord
      const cachedDashboard = localStorage.getItem('dashboard-stats')
      const cachedFolders = localStorage.getItem('folder-stats')
      const cachedTeam = localStorage.getItem('team-leaderboard-stats')

      // 🔥 STALE-WHILE-REVALIDATE: Toujours afficher le cache si disponible
      if (cachedDashboard) {
        try {
          const cached = JSON.parse(cachedDashboard)
          setDashboardStats(cached.data)
          setAnalyticsLoading(false)

          // Log si le cache est vieux (> 30 min)
          const cacheAge = Date.now() - cached.timestamp
          if (cacheAge > 1800000) {
            console.log('⚠️ Cache dashboard ancien:', Math.floor(cacheAge / 60000), 'minutes')
          }
        } catch (err) {
          console.error('Erreur parsing cache dashboard:', err)
          localStorage.removeItem('dashboard-stats')
        }
      }

      if (cachedFolders) {
        try {
          const cached = JSON.parse(cachedFolders)
          setFolderStats(cached.data)
          setFolderStatsLoading(false)

          const cacheAge = Date.now() - cached.timestamp
          if (cacheAge > 1800000) {
            console.log('⚠️ Cache folders ancien:', Math.floor(cacheAge / 60000), 'minutes')
          }
        } catch (err) {
          console.error('Erreur parsing cache folders:', err)
          localStorage.removeItem('folder-stats')
        }
      }

      if (cachedTeam) {
        try {
          const cached = JSON.parse(cachedTeam)
          setTeamLeaderboard(cached.data)
          setTeamLoading(false)

          const cacheAge = Date.now() - cached.timestamp
          if (cacheAge > 1800000) {
            console.log('⚠️ Cache team ancien:', Math.floor(cacheAge / 60000), 'minutes')
          }
        } catch (err) {
          console.error('Erreur parsing cache team:', err)
          localStorage.removeItem('team-leaderboard-stats')
        }
      }

      // Charger les vraies données en arrière-plan (toujours)
      Promise.all([
        fetchDashboardStats(),
        fetchFolderStats(),
        fetchTeamLeaderboard()
      ]).catch(err => console.error('Erreur chargement dashboard:', err))
    }
  }, [status])

  const links = contextLinks

  const fetchDashboardStats = async () => {
    try {
      // Ne pas afficher le loading si on a déjà du cache
      const hasCache = localStorage.getItem('dashboard-stats')
      if (!hasCache) {
        setAnalyticsLoading(true)
      }

      const response = await fetch('/api/analytics/dashboard-all')
      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data)

        // ⚡ Sauvegarder dans le cache
        localStorage.setItem('dashboard-stats', JSON.stringify({
          data,
          timestamp: Date.now()
        }))
      } else {
        console.error('Erreur API dashboard-all:', response.status)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchFolderStats = async () => {
    try {
      const hasCache = localStorage.getItem('folder-stats')
      if (!hasCache) {
        setFolderStatsLoading(true)
      }

      const response = await fetch('/api/analytics/folders-simple')
      if (response.ok) {
        const data = await response.json()
        setFolderStats(data)

        // ⚡ Sauvegarder dans le cache
        localStorage.setItem('folder-stats', JSON.stringify({
          data,
          timestamp: Date.now()
        }))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats dossiers:', error)
    } finally {
      setFolderStatsLoading(false)
    }
  }

  const fetchTeamLeaderboard = async () => {
    try {
      const hasCache = localStorage.getItem('team-leaderboard-stats')
      if (!hasCache) {
        setTeamLoading(true)
      }

      const response = await fetch('/api/team/leaderboard?period=all', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTeamLeaderboard(data)

        // ⚡ Sauvegarder dans le cache
        localStorage.setItem('team-leaderboard-stats', JSON.stringify({
          data,
          timestamp: Date.now()
        }))
      } else if (response.status === 400) {
        // L'utilisateur n'a pas d'équipe
        setTeamLeaderboard(null)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du leaderboard:', error)
      setTeamLeaderboard(null)
    } finally {
      setTeamLoading(false)
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
    // Rediriger vers la page Links pour éditer
    router.push('/dashboard/links')
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

  const handleCreateClick = () => {
    // Vérifier si l'utilisateur peut créer un nouveau lien
    const linkCount = links.length
    if (requireLimit('maxLinksPerPage', linkCount)) {
      setShowCreateModal(true)
    }
    // Si la limite est atteinte, requireLimit affichera automatiquement un message
    // et redirigera vers la page de pricing
  }

  const quickActions: QuickAction[] = [
    {
      label: 'Créer un lien',
      icon: Plus,
      onClick: handleCreateClick,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Publier une nouvelle page'
    },
    {
      label: 'Analytics',
      icon: Activity,
      href: '/dashboard/visitors',
      gradient: 'from-purple-500 to-pink-500',
      description: 'Comprendre les performances'
    },
    {
      label: 'Mes liens',
      icon: Link2,
      href: '/dashboard/links',
      gradient: 'from-emerald-500 to-teal-500',
      description: 'Gérer les URLs publiques'
    },
    {
      label: userProfile?.plan === 'free' ? 'Passer Pro' : 'Abonnement',
      icon: userProfile?.plan === 'free' ? Crown : Zap,
      href: '/dashboard/billing',
      gradient: userProfile?.plan === 'free' ? 'from-yellow-500 to-orange-500' : 'from-gray-500 to-gray-600',
      description: userProfile?.plan === 'free' ? 'Activer les options avancées' : 'Gérer votre abonnement'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Header amélioré */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">
                Bonjour, {userProfile?.name || session?.user?.email?.split('@')[0]}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            {/* Actions rapides admin */}
            {((session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'manager') && (
              <motion.button
                onClick={() => router.push('/admin/users')}
                className="border border-gray-200 bg-white px-5 py-2.5 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl font-semibold flex items-center gap-2 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {action.href ? (
                <FastLink href={action.href} prefetch={true}>
                  <div className="relative h-full bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 cursor-pointer group border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon container minimal */}
                      <div className="inline-flex p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-700 mb-2 sm:mb-3 group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors duration-200">
                        <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                      </div>

                      {/* Text content */}
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1">
                        {action.label}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {action.description}
                      </p>
                      
                      {/* Special badges */}
                      {action.label.includes('Pro') && userProfile?.plan === 'free' && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium px-2 py-0.5 rounded">
                            PRO
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </FastLink>
              ) : (
                <button
                  onClick={action.onClick}
                  className="relative h-full bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 cursor-pointer group border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 w-full text-left"
                >
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon container minimal */}
                    <div className="inline-flex p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-700 mb-2 sm:mb-3 group-hover:bg-gray-100 dark:group-hover:bg-gray-600 transition-colors duration-200">
                      <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" strokeWidth={2} />
                    </div>

                    {/* Text content */}
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1">
                      {action.label}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Statistiques principales */}
        <div className="mb-6 sm:mb-8">
          {/* Cartes de statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-brand-500/15 rounded-lg sm:rounded-xl">
                  <MousePointer className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" />
                </div>
                {dashboardStats?.growthRate !== undefined && (
                  <span className={`text-xs sm:text-sm font-medium ${
                    dashboardStats.growthRate > 0
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}>
                    {dashboardStats.growthRate > 0 ? '+' : ''}{dashboardStats.growthRate}%
                  </span>
                )}
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {dashboardStats?.totalClicks || 0}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Total clics</p>
            </motion.div>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-emerald-500/15 rounded-lg sm:rounded-xl">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {dashboardStats?.uniqueVisitors || 0}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Visiteurs uniques</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-amber-500/15 rounded-lg sm:rounded-xl">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {links.filter(l => l.isActive).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Liens actifs</p>
            </motion.div>
          </div>

          {/* Carte du monde interactive - Pleine largeur */}
          {!analyticsLoading && dashboardStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 mb-6 sm:mb-8"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
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
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Évolution sur 7 jours
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-brand-500/100 rounded-full" />
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
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Top liens
              </h2>
              <FastLink href="/dashboard/visitors" prefetch={true}>
                <span className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                  Voir tout
                  <ChevronRight className="w-4 h-4" />
                </span>
              </FastLink>
            </div>

            {dashboardStats?.topLinks && dashboardStats.topLinks.length > 0 ? (
              <div className="space-y-3">
                {dashboardStats.topLinks.slice(0, 5).map((link: any, index: number) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:bg-gray-700 transition-all cursor-pointer group"
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
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-brand-600 transition-colors">
                          {link.internalName || link.title}
                        </p>
                        {link.internalName && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                            ({link.title})
                          </p>
                        )}
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

          {/* Performance de l'équipe */}
          {teamLeaderboard && teamLeaderboard.leaderboard && Array.isArray(teamLeaderboard.leaderboard) && teamLeaderboard.leaderboard.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.625 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Performance de l'équipe
                </h2>
                <FastLink href="/dashboard/team-leaderboard" prefetch={true}>
                  <span className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                    Voir détails
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </FastLink>
              </div>

              {teamLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto" />
                </div>
              ) : (
                <div className="space-y-3">
                  {teamLeaderboard.leaderboard.slice(0, 5).map((member: any, index: number) => (
                    <motion.div
                      key={member.user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.625 + index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                          'bg-gradient-to-br from-blue-400 to-indigo-500'
                        }`}>
                          {((member.user as any).nickname || member.user.name || member.user.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {(member.user as any).nickname || member.user.name || member.user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {member.stats.totalLinks} {member.stats.totalLinks > 1 ? 'liens assignés' : 'lien assigné'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {member.stats.totalClicks}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">clics</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Analyse des dossiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Analyse dossiers
              </h2>
              <FastLink href="/dashboard/folders" prefetch={true}>
                <span className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                  Gérer
                  <ChevronRight className="w-4 h-4" />
                </span>
              </FastLink>
            </div>

            {folderStats ? (
              <div className="space-y-4">
                {/* Stats globales des dossiers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Folder className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">Total dossiers</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {folderStats.totalFolders || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Link2 className="w-4 h-4 text-secondary-600" />
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
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:bg-gray-700 transition-all"
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
                    <FastLink href="/dashboard/folders" prefetch={true}>
                      <button className="mt-2 text-xs text-brand-600 hover:underline">
                        Créer un dossier
                      </button>
                    </FastLink>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-gray-50/80 dark:bg-gray-700/80 rounded-xl"></div>
                <div className="h-16 bg-gray-50/80 dark:bg-gray-700/80 rounded-xl"></div>
                <div className="h-16 bg-gray-50/80 dark:bg-gray-700/80 rounded-xl"></div>
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Insights
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-brand-500/10 rounded-xl">
                  <Globe className="w-10 h-10 text-brand-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Portée globale
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dashboardStats?.topCountries?.length || 0} pays atteints
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-secondary/10 rounded-xl">
                  <Smartphone className="w-10 h-10 text-secondary-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Mobile first
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dashboardStats?.deviceStats?.mobile || 65}% mobile
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-emerald-500/10 rounded-xl">
                  <Clock className="w-10 h-10 text-emerald-600 flex-shrink-0" />
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
            <div className="rounded-2xl border border-gray-200 bg-gray-900 p-6 text-white shadow-sm dark:border-gray-700">
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
            <FastLink href="/dashboard/links" prefetch={true}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-brand-500 transition-all group"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-600">
                  Gérer tous les liens
                </span>
                <ArrowUpRight className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-brand-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </motion.button>
            </FastLink>
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
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                  >
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Statut */}
                    <div className="absolute top-4 right-4">
                      <div className={`w-3 h-3 rounded-full ${
                        link.isActive 
                          ? 'bg-emerald-500/100 shadow-lg shadow-green-500/50' 
                          : 'bg-foreground/30'
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
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                              <Link2 className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Titre et URL */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-brand-600 transition-colors">
                            {link.internalName || link.title}
                          </h3>
                          {link.internalName && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-1">
                              ({link.title})
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <Link2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              taplinkr.com/{link.slug}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Statistiques */}
                      <div className="bg-white dark:bg-gray-800/80 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MousePointer className="w-4 h-4 text-brand-600" />
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
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Zap className="w-3.5 h-3.5 text-secondary-600" />
                              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Direct</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                              <Layers className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                {link.multiLinks?.length || 0} liens
                              </span>
                            </div>
                          )}
                          {link.shieldEnabled && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-lg">
                              <Shield className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Shield</span>
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
                              ? 'bg-emerald-500/15 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/15'
                              : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50/80 dark:bg-gray-700/80'
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
                  className="bg-gradient-to-r from-brand-500/10 to-brand-500/5 rounded-2xl p-6 border border-brand-500/20"
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
              className="bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-12 text-center"
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
        
      </AnimatePresence>
    </div>
  )
}
