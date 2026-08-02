'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react'

import { useLinks } from '@/contexts/LinksContext'
import DashboardAtmosphere from '@/components/dashboard/DashboardAtmosphere'
import { reconcileLiveClickCounts } from '@/lib/live-click-counts'
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
  const reduceMotion = useReducedMotion()
  const { personalLinks, loading, refreshLinks, updateLinkOptimistic } = useLinks()
  const [createMode, setCreateMode] = useState<'landing' | 'direct' | null>(null)
  const [showCreatePicker, setShowCreatePicker] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkType | null>(null)
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null)
  const [liveClicks, setLiveClicks] = useState<Record<string, number>>({})
  const [todayClicks, setTodayClicks] = useState<Record<string, number>>({})
  const [clickDeltas, setClickDeltas] = useState<Record<string, number>>({})
  const [clickCountsReady, setClickCountsReady] = useState(false)
  const [todayClicksReady, setTodayClicksReady] = useState(false)
  const liveClicksRef = useRef<Record<string, number>>({})
  const clickCountsInitializedRef = useRef(false)
  const todayClicksInitializedRef = useRef(false)

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
    const controller = new AbortController()

    const loadTodayClicks = async () => {
      try {
        const start = new Date()
        start.setHours(0, 0, 0, 0)
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        const response = await fetch(
          `/api/dashboard/metrics?period=today&start=${encodeURIComponent(start.toISOString())}&timeZone=${encodeURIComponent(timeZone)}`,
          { cache: 'no-store', signal: controller.signal },
        )
        if (!response.ok) return

        const data = await response.json()
        const clicks = data.dailyClicks?.[0]?.clicks || {}
        setTodayClicks(clicks)
        todayClicksInitializedRef.current = true
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      } finally {
        if (!controller.signal.aborted) setTodayClicksReady(true)
      }
    }

    void loadTodayClicks()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    let stopped = false
    let requestInProgress = false
    let refreshTimer: number | undefined
    let unchangedRefreshes = 0
    const animationTimers = new Map<string, number>()

    const scheduleNextRefresh = () => {
      if (stopped) return
      if (refreshTimer) window.clearTimeout(refreshTimer)
      // Stay responsive while a creator is actively watching new traffic, then
      // back off automatically when nothing changes. This keeps the free
      // Firestore quota healthy without losing the live counter experience.
      const delay = unchangedRefreshes < 8 ? 15_000 : 60_000
      refreshTimer = window.setTimeout(refreshClickCounts, delay)
    }

    const refreshClickCounts = async () => {
      if (requestInProgress || document.visibilityState === 'hidden') {
        scheduleNextRefresh()
        return
      }
      requestInProgress = true
      try {
        const response = await fetch('/api/links/click-counts', {
          cache: 'no-store',
        })
        if (!response.ok) {
          if (!stopped) setClickCountsReady(true)
          return
        }
        const data = await response.json()
        const latestCounts: Array<{ id: string; clicks: number }> = data.counts || []
        if (!stopped) {
          const { nextClicks, increases } = reconcileLiveClickCounts(
            latestCounts,
            liveClicksRef.current,
            clickCountsInitializedRef.current,
          )

          unchangedRefreshes = increases.length ? 0 : unchangedRefreshes + 1
          clickCountsInitializedRef.current = true
          liveClicksRef.current = nextClicks
          setLiveClicks(nextClicks)
          setClickCountsReady(true)

          if (increases.length) {
            if (todayClicksInitializedRef.current) {
              setTodayClicks(current => ({
                ...current,
                ...Object.fromEntries(increases.map(item => [
                  item.id,
                  (current[item.id] || 0) + item.delta,
                ])),
              }))
            }
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
        // Keep the last known values and retry silently after the safe delay.
        unchangedRefreshes = Math.max(unchangedRefreshes, 8)
        if (!stopped) setClickCountsReady(true)
      } finally {
        requestInProgress = false
        scheduleNextRefresh()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        unchangedRefreshes = 0
        if (refreshTimer) window.clearTimeout(refreshTimer)
        refreshClickCounts()
      }
    }
    const handleFocus = () => {
      unchangedRefreshes = 0
      if (refreshTimer) window.clearTimeout(refreshTimer)
      refreshClickCounts()
    }

    void refreshClickCounts()
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopped = true
      if (refreshTimer) window.clearTimeout(refreshTimer)
      animationTimers.forEach(timer => window.clearTimeout(timer))
      window.removeEventListener('focus', handleFocus)
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
    <div className="relative min-h-screen overflow-hidden bg-[#08080d] px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <DashboardAtmosphere />
      <div className="relative mx-auto max-w-[1500px]">
        <motion.header initial={reduceMotion ? false : { opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300"><Sparkles className="h-3.5 w-3.5" />Link hub</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Your links</h1>
            <p className="mt-2 text-base text-[#9494a7]">Create link pages or direct redirects.</p>
          </div>
          <motion.button
            whileHover={reduceMotion ? undefined : { y: -2, scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            onClick={() => setShowCreatePicker(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-3 text-sm font-bold shadow-lg shadow-violet-950/35 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Create link
          </motion.button>
        </motion.header>

        <motion.section initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.48 }} className="mt-8 overflow-hidden rounded-[24px] border border-white/[0.075] bg-[#101018]/90 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(item => <div key={item} className="h-[88px] animate-pulse rounded-xl bg-white/[0.035]" />)}
            </div>
          ) : personalLinks.length ? (
            <div className="space-y-2">
              {personalLinks.map((item, index) => {
                const displayedClicks = clickCountsReady
                  ? (liveClicks[item.id] ?? item.clicks ?? 0)
                  : null

                return (
                <motion.article
                  key={item.id}
                  layout
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.045, 0.32), duration: 0.36 }}
                  whileHover={reduceMotion ? undefined : { x: 4, scale: 1.002 }}
                  className="group relative grid min-h-[88px] items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.075] bg-[#0a0a11]/90 px-4 py-3 transition-colors hover:border-violet-400/25 hover:bg-[#0d0d16] sm:grid-cols-[minmax(240px,1fr)_130px_minmax(130px,0.55fr)_190px_132px]"
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-violet-400/0 to-transparent transition-all duration-300 group-hover:via-violet-400/80" />
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
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                      item.isDirect ? 'border-violet-400/10 bg-violet-500/10 text-violet-300' : 'border-sky-400/10 bg-sky-500/10 text-sky-300'
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
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <motion.span
                          key={`${item.id}-${displayedClicks ?? 'loading'}`}
                          initial={clickDeltas[item.id] ? { opacity: 0.35, scale: 0.6, y: 8 } : false}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 480, damping: 22 }}
                          className="text-xl font-bold leading-none"
                        >
                          {displayedClicks === null ? '—' : displayedClicks.toLocaleString('en-US')}
                        </motion.span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#77778a]">total</span>
                      </div>
                      <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-emerald-400/10 px-2 py-1 text-[11px] font-bold text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Today {todayClicksReady ? (todayClicks[item.id] || 0).toLocaleString('en-US') : '—'}
                      </span>
                    </div>
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
                      className={`relative h-7 w-12 rounded-full transition-all duration-300 ${item.isActive ? 'bg-violet-500 shadow-[0_0_18px_rgba(139,92,246,.28)]' : 'bg-[#343443]'}`}
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
                </motion.article>
                )
              })}
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
        </motion.section>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-4 flex items-center gap-2 text-xs text-[#6f6f81]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Click counts update automatically. Status changes are applied immediately.
        </motion.p>
      </div>

      <AnimatePresence>
        {showCreatePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) setShowCreatePicker(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="w-full max-w-xl rounded-3xl border border-[#2a2a38] bg-[#0e0e17] p-5 shadow-2xl sm:p-7"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">Create a new link</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">What do you want to create?</h2>
                <p className="mt-2 text-sm text-[#9292a5]">Choose one option. Each has its own simple editor.</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePicker(false)
                    setCreateMode('landing')
                  }}
                  className="group rounded-2xl border border-[#30303f] bg-white/[0.025] p-5 text-left transition hover:border-violet-400 hover:bg-violet-500/10"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15 text-violet-300 transition group-hover:bg-violet-500 group-hover:text-white">
                    <LayoutGrid className="h-5 w-5" />
                  </span>
                  <span className="mt-5 block text-lg font-black">Landing page</span>
                  <span className="mt-1 block text-sm leading-5 text-[#8f8fa3]">A customizable page with your profile and multiple links.</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePicker(false)
                    setCreateMode('direct')
                  }}
                  className="group rounded-2xl border border-[#30303f] bg-white/[0.025] p-5 text-left transition hover:border-violet-400 hover:bg-violet-500/10"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-white/65 transition group-hover:bg-violet-500 group-hover:text-white">
                    <Link2 className="h-5 w-5" />
                  </span>
                  <span className="mt-5 block text-lg font-black">Direct link</span>
                  <span className="mt-1 block text-sm leading-5 text-[#8f8fa3]">A short URL that redirects visitors to one destination.</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowCreatePicker(false)}
                className="mt-5 w-full rounded-xl border border-[#2b2b39] px-4 py-3 text-sm font-bold text-[#a0a0b2] transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {(createMode || editingLink) && (
        <CreateLinkModal
          isOpen
          initialMode={createMode || 'landing'}
          editingLink={editingLink}
          onClose={() => {
            setCreateMode(null)
            setEditingLink(null)
          }}
          onSuccess={async (savedLink) => {
            if (editingLink?.id && savedLink) {
              updateLinkOptimistic(editingLink.id, savedLink)
            }
            setCreateMode(null)
            setEditingLink(null)
            await refreshLinks()
          }}
        />
      )}
    </div>
  )
}
