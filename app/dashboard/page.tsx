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
  Gift
} from 'lucide-react'
import CreateLinkModal from '@/components/CreateLinkModal'
import Link from 'next/link'
import EditLinkModal from '@/components/EditLinkModal'
import EditPhonePreview from '@/components/EditPhonePreview'
import { useLinkUpdate } from '@/contexts/LinkUpdateContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useLinks } from '@/contexts/LinksContext'
import { Link as LinkType } from '@/types'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts'
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

  useEffect(() => {
    if (status === 'authenticated') {
      refreshLinks()
      fetchDashboardStats()
    }
  }, [status])

  const links = contextLinks

  const fetchDashboardStats = async () => {
    try {
      setAnalyticsLoading(true)
      const data = await fetchAnalyticsData()
      setDashboardStats(data)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setAnalyticsLoading(false)
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
        {!analyticsLoading && dashboardStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Carte des statistiques */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Vue d'ensemble
                </h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">7 derniers jours</option>
                  <option value="30">30 derniers jours</option>
                  <option value="90">90 derniers jours</option>
                </select>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <MousePointer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {dashboardStats.growthRate > 0 ? '+' : ''}{dashboardStats.growthRate || 0}%
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {dashboardStats.totalClicks || 0}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Total clics</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <ArrowUpRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {dashboardStats.totalViews || 0}
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Total vues</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {dashboardStats.uniqueVisitors || 0}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">Visiteurs uniques</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {links.filter(l => l.isActive).length}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Liens actifs</p>
                </div>
              </div>

              {/* Graphique */}
              {dashboardStats.summary && dashboardStats.summary.length > 0 && (
                <div className="h-64">
                  <AnalyticsCharts data={dashboardStats} />
                </div>
              )}
            </div>

            {/* Top liens performants */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Top liens 🏆
                </h2>
                <Link href="/dashboard/analytics">
                  <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    Voir tout
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>

              {dashboardStats.topLinks && dashboardStats.topLinks.length > 0 ? (
                <div className="space-y-3">
                  {dashboardStats.topLinks.slice(0, 5).map((link: any, index: number) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => handleEdit(link)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                          'bg-gradient-to-br from-blue-400 to-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {link.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            /{link.slug}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          {link._count?.analyticsEvents || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">clics</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune donnée disponible</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Insights et recommandations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Statistiques détaillées */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Insights 📊
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Globe className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Portée globale
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visiteurs de {dashboardStats?.topCountries?.length || 0} pays
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Mobile first
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dashboardStats?.deviceStats?.mobile || 0}% sur mobile
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock className="w-10 h-10 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Meilleure heure
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dashboardStats?.peakHour || '18h-20h'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommandations */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4">
              Recommandations ✨
            </h2>
            <div className="space-y-3">
              {userProfile?.plan === 'free' && (
                <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                  <Crown className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Passez à Premium</p>
                    <p className="text-sm opacity-90">
                      Débloquez les analytics avancées et créez des liens illimités
                    </p>
                  </div>
                </div>
              )}
              
              {links.length < 3 && (
                <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                  <Link2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Ajoutez plus de liens</p>
                    <p className="text-sm opacity-90">
                      Créez au moins 5 liens pour maximiser votre présence
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                <Gift className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Code promo disponible</p>
                  <p className="text-sm opacity-90">
                    Utilisez WELCOME50 pour 50% de réduction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Liens récents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Liens récents
            </h2>
            <Link href="/dashboard/links">
              <span className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                Gérer tous les liens
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {links.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.slice(0, 6).map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleEdit(link)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        /{link.slug}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      link.isActive 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {link.isActive ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <MousePointer className="w-4 h-4" />
                        {link.clicks || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {link.views || 0}
                      </span>
                    </div>
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Link2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Vous n'avez pas encore de liens
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Créer votre premier lien
              </button>
            </div>
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