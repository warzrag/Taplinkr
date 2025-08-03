'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function DiagnosticPage() {
  const [checks, setChecks] = useState({
    sessionProvider: null,
    prismaConnection: null,
    publicAssets: null,
    apiRoutes: null,
    environment: null
  })

  useEffect(() => {
    // Check if SessionProvider is working
    try {
      const session = require('next-auth/react').useSession
      if (session) {
        setChecks(prev => ({ ...prev, sessionProvider: true }))
      }
    } catch (e) {
      setChecks(prev => ({ ...prev, sessionProvider: false }))
    }

    // Check public assets
    fetch('/final.png')
      .then(res => setChecks(prev => ({ ...prev, publicAssets: res.ok })))
      .catch(() => setChecks(prev => ({ ...prev, publicAssets: false })))

    // Check API routes
    fetch('/api/check-username?username=test')
      .then(res => setChecks(prev => ({ ...prev, apiRoutes: res.ok })))
      .catch(() => setChecks(prev => ({ ...prev, apiRoutes: false })))

    // Check environment variables
    setChecks(prev => ({ 
      ...prev, 
      environment: typeof window !== 'undefined' && window.location.hostname === 'localhost'
    }))
  }, [])

  const getIcon = (status) => {
    if (status === null) return <AlertCircle className="w-5 h-5 text-yellow-500" />
    if (status === true) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Diagnostic de l'application</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span>Session Provider</span>
            {getIcon(checks.sessionProvider)}
          </div>
          
          <div className="flex items-center justify-between">
            <span>Assets publics</span>
            {getIcon(checks.publicAssets)}
          </div>
          
          <div className="flex items-center justify-between">
            <span>Routes API</span>
            {getIcon(checks.apiRoutes)}
          </div>
          
          <div className="flex items-center justify-between">
            <span>Environnement</span>
            {getIcon(checks.environment)}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">Informations système</h2>
          <div className="text-sm text-blue-800 space-y-1">
            <p>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
            <p>Viewport: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}