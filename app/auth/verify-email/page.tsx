'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de vérification manquant')
      return
    }

    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Email vérifié avec succès !')
        
        // Essayer de se connecter automatiquement avec l'email retourné
        if (data.email) {
          setTimeout(async () => {
            try {
              // Connexion automatique avec juste l'email (sans mot de passe car déjà vérifié)
              const result = await signIn('credentials', {
                email: data.email,
                verified: true,
                redirect: false
              })
              
              if (result?.ok) {
                router.push('/dashboard')
              } else {
                router.push('/auth/signin?verified=true')
              }
            } catch (error) {
              router.push('/auth/signin?verified=true')
            }
          }, 1500)
        } else {
          // Rediriger vers la page de connexion après 3 secondes
          setTimeout(() => {
            router.push('/auth/signin?verified=true')
          }, 3000)
        }
      } else {
        setStatus('error')
        setMessage(data.message || 'Erreur lors de la vérification')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erreur de connexion au serveur')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          {/* Icon */}
          {status === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6"
            >
              <Loader2 className="w-20 h-20 text-blue-600" />
            </motion.div>
          )}
          
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
          )}
          
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-12 h-12 text-red-600" />
            </motion.div>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {status === 'loading' && 'Vérification en cours...'}
            {status === 'success' && 'Email vérifié !'}
            {status === 'error' && 'Échec de la vérification'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-8">{message}</p>

          {/* Actions */}
          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Redirection automatique dans 3 secondes...
              </p>
              <Link href="/auth/signin">
                <motion.button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Se connecter maintenant
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  Le lien a peut-être expiré ou a déjà été utilisé.
                </p>
              </div>
              
              <Link href="/auth/resend-verification">
                <motion.button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-4 h-4" />
                  Renvoyer l'email
                </motion.button>
              </Link>
              
              <Link href="/auth/signin">
                <button className="w-full text-gray-600 hover:text-gray-900 font-medium">
                  Retour à la connexion
                </button>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}