'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface PasswordProtectionModalProps {
  linkTitle: string
  hint?: string
  onVerify: (password: string) => Promise<{ success: boolean; error?: string }>
  isLocked?: boolean
  lockedUntil?: Date
}

export default function PasswordProtectionModal({
  linkTitle,
  hint,
  onVerify,
  isLocked,
  lockedUntil
}: PasswordProtectionModalProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError('')

    try {
      const result = await onVerify(password)
      if (!result.success) {
        setError(result.error || 'Mot de passe incorrect')
        setPassword('')
      }
    } catch (error) {
      setError('Erreur lors de la vérification')
    } finally {
      setLoading(false)
    }
  }

  const formatLockTime = (date: Date) => {
    const diff = date.getTime() - Date.now()
    const minutes = Math.ceil(diff / (1000 * 60))
    return minutes > 60 
      ? `${Math.ceil(minutes / 60)} heure(s)`
      : `${minutes} minute(s)`
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Lock Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Contenu protégé
          </h1>
          <p className="text-gray-600">
            Ce lien nécessite un mot de passe pour accéder à "{linkTitle}"
          </p>
        </div>

        {/* Locked State */}
        {isLocked && lockedUntil && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Accès temporairement bloqué</p>
                <p className="text-red-600 text-sm">
                  Réessayez dans {formatLockTime(lockedUntil)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hint */}
          {hint && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                <span className="font-medium">Indice :</span> {hint}
              </p>
            </div>
          )}

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez le mot de passe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              disabled={loading || isLocked}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={loading || isLocked}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm flex items-center space-x-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !password.trim() || isLocked}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Vérification...' : 'Accéder au contenu'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Ce contenu est protégé par son créateur
          </p>
        </div>
      </div>
    </div>
  )
}