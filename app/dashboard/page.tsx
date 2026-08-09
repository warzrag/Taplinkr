'use client'

import dynamic from 'next/dynamic'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Activity,
  BarChart3,
  Bot,
  Clock3,
  ExternalLink,
  Link2,
  MousePointerClick,
  Percent,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useLinks } from '@/contexts/LinksContext'
import { useProfile } from '@/contexts/ProfileContext'
import DashboardAtmosphere from '@/components/dashboard/DashboardAtmosphere'

const CreateLinkModal = dynamic(() => import('@/components/CreateLinkModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 grid place-items-center bg-black/70"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" /></div>,
})

const cardClass = 'rounded-[22px] border border-white/[0.075] bg-dash-raised/90 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl'
type Period = 'today' | '7d' | '30d'

interface DashboardMetrics {
  realClicks: number
  uniqueVisitors: number
  pageViews: number
  visitsWithClick: number
  clickThroughRate: number
  botsFiltered: number
  changes: Record<'realClicks' | 'uniqueVisitors' | 'clickThroughRate' | 'botsFiltered', number>
  dailyClicks: Array<{ date: string; clicks: Record<string, number>; total: number }>
  hourlyClicks: Array<{ hour: number; clicks: number }>
  topLinks: Array<{ id: string; name: string; slug: string; clicks: number; previousClicks: number }>
  recentActivity: Array<{
    id: string
    linkId: string
    linkName: string
    createdAt: string
    country: string | null
    device: string | null
  }>
}

const emptyMetrics: DashboardMetrics = {
  realClicks: 0,
  uniqueVisitors: 0,
  pageViews: 0,
  visitsWithClick: 0,
  clickThroughRate: 0,
  botsFiltered: 0,
  changes: { realClicks: 0, uniqueVisitors: 0, clickThroughRate: 0, botsFiltered: 0 },
  dailyClicks: [],
  hourlyClicks: Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0 })),
  topLinks: [],
  recentActivity: [],
}

const periodLabels: Record<Period, string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
}

function Trend({ value, negativeIsGood = false }: { value: number; negativeIsGood?: boolean }) {
  if (value === 0) return <span className="text-xs font-bold text-dash-text6">0%</span>

  const rising = value >= 0
  const positive = negativeIsGood ? !rising : rising
  const Icon = rising ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 1 })}%
    </span>
  )
}

function TrafficChart({ values, period }: { values: number[]; period: Period }) {
  const max = Math.max(1, ...values)
  const total = values.reduce((sum, value) => sum + value, 0)
  const width = 800
  const height = 200
  const chartTop = 10
  const chartBottom = 190
  const usableHeight = chartBottom - chartTop

  // Les lignes de repere et leurs etiquettes sont calculees a partir des memes
  // constantes, pour qu'elles ne puissent pas se desaligner.
  const gridRows = [0, 1, 2, 3].map(row => {
    const y = chartTop + (usableHeight / 3) * row
    return { y, pct: (y / height) * 100, value: Math.round((max * (3 - row)) / 3) }
  })

  // Etiquettes horizontales : pour "today", l'index est l'heure.
  const hourName = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }
  const lastIndex = Math.max(1, values.length - 1)
  const xLabels = period === 'today'
    ? [
        ...[0, 6, 12, 18]
          .filter(hour => hour < values.length)
          .map(hour => ({ pct: (hour / lastIndex) * 100, label: hourName(hour) }))
          // on ecarte celles qui tomberaient sur "Now"
          .filter(item => item.pct < 86),
        { pct: 100, label: 'Now' },
      ]
    : [
        { pct: 0, label: periodLabels[period] },
        { pct: 100, label: 'Today' },
      ]
  const points = values.map((value, index) => ({
    x: values.length <= 1 ? width / 2 : (index / (values.length - 1)) * width,
    y: chartBottom - (value / max) * usableHeight,
    value,
  }))
  const linePath = points.length
    ? `M ${points.map(point => `${point.x} ${point.y}`).join(' L ')}`
    : `M 0 ${chartBottom} L ${width} ${chartBottom}`
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`
    : `M 0 ${chartBottom} L ${width} ${chartBottom} Z`

  return (
    <div className="mt-5 flex gap-2.5" aria-label={`${total} real clicks in ${periodLabels[period].toLowerCase()}`}>
      {/* Echelle verticale : sans elle, les lignes en pointilles ne voulaient rien dire. */}
      <div className="relative h-[200px] w-10 shrink-0">
        {gridRows.map(row => (
          <span
            key={row.y}
            className="absolute right-0 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium tabular-nums text-dash-text6"
            style={{ top: `${row.pct}%` }}
          >
            {row.value.toLocaleString('en-US')}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
      <div className="relative h-[200px] rounded-2xl border border-white/[0.045] bg-gradient-to-b from-white/[0.025] to-transparent">
        <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img">
          <defs>
            <linearGradient id="trafficArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#9b7cff" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="trafficLine" x1="0" x2="1">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="45%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f0abfc" />
            </linearGradient>
            <filter id="trafficGlow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {gridRows.map(row => (
            <line key={row.y} x1="0" x2={width} y1={row.y} y2={row.y} stroke="white" strokeOpacity="0.055" strokeDasharray="5 8" />
          ))}
          <motion.path key={`area-${period}-${values.join('-')}`} d={areaPath} fill="url(#trafficArea)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} />
          <motion.path
            key={`line-${period}-${values.join('-')}`}
            d={linePath}
            fill="none"
            stroke="url(#trafficLine)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#trafficGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </svg>

        {/* Les points sont poses en HTML et non en SVG : le graphique est etire
            horizontalement (preserveAspectRatio="none"), ce qui transformait les
            cercles SVG en ovales. Le reperage est le meme, donc ils restent alignes. */}
        {points.map((point, index) => point.value > 0 && (
          <span
            key={index}
            title={`${point.value.toLocaleString('en-US')} click${point.value === 1 ? '' : 's'}`}
            className="absolute h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300 ring-[3px] ring-dash-overlay"
            style={{ left: `${(point.x / width) * 100}%`, top: `${(point.y / height) * 100}%` }}
          />
        ))}
      </div>

      {/* Echelle horizontale : il n'y avait que deux reperes pour 24 points. */}
      <div className="relative mt-2.5 h-4 text-[11px] font-medium text-dash-text6">
        {xLabels.map(item => (
          <span
            key={item.label}
            className="absolute whitespace-nowrap"
            style={
              item.pct === 0 ? { left: 0 }
              : item.pct === 100 ? { right: 0 }
              : { left: `${item.pct}%`, transform: 'translateX(-50%)' }
            }
          >
            {item.label}
          </span>
        ))}
      </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const reduceMotion = useReducedMotion()
  const { data: session } = useSession()
  const { refreshLinks } = useLinks()
  const { profile } = useProfile()
  const [createMode, setCreateMode] = useState<'landing' | 'direct' | null>(null)
  const [period, setPeriod] = useState<Period>('today')
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [metricsError, setMetricsError] = useState('')

  const name = profile?.name || session?.user?.name || session?.user?.email?.split('@')[0] || 'creator'

  useEffect(() => {
    let stopped = false
    let requestInProgress = false

    const loadMetrics = async (showLoader = false) => {
      if (requestInProgress || stopped) return
      requestInProgress = true
      if (showLoader) setMetricsLoading(true)
      setMetricsError('')
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        const response = await fetch(
          `/api/dashboard/metrics?period=${period}&timeZone=${encodeURIComponent(timeZone)}`,
          { cache: 'no-store' },
        )
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Unable to load overview')
        if (!stopped) setMetrics({ ...emptyMetrics, ...data })
      } catch (error) {
        if (!stopped) setMetricsError(error instanceof Error ? error.message : 'Unable to load overview')
      } finally {
        requestInProgress = false
        if (!stopped) setMetricsLoading(false)
      }
    }

    void loadMetrics(true)
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void loadMetrics(false)
    }, 300_000)
    const handleFocus = () => void loadMetrics(false)
    window.addEventListener('focus', handleFocus)

    return () => {
      stopped = true
      window.clearInterval(timer)
      window.removeEventListener('focus', handleFocus)
    }
  }, [period])

  const chartValues = useMemo(
    () => period === 'today'
      ? metrics.hourlyClicks.slice(0, new Date().getHours() + 1).map(item => item.clicks)
      : metrics.dailyClicks.map(item => item.total),
    [metrics.dailyClicks, metrics.hourlyClicks, period],
  )
  const maxTopClicks = Math.max(1, ...metrics.topLinks.map(link => link.clicks))
  const stats = [
    // Ces 4 mesures sont de meme nature : elles se ressemblent volontairement.
    // La seule couleur porteuse de sens est celle de la variation (vert / rouge).
    { key: 'realClicks' as const, label: 'Real clicks', note: 'Verified actions', value: metrics.realClicks, suffix: '', icon: MousePointerClick },
    { key: 'uniqueVisitors' as const, label: 'Unique visitors', note: 'People reached', value: metrics.uniqueVisitors, suffix: '', icon: Users },
    { key: 'clickThroughRate' as const, label: 'Conversion rate', note: 'Views that clicked', value: metrics.clickThroughRate, suffix: '%', icon: Percent },
    { key: 'botsFiltered' as const, label: 'Bots filtered', note: 'Noise removed', value: metrics.botsFiltered, suffix: '', icon: Bot, negativeIsGood: true },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-dash-bg px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <DashboardAtmosphere />
      <div className="relative mx-auto max-w-[1500px]">
        <motion.header initial={reduceMotion ? false : { opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300"><Sparkles className="h-3.5 w-3.5" />Overview</p>
            {/* Un salut n'apporte aucune information : il ne doit pas etre l'element
                le plus gros d'un tableau de bord. Les chiffres passent devant. */}
            <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.03em] sm:text-[1.75rem]">Good to see you, {name}</h1>
            <p className="mt-1.5 text-sm text-dash-text5">Your real traffic and link performance at a glance.</p>
          </div>
          <div className="inline-flex self-start rounded-2xl border border-white/[0.08] bg-dash-raised/80 p-1.5 shadow-xl backdrop-blur-xl sm:self-auto">
            {([['today', 'Today'], ['7d', '7 days'], ['30d', '30 days']] as Array<[Period, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`relative rounded-xl px-3.5 py-2 text-sm font-bold transition ${period === value ? 'text-white' : 'text-dash-text5 hover:text-white'}`}
              >
                {period === value && <motion.span layoutId="active-period" className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-b from-violet-500 to-violet-600 shadow-lg shadow-violet-950/40" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </motion.header>

        {metricsError && <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{metricsError}</div>}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.article key={stat.key} initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07, duration: 0.45 }} whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }} className={`${cardClass} group relative overflow-hidden p-4 transition-colors hover:border-white/[0.13]`}>
              <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-dash-text4">{stat.label}</p>
                  <p className="mt-1 text-[11px] font-medium text-white/35">{stat.note}</p>
                  <AnimatePresence mode="wait"><motion.p key={`${stat.key}-${stat.value}-${metricsLoading}`} initial={reduceMotion ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -6 }} className="mt-3 text-3xl font-black tracking-[-0.04em] tabular-nums">
                    {metricsLoading ? '—' : `${stat.value.toLocaleString('en-US', { maximumFractionDigits: 1 })}${stat.suffix}`}
                  </motion.p></AnimatePresence>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/[0.07] bg-black/20 shadow-inner"><stat.icon className="h-5 w-5 text-dash-text4" /></span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Trend value={metrics.changes[stat.key]} negativeIsGood={stat.negativeIsGood} />
                <span className="text-xs text-dash-text6">vs previous period</span>
              </div></div>
            </motion.article>
          ))}
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <motion.article layout className={`${cardClass} relative overflow-hidden p-5`}>
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.07] blur-3xl" />
            <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {/* "Traffic pulse" ne disait pas ce qui etait mesure. */}
                <h2 className="flex items-center gap-2 text-lg font-bold"><Activity className="h-5 w-5 text-violet-300" />{period === 'today' ? 'Clicks per hour' : 'Clicks per day'}</h2>
                <p className="mt-1 text-sm text-dash-text6">Verified clicks · {periodLabels[period].toLowerCase()}</p>
              </div>
              {/* Le total et le nombre de vues portaient deux noms differents pour
                  une meme valeur. Chacun est maintenant explicitement etiquete. */}
              <div className="flex gap-6 text-right">
                <div>
                  <p className="text-2xl font-black tabular-nums">{metrics.realClicks.toLocaleString('en-US')}</p>
                  <p className="text-xs text-dash-text6">clicks</p>
                </div>
                <div>
                  <p className="text-2xl font-black tabular-nums text-dash-text4">{metrics.pageViews.toLocaleString('en-US')}</p>
                  <p className="text-xs text-dash-text6">page views</p>
                </div>
              </div>
            </div>
            {metricsLoading ? <div className="mt-5 h-[226px] animate-pulse rounded-2xl bg-white/[0.025]" /> : <TrafficChart values={chartValues} period={period} />}
            </div>
          </motion.article>

          <motion.aside initial={reduceMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className={`${cardClass} overflow-hidden p-5`}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-dash-text6">Quick actions</p>
            <div className="mt-5 space-y-3">
              <motion.button whileHover={reduceMotion ? undefined : { scale: 1.02 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }} onClick={() => setCreateMode('direct')} className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-3 text-left text-sm font-bold shadow-lg shadow-violet-950/30 transition hover:brightness-110">
                <Zap className="h-4 w-4" /><span className="flex-1">Create direct link</span><ArrowRight className="h-4 w-4" />
              </motion.button>
              <button onClick={() => setCreateMode('landing')} className="flex w-full items-center gap-3 rounded-xl border border-dash-line2 px-4 py-3 text-left text-sm font-bold transition hover:border-violet-500/50 hover:bg-violet-500/5">
                <Plus className="h-4 w-4" /><span className="flex-1">Create landing page</span><ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/dashboard/visitors" className="flex w-full items-center gap-3 rounded-xl border border-dash-line2 px-4 py-3 text-left text-sm font-bold transition hover:border-violet-500/50 hover:bg-violet-500/5">
                <BarChart3 className="h-4 w-4" /><span className="flex-1">Open click log</span><ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 flex gap-3 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.055] px-4 py-3 text-xs leading-5 text-emerald-100/70">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><span>Real traffic only. Bot and preview activity is filtered before these numbers are shown.</span>
            </div>
          </motion.aside>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <article className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-dash-line px-5 py-4">
              <div><h2 className="font-bold">Top performing links</h2><p className="mt-1 text-xs text-dash-text6">Ranked by real clicks</p></div>
              <Link href="/dashboard/links" className="text-xs font-bold text-violet-400 hover:text-violet-300">View links</Link>
            </div>
            {metrics.topLinks.length ? (
              <div className="divide-y divide-dash-line">
                {metrics.topLinks.map((item, index) => {
                  const change = item.previousClicks === 0 ? (item.clicks ? 100 : 0) : ((item.clicks - item.previousClicks) / item.previousClicks) * 100
                  return (
                    <motion.div key={item.id} whileHover={reduceMotion ? undefined : { x: 4 }}><Link href={`/dashboard/analytics/${item.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/[0.025]">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.035] text-xs font-black text-dash-text5">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-bold">{item.name}</p><Trend value={change} /></div>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]"><motion.div initial={{ width: 0 }} animate={{ width: `${(item.clicks / maxTopClicks) * 100}%` }} transition={{ duration: 0.7, delay: index * 0.08 }} className="h-full rounded-full bg-violet-400" /></div>
                        <p className="mt-1.5 truncate text-[11px] text-dash-text6">/{item.slug}</p>
                      </div>
                      <p className="text-sm font-black tabular-nums">{item.clicks.toLocaleString('en-US')}</p>
                    </Link></motion.div>
                  )
                })}
              </div>
            ) : <div className="px-5 py-12 text-center text-sm text-dash-text6">No real clicks during this period.</div>}
          </article>

          <article className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-dash-line px-5 py-4">
              <div><h2 className="font-bold">Recent activity</h2><p className="mt-1 text-xs text-dash-text6">Latest verified clicks</p></div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Live</span>
            </div>
            {metrics.recentActivity.length ? (
              <div className="divide-y divide-dash-line">
                {metrics.recentActivity.map(activity => (
                  <motion.div key={activity.id} initial={reduceMotion ? false : { opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/[0.02]">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-400"><Link2 className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{activity.linkName}</p><p className="mt-1 truncate text-[11px] text-dash-text6">{[activity.device, activity.country].filter(Boolean).join(' · ') || 'Verified visitor'}</p></div>
                    <span className="inline-flex items-center gap-1 text-[10px] text-dash-text6"><Clock3 className="h-3 w-3" />{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(activity.createdAt))}</span>
                  </motion.div>
                ))}
              </div>
            ) : <div className="px-5 py-12 text-center text-sm text-dash-text6">No recent activity for this period.</div>}
          </article>
        </section>

        <p className="mt-5 text-center text-[11px] text-dash-text6">Numbers refresh automatically every 5 minutes and when you return to this tab.</p>
      </div>

      {createMode && (
        <CreateLinkModal
          isOpen
          initialMode={createMode}
          onClose={() => setCreateMode(null)}
          onSuccess={async () => {
            setCreateMode(null)
            await refreshLinks()
          }}
        />
      )}
    </div>
  )
}
