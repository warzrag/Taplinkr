'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Loader2, RefreshCw, Search, Shield, Tag, UserCheck, UserX, Users } from 'lucide-react'
import toast from 'react-hot-toast'

import PromoCodesManager from '@/components/admin/PromoCodesManager'

type UserRow = {
  id: string
  email: string
  name?: string
  username: string
  role: string
  plan: string
  planExpiresAt?: string
  emailVerified: boolean
  isActive: boolean
  createdAt: string
  _count?: { links: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [promoCodes, setPromoCodes] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [showPromos, setShowPromos] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load users')
      setUsers(payload)
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Unable to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadPromos = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/promo-codes', { cache: 'no-store' })
      if (response.ok) setPromoCodes(await response.json())
    } catch {
      toast.error('Unable to load promo codes')
    }
  }, [])

  useEffect(() => { void loadUsers(); void loadPromos() }, [loadUsers, loadPromos])

  const visibleUsers = useMemo(() => users.filter(user => {
    const needle = query.trim().toLowerCase()
    const matchesSearch = !needle || [user.email, user.name, user.username].some(value => value?.toLowerCase().includes(needle))
    const matchesFilter = filter === 'all' || (filter === 'verified' ? user.emailVerified : filter === 'inactive' ? !user.isActive : user.role === filter || user.plan === filter)
    return matchesSearch && matchesFilter
  }), [users, query, filter])

  const stats = {
    total: users.length,
    active: users.filter(user => user.isActive).length,
    verified: users.filter(user => user.emailVerified).length,
    paid: users.filter(user => user.plan === 'standard' || user.plan === 'premium').length,
  }

  const toggleAccount = async (user: UserRow) => {
    setProcessing(user.id)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update account')
      toast.success(user.isActive ? 'Account suspended' : 'Account activated')
      await loadUsers()
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Unable to update account')
    } finally {
      setProcessing(null)
    }
  }

  const changeRole = async (user: UserRow, role: string) => {
    setProcessing(user.id)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to update role')
      toast.success(`Role changed to ${role}`)
      await loadUsers()
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Unable to update role')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Accounts & access</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Users</h1><p className="mt-2 text-sm text-white/45">Review accounts, verification, access status and administrative roles.</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowPromos(true)} className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold hover:bg-violet-400"><Tag className="h-4 w-4" /> Promo codes</button>
          <button onClick={loadUsers} disabled={loading} className="rounded-xl border border-white/10 p-2.5 text-white/65 hover:bg-white/5" aria-label="Refresh users"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[['Total users', stats.total], ['Active', stats.active], ['Verified', stats.verified], ['Paid access', stats.paid]].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-[#111119] p-5"><p className="text-sm text-white/45">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111119]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name, email or username..." className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-violet-500/50" /></div>
          <select value={filter} onChange={event => setFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#0d0d14] px-4 py-2.5 text-sm text-white/70 outline-none"><option value="all">All users</option><option value="verified">Verified email</option><option value="inactive">Suspended</option><option value="standard">Standard</option><option value="premium">Premium</option><option value="admin">Admins</option><option value="manager">Managers</option></select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/35"><tr><th className="px-5 py-3.5">User</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Plan</th><th className="px-5 py-3.5">Role</th><th className="px-5 py-3.5">Links</th><th className="px-5 py-3.5">Joined</th><th className="px-5 py-3.5">Access</th></tr></thead>
            <tbody className="divide-y divide-white/[0.07]">
              {loading && !users.length ? <tr><td colSpan={7} className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-violet-400" /></td></tr> : visibleUsers.length === 0 ? <tr><td colSpan={7} className="py-16 text-center"><Users className="mx-auto h-9 w-9 text-white/20" /><p className="mt-3 text-sm text-white/40">No matching users.</p></td></tr> : visibleUsers.map(user => (
                <tr key={user.id} className="text-sm hover:bg-white/[0.02]">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-700 font-bold">{(user.name || user.email).slice(0,1).toUpperCase()}</div><div className="min-w-0"><p className="truncate font-semibold">{user.name || user.username}</p><p className="truncate text-xs text-white/40">{user.email}</p></div></div></td>
                  <td className="px-5 py-4"><div className="space-y-1.5"><span className={`block text-xs font-semibold ${user.isActive ? 'text-emerald-300' : 'text-red-300'}`}>{user.isActive ? 'Active' : 'Suspended'}</span><span className={`inline-flex items-center gap-1 text-[11px] ${user.emailVerified ? 'text-sky-300' : 'text-white/30'}`}><CheckCircle2 className="h-3.5 w-3.5" />{user.emailVerified ? 'Email verified' : 'Not verified'}</span></div></td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${user.plan === 'free' ? 'bg-white/5 text-white/40' : 'bg-violet-500/15 text-violet-300'}`}>{user.plan}</span></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-white/25" /><select value={user.role} disabled={processing === user.id} onChange={event => void changeRole(user, event.target.value)} className="rounded-lg border border-white/10 bg-[#0d0d14] px-2.5 py-2 text-xs capitalize outline-none disabled:opacity-40"><option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option></select></div></td>
                  <td className="px-5 py-4 text-white/55">{user._count?.links || 0}</td>
                  <td className="px-5 py-4 text-xs text-white/40">{new Date(user.createdAt).toLocaleDateString('en-US')}</td>
                  <td className="px-5 py-4"><button onClick={() => void toggleAccount(user)} disabled={processing === user.id} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-40 ${user.isActive ? 'border-red-500/20 text-red-300 hover:bg-red-500/10' : 'border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10'}`}>{processing === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}{user.isActive ? 'Suspend' : 'Activate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPromos && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setShowPromos(false)}>
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-2xl" onClick={event => event.stopPropagation()}>
            <PromoCodesManager promoCodes={promoCodes} onRefresh={loadPromos} onClose={() => setShowPromos(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
