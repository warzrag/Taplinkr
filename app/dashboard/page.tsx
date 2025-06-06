'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { Plus } from 'lucide-react'
import CreateLinkModal from '@/components/CreateLinkModal'
import EditLinkModal from '@/components/EditLinkModal'
import EditPhonePreview from '@/components/EditPhonePreview'
import DraggableLinkList from '@/components/DraggableLinkList'
import { useLinkUpdate } from '@/contexts/LinkUpdateContext'
import { Link as LinkType } from '@/types'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const { updateLinkInPreview } = useLinkUpdate()
  const [links, setLinks] = useState<LinkType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkType | null>(null)
  const [liveEditingLink, setLiveEditingLink] = useState<LinkType | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLinks()
    }
  }, [status])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links')
      if (response.ok) {
        const data = await response.json()
        setLinks(data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des liens')
    } finally {
      setLoading(false)
    }
  }

  const handleLinksReorder = (newLinks: LinkType[]) => {
    setLinks(newLinks)
  }

  const handleToggle = async (linkId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/links/toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId, isActive })
      })
      
      if (response.ok) {
        setLinks(prev => prev.map(link => 
          link.id === linkId ? { ...link, isActive } : link
        ))
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
        setLinks(prev => prev.filter(link => link.id !== linkId))
        toast.success('Lien supprimé')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un lien</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <DraggableLinkList
          links={links}
          onLinksReorder={handleLinksReorder}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
          onSuccess={() => {
            setShowCreateModal(false)
            fetchLinks()
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
            onSuccess={() => {
              setShowEditModal(false)
              setEditingLink(null)
              setLiveEditingLink(null)
              fetchLinks()
            }}
            onLiveUpdate={(linkData) => {
              setLiveEditingLink(linkData as LinkType)
              if (updateLinkInPreview) updateLinkInPreview(linkData)
            }}
          />
          
          <EditPhonePreview
            isVisible={showEditModal}
            user={{
              name: session?.user?.name || 'Laura',
              username: session?.user?.email?.split('@')[0] || 'laura',
              image: session?.user?.image || null,
              bio: 'gratuit pour les prochaines 24h'
            }}
            links={liveEditingLink ? [liveEditingLink] : []}
          />
        </>
      )}
    </>
  )
}