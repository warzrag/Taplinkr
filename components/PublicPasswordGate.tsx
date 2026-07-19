'use client'

import { FormEvent, useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'

export default function PublicPasswordGate({ linkId, title, hint }: {
  linkId: string
  title: string
  hint?: string | null
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/protection/${encodeURIComponent(linkId)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Mot de passe incorrect')
        return
      }
      window.location.reload()
    } catch {
      setError('Impossible de vérifier le mot de passe. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 flex items-center justify-center">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Lock aria-hidden="true" />
        </div>
        <h1 className="text-center text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Cette page est protégée par un mot de passe.</p>
        {hint && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Indice : {hint}</p>}
        <label htmlFor="page-password" className="mt-6 block text-sm font-medium text-slate-800">Mot de passe</label>
        <input
          id="page-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <button disabled={loading || !password} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Accéder à la page
        </button>
      </form>
    </main>
  )
}
