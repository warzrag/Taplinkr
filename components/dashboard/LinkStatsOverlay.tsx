'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ExternalLink, Loader2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import {
  TrafficChart,
  Trend,
  dayName,
  hourName,
  periodLabels,
  type ChartPoint,
  type Period,
} from './TrafficChart'

type Metrics = {
  realClicks: number
  uniqueVisitors: number
  clickThroughRate: number
  botsFiltered: number
  changes: Record<'realClicks' | 'uniqueVisitors' | 'clickThroughRate' | 'botsFiltered', number>
  dailyClicks: Array<{ date: string; total: number }>
  hourlyClicks: Array<{ hour: number; clicks: number }>
  recentActivity: Array<{
    id: string
    createdAt: string
    country: string | null
    device: string | null
  }>
}

const empty: Metrics = {
  realClicks: 0,
  uniqueVisitors: 0,
  clickThroughRate: 0,
  botsFiltered: 0,
  changes: { realClicks: 0, uniqueVisitors: 0, clickThroughRate: 0, botsFiltered: 0 },
  dailyClicks: [],
  hourlyClicks: Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0 })),
  recentActivity: [],
}

export type OverlayLink = { id: string; title?: string; internalName?: string; slug?: string }

/**
 * Apercu des statistiques d un seul lien, sans quitter la liste.
 *
 * Interroge la meme route que le dashboard, avec le filtre linkId : les chiffres
 * sont donc calcules exactement de la meme facon. Il n existe pas deux
 * definitions de "clic reel" qui pourraient diverger.
 */
export default function LinkStatsOverlay({
  link,
  onClose,
}: {
  link: OverlayLink | null
  onClose: () => void
}) {
  const reduceMotion = useReducedMotion()
  const [period, setPeriod] = useState<Period>('today')
  const [metrics, setMetrics] = useState<Metrics>(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const name = link?.internalName?.trim() || link?.title || 'This link'

  // Fermeture au clavier, et defilement du fond bloque pendant l ouverture :
  // sans cela la liste glisse derriere le panneau au doigt.
  useEffect(() => {
    if (!link) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [link, onClose])

  useEffect(() => {
    if (!link) return
    let stopped = false
    setLoading(true)
    setError('')

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    fetch(
      `/api/dashboard/metrics?period=${period}&linkId=${encodeURIComponent(link.id)}&timeZone=${encodeURIComponent(timeZone)}`,
      { cache: 'no-store' },
    )
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load this link')
        if (!stopped) setMetrics({ ...empty, ...data })
      })
      .catch(problem => {
        if (!stopped) setError(problem instanceof Error ? problem.message : 'Unable to load this link')
      })
      .finally(() => { if (!stopped) setLoading(false) })

    return () => { stopped = true }
  }, [link, period])

  const chartData = useMemo<ChartPoint[]>(
    () => period === 'today'
      ? metrics.hourlyClicks
          .slice(0, new Date().getHours() + 1)
          .map(item => ({ value: item.clicks, label: hourName(item.hour) }))
      : metrics.dailyClicks.map(item => ({ value: item.total, label: dayName(item.date) })),
    [metrics.dailyClicks, metrics.hourlyClicks, period],
  )

  const tiles = [
    { label: 'Real clicks', value: metrics.realClicks.toLocaleString('en-US'), change: metrics.changes.realClicks, negativeIsGood: false },
    { label: 'Unique visitors', value: metrics.uniqueVisitors.toLocaleString('en-US'), change: metrics.changes.uniqueVisitors, negativeIsGood: false },
    { label: 'Conversion', value: `${metrics.clickThroughRate}%`, change: metrics.changes.clickThroughRate, negativeIsGood: false },
    { label: 'Noise filtered', value: metrics.botsFiltered.toLocaleString('en-US'), change: metrics.changes.botsFiltered, negativeIsGood: true },
  ]

  return (
    <AnimatePresence>
      {link && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Statistics for ${name}`}
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[26px] border border-white/[0.09] bg-dash-raised shadow-[0_40px_120px_rgba(0,0,0,0.6)] sm:rounded-[26px]"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 30 }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-dash-line px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-dash-text">{name}</h2>
                {link.slug && (
                  <a
                    href={`https://taplinkr.com/${link.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-dash-text5 transition hover:text-violet-300"
                  >
                    taplinkr.com/{link.slug}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-dash-line2 text-dash-text4 transition hover:border-violet-500/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="inline-flex rounded-2xl border border-white/[0.08] bg-dash-overlay p-1.5">
                {([['today', 'Today'], ['7d', '7 days'], ['30d', '30 days']] as Array<[Period, string]>).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPeriod(value)}
                    className={`relative rounded-xl px-3.5 py-2 text-sm font-bold transition ${period === value ? 'text-white' : 'text-dash-text5 hover:text-white'}`}
                  >
                    {period === value && (
                      <motion.span
                        layoutId="overlay-period"
                        className="absolute inset-0 rounded-xl bg-gradient-to-b from-violet-500 to-violet-600"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                ))}
              </div>

              {error && (
                <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {tiles.map(tile => (
                  <div key={tile.label} className="rounded-2xl border border-dash-line bg-dash-overlay/60 p-4">
                    <p className="text-xs font-semibold text-dash-text5">{tile.label}</p>
                    <p className="mt-2 text-2xl font-black tabular-nums text-dash-text">
                      {loading ? '—' : tile.value}
                    </p>
                    <div className="mt-1.5">
                      <Trend value={tile.change} negativeIsGood={tile.negativeIsGood} />
                    </div>
                  </div>
                ))}
              </div>

              {loading ? (
                <div className="mt-5 grid h-[236px] place-items-center rounded-2xl border border-dash-line bg-dash-overlay/40">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                </div>
              ) : (
                <TrafficChart data={chartData} period={period} />
              )}

              <h3 className="mt-6 text-sm font-bold text-dash-text2">Latest verified clicks</h3>
              {metrics.recentActivity.length === 0 ? (
                <p className="mt-2 text-sm text-dash-text5">
                  No verified click on this link {periodLabels[period].toLowerCase()}.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-dash-line rounded-2xl border border-dash-line">
                  {metrics.recentActivity.map(item => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <span className="truncate text-dash-text3">
                        {[item.device, item.country].filter(Boolean).join(' · ') || 'Unknown'}
                      </span>
                      <span className="shrink-0 tabular-nums text-dash-text5">
                        {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
