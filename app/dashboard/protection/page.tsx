'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Shield, Lock, Unlock, Eye, ArrowLeft, Plus, Settings } from 'lucide-react'

interface Link {
  id: string
  title: string
  slug: string
  isActive: boolean
  isProtected?: boolean
  hint?: string
}

interface ProtectionModalProps {
  isOpen: boolean
  onClose: () => void
  link: Link | null
  onSuccess: () => void
}

function ProtectionModal({ isOpen, onClose, link, onSuccess }: ProtectionModalProps) {
  const [password, setPassword] = useState('')
  const [hint, setHint] = useState('')
  const [maxAttempts, setMaxAttempts] = useState(5)
  const [lockoutDuration, setLockoutDuration] = useState(3600)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (link?.hint) {
      setHint(link.hint)
    }
  }, [link])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!link || !password.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/protection/${link.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password.trim(),
          hint: hint.trim() || undefined,
          maxAttempts,
          lockoutDuration
        })
      })

      if (response.ok) {
        toast.success('Protection configurée avec succès!')
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la configuration')
      }
    } catch (error) {
      toast.error('Erreur lors de la configuration')
    } finally {
      setLoading(false)
      setPassword('')
      setHint('')
    }
  }

  const removeProtection = async () => {
    if (!link) return

    setLoading(true)
    try {
      const response = await fetch(`/api/protection/${link.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Protection supprimée')
        onSuccess()
        onClose()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !link) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Protection - {link.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez un mot de passe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indice (optionnel)
            </label>
            <input
              type="text"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Indice pour aider les utilisateurs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tentatives max
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verrouillage (min)
              </label>
              <input
                type="number"
                min="1"
                value={Math.round(lockoutDuration / 60)}
                onChange={(e) => setLockoutDuration(parseInt(e.target.value) * 60)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            {link.isProtected && (
              <button
                type="button"
                onClick={removeProtection}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Supprimer protection
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Configuration...' : 'Configurer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProtectionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchLinks()
    }
  }, [status, router])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links')
      if (response.ok) {
        const data = await response.json()
        
        // Check protection status for each link
        const linksWithProtection = await Promise.all(
          data.map(async (link: Link) => {
            try {
              const protectionResponse = await fetch(`/api/protection/${link.id}`)
              if (protectionResponse.ok) {
                const protectionData = await protectionResponse.json()
                return {
                  ...link,
                  isProtected: protectionData.isProtected,
                  hint: protectionData.hint
                }
              }
            } catch (error) {
              console.error(`Error checking protection for link ${link.id}:`, error)
            }
            return { ...link, isProtected: false }
          })
        )
        
        setLinks(linksWithProtection)
      }
    } catch (error) {
      console.error('Error fetching links:', error)
      toast.error('Erreur lors du chargement des liens')
    } finally {
      setLoading(false)
    }
  }

  const openProtectionModal = (link: Link) => {
    setSelectedLink(link)
    setShowModal(true)
  }

  const closeModal = () => {
    setSelectedLink(null)
    setShowModal(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Protection des Liens</h1>
              <p className="text-gray-600">
                Protégez vos liens avec un mot de passe
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Liens</p>
                <p className="text-2xl font-bold text-gray-900">{links.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Protégés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {links.filter(link => link.isProtected).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Unlock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Non Protégés</p>
                <p className="text-2xl font-bold text-gray-900">
                  {links.filter(link => !link.isProtected).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Links List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Gestion des protections
            </h3>
          </div>
          
          <div className="p-6">
            {links.length > 0 ? (
              <div className="space-y-4">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        link.isProtected 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {link.isProtected ? <Lock size={20} /> : <Unlock size={20} />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{link.title}</h4>
                        <p className="text-sm text-gray-500">/{link.slug}</p>
                        {link.isProtected && link.hint && (
                          <p className="text-xs text-blue-600">Indice: {link.hint}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        link.isProtected
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {link.isProtected ? 'Protégé' : 'Public'}
                      </span>
                      
                      <button
                        onClick={() => openProtectionModal(link)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title={link.isProtected ? 'Modifier protection' : 'Ajouter protection'}
                      >
                        <Settings size={16} />
                      </button>
                      
                      <a
                        href={`/${link.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Voir le lien"
                      >
                        <Eye size={16} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun lien trouvé
                </h3>
                <p className="text-gray-500">
                  Créez des liens pour pouvoir les protéger.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Protection Modal */}
        <ProtectionModal
          isOpen={showModal}
          onClose={closeModal}
          link={selectedLink}
          onSuccess={fetchLinks}
        />
      </div>
    </div>
  )
}