'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function VerifyEmailWaitingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')
  
  const [checking, setChecking] = useState(false)
  const [resending, setResending] = useState(false)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!email) {
      router.push('/auth/signup')
      return
    }

    // Vérifier toutes les 3 secondes si l'email a été vérifié
    const interval = setInterval(() => {
      checkEmailStatus()
    }, 3000)

    // Vérification initiale
    checkEmailStatus()

    return () => clearInterval(interval)
  }, [email])

  const checkEmailStatus = async () => {
    if (checking || verified) return
    
    setChecking(true)
    try {
      const response = await fetch('/api/auth/check-email-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.verified) {
        setVerified(true)
        toast.success('Email vérifié avec succès!')
        
        // Se connecter automatiquement
        setTimeout(async () => {
          const result = await signIn('credentials', {
            email: email,
            redirect: false
          })
          
          if (result?.ok) {
            router.push('/dashboard')
          } else {
            router.push('/auth/signin?verified=true')
          }
        }, 1500)
      }
    } catch (error) {
      console.error('Erreur vérification:', error)
    } finally {
      setChecking(false)
    }
  }

  const resendEmail = async () => {
    setResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        toast.success('Email de vérification renvoyé!')
      } else {
        toast.error('Erreur lors de l\'envoi')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          {!verified ? (
            <>
              {/* Animation d'email */}
              <motion.div
                className="relative w-24 h-24 mx-auto mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-0 bg-blue-100 rounded-full"></div>
                <Mail className="absolute inset-0 w-12 h-12 m-auto text-blue-600" />
                {checking && (
                  <motion.div
                    className="absolute -bottom-2 -right-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-6 h-6 text-blue-600" />
                  </motion.div>
                )}
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Vérifiez votre boîte mail
              </h1>

              <p className="text-gray-600 mb-2">
                Nous avons envoyé un email de confirmation à
              </p>
              
              <p className="font-semibold text-gray-900 mb-6">
                {email}
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  Cliquez sur le lien dans l'email pour activer votre compte.
                  Cette page se mettra à jour automatiquement.
                </p>
              </div>

              <button
                onClick={resendEmail}
                disabled={resending}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {resending ? 'Envoi en cours...' : 'Renvoyer l\'email'}
              </button>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-3">
                  Email non reçu ? Vérifiez vos spams
                </p>
                <Link href="/auth/signin" className="text-sm text-blue-600 hover:text-blue-700">
                  Retour à la connexion
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* État vérifié */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Email vérifié !
              </h1>

              <p className="text-gray-600 mb-6">
                Redirection vers votre dashboard...
              </p>

              <motion.div
                className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5 }}
                />
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}