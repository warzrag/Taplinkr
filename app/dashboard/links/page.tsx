'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { 
  Plus,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  BarChart3,
  Globe,
  Link as LinkIcon,
  Folder,
  Activity,
  TrendingUp,
  AlertCircle,
  Crown
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
  const router = useRouter()
  const [links, setLinks] = useState<LinkData[]>([])
  const [folders, setFolders] = useState<FolderData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkData | null>(null)
  const [stats, setStats] = useState({
    totalLinks: 0,
    landingPages: 0,
    deepLinks: 0,
    activeLinks: 0,
    inactiveLinks: 0,
    totalClicks: 0,
    recentClicks: 0
  })

  // Limites selon le plan
  const limits = {
    landingPages: session?.user?.plan === 'premium' ? 10 : 1,
    deepLinks: session?.user?.plan === 'premium' ? 50 : 1
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Récupérer les liens
      const linksResponse = await fetch('/api/links')
      if (linksResponse.ok) {
        const linksData = await linksResponse.json()
        setLinks(linksData)
        
        // Calculer les statistiques
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
          recentClicks: 0 // TODO: Calculer les clics récents
        })
      }

      // Récupérer les dossiers
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

  const handleCreateLink = () => {
    // Vérifier les limites
    if (!editingLink?.isDirect && stats.landingPages >= limits.landingPages) {
      toast.error(`Limite atteinte : ${limits.landingPages} landing page(s) maximum`)
      return
    }
    if (editingLink?.isDirect && stats.deepLinks >= limits.deepLinks) {
      toast.error(`Limite atteinte : ${limits.deepLinks} deep link(s) maximum`)
      return
    }
    setShowCreateModal(true)
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
      } else {
        toast.error('Erreur lors de la suppression')
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
                         link.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (link.directUrl && link.directUrl.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filter === 'all' ||
                         (filter === 'landing' && !link.isDirect) ||
                         (filter === 'deep' && link.isDirect) ||
                         (filter === 'active' && link.isActive) ||
                         (filter === 'inactive' && !link.isActive)
    
    return matchesSearch && matchesFilter
  })

  // Grouper les liens par dossier
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Links</h1>
        
        {/* Alerte de limite */}
        {(stats.landingPages >= limits.landingPages || stats.deepLinks >= limits.deepLinks) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                You've reached your landing page and deeplink limits. 
                <Link href="/dashboard/billing" className="ml-1 font-semibold underline">
                  Upgrade your plan
                </Link> for more.
              </p>
              <div className="mt-2 text-sm text-amber-700">
                <div>Landing Pages: {stats.landingPages}/{limits.landingPages}</div>
                <div>Deep Links: {stats.deepLinks}/{limits.deepLinks}</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <button
            onClick={handleCreateLink}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Link
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, URL, destination, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">
              Active Domains
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{stats.activeLinks}/{stats.totalLinks}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'All', count: stats.totalLinks },
          { value: 'landing', label: 'Landing Pages', count: stats.landingPages },
          { value: 'deep', label: 'Deeplinks', count: stats.deepLinks },
          { value: 'active', label: 'Active', count: stats.activeLinks },
          { value: 'inactive', label: 'Inactive', count: stats.inactiveLinks },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === item.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {item.label}
            <span className="ml-2 text-xs">{item.count}</span>
          </button>
        ))}
      </div>

      {/* Actions sur les groupes */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Link Groups</h2>
        <div className="flex gap-4 text-sm">
          <button
            onClick={() => setFolders(folders.map(f => ({ ...f, isExpanded: true })))}
            className="text-blue-600 hover:underline"
          >
            Expand All
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() => setFolders(folders.map(f => ({ ...f, isExpanded: false })))}
            className="text-blue-600 hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Liste des liens */}
      <div className="space-y-4">
        {/* Liens non groupés */}
        {ungroupedLinks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">Ungrouped Links</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{ungroupedLinks.length} links</span>
                  <span>{ungroupedLinks.reduce((acc, l) => acc + l.clicks, 0)} clicks</span>
                  <span className="text-green-600">+{ungroupedLinks.length} 7 days</span>
                </div>
              </div>
            </div>
            <div className="divide-y">
              {ungroupedLinks.map(link => (
                <LinkItem 
                  key={link.id} 
                  link={link} 
                  onEdit={() => setEditingLink(link)}
                  onDelete={() => handleDeleteLink(link.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Dossiers */}
        {groupedFolders.map(folder => (
          <div key={folder.id} className="bg-white rounded-lg shadow-sm border">
            <div 
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
              onClick={() => toggleFolder(folder.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {folder.isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <Folder className="w-5 h-5" style={{ color: folder.color || '#6B7280' }} />
                  <span className="font-medium">{folder.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{folder.links.length} links</span>
                  <span>{folder.totalClicks} total clicks</span>
                  <span className="text-green-600">+{folder.recentClicks} 7 days</span>
                </div>
              </div>
            </div>
            {folder.isExpanded && folder.links.length > 0 && (
              <div className="divide-y">
                {folder.links.map(link => (
                  <LinkItem 
                    key={link.id} 
                    link={link} 
                    onEdit={() => setEditingLink(link)}
                    onDelete={() => handleDeleteLink(link.id)}
                  />
                ))}
              </div>
            )}
          </div>
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
  )
}

// Composant pour un élément de lien
function LinkItem({ 
  link, 
  onEdit, 
  onDelete 
}: { 
  link: LinkData
  onEdit: () => void
  onDelete: () => void
}) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://taplinkr.com/${link.slug}`)
    toast.success('Lien copié !')
  }

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="relative">
              <LinkIcon className="w-5 h-5 text-gray-400" />
              {link.isActive && (
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              )}
            </div>
            <button className="p-2 hover:bg-gray-100 rounded">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{link.title}</h3>
            <div className="text-sm text-gray-500 mt-1">
              <span className="text-blue-600">taplinkr.com/{link.slug}</span>
              {link.directUrl && (
                <>
                  <span className="mx-2">→</span>
                  <span>{link.directUrl}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{link.clicks}</div>
            <div className="text-xs text-gray-500">clicks</div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-100 rounded"
              title="Copier le lien"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 hover:bg-gray-100 rounded"
              title="Modifier"
            >
              <Edit className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-gray-100 rounded"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
            <a
              href={`https://taplinkr.com/${link.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded"
              title="Ouvrir"
            >
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
        <span>{link.isActive ? 'Active' : 'Inactive'}</span>
        <span>•</span>
        <span>{link.isDirect ? 'Deeplink' : 'Landing Page'}</span>
      </div>
    </div>
  )
}