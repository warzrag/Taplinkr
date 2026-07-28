'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { update } = useSession()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const acceptInvitation = useCallback(async (token: string) => {
    try {
      const response = await fetch(`/api/teams/join/${encodeURIComponent(token)}/accept`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to accept the invitation.')
      }

      setStatus('success')
      setMessage(data.message || 'Team joined successfully!')
      await update()

      setTimeout(() => {
        router.push('/dashboard/team/welcome')
      }, 2000)
    } catch (error: any) {
      console.error('Erreur:', error)
      setStatus('error')
      setMessage(error.message || 'Unable to accept the invitation.')
    }
  }, [router, update])

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Invitation token is missing')
      return
    }

    void acceptInvitation(token)
  }, [acceptInvitation, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Accepting your invitation...
            </h2>
            <p className="text-gray-600">
              Please wait while we add you to the team.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {message}
            </h2>
            <p className="text-gray-600">
              Redirecting you to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Back to dashboard
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
