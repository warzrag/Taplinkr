'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function QuickAddClicks() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [slug, setSlug] = useState('lauravissantes')
  const [count, setCount] = useState(100)

  const addClicks = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/add-clicks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, count })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  if (!session || (session.user as any).role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Accès refusé</h1>
        <p>Vous devez être administrateur.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Ajout rapide de clics (sans Prisma)</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="text-yellow-400 mb-4">
            ⚠️ Cette page utilise l'API REST Supabase directement pour éviter les erreurs du pooler
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Slug du lien</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded"
                placeholder="lauravissantes"
              />
            </div>
            
            <div>
              <label className="block mb-2">Nombre de clics à ajouter</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 rounded"
                min="1"
                max="10000"
              />
            </div>
            
            <button
              onClick={addClicks}
              disabled={loading || !slug}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-semibold disabled:opacity-50"
            >
              {loading ? 'Ajout en cours...' : `Ajouter ${count} clics`}
            </button>
          </div>
          
          {result && (
            <div className={`mt-6 p-4 rounded ${result.success ? 'bg-green-900' : 'bg-red-900'}`}>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              {result.success && (
                <p className="mt-2 text-green-400">
                  ✅ Redirection vers le dashboard dans 2 secondes...
                </p>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-8 space-x-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Retour au dashboard
          </button>
          <button
            onClick={() => router.push('/admin/db')}
            className="px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded"
          >
            Admin DB (avec Prisma)
          </button>
        </div>
      </div>
    </div>
  )
}