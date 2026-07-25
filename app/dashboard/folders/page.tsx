'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, FolderPlus, Plus } from 'lucide-react'
import Link from 'next/link'
import DragDropDashboard from '@/components/DragDropDashboard'
import CreateLinkModal from '@/components/CreateLinkModal'
import { toast } from 'react-hot-toast'
import { Link as LinkType } from '@/types'
import { safeGetItem, safeSetItem } from '@/lib/safe-storage'

interface Folder {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  isExpanded: boolean
  links: LinkType[]
  order: number
  parentId?: string | null
  children?: Folder[]
  teamShared?: boolean
  teamId?: string | null
}

export default function FoldersPage() {
  const router = useRouter()
  const [folders, setFolders] = useState<Folder[]>([])
  const [unorganizedLinks, setUnorganizedLinks] = useState<LinkType[]>([])
  const [loading, setLoading] = useState(false) // Commencer à false pour affichage immédiat
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  // Récupérer les dossiers et les liens
  useEffect(() => {
    // ⚡ STALE-WHILE-REVALIDATE: Charger depuis le cache d'abord
    const cached = safeGetItem<{
      folders: any[]
      unorganizedLinks: LinkType[]
      timestamp: number
    }>('folders-page-cache')

    if (cached) {
      try {
        // Toujours afficher le cache, même s'il est vieux
        if (cached.folders) {
          console.log('📦 Cache folders chargé:', cached.folders.length, 'dossiers')
          cached.folders.forEach(f => {
            console.log(`  - ${f.name}:`, f.links?.length || 0, 'liens,', f.children?.length || 0, 'sous-dossiers')
            if (f.children) {
              f.children.forEach((c: any) => {
                console.log(`    └─ ${c.name}:`, c.links?.length || 0, 'liens')
              })
            }
          })

          const foldersWithExpanded = (cached.folders || []).map((folder: any) => ({
            ...folder,
            isExpanded: false,
            links: folder.links || [], // 🔥 FIX: Préserver les liens du dossier
            children: folder.children?.map((child: any) => ({
              ...child,
              isExpanded: false,
              links: child.links || [] // 🔥 FIX: Préserver les liens des sous-dossiers
            })) || []
          }))
          setFolders(foldersWithExpanded)
        }

        if (cached.unorganizedLinks) {
          setUnorganizedLinks(cached.unorganizedLinks)
        }

        setLoading(false)

        const cacheAge = Date.now() - cached.timestamp
        if (cacheAge > 1800000) {
          console.log('⚠️ Cache folders page ancien:', Math.floor(cacheAge / 60000), 'minutes')
        }
      } catch (err) {
        console.error('Erreur parsing cache folders page:', err)
      }
    }

    // Charger les vraies données en arrière-plan (sans forceRefresh au démarrage)
    fetchData(false)
  }, [])

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true)

      // ⚡ Options de fetch pour contourner TOUS les caches si nécessaire
      const fetchOptions = forceRefresh ? {
        cache: 'no-cache' as RequestCache,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      } : {}

      // Ajouter timestamp pour être sûr de contourner le cache navigateur
      const timestamp = forceRefresh ? `?t=${Date.now()}` : ''

      // ⚡ Charger les deux APIs en parallèle pour gagner du temps
      const [foldersResponse, linksResponse] = await Promise.all([
        fetch(`/api/folders-direct${timestamp}`, fetchOptions),
        fetch(`/api/links-direct${timestamp}`, fetchOptions)
      ])

      // Traiter les dossiers
      let foldersData: any[] = []
      let unorganizedLinksData: LinkType[] = []

      if (foldersResponse.ok) {
        foldersData = await foldersResponse.json()
        const foldersWithExpanded = (foldersData || []).map((folder: any) => ({
          ...folder,
          isExpanded: false,
          links: folder.links || [], // 🔥 FIX: Préserver les liens du dossier
          children: folder.children?.map((child: any) => ({
            ...child,
            isExpanded: false,
            links: child.links || [] // 🔥 FIX: Préserver les liens des sous-dossiers
          })) || []
        }))
        setFolders(foldersWithExpanded)
      }

      // Traiter les liens non organisés
      if (linksResponse.ok) {
        const linksData = await linksResponse.json()
        const unorganized = linksData.filter((link: LinkType) => !link.folderId)
        setUnorganizedLinks(unorganized)
        unorganizedLinksData = unorganized
      }

      // 🔥 Sauvegarder dans le cache localStorage (avec gestion quota automatique)
      if (foldersResponse.ok || linksResponse.ok) {
        safeSetItem('folders-page-cache', {
          folders: foldersData,
          unorganizedLinks: unorganizedLinksData,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast.error('Unable to load your data.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLink = async (id: string, isActive: boolean) => {
    try {
      // Optimistic update
      setUnorganizedLinks(prev => prev.map(l => l.id === id ? { ...l, isActive } : l))
      setFolders(prev => prev.map(f => ({
        ...f,
        links: f.links.map(l => l.id === id ? { ...l, isActive } : l)
      })))

      const response = await fetch('/api/links/toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: id, isActive })
      })

      if (response.ok) {
        toast.success(isActive ? 'Link activated' : 'Link deactivated')
      } else {
        await fetchData()
      }
    } catch (error) {
      await fetchData()
      toast.error('Unable to update the link.')
    }
  }

  const handleEditLink = (link: LinkType) => {
    // Rediriger vers la page Links pour éditer
    router.push('/dashboard/links')
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      // Optimistic update
      setUnorganizedLinks(prev => prev.filter(l => l.id !== id))
      setFolders(prev => prev.map(f => ({
        ...f,
        links: f.links.filter(l => l.id !== id)
      })))

      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Link deleted.')
      } else {
        await fetchData()
        toast.error('Unable to delete the link.')
      }
    } catch (error) {
      await fetchData()
      toast.error('Unable to delete the link.')
    }
  }

  const handleMoveLink = async (linkId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/links/${linkId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId })
      })
      
      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      toast.error('Unable to move the link.')
    }
  }

  const handleCreateFolder = async () => {
    // Géré par le composant DragDropDashboard
  }

  const handleEditFolder = async (folder: Folder) => {
    const newName = prompt('Nouveau nom du dossier:', folder.name)
    if (!newName || newName === folder.name) return

    try {
      // ⚡ Optimistic update - Modifier immédiatement
      setFolders(prevFolders =>
        prevFolders.map(f =>
          f.id === folder.id ? { ...f, name: newName } : f
        )
      )

      const response = await fetch(`/api/folders/${folder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })

      if (response.ok) {
        // ⚡ Invalider TOUS les caches localStorage
        localStorage.removeItem('dashboard-stats')
        localStorage.removeItem('folder-stats')
        localStorage.removeItem('folders-page-cache')  // 🔥 FIX

        toast.success('Folder updated.')
        // Recharger avec cache bypass
        await fetchData(true)
      } else {
        // En cas d'erreur, restaurer l'ancien état
        await fetchData(true)
        toast.error('Unable to update the folder.')
      }
    } catch (error) {
      // En cas d'erreur, restaurer l'ancien état
      await fetchData(true)
      toast.error('Unable to update the folder.')
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder and all of its links?')) return

    try {
      // Optimistic update - Retirer immédiatement du state
      setFolders(prevFolders => prevFolders.filter(f => f.id !== folderId))

      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // ⚡ Invalider TOUS les caches localStorage
        localStorage.removeItem('dashboard-stats')
        localStorage.removeItem('folder-stats')
        localStorage.removeItem('folders-page-cache')  // 🔥 FIX

        toast.success('Folder deleted.')
        // Recharger avec cache bypass
        await fetchData(true)
      } else {
        // En cas d'erreur, recharger pour restaurer l'état
        await fetchData(true)
        toast.error('Unable to delete the folder.')
      }
    } catch (error) {
      // En cas d'erreur, recharger pour restaurer l'état
      await fetchData(true)
      toast.error('Unable to delete the folder.')
    }
  }

  const handleToggleFolder = async (folderId: string) => {
    setFolders(folders.map(folder => {
      // Vérifier si c'est le dossier parent qui doit être toggle
      if (folder.id === folderId) {
        return { ...folder, isExpanded: !folder.isExpanded }
      }

      // 🔥 FIX: Vérifier aussi dans les sous-dossiers (children)
      if (folder.children && folder.children.length > 0) {
        const updatedChildren = folder.children.map(child => {
          if (child.id === folderId) {
            return { ...child, isExpanded: !child.isExpanded }
          }
          return child
        })

        // Si un enfant a changé, retourner le parent avec les enfants mis à jour
        if (updatedChildren.some((child, idx) => child !== folder.children![idx])) {
          return { ...folder, children: updatedChildren }
        }
      }

      return folder
    }))
  }

  const handleShareFolder = async (folderId: string, folderName: string) => {
    try {
      const response = await fetch('/api/folders/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId })
      })

      const data = await response.json()

      if (response.ok) {
        // ⚡ Invalider TOUS les caches localStorage
        localStorage.removeItem('dashboard-stats')
        localStorage.removeItem('folder-stats')
        localStorage.removeItem('folders-page-cache')  // 🔥 FIX

        toast.success(`"${folderName}" shared with the team`)
        await fetchData(true)
      } else {
        toast.error(data.error || 'Unable to share the folder.')
      }
    } catch (error) {
      toast.error('Unable to share the folder.')
    }
  }

  const handleUnshareFolder = async (folderId: string, folderName: string) => {
    try {
      const response = await fetch(`/api/folders/share?folderId=${folderId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        // ⚡ Invalider TOUS les caches localStorage
        localStorage.removeItem('dashboard-stats')
        localStorage.removeItem('folder-stats')
        localStorage.removeItem('folders-page-cache')  // 🔥 FIX

        toast.success(`"${folderName}" removed from team sharing`)
        await fetchData(true)
      } else {
        toast.error(data.error || 'Unable to update sharing.')
      }
    } catch (error) {
      toast.error('Unable to remove the folder from sharing.')
    }
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mes dossiers et liens
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Organize links with folders and drag and drop to reorder
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => {
                  setSelectedFolderId(null)
                  setShowCreateModal(true)
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create a link</span>
              </motion.button>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <FolderPlus className="w-4 h-4" />
                <span>Click "New" to create folders</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* DragDropDashboard Component */}
        <DragDropDashboard
          folders={folders}
          unorganizedLinks={unorganizedLinks}
          onFoldersChange={setFolders}
          onLinksChange={setUnorganizedLinks}
          onToggleLink={handleToggleLink}
          onEditLink={handleEditLink}
          onDeleteLink={handleDeleteLink}
          onMoveLink={handleMoveLink}
          onCreateFolder={handleCreateFolder}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleDeleteFolder}
          onToggleFolder={handleToggleFolder}
          onShareFolder={handleShareFolder}
          onUnshareFolder={handleUnshareFolder}
          onCreateLinkInFolder={(folderId) => {
            setSelectedFolderId(folderId)
            setShowCreateModal(true)
          }}
          onFolderCreated={async () => {
            // 🔥 FIX: Invalider le cache localStorage AVANT de recharger
            localStorage.removeItem('folders-page-cache')
            // Recharger avec bypass cache après création
            await fetchData(true)
          }}
        />
      </div>

      {/* Modals */}
      <CreateLinkModal
        isOpen={showCreateModal}
        editingLink={null}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedFolderId(null)
        }}
        onSuccess={async (newLink) => {
          // Si un dossier est sélectionné, déplacer le lien dans ce dossier
          if (selectedFolderId && newLink?.id) {
            await handleMoveLink(newLink.id, selectedFolderId)
          }
          setShowCreateModal(false)
          setSelectedFolderId(null)
          await fetchData()
        }}
      />
    </div>
  )
}
