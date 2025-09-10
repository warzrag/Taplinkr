'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function DebugPage() {
  const { data: session } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [apiTest, setApiTest] = useState<any>(null)

  useEffect(() => {
    // Collecter les informations de debug
    setDebugInfo({
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      online: navigator.onLine,
      cookies: document.cookie ? 'Activés' : 'Désactivés',
      localStorage: typeof localStorage !== 'undefined' ? 'Disponible' : 'Non disponible',
      sessionUser: session?.user || 'Non connecté'
    })
  }, [session])

  const testAPI = async () => {
    try {
      const res = await fetch('/api/debug')
      const data = await res.json()
      setApiTest(data)
    } catch (error) {
      setApiTest({ error: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Page de Debug TapLinkr</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Informations Client</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔌 Test API</h2>
          <button 
            onClick={testAPI}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 mb-4"
          >
            Tester la connexion API
          </button>
          {apiTest && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">💻 Console de commandes</h2>
          <p className="text-gray-600 mb-4">
            Ouvrez la console du navigateur (F12) et tapez :
          </p>
          <code className="bg-gray-100 p-3 rounded block">
            window.TapLinkrDebug.showInfo()
          </code>
        </div>
      </div>
    </div>
  )
}