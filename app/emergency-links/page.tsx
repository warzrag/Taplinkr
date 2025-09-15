'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function EmergencyLinks() {
  const { data: session } = useSession()
  const router = useRouter()
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      fetchLinks()
    }
  }, [session])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/check-links')
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setLinks(data.links || [])
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold">Connectez-vous d'abord</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">🚨 Récupération d'urgence de vos liens</h1>
        
        <div className="bg-yellow-900/50 border border-yellow-600 p-4 rounded-lg mb-6">
          <p className="text-yellow-400">
            Cette page montre TOUS vos liens directement depuis la base de données.
            Vos liens ne sont PAS perdus !
          </p>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <div className="bg-red-900/50 p-4 rounded">
            <p>Erreur : {error}</p>
          </div>
        ) : (
          <div>
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-2">Statistiques</h2>
              <p>Total des liens : <span className="font-bold text-green-400">{links.length}</span></p>
              <p>Total des clics : <span className="font-bold text-blue-400">
                {links.reduce((sum, link) => sum + (link.clicks || 0), 0)}
              </span></p>
            </div>

            <h2 className="text-xl font-semibold mb-4">Vos liens :</h2>
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{link.title || 'Sans titre'}</h3>
                      <p className="text-gray-400">Slug : {link.slug}</p>
                      <p className="text-sm mt-2">
                        Clics : <span className="text-blue-400">{link.clicks || 0}</span> | 
                        Vues : <span className="text-green-400">{link.views || 0}</span> | 
                        MultiLinks : <span className="text-purple-400">{link.multiLinksCount || 0}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-xs ${
                        link.isActive ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {link.isActive ? 'Actif' : 'Inactif'}
                      </span>
                      <div className="mt-2">
                        <a 
                          href={`https://www.taplinkr.com/${link.slug}`}
                          target="_blank"
                          className="text-blue-400 hover:underline text-sm"
                        >
                          Voir le lien →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Retour au dashboard
              </button>
              <button
                onClick={fetchLinks}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                Rafraîchir
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}