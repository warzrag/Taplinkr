'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Globe2,
  Link2,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Settings2,
  Users,
} from 'lucide-react'

type Overview = {
  metrics: {
    users: number
    newUsers: number
    links: number
    activeLinks: number
    clicks: number
    views: number
    paidUsers: number
    domains: number
    verifiedDomains: number
  }
  billing: { configured: boolean; secretKey: boolean; webhook: boolean; prices: boolean }
  domains: { configured: boolean }
  recentUsers: Array<{ id: string; email: string; name?: string; username: string; plan: string; emailVerified: boolean; createdAt: string }>
}

const number = new Intl.NumberFormat('en-US')

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/overview', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load admin overview')
      setData(payload)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load admin overview')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  if (loading && !data) {
    return <div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-lg font-semibold">{error}</p>
        <button onClick={load} className="mt-5 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold">Try again</button>
      </div>
    )
  }

  const cards = [
    { label: 'Total users', value: data.metrics.users, hint: `+${data.metrics.newUsers} in 7 days`, icon: Users, color: 'text-sky-300' },
    { label: 'Paid accounts', value: data.metrics.paidUsers, hint: `${data.metrics.users ? Math.round(data.metrics.paidUsers / data.metrics.users * 100) : 0}% conversion`, icon: CreditCard, color: 'text-emerald-300' },
    { label: 'Published links', value: data.metrics.links, hint: `${data.metrics.activeLinks} active`, icon: Link2, color: 'text-violet-300' },
    { label: 'Real clicks', value: data.metrics.clicks, hint: `${number.format(data.metrics.views)} page views`, icon: MousePointerClick, color: 'text-amber-300' },
  ]

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            <Settings2 className="h-4 w-4" /> Operations center
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Admin overview</h1>
          <p className="mt-2 text-sm text-white/45">Users, revenue access, links and infrastructure at a glance.</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/[0.06] disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-[#111119] p-5 shadow-[0_24px_80px_rgba(0,0,0,.18)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/45">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{number.format(card.value)}</p>
              </div>
              <div className={`rounded-xl bg-white/[0.05] p-2.5 ${card.color}`}><card.icon className="h-5 w-5" /></div>
            </div>
            <p className="mt-4 text-xs text-white/35">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-2xl border border-white/10 bg-[#111119]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-semibold">Newest accounts</h2>
              <p className="mt-1 text-xs text-white/40">Latest people who joined Taplinkr</p>
            </div>
            <button onClick={() => router.push('/admin/users')} className="flex items-center gap-2 text-sm font-semibold text-violet-300">View all <ArrowRight className="h-4 w-4" /></button>
          </div>
          <div className="divide-y divide-white/[0.07]">
            {data.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-700 text-sm font-bold">
                  {(user.name || user.email).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{user.name || user.username}</p>
                  <p className="truncate text-xs text-white/40">{user.email}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${user.plan === 'free' ? 'bg-white/5 text-white/45' : 'bg-violet-500/15 text-violet-300'}`}>{user.plan}</span>
                {user.emailVerified && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#111119] p-5">
            <div className="flex items-center gap-3"><Activity className="h-5 w-5 text-emerald-300" /><h2 className="font-semibold">Launch readiness</h2></div>
            <div className="mt-5 space-y-3">
              <Status label="Stripe secret key" ok={data.billing.secretKey} />
              <Status label="Stripe prices" ok={data.billing.prices} />
              <Status label="Stripe webhook" ok={data.billing.webhook} />
              <Status label="Custom-domain automation" ok={data.domains.configured} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#111119] p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-white/45">Custom domains</p><p className="mt-2 text-2xl font-semibold">{data.metrics.verifiedDomains} / {data.metrics.domains}</p></div>
              <Globe2 className="h-7 w-7 text-sky-300" />
            </div>
            <button onClick={() => router.push('/admin/domains')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5">Manage domains <ArrowRight className="h-4 w-4" /></button>
          </section>
        </div>
      </div>
    </div>
  )
}

function Status({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-black/10 px-3.5 py-3">
      <span className="text-sm text-white/60">{label}</span>
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>{ok ? 'Ready' : 'Setup needed'}</span>
    </div>
  )
}
