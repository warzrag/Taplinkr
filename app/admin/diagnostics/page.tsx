'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Database,
  Server,
  Globe,
  Activity,
  Zap,
  Cpu,
  HardDrive,
  Users,
  Link2,
  MousePointer,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DiagnosticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [clientInfo, setClientInfo] = useState<any>({})

  // Vérifier les permissions admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Collecter les infos côté client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setClientInfo({
        url: window.location.href,
        userAgent: navigator.userAgent,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth,
          pixelRatio: window.devicePixelRatio
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        memory: (navigator as any).deviceMemory || 'N/A',
        cores: navigator.hardwareConcurrency || 'N/A',
        localStorage: {
          available: typeof localStorage !== 'undefined',
          items: typeof localStorage !== 'undefined' ? localStorage.length : 0
        },
        sessionStorage: {
          available: typeof sessionStorage !== 'undefined',
          items: typeof sessionStorage !== 'undefined' ? sessionStorage.length : 0
        }
      })

      // Monitoring des erreurs JavaScript
      window.addEventListener('error', (e) => {
        console.error('🔴 Erreur capturée:', e.message, e.filename, e.lineno)
        toast.error(`Erreur JS: ${e.message}`)
      })

      window.addEventListener('unhandledrejection', (e) => {
        console.error('🔴 Promise rejetée:', e.reason)
        toast.error(`Promise rejetée: ${e.reason}`)
      })
    }
  }, [])

  const loadDiagnostics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/system-health')
      const data = await response.json()
      setDiagnostics(data)

      // Test de performance
      const performanceData = await testPerformance()
      setDiagnostics(prev => ({ ...prev, performance: performanceData }))
    } catch (error) {
      console.error('Erreur chargement diagnostics:', error)
      toast.error('Erreur lors du chargement des diagnostics')
    } finally {
      setLoading(false)
    }
  }

  const testPerformance = async () => {
    const tests = {
      api: { name: 'API Links', endpoint: '/api/links' },
      db: { name: 'Database Query', endpoint: '/api/test-db' },
      static: { name: 'Static Assets', endpoint: '/final.png' }
    }

    const results = {}

    for (const [key, test] of Object.entries(tests)) {
      const start = performance.now()
      try {
        await fetch(test.endpoint)
        const end = performance.now()
        results[key] = {
          name: test.name,
          time: Math.round(end - start),
          status: 'success'
        }
      } catch (error) {
        results[key] = {
          name: test.name,
          time: 0,
          status: 'error',
          error: error.message
        }
      }
    }

    return results
  }

  useEffect(() => {
    loadDiagnostics()
  }, [])

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadDiagnostics, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔍 Diagnostics Système</h1>
            <p className="text-gray-600 mt-1">Analyse complète de TapLinkr</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 inline mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={loadDiagnostics}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Base de données</p>
                <p className="text-2xl font-bold">
                  {diagnostics?.database?.status || 'N/A'}
                </p>
              </div>
              <Database className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Utilisateurs</p>
                <p className="text-2xl font-bold">
                  {diagnostics?.database?.stats?.users || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Liens créés</p>
                <p className="text-2xl font-bold">
                  {diagnostics?.database?.stats?.links || 0}
                </p>
              </div>
              <Link2 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Clics totaux</p>
                <p className="text-2xl font-bold">
                  {diagnostics?.database?.stats?.clicks || 0}
                </p>
              </div>
              <MousePointer className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Détails système */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations serveur */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Server className="w-5 h-5 mr-2 text-gray-600" />
              Serveur
            </h2>
            
            {diagnostics?.system && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plateforme</span>
                  <span className="font-medium">{diagnostics.system.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Node.js</span>
                  <span className="font-medium">{diagnostics.system.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CPU</span>
                  <span className="font-medium">{diagnostics.system.cpu.cores} cores</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mémoire utilisée</span>
                  <span className="font-medium">{diagnostics.system.memory.usage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">
                    {Math.round(diagnostics.system.uptime / 60)} minutes
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Informations client */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-gray-600" />
              Client (Vous)
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Écran</span>
                <span className="font-medium">
                  {clientInfo.screen?.width}x{clientInfo.screen?.height}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fenêtre</span>
                <span className="font-medium">
                  {clientInfo.viewport?.width}x{clientInfo.viewport?.height}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Langue</span>
                <span className="font-medium">{clientInfo.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En ligne</span>
                <span className="font-medium">
                  {clientInfo.onLine ? 'Oui' : 'Non'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stockage local</span>
                <span className="font-medium">
                  {clientInfo.localStorage?.items || 0} éléments
                </span>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-gray-600" />
              Performance
            </h2>
            
            {diagnostics?.performance && (
              <div className="space-y-3">
                {Object.entries(diagnostics.performance).map(([key, data]: [string, any]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-600">{data.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {data.time > 0 ? `${data.time}ms` : 'Erreur'}
                      </span>
                      {getStatusIcon(data.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Services externes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-gray-600" />
              Services
            </h2>
            
            {diagnostics?.services && (
              <div className="space-y-3">
                {Object.entries(diagnostics.services).map(([service, data]: [string, any]) => (
                  <div key={service} className="flex justify-between items-center">
                    <span className="text-gray-600 capitalize">{service}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{data.status}</span>
                      {getStatusIcon(data.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Console de debug */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Console de Debug</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-auto">
            <div>
              <span className="text-green-400">TapLinkr@diagnostics</span>
              <span className="text-gray-500">:</span>
              <span className="text-blue-400">~</span>
              <span className="text-gray-500">$</span> system status
            </div>
            <pre className="mt-2 text-xs">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}