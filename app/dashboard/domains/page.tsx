'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'

type DnsRecord = { type: string; name: string; value: string; reason?: string }
type Domain = {
  id: string
  domain: string
  redirectTo?: string
  verified: boolean
  sslEnabled: boolean
  dnsRecords: DnsRecord[]
  createdAt: string
}
type PublicLink = {
  id: string
  slug: string
  title: string
  internalName?: string
  isDirect: boolean
}
type Payload = {
  domains: Domain[]
  links: PublicLink[]
  allowed: boolean
  automationConfigured: boolean
  maxDomains: number
}

export default function CustomDomainsPage() {
  const [data, setData] = useState<Payload | null>(null)
  const [domain, setDomain] = useState('')
  const [linkId, setLinkId] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [working, setWorking] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/domains', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load custom domains.')
      setData(payload)
      setLoadError(null)
      setLinkId(current => current || payload.links?.[0]?.id || '')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load custom domains.'
      setLoadError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const connect = async () => {
    if (!domain.trim() || !linkId) {
      toast.error('Enter your domain and choose its destination.')
      return
    }
    setWorking('create')
    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, linkId }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to connect this domain.')
      setDomain('')
      toast.success('Domain added. Complete the DNS step below.')
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to connect this domain.')
    } finally {
      setWorking(null)
    }
  }

  const verify = async (item: Domain) => {
    setWorking(`verify:${item.id}`)
    try {
      const response = await fetch(`/api/domains/${item.id}/verify`, { method: 'POST' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to verify this domain.')
      if (payload.domain.verified) toast.success('Your domain is live with HTTPS.')
      else toast('DNS is not ready yet. Check the records and try again shortly.')
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to verify this domain.')
    } finally {
      setWorking(null)
    }
  }

  const remove = async (item: Domain) => {
    if (!window.confirm(`Disconnect ${item.domain} from Taplinkr?`)) return
    setWorking(`delete:${item.id}`)
    try {
      const response = await fetch(`/api/domains?id=${encodeURIComponent(item.id)}`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to disconnect this domain.')
      toast.success('Domain disconnected.')
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to disconnect this domain.')
    } finally {
      setWorking(null)
    }
  }

  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value)
    toast.success('Copied')
  }

  if (loading && !data) {
    return <div className="grid min-h-[70vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
  }

  if (!data && loadError) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">Your brand</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Custom domains</h1>
        <div className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/[0.06] p-7">
          <AlertCircle className="h-9 w-9 text-red-300" />
          <h2 className="mt-5 text-xl font-semibold">We couldn't load your custom domains</h2>
          <p className="mt-2 text-sm leading-6 text-white/50">{loadError}</p>
          <button onClick={() => void load()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 dark:bg-white dark:text-black">
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">Your brand</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Custom domains</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">Use a domain you own for one of your Taplinkr pages or direct links. HTTPS is issued automatically after DNS verification.</p>
        </div>
        <button onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {!data?.allowed ? (
        <div className="mt-8 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-7">
          <Globe2 className="h-9 w-9 text-violet-300" />
          <h2 className="mt-5 text-xl font-semibold">Custom domains are included with Premium</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">Upgrade to connect your own domain, remove Taplinkr from the public URL and receive automatic HTTPS.</p>
          <Link href="/dashboard/pricing" className="mt-5 inline-flex rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold hover:bg-violet-400">View Premium</Link>
        </div>
      ) : !data?.automationConfigured ? (
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-6">
          <h2 className="font-semibold text-amber-100">Custom domains are temporarily unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-white/50">The hosting connection still needs to be completed by the Taplinkr administrator.</p>
        </div>
      ) : (
        <section className="mt-8 rounded-3xl border border-white/10 bg-[#111119] p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-300"><Globe2 className="h-5 w-5" /></span>
            <div><h2 className="font-semibold">Connect a domain</h2><p className="mt-1 text-xs text-white/40">You must own the domain and be able to edit its DNS settings.</p></div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <label className="block"><span className="mb-2 block text-xs font-semibold text-white/60">Domain name</span><input value={domain} onChange={event => setDomain(event.target.value)} placeholder="creator.com or links.creator.com" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-violet-500/60" /></label>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-white/60">Open this link</span><select value={linkId} onChange={event => setLinkId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0d0d14] px-4 py-3 text-sm outline-none focus:border-violet-500/60"><option value="">Choose a destination</option>{data.links.map(link => <option key={link.id} value={link.id}>{link.internalName || link.title} — {link.isDirect ? 'Direct link' : 'Landing page'}</option>)}</select></label>
            <button onClick={connect} disabled={working === 'create' || !domain.trim() || !linkId || data.domains.length >= data.maxDomains} className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 text-sm font-semibold hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40">{working === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe2 className="h-4 w-4" />} Connect</button>
          </div>
          <p className="mt-3 text-xs text-white/30">{data.domains.length} of {data.maxDomains} custom domains connected</p>
        </section>
      )}

      <div className="mt-6 space-y-5">
        {data?.domains.map(item => (
          <section key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-[#111119]">
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-center gap-4">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${item.verified ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>{item.verified ? <Check className="h-5 w-5" /> : <Globe2 className="h-5 w-5" />}</span>
                <div className="min-w-0"><h2 className="truncate text-lg font-semibold">{item.domain}</h2><p className="mt-1 text-xs text-white/40">Destination: taplinkr.com/{item.redirectTo}</p></div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${item.verified ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-200'}`}>{item.verified ? 'Live' : 'DNS setup required'}</span>
                {item.sslEnabled && <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300"><ShieldCheck className="h-3.5 w-3.5" /> HTTPS</span>}
                {item.verified && <a href={`https://${item.domain}`} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 p-2 text-white/60 hover:bg-white/5" aria-label="Open domain"><ExternalLink className="h-4 w-4" /></a>}
                <button onClick={() => void remove(item)} disabled={working === `delete:${item.id}`} className="rounded-lg border border-red-500/15 p-2 text-red-300 hover:bg-red-500/10 disabled:opacity-40" aria-label="Disconnect domain">{working === `delete:${item.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
              </div>
            </div>

            {!item.verified && (
              <div className="p-5 sm:p-6">
                <h3 className="text-sm font-semibold">Add these records at your domain provider</h3>
                <p className="mt-1 text-xs leading-5 text-white/40">Remove any existing A, AAAA or CNAME record using the same host before adding the record below. Keep your email MX records unchanged.</p>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-white/35"><tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Value</th><th className="w-12 px-4 py-3" /></tr></thead><tbody className="divide-y divide-white/[0.07]">{item.dnsRecords.map((record, index) => <tr key={`${record.type}:${record.name}:${index}`}><td className="px-4 py-3 font-semibold text-violet-300">{record.type}</td><td className="px-4 py-3 font-mono text-xs">{record.name}</td><td className="max-w-md truncate px-4 py-3 font-mono text-xs text-white/60">{record.value}</td><td className="px-4 py-3"><button onClick={() => void copy(record.value)} className="text-white/40 hover:text-white" aria-label="Copy value"><Copy className="h-4 w-4" /></button></td></tr>)}</tbody></table>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-white/35">DNS changes often appear within minutes but can occasionally take up to 48 hours.</p><button onClick={() => void verify(item)} disabled={working === `verify:${item.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50 dark:bg-white dark:text-black">{working === `verify:${item.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Verify DNS</button></div>
              </div>
            )}
          </section>
        ))}
      </div>

      {data && data.domains.length === 0 && data.allowed && data.automationConfigured && (
        <div className="mt-6 rounded-3xl border border-dashed border-white/10 py-14 text-center"><Globe2 className="mx-auto h-9 w-9 text-white/20" /><p className="mt-4 text-sm font-semibold text-white/60">No custom domain connected yet</p><p className="mt-1 text-xs text-white/30">Connect the first one above.</p></div>
      )}
    </div>
  )
}
