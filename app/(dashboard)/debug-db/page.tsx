'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Database, User, Link2, MousePointer, Folder } from 'lucide-react'

export default function DebugDBPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/debug-db')
      if (!response.ok) throw new Error('Erreur de récupération')
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Database className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Debug Database</h1>
              {data && (
                <span className="text-sm text-gray-500">
                  Dernière mise à jour: {new Date(data.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="text-sm">Auto-refresh</span>
              </label>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value={2}>2s</option>
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                </select>
              )}
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stats */}
          {data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg"
              >
                <User className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-900">{data.counts.users}</p>
                <p className="text-sm text-blue-700">Utilisateurs</p>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg"
              >
                <Link2 className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-900">{data.counts.links}</p>
                <p className="text-sm text-green-700">Liens</p>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg"
              >
                <Folder className="w-6 h-6 text-purple-600 mb-2" />
                <p className="text-2xl font-bold text-purple-900">{data.counts.multiLinks}</p>
                <p className="text-sm text-purple-700">Multi-liens</p>
              </motion.div>
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg"
              >
                <MousePointer className="w-6 h-6 text-orange-600 mb-2" />
                <p className="text-2xl font-bold text-orange-900">{data.counts.clicks}</p>
                <p className="text-sm text-orange-700">Clics</p>
              </motion.div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">Erreur: {error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Utilisateurs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Utilisateurs ({data.users.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Username</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vérifié</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Créé le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((user: any) => (
                      <tr key={user.id} className="border-t">
                        <td className="px-4 py-2 text-sm">{user.email}</td>
                        <td className="px-4 py-2 text-xs font-mono text-gray-500">{user.id}</td>
                        <td className="px-4 py-2 text-sm">{user.username || '-'}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {user.emailVerified ? 'Oui' : 'Non'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Liens par utilisateur */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Liens par utilisateur</h2>
              <div className="space-y-2">
                {data.linksByUser.map((item: any) => (
                  <div key={item.user_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.email}</p>
                      <p className="text-xs text-gray-500">{item.user_id}</p>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">{item.link_count} liens</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tous les liens */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-green-600" />
                Tous les liens ({data.links.length})
              </h2>
              <div className="space-y-4">
                {data.links.map((link: any) => (
                  <motion.div 
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{link.title}</h3>
                        <p className="text-sm text-gray-600">Slug: /{link.slug}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>ID: {link.id}</span>
                          <span>User: {link.userId}</span>
                          <span className={link.isActive ? 'text-green-600' : 'text-red-600'}>
                            {link.isActive ? '✓ Actif' : '✗ Inactif'}
                          </span>
                          <span>Multi-liens: {link.multiLinksCount}</span>
                        </div>
                        {link.isDirect && (
                          <p className="text-xs text-blue-600 mt-1">
                            Lien direct → {link.directUrl}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">{link.clicks}</p>
                        <p className="text-xs text-gray-500">clics</p>
                        <p className="text-sm text-gray-500 mt-1">{link.views} vues</p>
                      </div>
                    </div>
                    {(link.profileImage || link.coverImage) && (
                      <div className="mt-3 flex gap-2">
                        {link.profileImage && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Photo profil
                          </span>
                        )}
                        {link.coverImage && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            Couverture
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                {data.links.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Aucun lien trouvé</p>
                )}
              </div>
            </div>

            {/* Multi-liens */}
            {data.multiLinks.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Multi-liens ({data.multiLinks.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.multiLinks.map((ml: any) => (
                    <div key={ml.id} className="border rounded-lg p-3">
                      <p className="font-medium">{ml.title}</p>
                      <p className="text-xs text-gray-500">{ml.url}</p>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>Link: {ml.linkId}</span>
                        <span>{ml.clicks} clics</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sessions actives */}
            {data.sessions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Sessions actives</h2>
                <div className="space-y-2">
                  {data.sessions.map((session: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">User: {session.userId}</span>
                      <span className="text-xs text-green-700">
                        Expire: {new Date(session.expires).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}