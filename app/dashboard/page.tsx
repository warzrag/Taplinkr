'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Plus, Folder as FolderIcon, Link2, BarChart3, Crown, Shield } from 'lucide-react'
import CreateLinkModal from '@/components/CreateLinkModal'
import Link from 'next/link'
import EditLinkModal from '@/components/EditLinkModal'
import EditPhonePreview from '@/components/EditPhonePreview'
import DraggableLinkList from '@/components/DraggableLinkList'
import FolderManager from '@/components/FolderManager'
import MoveToFolderMenu from '@/components/MoveToFolderMenu'
import DragDropDashboard from '@/components/DragDropDashboard'
import EditFolderModal from '@/components/EditFolderModal'
import { useLinkUpdate } from '@/contexts/LinkUpdateContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useLinks } from '@/contexts/LinksContext'
import { Link as LinkType } from '@/types'

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

  useEffect(() => {
    if (status === 'authenticated') {
      refreshLinks()
      fetchFolders()
    }
  }, [status]) // refreshLinks retiré des dépendances pour éviter la boucle infinie

  // Filtrer les liens sans dossier depuis le contexte
  const links = contextLinks.filter(link => !link.folderId)

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
    console.log('📁 [DASHBOARD] handleSaveFolder appelé avec:', folderData)
    console.log('📁 [DASHBOARD] Mode:', editingFolder ? 'MODIFICATION' : 'CRÉATION')
    
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
        console.log('📁 [DASHBOARD] Envoi POST vers /api/folders')
        console.log('📁 [DASHBOARD] Body de la requête:', JSON.stringify(folderData))
        
        const response = await fetch('/api/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(folderData)
        })
        
        console.log('📁 [DASHBOARD] Réponse reçue:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
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
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600">Gérez vos liens et consultez vos statistiques</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {/* Bouton Admin - Visible uniquement pour les admins */}
            {(session?.user as any)?.role === 'admin' && (
              <Link href="/admin/users">
                <motion.button
                  className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all w-full sm:w-auto shadow-lg hover:shadow-xl"
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
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all w-full sm:w-auto shadow-lg hover:shadow-xl"
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
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all w-full sm:w-auto shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics des Dossiers</span>
              </motion.button>
            </Link>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
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
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
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
            console.log('📁 [DASHBOARD] Bouton créer dossier cliqué')
            setShowEditFolderModal(true)
            setEditingFolder(null)
            console.log('📁 [DASHBOARD] Modal EditFolderModal ouvert avec editingFolder=null')
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
              setLiveEditingLink(linkData as LinkType)
              if (updateLinkInPreview) updateLinkInPreview(linkData)
            }}
          />
          
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