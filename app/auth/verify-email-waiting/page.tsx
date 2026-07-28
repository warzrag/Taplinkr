'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function VerifyEmailWaitingPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const deliveryDelayed = searchParams.get('delivery') === 'delayed'
  const [resending, setResending] = useState(false)

  const resendEmail = async () => {
    if (!email) return
    setResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast.error(data.error || 'Unable to send the verification email.')
        return
      }
      toast.success('Verification email sent.')
    } catch {
      toast.error('Unable to connect to the server.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl"
      >
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-12 w-12 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
        <p className="mt-3 text-gray-600">We sent an account verification link to</p>
        <p className="mt-1 break-all font-semibold text-gray-900">
          {email || 'your email address'}
        </p>

        {deliveryDelayed ? (
          <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              Your account was created, but the first email could not be delivered. Use the button below to try again.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Open the email and select <strong>Verify my email</strong>. The link will bring you back to TapLinkr.
            </p>
          </div>
        )}

        <button
          onClick={resendEmail}
          disabled={resending || !email}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
        >
          {resending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <RefreshCw className="h-4 w-4" />}
          {resending ? 'Sending...' : 'Resend email'}
        </button>

        <p className="mt-5 text-sm text-gray-500">
          Didn&apos;t receive it? Check your spam folder first.
        </p>
        <Link
          href="/auth/signin"
          className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          I verified my email — log in
        </Link>
      </motion.div>
    </div>
  )
}
