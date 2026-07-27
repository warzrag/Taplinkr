'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  BarChart3,
  Copy,
  Edit3,
  GripVertical,
  LayoutGrid,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react'

import { useLinks } from '@/contexts/LinksContext'
import { Link as LinkType } from '@/types'

const CreateLinkModal = dynamic(() => import('@/components/CreateLinkModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 grid place-items-center bg-black/70"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" /></div>,
})

function destinationLabel(url?: string | null) {
  if (!url) return 'Destination not set'
  try {
    const parsed = new URL(url)
    return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname === '/' ? '' : parsed.pathname}`
  } catch {
    return url
  }
}

function dashboardLinkName(item: LinkType) {
  return item.internalName?.trim() || item.title
}

export default function LinksDashboard() {
  const { personalLinks, loading, refreshLinks } = useLinks()
  const [createMode, setCreateMode] = useState<'landing' | 'direct' | null>(null)
  const [editingLink, setEditingLink] = useState<LinkType | null>(null)
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null)
  const [liveClicks, setLiveClicks] = useState<Record<string, number>>({})
  const [clickDeltas, setClickDeltas] = useState<Record<string, number>>({})
  const liveClicksRef = useRef<Record<string, number>>({})

  useEffect(() => {
    setLiveClicks(current => {
      const next = { ...current }
      personalLinks.forEach(item => {
        if (next[item.id] === undefined) next[item.id] = item.clicks || 0
      })
      liveClicksRef.current = next
      return next
    })
  }, [personalLinks])

  useEffect(() => {
    let stopped = false
    let requestInProgress = false
    const animationTimers = new Map<string, number>()

    const refreshClickCounts = async () => {
      if (requestInProgress || document.visibilityState === 'hidden') return
      requestInProgress = true
      try {
        const response = await fetch(`/api/links/fast?live=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        })
        if (!response.ok) return
        const data = await response.json()
        const latestLinks: LinkType[] = data.links || data.personalLinks || (Array.isArray(data) ? data : [])
        if (!stopped) {
          const nextClicks = Object.fromEntries(
            latestLinks.map(item => [item.id, item.clicks || 0]),
          )
          const increases = latestLinks
            .map(item => ({
              id: item.id,
              delta: (item.clicks || 0) - (liveClicksRef.current[item.id] ?? (item.clicks || 0)),
            }))
            .filter(item => item.delta > 0)

          liveClicksRef.current = nextClicks
          setLiveClicks(nextClicks)

          if (increases.length) {
            setClickDeltas(current => ({
              ...current,
              ...Object.fromEntries(increases.map(item => [item.id, item.delta])),
            }))
            increases.forEach(item => {
              const existingTimer = animationTimers.get(item.id)
              if (existingTimer) window.clearTimeout(existingTimer)
              animationTimers.set(item.id, window.setTimeout(() => {
                setClickDeltas(current => {
                  const next = { ...current }
                  delete next[item.id]
                  return next
                })
                animationTimers.delete(item.id)
              }, 1400))
            })
          }
        }
      } catch {
        // Keep the last known values and retry silently on the next interval.
      } finally {
        requestInProgress = false
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshClickCounts()
    }
    const interval = window.setInterval(refreshClickCounts, 5000)
    window.addEventListener('focus', refreshClickCounts)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopped = true
      window.clearInterval(interval)
      animationTimers.forEach(timer => window.clearTimeout(timer))
      window.removeEventListener('focus', refreshClickCounts)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const copyUrl = async (slug: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
    toast.success('URL copied')
  }

  const toggleLink = async (item: LinkType) => {
    const response = await fetch('/api/links/toggle', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId: item.id, isActive: !item.isActive }),
    })

    if (!response.ok) {
      toast.error('Unable to update link status')
      return
    }

    toast.success(item.isActive ? 'Link disabled' : 'Link enabled')
    await refreshLinks()
  }

  const deleteLink = async (item: LinkType) => {
    const confirmed = window.confirm(
      `Delete “${item.internalName || item.title}”? This action cannot be undone.`,
    )
    if (!confirmed) return

    setDeletingLinkId(item.id)
    try {
      const response = await fetch(`/api/links/${item.id}`, {
        method: 'DELETE',
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        toast.error(data.error || 'Unable to delete this link')
        return
      }

      localStorage.removeItem('links-cache')
      localStorage.removeItem('dashboard-stats')
      if (editingLink?.id === item.id) setEditingLink(null)
      toast.success('Link deleted')
      await refreshLinks()
    } catch {
      toast.error('Unable to delete this link')
    } finally {
      setDeletingLinkId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-8 text-white sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Links</h1>
            <p className="mt-2 text-base text-[#9494a7]">Create link pages or direct redirects.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCreateMode('landing')}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2c2c3a] bg-[#101019] px-4 py-3 text-sm font-semibold transition hover:border-violet-500/50"
            >
              <LayoutGrid className="h-4 w-4" />
              New page
            </button>
            <button
              onClick={() => setCreateMode('direct')}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold transition hover:bg-violet-400"
            >
              <Plus className="h-4 w-4" />
              New direct link
            </button>
          </div>
        </header>

        <section className="mt-10 overflow-hidden rounded-2xl border border-[#252532] bg-[#0e0e16] p-3">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(item => <div key={item} className="h-[88px] animate-pulse rounded-xl bg-white/[0.035]" />)}
            </div>
          ) : personalLinks.length ? (
            <div className="space-y-2">
              {personalLinks.map(item => (
                <article
                  key={item.id}
                  className="group grid min-h-[88px] items-center gap-4 rounded-xl border border-[#282835] bg-[#0b0b12] px-4 py-3 transition hover:border-[#3a3a4a] sm:grid-cols-[minmax(240px,1fr)_130px_minmax(130px,0.55fr)_170px_132px]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <GripVertical className="hidden h-5 w-5 shrink-0 text-[#5e5e70] sm:block" />
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.isActive ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.35)]' : 'bg-[#505060]'}`} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{dashboardLinkName(item)}</p>
                      <button
                        onClick={() => copyUrl(item.slug)}
                        className="mt-1 flex max-w-full items-center gap-1.5 text-left text-sm text-[#8e8ea1] transition hover:text-violet-300"
                      >
                        <span className="truncate">taplinkr.com/{item.slug}</span>
                        <Copy className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                      item.isDirect ? 'bg-violet-500/10 text-violet-300' : 'bg-sky-500/10 text-sky-300'
                    }`}>
                      {item.isDirect ? <Link2 className="h-3.5 w-3.5" /> : <LayoutGrid className="h-3.5 w-3.5" />}
                      {item.isDirect ? 'Direct' : 'Page'}
                    </span>
                  </div>

                  <p className="truncate text-sm text-[#9292a5]">
                    {item.isDirect ? destinationLabel(item.directUrl) : `${item.multiLinks?.length || 0} bouton${(item.multiLinks?.length || 0) > 1 ? 's' : ''}`}
                  </p>

                  <Link
                    href={`/dashboard/analytics/${item.id}`}
                    className={`relative inline-flex items-center gap-2.5 rounded-xl border px-3 py-2 text-[#d6d6e0] transition duration-500 hover:text-violet-200 ${
                      clickDeltas[item.id]
                        ? 'scale-[1.04] border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_28px_rgba(52,211,153,0.22)]'
                        : 'border-violet-500/15 bg-violet-500/[0.07] hover:border-violet-500/35 hover:bg-violet-500/10'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5 shrink-0 text-violet-400" />
                    <motion.span
                      key={`${item.id}-${liveClicks[item.id] ?? item.clicks ?? 0}`}
                      initial={clickDeltas[item.id] ? { opacity: 0.35, scale: 0.6, y: 8 } : false}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 480, damping: 22 }}
                      className="text-xl font-bold leading-none"
                    >
                      {(liveClicks[item.id] ?? item.clicks ?? 0).toLocaleString('en-US')}
                    </motion.span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#89899c]">clicks</span>
                    <AnimatePresence>
                      {clickDeltas[item.id] ? (
                        <motion.span
                          key={`delta-${item.id}-${liveClicks[item.id]}`}
                          initial={{ opacity: 0, y: 4, scale: 0.7 }}
                          animate={{ opacity: 1, y: -18, scale: 1 }}
                          exit={{ opacity: 0, y: -30, scale: 0.85 }}
                          transition={{ duration: 0.55, ease: 'easeOut' }}
                          className="pointer-events-none absolute -right-1 -top-1 rounded-full bg-emerald-400 px-2 py-0.5 text-xs font-black text-emerald-950 shadow-lg shadow-emerald-500/30"
                        >
                          +{clickDeltas[item.id]}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </Link>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleLink(item)}
                      className={`relative h-7 w-12 rounded-full transition ${item.isActive ? 'bg-violet-500' : 'bg-[#343443]'}`}
                      aria-label={item.isActive ? 'Disable link' : 'Enable link'}
                    >
                      <span className={`absolute top-1 h-5 w-5 rounded-full bg-[#0b0b12] transition-transform ${item.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <button
                      onClick={() => setEditingLink(item)}
                      className="rounded-lg p-2 text-[#8d8d9f] transition hover:bg-white/5 hover:text-white"
                      aria-label="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {item.canDelete !== false && (
                      <button
                        onClick={() => deleteLink(item)}
                        disabled={deletingLinkId === item.id}
                        className="rounded-lg p-2 text-[#8d8d9f] transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-wait disabled:opacity-50"
                        aria-label={`Delete ${item.internalName || item.title}`}
                        title="Delete link"
                      >
                        {deletingLinkId === item.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-20 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Link2 className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-xl font-semibold">Create your first link</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8e8ea1]">
                A page groups several buttons. A direct link immediately redirects to a destination.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button onClick={() => setCreateMode('landing')} className="rounded-xl border border-[#30303e] px-4 py-3 text-sm font-semibold hover:border-violet-500/50">
                  Create a page
                </button>
                <button onClick={() => setCreateMode('direct')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold hover:bg-violet-400">
                  <Zap className="h-4 w-4" />
                  Create a direct link
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="mt-4 flex items-center gap-2 text-xs text-[#6f6f81]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Click counts update automatically every 5 seconds. Status changes are applied immediately.
        </p>
      </div>

      {(createMode || editingLink) && (
        <CreateLinkModal
          isOpen
          initialMode={createMode || 'landing'}
          editingLink={editingLink}
          onClose={() => {
            setCreateMode(null)
            setEditingLink(null)
          }}
          onSuccess={async () => {
            setCreateMode(null)
            setEditingLink(null)
            await refreshLinks()
          }}
        />
      )}
    </div>
  )
}
