'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  Link2, 
  Plus, 
  Search,
  Filter,
  ChevronLeft,
  Folder,
  FolderPlus,
  Eye,
  MousePointer,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Shield,
  Zap,
  Layers,
  X
} from 'lucide-react'
import Link from 'next/link'
import CreateLinkModal from '@/components/CreateLinkModal'
import EditLinkModal from '@/components/EditLinkModal'
import { useLinks } from '@/contexts/LinksContext'
import { Link as LinkType } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'react-hot-toast'

export default function LinksPage() {
  const { data: session } = useSession()
  const { links, loading, refreshLinks } = useLinks()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'clicks' | 'name'>('recent')

  // Filtrer et trier les liens
  const filteredLinks = links
    .filter(link => {
      const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          link.slug.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'all' || 
                          (filterType === 'active' && link.isActive) ||
                          (filterType === 'inactive' && !link.isActive)
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'clicks':
          return (b.clicks || 0) - (a.clicks || 0)
        case 'name':
          return a.title.localeCompare(b.title)
        default: // recent
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

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
    setShowEditModal(true)
  }

  const handleDelete = async (linkId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) return
    
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

  const handleCopyLink = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
      toast.success('Lien copié !')
    } catch (error) {
      toast.error('Erreur lors de la copie')
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
                Mes liens
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez tous vos liens en un seul endroit
              </p>
            </div>
            
            {/* Create Button */}
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau lien</span>
            </motion.button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un lien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
                {(['all', 'active', 'inactive'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterType(filter)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      filterType === filter
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {filter === 'all' ? 'Tous' : filter === 'active' ? 'Actifs' : 'Inactifs'}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="recent">Plus récents</option>
                <option value="clicks">Plus cliqués</option>
                <option value="name">Nom (A-Z)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{links.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total liens</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {links.filter(l => l.isActive).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Liens actifs</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <MousePointer className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {links.reduce((total, link) => total + (link.clicks || 0), 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total clics</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Links Grid */}
        {filteredLinks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredLinks.map((link, index) => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                {/* Status indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-3 h-3 rounded-full ${
                    link.isActive 
                      ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse' 
                      : 'bg-gray-400'
                  }`} />
                  
                  {/* More menu */}
                  <div className="relative group">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => handleEdit(link)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleCopyLink(link.slug)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copier le lien
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Link info */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Icon/Image */}
                  <div className="flex-shrink-0">
                    {link.coverImage ? (
                      <img
                        src={link.coverImage}
                        alt={link.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : link.icon ? (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-xl">{link.icon}</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Link2 className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Title and URL */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      taplinkr.com/{link.slug}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MousePointer className="w-4 h-4" />
                      {link.clicks || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(link.createdAt), 'dd MMM', { locale: fr })}
                    </span>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    {link.isDirect && (
                      <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    )}
                    {link.shieldEnabled && (
                      <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                    {!link.isDirect && link.multiLinks && link.multiLinks.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs">{link.multiLinks.length}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(link.id, !link.isActive)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      link.isActive
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {link.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <a
                    href={`/${link.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center"
          >
            <Link2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm || filterType !== 'all' ? 'Aucun lien trouvé' : 'Aucun lien créé'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre premier lien'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Créer un lien
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreateLinkModal
        isOpen={showCreateModal}
        editingLink={null}
        onClose={() => setShowCreateModal(false)}
        onSuccess={async () => {
          setShowCreateModal(false)
          await refreshLinks()
        }}
      />
      
      {editingLink && (
        <EditLinkModal
          isOpen={showEditModal}
          editingLink={editingLink}
          onClose={() => {
            setShowEditModal(false)
            setEditingLink(null)
          }}
          onSuccess={async () => {
            setShowEditModal(false)
            setEditingLink(null)
            await refreshLinks()
          }}
          onLiveUpdate={() => {}}
        />
      )}
    </div>
  )
}