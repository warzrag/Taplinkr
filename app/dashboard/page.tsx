'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { Plus } from 'lucide-react'
import CreateLinkModal from '@/components/CreateLinkModal'
import DraggableLinkList from '@/components/DraggableLinkList'
import { Link as LinkType } from '@/types'

export default function Dashboard() {
  const { status } = useSession()
  const [links, setLinks] = useState<LinkType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkType | null>(null)

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
    setShowCreateModal(true)
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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Gérez vos liens et consultez vos statistiques</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un lien</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
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
          editingLink={editingLink}
          onClose={() => {
            setShowCreateModal(false)
            setEditingLink(null)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setEditingLink(null)
            fetchLinks()
          }}
        />
      )}
    </>
  )
}