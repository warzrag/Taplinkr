'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Link2, 
  Plus, 
  Search,
  Filter,
  ChevronLeft,
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
  QrCode,
  BarChart3,
  Grid3X3,
  List,
  ChevronDown,
  Clock,
  TrendingUp,
  Globe,
  Sparkles,
  Palette,
  Lock,
  Unlock,
  Image as ImageIcon,
  X
} from 'lucide-react'
import Link from 'next/link'
import CreateLinkModal from '@/components/CreateLinkModal'
import EditLinkModal from '@/components/EditLinkModal'
import TeamLinksSection from '@/components/TeamLinksSection'
import { useLinks } from '@/contexts/LinksContext'
import { Link as LinkType } from '@/types'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import { usePermissions } from '@/hooks/usePermissions'

export default function LinksPage() {
  const { data: session } = useSession()
  const { personalLinks, teamLinks, hasTeam, loading, refreshLinks } = useLinks()
  const { requireLimit } = usePermissions()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'clicks' | 'name'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedLinks, setSelectedLinks] = useState<string[]>([])
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null)

  // Filtrer et trier les liens personnels
  const filteredLinks = personalLinks
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

  const handleCreateClick = () => {
    // Vérifier si l'utilisateur peut créer un nouveau lien
    const linkCount = personalLinks.length
    if (requireLimit('maxLinksPerPage', linkCount)) {
      setShowCreateModal(true)
    }
    // Si la limite est atteinte, requireLimit affichera automatiquement un message
    // et redirigera vers la page de pricing
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedLinks.length === 0) return

    switch (action) {
      case 'delete':
        if (!confirm(`Supprimer ${selectedLinks.length} liens ?`)) return
        // Implémenter la suppression en masse
        break
      case 'activate':
      case 'deactivate':
        // Implémenter l'activation/désactivation en masse
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-foreground/60">Chargement des liens...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.14),_transparent_55%)] bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-500/12 via-transparent to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 lg:px-8 lg:py-12">
        {/* Header moderne */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-muted))] rounded-xl shadow-sm transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Mes liens
                </h1>
                <p className="text-foreground/60 mt-1">
                  {personalLinks.length} {personalLinks.length > 1 ? 'liens personnels' : 'lien personnel'}
                  {teamLinks.length > 0 && ` • ${teamLinks.length} ${teamLinks.length > 1 ? 'liens d\'équipe' : 'lien d\'équipe'}`}
                </p>
              </div>
            </div>
            
            {/* Actions principales */}
            <div className="flex items-center gap-3">
              {selectedLinks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 mr-4"
                >
                  <span className="text-sm text-foreground/60">
                    {selectedLinks.length} sélectionné{selectedLinks.length > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="p-2 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                  >
                    <Unlock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="p-2 text-amber-600 hover:bg-amber-500/10 rounded-lg transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="p-2 text-red-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              
              <motion.button
                onClick={handleCreateClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-medium shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un lien</span>
              </motion.button>
            </div>
          </div>

          {/* Barre de recherche et filtres modernes */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche améliorée */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-foreground/45" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par nom, slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[hsl(var(--surface))] border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/45 hover:text-foreground/60"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filtres et vues */}
            <div className="flex items-center gap-3">
              {/* Filtre par statut */}
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-3 bg-[hsl(var(--surface))] border border-border/60 rounded-xl hover:bg-[hsl(var(--surface-muted))] transition-colors">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {filterType === 'all' ? 'Tous' : filterType === 'active' ? 'Actifs' : 'Inactifs'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Tri */}
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-3 bg-[hsl(var(--surface))] border border-border/60 rounded-xl hover:bg-[hsl(var(--surface-muted))] transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {sortBy === 'recent' ? 'Récents' : sortBy === 'clicks' ? 'Populaires' : 'A-Z'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Vue */}
              <div className="flex items-center bg-[hsl(var(--surface))] border border-border/60 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-brand-600 text-white' 
                      : 'text-foreground/60 hover:bg-[hsl(var(--surface-muted))]'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-brand-600 text-white' 
                      : 'text-foreground/60 hover:bg-[hsl(var(--surface-muted))]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[hsl(var(--surface))] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-brand-500/15 rounded-xl">
                <Link2 className="w-6 h-6 text-brand-600" />
              </div>
              <span className="text-xs text-foreground/55">Total</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{personalLinks.length + teamLinks.length}</p>
            <p className="text-sm text-foreground/60 mt-1">Total des liens</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[hsl(var(--surface))] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-emerald-500/15 rounded-xl">
                <Eye className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs text-foreground/55">Actifs</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {personalLinks.filter(l => l.isActive).length}
            </p>
            <p className="text-sm text-foreground/60 mt-1">Liens actifs</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[hsl(var(--surface))] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-[hsl(var(--secondary))]/15 rounded-xl">
                <MousePointer className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-foreground/55">Clics</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {[...personalLinks, ...teamLinks].reduce((total, link) => total + (link.clicks || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-foreground/60 mt-1">Total des clics</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[hsl(var(--surface))] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs text-foreground/55">CTR</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {personalLinks.length > 0 ? Math.round((personalLinks.reduce((total, link) => total + (link.clicks || 0), 0) / personalLinks.length)) : 0}
            </p>
            <p className="text-sm text-foreground/60 mt-1">Clics moyens</p>
          </motion.div>
        </div>

        {/* Section des liens d'équipe */}
        {teamLinks.length > 0 && (
          <TeamLinksSection links={teamLinks} viewMode={viewMode} />
        )}

        {/* Liste des liens personnels */}
        {personalLinks.length > 0 && (
          <div className="mb-8">
            {/* Header de section pour les liens personnels */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                <Link2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Mes liens personnels
                </h3>
                <p className="text-sm text-foreground/60">
                  {personalLinks.length} lien{personalLinks.length > 1 ? 's' : ''} créé{personalLinks.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {filteredLinks.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredLinks.map((link, index) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <div className="bg-[hsl(var(--surface))] rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-500/40">
                    {/* En-tête de la carte */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Image ou icône */}
                        {link.coverImage ? (
                          <img
                            src={link.coverImage}
                            alt={link.title}
                            className="w-14 h-14 rounded-xl object-cover shadow-sm"
                          />
                        ) : link.icon ? (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
                            <span className="text-2xl">{link.icon}</span>
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <Link2 className="w-7 h-7 text-foreground/55" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                            {link.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              link.isActive 
                                ? 'bg-green-100 text-green-700 
                                : 'bg-[hsl(var(--surface-muted))] text-foreground/70
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                link.isActive ? 'bg-green-500 animate-pulse' : 'bg-[hsl(var(--surface-muted))]/800'
                              }`} />
                              {link.isActive ? 'En ligne' : 'Hors ligne'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu actions */}
                      <div className="relative">
                        <button
                          onClick={() => setShowMoreMenu(showMoreMenu === link.id ? null : link.id)}
                          className="p-2 hover:bg-[hsl(var(--surface-muted))] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-5 h-5 text-foreground/55" />
                        </button>
                        
                        <AnimatePresence>
                          {showMoreMenu === link.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-52 bg-[hsl(var(--surface))] rounded-xl shadow-2xl border border-gray-100 py-2 z-20"
                            >
                              <button
                                onClick={() => {
                                  handleEdit(link)
                                  setShowMoreMenu(null)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-foreground/70 hover:bg-[hsl(var(--surface-muted))] flex items-center gap-3"
                              >
                                <Edit className="w-4 h-4" />
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  handleCopyLink(link.slug)
                                  setShowMoreMenu(null)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-foreground/70 hover:bg-[hsl(var(--surface-muted))] flex items-center gap-3"
                              >
                                <Copy className="w-4 h-4" />
                                Copier le lien
                              </button>
                              <Link href={`/dashboard/analytics/${link.id}`}>
                                <button className="w-full px-4 py-2.5 text-left text-sm text-foreground/70 hover:bg-[hsl(var(--surface-muted))] flex items-center gap-3">
                                  <BarChart3 className="w-4 h-4" />
                                  Voir les analytics
                                </button>
                              </Link>
                              <hr className="my-2 border-gray-100" />
                              <button
                                onClick={() => {
                                  handleDelete(link.id)
                                  setShowMoreMenu(null)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-rose-500/10 flex items-center gap-3"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* URL et stats */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <Globe className="w-4 h-4" />
                        <span className="font-mono">taplinkr.com/{link.slug}</span>
                      </div>

                      {/* Statistiques */}
                      <div className="text-center p-3 bg-[hsl(var(--surface-muted))]/80 rounded-xl">
                        <p className="text-2xl font-bold text-foreground">
                          {(link.clicks || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-foreground/60 mt-1">Clics</p>
                      </div>

                      {/* Features badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {link.isDirect && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                            <Zap className="w-3 h-3" />
                            Direct
                          </span>
                        )}
                        {link.shieldEnabled && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                            <Shield className="w-3 h-3" />
                            Protégé
                          </span>
                        )}
                        {!link.isDirect && link.multiLinks && link.multiLinks.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                            <Layers className="w-3 h-3" />
                            {link.multiLinks.length} liens
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => handleToggle(link.id, !link.isActive)}
                          className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all ${
                            link.isActive
                              ? 'bg-[hsl(var(--surface-muted))] text-foreground/70 hover:bg-[hsl(var(--surface-muted))]/80'
                              : 'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:shadow-lg hover:shadow-brand-500/20'
                          }`}
                        >
                          {link.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <a
                          href={`/${link.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-[hsl(var(--surface-muted))] hover:bg-[hsl(var(--surface-muted))]/80 rounded-xl transition-colors"
                        >
                          <ExternalLink className="w-5 h-5 text-foreground/60" />
                        </a>
                        <button className="p-2.5 bg-[hsl(var(--surface-muted))] hover:bg-[hsl(var(--surface-muted))]/80 rounded-xl transition-colors">
                          <QrCode className="w-5 h-5 text-foreground/60" />
                        </button>
                      </div>

                      {/* Date de création */}
                      <div className="flex items-center justify-between text-xs text-foreground/55 pt-2 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Créé {formatDistanceToNow(new Date(link.createdAt), { locale: fr, addSuffix: true })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(link.updatedAt), 'HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Vue liste */
            <div className="bg-[hsl(var(--surface))] rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[hsl(var(--surface-muted))]/80 border-b border-border/60">
                    <th className="px-6 py-4 text-left text-xs font-medium text-foreground/55 uppercase tracking-wider">
                      Lien
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-foreground/55 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-foreground/55 uppercase tracking-wider">
                      Clics
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-foreground/55 uppercase tracking-wider">
                      Créé le
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-foreground/55 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLinks.map((link) => (
                    <tr key={link.id} className="hover:bg-[hsl(var(--surface-muted))]/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {link.icon ? (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                              <span className="text-lg">{link.icon}</span>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[hsl(var(--surface-muted))] flex items-center justify-center">
                              <Link2 className="w-5 h-5 text-foreground/55" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{link.title}</p>
                            <p className="text-sm text-foreground/55">/{link.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          link.isActive 
                            ? 'bg-green-100 text-green-700 
                            : 'bg-[hsl(var(--surface-muted))] text-foreground/70
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            link.isActive ? 'bg-green-500' : 'bg-[hsl(var(--surface-muted))]/800'
                          }`} />
                          {link.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground">{link.clicks || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground/60">
                        {format(new Date(link.createdAt), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(link)}
                            className="p-1.5 hover:bg-[hsl(var(--surface-muted))] rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-foreground/60" />
                          </button>
                          <a
                            href={`/${link.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-[hsl(var(--surface-muted))] rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-foreground/60" />
                          </a>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* État vide */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[hsl(var(--surface))] rounded-2xl p-16 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-500/15 to-brand-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Link2 className="w-12 h-12 text-brand-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {searchTerm || filterType !== 'all' ? 'Aucun lien trouvé' : 'Créez votre premier lien'}
              </h3>
              <p className="text-foreground/60 mb-8 text-lg">
                {searchTerm || filterType !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Commencez à partager vos liens avec le monde entier'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/25 transition-all"
                  >
                    <Sparkles className="w-5 h-5" />
                    Créer mon premier lien
                  </button>
                  <p className="text-sm text-foreground/55">
                    Ou importez vos liens depuis une autre plateforme
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
          </div>
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
