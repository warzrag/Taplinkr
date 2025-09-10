'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AlertCircle, Database, Search, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EmergencyDataPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')

  const checkData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/emergency-check')
      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error || 'Erreur de vérification')
      }
      
      setData(result)
      
      // Alertes
      if (result.links.total === 0) {
        toast.error('Aucun lien trouvé dans la base de données!')
      } else {
        toast.success(`${result.links.total} liens trouvés`)
      }
      
    } catch (err) {
      setError(err.message)
      toast.error('Erreur lors de la vérification')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      checkData()
    }
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Connexion requise</h1>
          <p>Connectez-vous pour vérifier vos données</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-red-900">
                🚨 Vérification d'urgence des données
              </h1>
              <p className="text-red-700 mt-1">
                Cette page vérifie l'intégrité de vos données
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={checkData}
          disabled={loading}
          className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Revérifier
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Informations utilisateur */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Utilisateur actuel
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">ID</p>
                  <p className="font-mono text-sm">{data.currentUser.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p>{data.currentUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Username</p>
                  <p>{data.currentUser.username}</p>
                </div>
                <div>
                  <p className="text-gray-600">Créé le</p>
                  <p>{new Date(data.currentUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Statistiques</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {data.links.total}
                  </p>
                  <p className="text-gray-600">Liens trouvés</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {data.currentUser.foldersCount}
                  </p>
                  <p className="text-gray-600">Dossiers</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {data.recentClicks.length}
                  </p>
                  <p className="text-gray-600">Clics récents</p>
                </div>
              </div>
            </div>

            {/* Liens trouvés */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Liens trouvés ({data.links.total})
              </h2>
              
              {data.links.allFound.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3" />
                  <p>Aucun lien trouvé dans la base de données</p>
                  <p className="text-sm mt-1">Vos liens ont peut-être été supprimés ou migrés</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.links.allFound.map((link: any) => (
                    <div key={link.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{link.title}</h3>
                          <p className="text-sm text-gray-600">/{link.slug}</p>
                          <p className="text-xs text-gray-500">
                            Créé le {new Date(link.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {link.clicks} clics
                          </p>
                          <p className="text-xs text-gray-500">
                            {link.isActive ? '✅ Actif' : '❌ Inactif'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Utilisateurs possibles */}
            {data.possibleDuplicateUsers.length > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-yellow-900">
                  ⚠️ Comptes multiples détectés
                </h2>
                <p className="text-yellow-700 mb-3">
                  Plusieurs comptes avec le même email/username ont été trouvés :
                </p>
                <div className="space-y-2">
                  {data.possibleDuplicateUsers.map((user: any) => (
                    <div key={user.id} className="bg-white p-3 rounded border">
                      <p className="font-mono text-sm">{user.id}</p>
                      <p>{user.email} - @{user.username}</p>
                      <p className="text-xs text-gray-500">
                        Créé le {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Info */}
            <details className="bg-gray-100 rounded-lg p-6">
              <summary className="cursor-pointer font-semibold">
                🔧 Informations de debug
              </summary>
              <pre className="mt-4 text-xs overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}