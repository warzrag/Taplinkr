'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Plus,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Edit2,
  Trash2,
  BarChart3,
  Globe,
  Link as LinkIcon,
  Folder,
  Activity,
  TrendingUp,
  AlertCircle,
  Crown,
  Zap,
  Star,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpRight,
  MousePointer
} from 'lucide-react'
import Link from 'next/link'
import CreateLinkModal from '@/components/CreateLinkModal'
import EditLinkModal from '@/components/EditLinkModal'

interface LinkData {
  id: string
  title: string
  slug: string
  directUrl?: string
  isDirect: boolean
  isActive: boolean
  clicks: number
  createdAt: string
  folderId?: string | null
}

interface FolderData {
  id: string
  name: string
  description?: string
  color?: string
  links: LinkData[]
  isExpanded: boolean
  totalClicks: number
  recentClicks: number
}

export default function LinksPage() {
  const { data: session } = useSession()
  const [links, setLinks] = useState<LinkData[]>([])
  const [folders, setFolders] = useState<FolderData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkData | null>(null)
  const [showActions, setShowActions] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalLinks: 0,
    landingPages: 0,
    deepLinks: 0,
    activeLinks: 0,
    inactiveLinks: 0,
    totalClicks: 0,
    recentClicks: 0
  })

  const limits = {
    landingPages: session?.user?.plan === 'premium' ? 10 : 1,
    deepLinks: session?.user?.plan === 'premium' ? 50 : 1
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const linksResponse = await fetch('/api/links')
      if (linksResponse.ok) {
        const linksData = await linksResponse.json()
        setLinks(linksData)
        
        const landingPages = linksData.filter((l: LinkData) => !l.isDirect).length
        const deepLinks = linksData.filter((l: LinkData) => l.isDirect).length
        const activeLinks = linksData.filter((l: LinkData) => l.isActive).length
        const totalClicks = linksData.reduce((acc: number, l: LinkData) => acc + l.clicks, 0)
        
        setStats({
          totalLinks: linksData.length,
          landingPages,
          deepLinks,
          activeLinks,
          inactiveLinks: linksData.length - activeLinks,
          totalClicks,
          recentClicks: Math.floor(totalClicks * 0.3)
        })
      }

      const foldersResponse = await fetch('/api/folders')
      if (foldersResponse.ok) {
        const foldersData = await foldersResponse.json()
        setFolders(foldersData.map((f: any) => ({
          ...f,
          isExpanded: true,
          totalClicks: 0,
          recentClicks: 0
        })))
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) return

    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Lien supprimé')
        fetchData()
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const toggleFolder = (folderId: string) => {
    setFolders(folders.map(f => 
      f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
    ))
  }

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.slug.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filter === 'all' ||
                         (filter === 'landing' && !link.isDirect) ||
                         (filter === 'deep' && link.isDirect) ||
                         (filter === 'active' && link.isActive) ||
                         (filter === 'inactive' && !link.isActive)
    
    return matchesSearch && matchesFilter
  })

  const ungroupedLinks = filteredLinks.filter(l => !l.folderId)
  const groupedFolders = folders.map(folder => ({
    ...folder,
    links: filteredLinks.filter(l => l.folderId === folder.id),
    totalClicks: filteredLinks.filter(l => l.folderId === folder.id)
                              .reduce((acc, l) => acc + l.clicks, 0)
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header avec animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                Mes Liens
              </h1>
              <p className="text-gray-600 mt-1">Gérez et analysez tous vos liens en un seul endroit</p>
            </div>
            
            {/* Statistiques rapides */}
            <div className="hidden lg:flex items-center gap-6">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600">{stats.totalClicks}</div>
                <div className="text-xs text-gray-500">Clics totaux</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-green-600">+{stats.recentClicks}</div>
                <div className="text-xs text-gray-500">Cette semaine</div>
              </motion.div>
            </div>
          </div>
          
          {/* Alerte de limite avec design moderne */}
          {(stats.landingPages >= limits.landingPages || stats.deepLinks >= limits.deepLinks) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-5 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <Crown className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Débloquez votre potentiel complet !
                  </h3>
                  <p className="text-sm text-amber-700 mb-3">
                    Vous avez atteint vos limites actuelles. Passez au plan Premium pour créer plus de liens.
                  </p>
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-amber-200 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full"
                          style={{ width: `${(stats.landingPages / limits.landingPages) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-amber-700">
                        {stats.landingPages}/{limits.landingPages} Pages
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-amber-200 rounded-full h-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full"
                          style={{ width: `${(stats.deepLinks / limits.deepLinks) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-amber-700">
                        {stats.deepLinks}/{limits.deepLinks} Liens
                      </span>
                    </div>
                  </div>
                  <Link href="/dashboard/billing">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 shadow-lg shadow-amber-500/25"
                    >
                      <Zap className="w-4 h-4" />
                      Passer au Premium
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Barre d'actions */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 font-medium"
            >
              <Plus className="w-5 h-5" />
              Créer un lien
            </motion.button>

            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, URL, destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Domaines actifs</span>
              </div>
              <div className="font-bold text-gray-900">{stats.activeLinks}/{stats.totalLinks}</div>
            </div>
          </div>
        </motion.div>

        {/* Filtres avec design moderne */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'Tous', count: stats.totalLinks, icon: Globe, color: 'gray' },
            { value: 'landing', label: 'Landing Pages', count: stats.landingPages, icon: MousePointer, color: 'blue' },
            { value: 'deep', label: 'Liens directs', count: stats.deepLinks, icon: ArrowUpRight, color: 'purple' },
            { value: 'active', label: 'Actifs', count: stats.activeLinks, icon: Eye, color: 'green' },
            { value: 'inactive', label: 'Inactifs', count: stats.inactiveLinks, icon: EyeOff, color: 'red' },
          ].map((item) => {
            const Icon = item.icon
            const isActive = filter === item.value
            return (
              <motion.button
                key={item.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(item.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? `bg-${item.color}-100 text-${item.color}-700 ring-2 ring-${item.color}-500 ring-opacity-50`
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? `bg-${item.color}-200` : 'bg-gray-100'
                }`}>
                  {item.count}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Section des groupes */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
              <Folder className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Groupes de liens</h2>
          </div>
          <div className="flex gap-4 text-sm">
            <button
              onClick={() => setFolders(folders.map(f => ({ ...f, isExpanded: true })))}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Tout développer
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setFolders(folders.map(f => ({ ...f, isExpanded: false })))}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Tout réduire
            </button>
          </div>
        </div>

        {/* Liste des liens avec animations */}
        <div className="space-y-4">
          {/* Liens non groupés */}
          {ungroupedLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Folder className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Liens non groupés</h3>
                      <p className="text-sm text-gray-500">{ungroupedLinks.length} liens</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {ungroupedLinks.reduce((acc, l) => acc + l.clicks, 0)}
                      </div>
                      <div className="text-xs text-gray-500">clics totaux</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        +{Math.floor(ungroupedLinks.reduce((acc, l) => acc + l.clicks, 0) * 0.3)}
                      </div>
                      <div className="text-xs text-gray-500">cette semaine</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {ungroupedLinks.map((link, index) => (
                  <LinkItem 
                    key={link.id} 
                    link={link} 
                    index={index}
                    onEdit={() => setEditingLink(link)}
                    onDelete={() => handleDeleteLink(link.id)}
                    showActions={showActions === link.id}
                    setShowActions={setShowActions}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Dossiers */}
          {groupedFolders.map((folder, folderIndex) => (
            <motion.div
              key={folder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: folderIndex * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <motion.div 
                className="p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b cursor-pointer hover:bg-gray-100/70 transition-colors"
                onClick={() => toggleFolder(folder.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: folder.isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-2 bg-white rounded-xl shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </motion.div>
                    <div 
                      className="p-2 rounded-xl shadow-sm"
                      style={{ backgroundColor: `${folder.color}20` || '#f3f4f6' }}
                    >
                      <Folder className="w-5 h-5" style={{ color: folder.color || '#6B7280' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{folder.name}</h3>
                      <p className="text-sm text-gray-500">
                        {folder.links.length} liens • {folder.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{folder.totalClicks}</div>
                      <div className="text-xs text-gray-500">clics totaux</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        +{Math.floor(folder.totalClicks * 0.3)}
                      </div>
                      <div className="text-xs text-gray-500">cette semaine</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <AnimatePresence>
                {folder.isExpanded && folder.links.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="divide-y divide-gray-100"
                  >
                    {folder.links.map((link, index) => (
                      <LinkItem 
                        key={link.id} 
                        link={link}
                        index={index}
                        onEdit={() => setEditingLink(link)}
                        onDelete={() => handleDeleteLink(link.id)}
                        showActions={showActions === link.id}
                        setShowActions={setShowActions}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Modals */}
        {showCreateModal && (
          <CreateLinkModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchData()
            }}
          />
        )}
        
        {editingLink && (
          <EditLinkModal
            isOpen={!!editingLink}
            link={editingLink}
            onClose={() => setEditingLink(null)}
            onSuccess={() => {
              setEditingLink(null)
              fetchData()
            }}
          />
        )}
      </div>
    </div>
  )
}

// Composant LinkItem avec design moderne
function LinkItem({ 
  link, 
  index,
  onEdit, 
  onDelete,
  showActions,
  setShowActions
}: { 
  link: LinkData
  index: number
  onEdit: () => void
  onDelete: () => void
  showActions: boolean
  setShowActions: (id: string | null) => void
}) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://taplinkr.com/${link.slug}`)
    toast.success('Lien copié dans le presse-papier !', {
      icon: '📋',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-5 hover:bg-gray-50/50 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.1 }}
            >
              <div className={`p-2.5 rounded-xl ${
                link.isActive 
                  ? 'bg-gradient-to-br from-blue-100 to-indigo-100' 
                  : 'bg-gray-100'
              }`}>
                <LinkIcon className={`w-5 h-5 ${
                  link.isActive ? 'text-blue-600' : 'text-gray-400'
                }`} />
              </div>
              {link.isActive && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              )}
            </motion.div>
            
            <div className="relative">
              <button 
                onClick={() => setShowActions(showActions ? null : link.id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 min-w-[160px]"
                  >
                    <button
                      onClick={() => {
                        onEdit()
                        setShowActions(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        copyToClipboard()
                        setShowActions(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copier le lien
                    </button>
                    <button
                      onClick={() => {
                        onDelete()
                        setShowActions(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">{link.title}</h3>
              {link.isDirect && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  Lien direct
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-blue-600 font-medium">taplinkr.com/{link.slug}</span>
              {link.directUrl && (
                <>
                  <ArrowUpRight className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-gray-500 truncate max-w-xs">{link.directUrl}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Créé {new Date(link.createdAt).toLocaleDateString()}
              </span>
              <span className={`flex items-center gap-1 ${link.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {link.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {link.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {link.clicks}
            </div>
            <div className="text-xs text-gray-500 font-medium">clics</div>
          </motion.div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={copyToClipboard}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              title="Copier le lien"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="p-2.5 hover:bg-blue-50 rounded-xl transition-colors"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4 text-blue-600" />
            </motion.button>
            <motion.a
              href={`https://taplinkr.com/${link.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2.5 hover:bg-purple-50 rounded-xl transition-colors"
              title="Ouvrir"
            >
              <ExternalLink className="w-4 h-4 text-purple-600" />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}