'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Share2, Lock, Unlock, Edit3, Trash2, Eye, Clock,
  Shield, AlertCircle, CheckCircle, UserCheck, UserX, Crown,
  Zap, Star, Copy, ExternalLink, BarChart
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface TeamLink {
  id: string
  slug: string
  title: string
  description?: string
  teamShared: boolean
  clicks: number
  views: number
  createdAt: string
  updatedAt: string
  lastModifiedBy?: string
  user: {
    id: string
    name?: string
    email: string
    image?: string
  }
  originalOwner?: {
    id: string
    name?: string
    email: string
  }
  lastModifier?: {
    id: string
    name?: string
    email: string
  }
  multiLinks?: any[]
}

interface TeamLinkManagerProps {
  userRole?: string
  userId?: string
  teamId?: string
}

export default function TeamLinkManager({ userRole, userId, teamId }: TeamLinkManagerProps) {
  const [teamLinks, setTeamLinks] = useState<TeamLink[]>([])
  const [userLinks, setUserLinks] = useState<TeamLink[]>([])
  const [loading, setLoading] = useState(false) // Commencer à false pour affichage immédiat
  const [selectedLink, setSelectedLink] = useState<TeamLink | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'mine' | 'team'>('all')

  // Charger les liens
  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      setLoading(true)

      // ⚡ Charger les deux APIs en parallèle
      const [teamResponse, userResponse] = await Promise.all([
        fetch('/api/team/sync-links'),
        fetch('/api/links/fast') // Utiliser l'API rapide au lieu de /api/links
      ])

      // 🔍 DEBUG
      console.log('🔍 TeamLinkManager - Réponses API:')
      console.log('  Team API status:', teamResponse.status, teamResponse.ok ? '✅' : '❌')
      console.log('  User API status:', userResponse.status, userResponse.ok ? '✅' : '❌')

      // Traiter les liens d'équipe
      if (teamResponse.ok) {
        const teamData = await teamResponse.json()
        console.log('  Team data:', teamData)
        console.log('  Team links count:', teamData.links?.length || 0)
        setTeamLinks(teamData.links || [])
      } else {
        const errorData = await teamResponse.json().catch(() => ({ error: 'Unknown' }))
        console.log('  ❌ Team API error:', errorData)
        setTeamLinks([])
      }

      // Traiter les liens personnels
      if (userResponse.ok) {
        const userData = await userResponse.json()
        const links = userData.links || []
        console.log('  User links count:', links.length)
        console.log('  User links (non-shared):', links.filter((link: any) => !link.teamShared).length)
        setUserLinks(links.filter((link: any) => !link.teamShared))
      } else {
        const errorData = await userResponse.json().catch(() => ({ error: 'Unknown' }))
        console.log('  ❌ User API error:', errorData)
        setUserLinks([])
      }
    } catch (error) {
      console.error('Erreur chargement liens:', error)
      toast.error('Erreur lors du chargement des liens')
    } finally {
      setLoading(false)
    }
  }

  const shareLink = async (linkId: string) => {
    try {
      const response = await fetch('/api/team/sync-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId })
      })

      if (response.ok) {
        toast.success('Lien partagé avec l\'équipe')
        fetchLinks()
        setShowShareModal(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du partage')
      }
    } catch (error) {
      toast.error('Erreur lors du partage du lien')
    }
  }

  const unshareLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/team/sync-links?linkId=${linkId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Lien retiré du partage')
        fetchLinks()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du retrait')
      }
    } catch (error) {
      toast.error('Erreur lors du retrait du partage')
    }
  }

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://taplinkr.com/${slug}`)
    toast.success('Lien copié!')
  }

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />
      case 'editor':
        return <Edit3 className="w-4 h-4 text-green-500" />
      default:
        return <Eye className="w-4 h-4 text-gray-500" />
    }
  }

  const canEdit = userRole === 'owner' || userRole === 'admin' || userRole === 'editor'
  const canShare = userRole === 'owner' || userRole === 'admin' || userRole === 'editor'
  const canDelete = userRole === 'owner' || userRole === 'admin'

  const filteredLinks = filter === 'mine'
    ? userLinks
    : filter === 'team'
    ? teamLinks
    : [...teamLinks, ...userLinks]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 dark:bg-gray-900">
      {/* Header avec filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">Liens d'équipe</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Gérez et partagez vos liens</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Tous ({filteredLinks.length})
            </button>
            <button
              onClick={() => setFilter('mine')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'mine'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Mes liens ({userLinks.length})
            </button>
            <button
              onClick={() => setFilter('team')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                filter === 'team'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Équipe ({teamLinks.length})
            </button>
          </div>
        </div>

        {/* Indicateur de rôle */}
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            {getRoleIcon(userRole)}
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              Votre rôle: <span className="font-medium capitalize">{userRole || 'Viewer'}</span>
            </span>
          </div>
          {canShare && (
            <span className="text-xs text-gray-500 dark:text-gray-400 sm:ml-auto">
              Vous pouvez partager et modifier les liens
            </span>
          )}
        </div>
      </div>

      {/* Liste des liens */}
      <div className="grid gap-3 sm:gap-4">
        <AnimatePresence>
          {filteredLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Avatar du propriétaire */}
                  <div className="relative flex-shrink-0">
                    {link.user?.image ? (
                      <img
                        src={link.user.image}
                        alt={link.user?.name || link.user?.email || ''}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                        {(link.user?.name || link.user?.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    {link.teamShared && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Share2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">{link.title}</h3>
                      {link.teamShared && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full whitespace-nowrap">
                          Partagé
                        </span>
                      )}
                    </div>

                    {link.description && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{link.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{link.user?.name || link.user?.email || 'Utilisateur'}</span>
                      </span>
                      {link.lastModifier && link.lastModifier.id !== link.user?.id && (
                        <span className="flex items-center gap-1">
                          <Edit3 className="w-3 h-3 flex-shrink-0" />
                          <span className="hidden sm:inline">Modifié par</span>
                          <span className="truncate max-w-[100px]">{link.lastModifier.name || link.lastModifier.email}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        {new Date(link.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Statistiques */}
                    <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{link.views}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <BarChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{link.clicks}</span>
                      </div>
                      {link.multiLinks && link.multiLinks.length > 0 && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{link.multiLinks.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => copyLink(link.slug)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title="Copier le lien"
                  >
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <Link
                    href={`/${link.slug}`}
                    target="_blank"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title="Ouvrir le lien"
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>

                  {!link.teamShared && (
                    <button
                      onClick={() => shareLink(link.id)}
                      className="p-2 sm:p-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 rounded-lg transition-all shadow-lg"
                      title="Partager avec l'équipe"
                    >
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}

                  {link.teamShared && (
                    <button
                      onClick={() => unshareLink(link.id)}
                      className="p-2 sm:p-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 rounded-lg transition-all shadow-lg"
                      title="Retirer du partage"
                    >
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}

                  {canEdit && (
                    <Link
                      href={`/dashboard/links/${link.id}/edit`}
                      className="p-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredLinks.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'team'
                ? 'Aucun lien partagé avec l\'équipe'
                : filter === 'mine'
                ? 'Vous n\'avez pas encore de liens personnels'
                : 'Aucun lien disponible'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}