'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Shield, Folder, Share2, Check, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [folders, setFolders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [stats, setStats] = useState({ total: 0, shared: 0, notShared: 0 })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
    } else {
      loadFolders()
    }
  }, [session, status, router])

  const loadFolders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data)

        // Calculer les stats
        const total = data.length
        const shared = data.filter((f: any) => f.teamShared).length
        const notShared = total - shared
        setStats({ total, shared, notShared })
      }
    } catch (error) {
      console.error('Erreur chargement dossiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const shareAllFolders = async () => {
    try {
      setSharing(true)
      const response = await fetch('/api/folders/share-all', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        loadFolders() // Recharger pour voir les changements
      } else {
        toast.error(data.error || 'Erreur lors du partage')
      }
    } catch (error) {
      toast.error('Erreur lors du partage des dossiers')
    } finally {
      setSharing(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Panneau Admin</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gestion des dossiers d'équipe</p>
          </div>
        </div>

        {/* Stats des dossiers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Folder className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Dossiers</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Partagés</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.shared}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Non partagés</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.notShared}</p>
          </div>
        </div>

        {/* Action de partage */}
        {stats.notShared > 0 && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Partager avec l'équipe
                </h3>
                <p className="text-indigo-100 text-sm">
                  Vous avez {stats.notShared} dossier{stats.notShared > 1 ? 's' : ''} non partagé{stats.notShared > 1 ? 's' : ''}. Partagez-les avec votre équipe en un clic.
                </p>
              </div>
              <button
                onClick={shareAllFolders}
                disabled={sharing}
                className="w-full sm:w-auto px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {sharing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"></div>
                    Partage...
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    Tout partager
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Liste des dossiers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mes dossiers</h2>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Aucun dossier trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        folder.teamShared
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        <span className="text-xl">{folder.icon || '📁'}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {folder.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {folder.teamShared ? (
                          <>
                            <Check className="w-3 h-3 text-green-600" />
                            Partagé
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-orange-600" />
                            Non partagé
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info admin */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations</h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">Email:</strong> {session.user.email}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">Rôle:</strong> {session.user.role}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong className="text-gray-900 dark:text-white">Plan:</strong> {session.user.plan}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}