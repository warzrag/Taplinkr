'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EmergencyReset() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [securityCode, setSecurityCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleReset = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/emergency-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, securityCode })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      }
    } catch (error) {
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">
            🔐 Réinitialisation d'urgence
          </h1>
          
          <div className="bg-red-900/20 border border-red-600 p-4 rounded mb-6">
            <p className="text-red-400 text-sm">
              ⚠️ Cette page permet de réinitialiser votre mot de passe en urgence.
              Utilisez le code de sécurité : <span className="font-mono font-bold">TAPLINKR-EMERGENCY-2024</span>
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="votre@email.com"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Nouveau mot de passe"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm">Code de sécurité</label>
              <input
                type="text"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Code de sécurité"
              />
            </div>
            
            <button
              onClick={handleReset}
              disabled={loading || !email || !newPassword || !securityCode}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </div>
          
          {result && (
            <div className={`mt-6 p-4 rounded ${result.success ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
              <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                {result.success ? result.message : result.error}
              </p>
              {result.success && (
                <p className="text-green-400 mt-2">
                  Redirection vers la page de connexion dans 3 secondes...
                </p>
              )}
            </div>
          )}
          
          <div className="mt-6 text-center">
            <a href="/auth/signin" className="text-blue-400 hover:underline text-sm">
              Retour à la connexion normale
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}