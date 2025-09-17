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
  const [loading, setLoading] = useState(true)
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

      // Charger les liens de l'équipe
      const teamResponse = await fetch('/api/team/sync-links')
      if (teamResponse.ok) {
        const teamData = await teamResponse.json()
        setTeamLinks(teamData.links || [])
      } else {
        setTeamLinks([])
      }

      // Charger les liens personnels de l'utilisateur
      const userResponse = await fetch('/api/links')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        // Vérifier que userData.links existe avant de filtrer
        if (userData.links && Array.isArray(userData.links)) {
          setUserLinks(userData.links.filter((link: any) => !link.teamShared))
        } else {
          setUserLinks([])
        }
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
    <div className="space-y-6">
      {/* Header avec filtres */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Liens d'équipe</h2>
              <p className="text-sm text-gray-600">Gérez et partagez vos liens avec l'équipe</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tous ({filteredLinks.length})
            </button>
            <button
              onClick={() => setFilter('mine')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'mine'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Mes liens ({userLinks.length})
            </button>
            <button
              onClick={() => setFilter('team')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'team'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Équipe ({teamLinks.length})
            </button>
          </div>
        </div>

        {/* Indicateur de rôle */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
          {getRoleIcon(userRole)}
          <span className="text-sm text-gray-700">
            Votre rôle: <span className="font-medium capitalize">{userRole || 'Viewer'}</span>
          </span>
          {canShare && (
            <span className="ml-auto text-xs text-gray-500">
              Vous pouvez partager et modifier les liens
            </span>
          )}
        </div>
      </div>

      {/* Liste des liens */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredLinks.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {/* Avatar du propriétaire */}
                    <div className="relative">
                      {link.user.image ? (
                        <img
                          src={link.user.image}
                          alt={link.user.name || link.user.email}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {(link.user.name || link.user.email)[0].toUpperCase()}
                        </div>
                      )}
                      {link.teamShared && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <Share2 className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{link.title}</h3>
                        {link.teamShared && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Partagé
                          </span>
                        )}
                      </div>

                      {link.description && (
                        <p className="text-sm text-gray-600 mb-2">{link.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          {link.user.name || link.user.email}
                        </span>
                        {link.lastModifier && link.lastModifier.id !== link.user.id && (
                          <span className="flex items-center gap-1">
                            <Edit3 className="w-3 h-3" />
                            Modifié par {link.lastModifier.name || link.lastModifier.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(link.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Statistiques */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span>{link.views} vues</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <BarChart className="w-4 h-4" />
                          <span>{link.clicks} clics</span>
                        </div>
                        {link.multiLinks && link.multiLinks.length > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Zap className="w-4 h-4" />
                            <span>{link.multiLinks.length} liens</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => copyLink(link.slug)}
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Copier le lien"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/${link.slug}`}
                    target="_blank"
                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Ouvrir le lien"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {canShare && !link.teamShared && link.user.id === userId && (
                    <button
                      onClick={() => shareLink(link.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Partager avec l'équipe"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  )}

                  {canShare && link.teamShared && (link.user.id === userId || link.originalOwner?.id === userId) && (
                    <button
                      onClick={() => unshareLink(link.id)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Retirer du partage"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}

                  {canEdit && (
                    <Link
                      href={`/dashboard/links/${link.id}/edit`}
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit3 className="w-4 h-4" />
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