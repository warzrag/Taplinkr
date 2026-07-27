'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BarChart3, ChevronLeft, MousePointerClick, Plus } from 'lucide-react'
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

type Period = 'today' | '7d' | '30d'

interface FolderInsight {
  id: string
  name: string
  parentId: string | null
  directClicks: number
  totalClicks: number
  dailyClicks: Array<{ date: string; clicks: number }>
  topLinks: Array<{ id: string; name: string; slug: string; clicks: number }>
}

function periodStart(period: Period) {
  const start = new Date()
  if (period !== 'today') start.setDate(start.getDate() - (period === '7d' ? 6 : 29))
  start.setHours(0, 0, 0, 0)
  return start.toISOString()
}

export default function FoldersPage() {
  const router = useRouter()
  const [folders, setFolders] = useState<Folder[]>([])
  const [unorganizedLinks, setUnorganizedLinks] = useState<LinkType[]>([])
  const [loading, setLoading] = useState(false) // Commencer à false pour affichage immédiat
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('7d')
  const [insights, setInsights] = useState<FolderInsight[]>([])
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [selectedAnalyticsFolderId, setSelectedAnalyticsFolderId] = useState<string | null>(null)

  const fetchInsights = useCallback(async () => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      const response = await fetch(
        `/api/analytics/folders?period=${period}&start=${encodeURIComponent(periodStart(period))}&timeZone=${encodeURIComponent(timeZone)}`,
        { cache: 'no-store' },
      )
      if (!response.ok) return
      const data = await response.json()
      setInsights(data.insights || [])
    } catch {
      // Keep the latest successful folder analytics visible.
    } finally {
      setInsightsLoading(false)
    }
  }, [period])

  useEffect(() => {
    setInsightsLoading(true)
    fetchInsights()
  }, [fetchInsights])

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
        await fetchData(true)
        await fetchInsights()
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
    if (!confirm('Delete this folder? Its links and click history will be kept in Unorganized links.')) return

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

  const selectedInsight = insights.find(item => item.id === selectedAnalyticsFolderId)
    || insights.find(item => !item.parentId)

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <div className="mx-auto max-w-[1500px] p-4 lg:p-10">
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
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-400">Link workspace</p>
              <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-white">
                Organize your links
              </h1>
              <p className="mt-2 text-[#9696a8]">
                Create folders, then drag each link into the right place.
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
            </div>
          </div>
        </motion.div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {[
            ['1', 'Create a folder', 'Use any name: niche, platform, campaign...'],
            ['2', 'Find links in Inbox', 'Every link without a folder appears there.'],
            ['3', 'Drag and drop', 'Drop a link directly into its destination folder.'],
          ].map(([step, title, description]) => (
            <div key={step} className="flex gap-3 rounded-2xl border border-[#252532] bg-[#11111a] p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-bold text-violet-300">{step}</span>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-[#858598]">{description}</p>
              </div>
            </div>
          ))}
        </div>

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
            localStorage.removeItem('folders-page-cache')
            await fetchData(true)
            await fetchInsights()
          }}
          folderClickCounts={Object.fromEntries(insights.map(item => [item.id, item.totalClicks]))}
          periodLabel={period === 'today' ? 'today' : `last ${period === '7d' ? 7 : 30} days`}
        />

        <details className="group mt-8 rounded-2xl border border-[#252532] bg-[#11111a] p-5 sm:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-violet-500/10 p-2.5 text-violet-300">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-white">Click analytics</p>
                <p className="mt-0.5 text-sm text-[#858598]">Open the detailed breakdown by folder and category.</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-violet-300 group-open:hidden">View details</span>
            <span className="hidden text-sm font-semibold text-violet-300 group-open:inline">Hide details</span>
          </summary>
          <div className="mt-6 border-t border-[#252532] pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-400" />
                <h2 className="text-xl font-semibold">Clicks by folder and category</h2>
              </div>
              <p className="mt-1 text-sm text-[#858598]">Real clicks only. Historical clicks stay with the folder they belonged to.</p>
            </div>
            <div className="inline-flex self-start rounded-xl border border-[#2b2b39] bg-[#0b0b12] p-1">
              {([
                ['today', 'Today'],
                ['7d', '7 days'],
                ['30d', '30 days'],
              ] as Array<[Period, string]>).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPeriod(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    period === value ? 'bg-violet-500 text-white' : 'text-[#8e8ea2] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {folders.length ? folders.map(rootFolder => {
              const folderInsight = insights.find(item => item.id === rootFolder.id)
              const categories = (rootFolder.children || []).map(category => ({
                folder: category,
                insight: insights.find(item => item.id === category.id),
              }))
              return (
                <article key={rootFolder.id} className="rounded-2xl border border-[#292936] bg-[#0b0b12] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">{rootFolder.icon} {rootFolder.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[#6f6f81]">Folder total</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-violet-500/10 px-3 py-2 text-violet-300">
                      <MousePointerClick className="h-4 w-4" />
                      <span className="text-2xl font-bold">
                        {insightsLoading ? '—' : (folderInsight?.totalClicks || 0).toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-5 space-y-2">
                    {categories.length ? categories.map(({ folder, insight }) => (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => setSelectedAnalyticsFolderId(folder.id)}
                        className="flex w-full items-center justify-between rounded-xl border border-[#242431] bg-white/[0.025] px-3 py-2.5 text-left transition hover:border-violet-500/40 hover:bg-violet-500/[0.06]"
                      >
                        <span className="truncate text-sm font-medium text-[#cfcfda]">{folder.icon} {folder.name}</span>
                        <span className="ml-3 font-bold text-white">{(insight?.totalClicks || 0).toLocaleString('en-US')}</span>
                      </button>
                    )) : (
                      <p className="rounded-xl border border-dashed border-[#30303e] px-3 py-4 text-center text-sm text-[#77778a]">
                        Add subfolders to compare categories.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAnalyticsFolderId(rootFolder.id)}
                    className="mt-4 w-full rounded-xl border border-[#30303e] px-3 py-2 text-sm font-semibold text-violet-300 transition hover:border-violet-500/50 hover:bg-violet-500/[0.06]"
                  >
                    View folder breakdown
                  </button>
                </article>
              )
            }) : (
              <div className="col-span-full rounded-xl border border-dashed border-[#30303e] px-5 py-10 text-center text-sm text-[#77778a]">
                Create your first folder below.
              </div>
            )}
          </div>

          {selectedInsight && (
            <div className="mt-6 rounded-2xl border border-[#292936] bg-[#0b0b12] p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-400">Folder breakdown</p>
                  <h3 className="mt-1 text-xl font-semibold">{selectedInsight.name}</h3>
                </div>
                <p className="text-sm text-[#858598]">
                  {selectedInsight.totalClicks.toLocaleString('en-US')} real clicks · {selectedInsight.directClicks.toLocaleString('en-US')} directly in this folder
                </p>
              </div>
              <div className="mt-5 overflow-x-auto pb-2">
                <div className="flex min-w-max gap-2">
                  {selectedInsight.dailyClicks.map(day => (
                    <div key={day.date} className="w-24 rounded-xl border border-[#242431] bg-white/[0.025] p-3 text-center">
                      <p className="text-xs text-[#77778a]">
                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${day.date}T12:00:00`))}
                      </p>
                      <p className={`mt-2 text-xl font-bold ${day.clicks ? 'text-violet-300' : 'text-[#555568]'}`}>
                        {day.clicks.toLocaleString('en-US')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 border-t border-[#242431] pt-4">
                <p className="text-sm font-semibold text-[#b8b8c7]">Links in this breakdown</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {selectedInsight.topLinks.length ? selectedInsight.topLinks.map(link => (
                    <div key={link.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{link.name}</p>
                        <p className="truncate text-xs text-[#666679]">/{link.slug}</p>
                      </div>
                      <span className="ml-3 text-lg font-bold text-violet-300">{link.clicks.toLocaleString('en-US')}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-[#77778a]">No clicks in this period.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>
        </details>

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
          await fetchInsights()
        }}
      />
    </div>
  )
}
