'use client'

import { useState } from 'react'
import { Folder, Share2, Check } from 'lucide-react'

export default function ShareFoldersPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const shareAllFolders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/folders/share-all', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error) {
      alert('Erreur: ' + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Folder className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Partager les dossiers
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Partagez tous vos dossiers avec votre équipe
              </p>
            </div>
          </div>

          {!result ? (
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
                <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
                  ℹ️ Information
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-400">
                  Cette action partagera TOUS vos dossiers personnels avec votre équipe.
                  Les membres de l'équipe pourront voir et accéder à ces dossiers.
                </p>
              </div>

              <button
                onClick={shareAllFolders}
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Partage en cours...
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    Partager tous mes dossiers
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 dark:text-green-300 text-xl">
                      {result.message}
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Total partagé: {result.totalShared} dossier(s)
                    </p>
                  </div>
                </div>

                {result.folders && result.folders.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                      Dossiers partagés:
                    </p>
                    <div className="space-y-1">
                      {result.folders.map((name: string, i: number) => (
                        <div key={i} className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => window.location.href = '/dashboard/folders'}
                className="w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
              >
                Retour aux dossiers
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
