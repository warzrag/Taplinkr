'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import bcrypt from 'bcryptjs'

export default function ResetPasswordTemp() {
  const [email] = useState('florent.media2@gmail.com')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage('Le mot de passe doit faire au moins 6 caractères')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/reset-password-temp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          newPassword 
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage('✅ Mot de passe changé avec succès !')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setMessage('❌ ' + data.error)
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center">
            Réinitialisation temporaire
          </h2>
          <p className="text-center text-red-600 mt-2">
            ⚠️ PAGE À SUPPRIMER APRÈS UTILISATION
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email (fixe)
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Changement...' : 'Changer le mot de passe'}
          </button>

          {message && (
            <p className="text-center text-sm mt-4">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}