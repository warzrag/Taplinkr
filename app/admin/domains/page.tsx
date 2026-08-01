'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Globe2, Loader2, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

type Domain = {
  id: string
  domain: string
  verified: boolean
  sslEnabled: boolean
  sslExpiry?: string
  redirectTo?: string
  createdAt: string
  user?: { email: string; name?: string; username: string; plan: string }
}

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/domains', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load domains')
      setDomains(payload.domains || [])
      setConfigured(Boolean(payload.automationConfigured))
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Unable to load domains')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const remove = async (domain: Domain) => {
    if (!window.confirm(`Remove the unverified record for ${domain.domain}?`)) return
    setRemoving(domain.id)
    try {
      const response = await fetch(`/api/admin/domains?id=${encodeURIComponent(domain.id)}`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to remove domain')
      toast.success('Domain record removed')
      await load()
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Unable to remove domain')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">Premium infrastructure</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Custom domains</h1><p className="mt-2 text-sm text-white/45">Monitor ownership, DNS verification and HTTPS status.</p></div>
        <button onClick={load} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
      </div>

      <div className={`mt-8 rounded-2xl border p-5 ${configured ? 'border-emerald-500/20 bg-emerald-500/[0.06]' : 'border-amber-500/20 bg-amber-500/[0.06]'}`}>
        <div className="flex gap-3">
          {configured ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />}
          <div><h2 className="font-semibold">{configured ? 'Vercel automation configured' : 'Custom domains are not live yet'}</h2><p className="mt-1 text-sm leading-6 text-white/50">{configured ? 'New domains can be connected to the hosting project and verified automatically.' : 'The database records exist, but Vercel domain attachment and real DNS verification must be completed before customers can use this feature.'}</p></div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111119]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/35"><tr><th className="px-5 py-3.5">Domain</th><th className="px-5 py-3.5">Owner</th><th className="px-5 py-3.5">DNS</th><th className="px-5 py-3.5">HTTPS</th><th className="px-5 py-3.5">Created</th><th className="px-5 py-3.5">Action</th></tr></thead>
            <tbody className="divide-y divide-white/[0.07]">
              {loading && !domains.length ? <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-violet-400" /></td></tr> : domains.length === 0 ? <tr><td colSpan={6} className="py-16 text-center"><Globe2 className="mx-auto h-9 w-9 text-white/20" /><p className="mt-3 text-sm text-white/40">No custom domains have been requested.</p></td></tr> : domains.map(domain => (
                <tr key={domain.id} className="text-sm hover:bg-white/[0.02]">
                  <td className="px-5 py-4"><p className="font-semibold">{domain.domain}</p><p className="mt-1 text-xs text-white/35">{domain.redirectTo || 'No page assigned'}</p></td>
                  <td className="px-5 py-4"><p className="text-white/70">{domain.user?.name || domain.user?.username || 'Unknown'}</p><p className="mt-1 text-xs text-white/35">{domain.user?.email}</p></td>
                  <td className="px-5 py-4"><Badge ok={domain.verified} label={domain.verified ? 'Verified' : 'Pending'} /></td>
                  <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs ${domain.sslEnabled ? 'text-emerald-300' : 'text-white/35'}`}><ShieldCheck className="h-4 w-4" />{domain.sslEnabled ? 'Active' : 'Not issued'}</span></td>
                  <td className="px-5 py-4 text-xs text-white/40">{new Date(domain.createdAt).toLocaleDateString('en-US')}</td>
                  <td className="px-5 py-4"><button onClick={() => void remove(domain)} disabled={domain.verified || domain.sslEnabled || removing === domain.id} title={domain.verified ? 'Disconnect from Vercel first' : 'Remove record'} className="rounded-lg border border-red-500/15 p-2 text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-25">{removing === domain.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ok ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>{label}</span>
}
