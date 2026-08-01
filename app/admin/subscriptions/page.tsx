'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ExternalLink, Gift, Loader2, RefreshCw, Search, WalletCards } from 'lucide-react'
import toast from 'react-hot-toast'

type Account = {
  id: string
  email: string
  name?: string
  username: string
  plan: string
  planExpiresAt?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: string
  _count?: { links: number }
}

type Payload = {
  users: Account[]
  summary: { free: number; standard: number; premium: number; stripe: number; complimentary: number }
}

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/subscriptions', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load subscriptions')
      setData(payload)
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Unable to load subscriptions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const rows = useMemo(() => (data?.users || []).filter(user => {
    const needle = query.toLowerCase().trim()
    const matchesQuery = !needle || [user.email, user.name, user.username].some(value => value?.toLowerCase().includes(needle))
    const matchesFilter = filter === 'all' || (filter === 'stripe' ? Boolean(user.stripeSubscriptionId) : user.plan === filter)
    return matchesQuery && matchesFilter
  }), [data, query, filter])

  const changePlan = async (user: Account, plan: string) => {
    if (user.stripeSubscriptionId) {
      toast.error('Stripe-managed subscriptions must be changed in Stripe.')
      return
    }
    setUpdating(user.id)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update plan')
      toast.success(`Plan changed to ${plan}`)
      await load()
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Unable to update plan')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Revenue access</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Subscriptions</h1>
          <p className="mt-2 text-sm text-white/45">See paying customers, complimentary access and plan distribution.</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Stripe customers', data?.summary.stripe || 0],
          ['Complimentary', data?.summary.complimentary || 0],
          ['Free', data?.summary.free || 0],
          ['Standard', data?.summary.standard || 0],
          ['Premium', data?.summary.premium || 0],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#111119] p-5">
            <p className="text-sm text-white/45">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#111119]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search account..." className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-violet-500/50" />
          </div>
          <select value={filter} onChange={event => setFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#0d0d14] px-4 py-2.5 text-sm text-white/70 outline-none">
            <option value="all">All plans</option>
            <option value="stripe">Stripe customers</option>
            <option value="free">Free</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/35">
              <tr><th className="px-5 py-3.5">Account</th><th className="px-5 py-3.5">Source</th><th className="px-5 py-3.5">Plan</th><th className="px-5 py-3.5">Links</th><th className="px-5 py-3.5">Expires</th><th className="px-5 py-3.5">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-white/[0.07]">
              {loading && !data ? (
                <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-violet-400" /></td></tr>
              ) : rows.map(user => (
                <tr key={user.id} className="text-sm hover:bg-white/[0.02]">
                  <td className="px-5 py-4"><p className="font-semibold">{user.name || user.username}</p><p className="mt-1 text-xs text-white/40">{user.email}</p></td>
                  <td className="px-5 py-4">
                    {user.stripeSubscriptionId ? <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs text-sky-300"><WalletCards className="h-3.5 w-3.5" /> Stripe</span> : user.plan !== 'free' ? <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300"><Gift className="h-3.5 w-3.5" /> Complimentary</span> : <span className="text-xs text-white/35">Free</span>}
                  </td>
                  <td className="px-5 py-4">
                    <select value={user.plan} disabled={Boolean(user.stripeSubscriptionId) || updating === user.id} onChange={event => void changePlan(user, event.target.value)} className="rounded-lg border border-white/10 bg-[#0d0d14] px-3 py-2 text-xs capitalize outline-none disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="free">Free</option><option value="standard">Standard</option><option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-white/60">{user._count?.links || 0}</td>
                  <td className="px-5 py-4 text-xs text-white/45">{user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString('en-US') : 'No expiry'}</td>
                  <td className="px-5 py-4">{user.stripeCustomerId ? <a href={`https://dashboard.stripe.com/customers/${user.stripeCustomerId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300">Open Stripe <ExternalLink className="h-3.5 w-3.5" /></a> : <span className="text-xs text-white/25">Local account</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
