'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Plus, Folder as FolderIcon, Link2, BarChart3, Crown, Shield, TrendingUp, Eye, MousePointer, Users } from 'lucide-react'
import CreateLinkModal from '@/components/CreateLinkModal'
import Link from 'next/link'
import EditLinkModal from '@/components/EditLinkModal'
import EditPhonePreview from '@/components/EditPhonePreview'
import MoveToFolderMenu from '@/components/MoveToFolderMenu'
import DragDropDashboard from '@/components/DragDropDashboard'
import EditFolderModal from '@/components/EditFolderModal'
import { useLinkUpdate } from '@/contexts/LinkUpdateContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useLinks } from '@/contexts/LinksContext'
import { Link as LinkType } from '@/types'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts'
import { fetchAnalyticsData } from '@/lib/analytics/api-wrapper'

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
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const { updateLinkInPreview } = useLinkUpdate()
  const { profile: userProfile } = useProfile()
  const { links: contextLinks, folders: contextFolders, loading: contextLoading, refreshLinks, refreshFolders } = useLinks()
  const [folders, setFolders] = useState<Folder[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkType | null>(null)
  const [liveEditingLink, setLiveEditingLink] = useState<LinkType | null>(null)
  const [movingLink, setMovingLink] = useState<LinkType | null>(null)
  const [showEditFolderModal, setShowEditFolderModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      refreshLinks()
      fetchFolders()
      fetchDashboardStats()
    }
  }, [status]) // refreshLinks retiré des dépendances pour éviter la boucle infinie

  // Filtrer les liens sans dossier depuis le contexte
  const links = contextLinks.filter(link => !link.folderId)

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

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des dossiers')
    }
  }

  const handleLinksReorder = async (newLinks: LinkType[]) => {
    // Mettre à jour l'ordre dans la base de données
    // Pour l'instant, on ne fait rien car le contexte gère déjà les liens
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

  const handleMoveLink = async (linkId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/links/${linkId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId })
      })
      
      if (response.ok) {
        // Recharger les liens et dossiers
        await refreshLinks()
        fetchFolders()
        toast.success(folderId ? 'Lien déplacé dans le dossier' : 'Lien sorti du dossier')
      }
    } catch (error) {
      toast.error('Erreur lors du déplacement')
    }
  }

  const handleSaveFolder = async (folderData: Partial<Folder>) => {
    try {
      if (editingFolder) {
        // Mise à jour d'un dossier existant
        const response = await fetch(`/api/folders/${editingFolder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(folderData)
        })

        if (response.ok) {
          const updatedFolder = await response.json()
          setFolders(folders.map(f => f.id === editingFolder.id ? { ...f, ...updatedFolder } : f))
          setEditingFolder(null)
          setShowEditFolderModal(false)
          toast.success('Dossier mis à jour')
        } else {
          const errorData = await response.json()
          console.error('Erreur API mise à jour dossier:', errorData)
          toast.error(errorData.error || 'Erreur lors de la mise à jour du dossier')
        }
      } else {
        // Création d'un nouveau dossier
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(folderData)
        })

        if (response.ok) {
          const newFolder = await response.json()
          setFolders([...folders, newFolder])
          setShowEditFolderModal(false)
          toast.success('Dossier créé')
        } else {
          const errorData = await response.json()
          console.error('Erreur API création dossier:', errorData)
          toast.error(errorData.error || 'Erreur lors de la création du dossier')
        }
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
      toast.error(editingFolder ? 'Erreur réseau lors de la mise à jour' : 'Erreur réseau lors de la création')
    }
  }

  if (contextLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gérez vos liens et consultez vos statistiques</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:gap-3">
            {/* Bouton Admin - Visible uniquement pour les admins */}
            {(session?.user as any)?.role === 'admin' && (
              <Link href="/admin/users">
                <motion.button
                  className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white px-3 py-2 text-sm lg:px-4 lg:text-base rounded-lg flex items-center justify-center gap-2 transition-all w-full sm:w-auto shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </motion.button>
              </Link>
            )}
            
            {/* Bouton Passer Pro - Masqué pour les admins et les utilisateurs Pro/Business */}
            {(session?.user as any)?.plan === 'free' && (
              <Link href="/pricing">
                <motion.button
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-3 py-2 text-sm lg:px-4 lg:text-base rounded-lg flex items-center justify-center gap-2 transition-all w-full sm:w-auto shadow-lg hover:shadow-xl animate-pulse"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Crown className="w-4 h-4" />
                  <span>Passer Pro</span>
                </motion.button>
              </Link>
            )}
            <Link href="/dashboard/folders-analytics">
              <motion.button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-2 text-sm lg:px-4 lg:text-base rounded-lg flex items-center justify-center gap-2 transition-all w-full sm:w-auto shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics des Dossiers</span>
                <span className="sm:hidden">Analytics</span>
              </motion.button>
            </Link>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm lg:px-4 lg:text-base rounded-lg flex items-center justify-center gap-2 transition-colors w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              <span>Créer un lien</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Statistiques principales */}
        {dashboardStats && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Clics</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {dashboardStats.totalClicks || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <MousePointer className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Vues</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {dashboardStats.totalViews || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Visiteurs Uniques</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {dashboardStats.uniqueVisitors || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Croissance 7j</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {dashboardStats.growthRate > 0 ? '+' : ''}{dashboardStats.growthRate || 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Graphiques */}
            {dashboardStats.summary && dashboardStats.summary.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Évolution sur 7 jours
                </h3>
                <AnalyticsCharts data={dashboardStats} />
              </motion.div>
            )}

            {/* Top liens performants */}
            {dashboardStats.topLinks && dashboardStats.topLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Top 5 liens performants
                </h3>
                <div className="space-y-3">
                  {dashboardStats.topLinks.slice(0, 5).map((link: any, index: number) => (
                    <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{link.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">/{link.slug}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          {link._count?.analyticsEvents || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">clics</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        <DragDropDashboard
          folders={folders}
          unorganizedLinks={links}
          onFoldersChange={setFolders}
          onLinksChange={async () => {
            // Ne rien faire car les liens sont gérés par le contexte
            await refreshLinks()
          }}
          onToggleLink={handleToggle}
          onEditLink={handleEdit}
          onDeleteLink={handleDelete}
          onMoveLink={handleMoveLink}
          onCreateFolder={() => {
            setShowEditFolderModal(true)
            setEditingFolder(null)
          }}
          onEditFolder={(folder) => {
            setEditingFolder(folder)
            setShowEditFolderModal(true)
          }}
          onDeleteFolder={async (folderId) => {
            if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) return
            
            try {
              const response = await fetch(`/api/folders/${folderId}`, {
                method: 'DELETE'
              })
              
              if (response.ok) {
                await refreshLinks()
                fetchFolders()
                toast.success('Dossier supprimé')
              }
            } catch (error) {
              toast.error('Erreur lors de la suppression')
            }
          }}
          onToggleFolder={async (folderId) => {
            const folder = folders.find(f => f.id === folderId)
            if (!folder) return
            
            try {
              const response = await fetch(`/api/folders/${folderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isExpanded: !folder.isExpanded })
              })
              
              if (response.ok) {
                const updatedFolder = await response.json()
                setFolders(folders.map(f => f.id === folderId ? updatedFolder : f))
              }
            } catch (error) {
              toast.error('Erreur lors de la mise à jour')
            }
          }}
        />
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateLinkModal
          isOpen={showCreateModal}
          editingLink={null}
          onClose={() => {
            setShowCreateModal(false)
          }}
          onSuccess={async () => {
            setShowCreateModal(false)
            await refreshLinks()
          }}
        />
      )}
      
      {showEditModal && (
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
            }}
            onLiveUpdate={(linkData) => {
              // Forcer une nouvelle référence pour déclencher le re-render
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

      {/* Move to folder menu */}
      {movingLink && (
        <MoveToFolderMenu
          linkId={movingLink.id}
          currentFolderId={movingLink.folderId}
          onClose={() => setMovingLink(null)}
          onMove={handleMoveLink}
        />
      )}

      {/* Edit folder modal */}
      <EditFolderModal
        isOpen={showEditFolderModal}
        folder={editingFolder}
        onClose={() => {
          setShowEditFolderModal(false)
          setEditingFolder(null)
        }}
        onSave={handleSaveFolder}
      />
    </>
  )
}