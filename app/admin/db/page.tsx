'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DatabaseAdmin() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [slug, setSlug] = useState('lauravissantes')
  const [count, setCount] = useState(10)

  // Vérifier les permissions
  if (!session || (session.user as any).role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
        <p>Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    )
  }

  const executeAction = async (action: string, data?: any) => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/db-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data })
      })
      
      const result = await response.json()
      setResult(result)
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Administration Base de Données</h1>
        
        <div className="space-y-6">
          {/* Ajouter des clics de test */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Ajouter des clics de test</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Slug du lien"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="px-4 py-2 bg-gray-700 rounded"
              />
              <input
                type="number"
                placeholder="Nombre de clics"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="px-4 py-2 bg-gray-700 rounded w-32"
              />
            </div>
            <button
              onClick={() => executeAction('ADD_TEST_CLICKS', { slug, count })}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
            >
              Ajouter {count} clics
            </button>
          </div>

          {/* Obtenir les statistiques */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Statistiques actuelles</h2>
            <button
              onClick={() => executeAction('GET_STATS')}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
            >
              Voir les statistiques
            </button>
          </div>

          {/* Réinitialiser tous les clics */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Réinitialiser</h2>
            <p className="text-red-400 mb-4">⚠️ Attention : Cette action supprimera TOUS les clics</p>
            <button
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir réinitialiser TOUS les compteurs ?')) {
                  executeAction('RESET_ALL_CLICKS')
                }
              }}
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
            >
              Réinitialiser tous les compteurs
            </button>
          </div>

          {/* Résultats */}
          {result && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Résultat</h2>
              <pre className="bg-gray-900 p-4 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-8 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Retour au dashboard
        </button>
      </div>
    </div>
  )
}