'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  BarChart3,
  Bot,
  Download,
  Eye,
  MousePointer2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'react-hot-toast'

import DashboardAtmosphere from '@/components/dashboard/DashboardAtmosphere'

interface ChartPoint {
  date: string
  clicks: number
  views: number
}

interface AnalyticsData {
  summary: ChartPoint[]
  stats: {
    topCountries: Array<[string, number]>
    topSources: Array<[string, number]>
  }
  totals: {
    clicks: number
    views: number
    uniqueVisitors: number
    growthRate: number
    filteredClicks: number
    botsFiltered: number
    duplicatesFiltered: number
  }
}

const emptyData: AnalyticsData = {
  summary: [],
  stats: { topCountries: [], topSources: [] },
  totals: {
    clicks: 0,
    views: 0,
    uniqueVisitors: 0,
    growthRate: 0,
    filteredClicks: 0,
    botsFiltered: 0,
    duplicatesFiltered: 0,
  },
}

export default function AnalyticsPage() {
  const reduceMotion = useReducedMotion()
  const [days, setDays] = useState(7)
  const [data, setData] = useState<AnalyticsData>(emptyData)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/charts?days=${days}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Impossible de charger les analytics')
      setData({
        summary: payload.summary || [],
        stats: {
          topCountries: payload.stats?.topCountries || [],
          topSources: payload.stats?.topSources || [],
        },
        totals: payload.totals || emptyData.totals,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load analytics.')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const exportCsv = () => {
    const rows = [
      ['date', 'clicks', 'views'],
      ...data.summary.map(item => [item.date, item.clicks, item.views]),
    ]
    const blob = new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `taplinkr-analytics-${days}d.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const clicksPerVisitor = data.totals.uniqueVisitors > 0
    ? Math.round((data.totals.clicks / data.totals.uniqueVisitors) * 10) / 10
    : 0

  const cards = [
    { label: 'Total clicks', note: 'Verified actions', value: data.totals.clicks, icon: MousePointer2, color: 'text-violet-300', glow: 'from-violet-500/20 via-violet-500/5' },
    { label: 'Unique visitors', note: 'People reached', value: data.totals.uniqueVisitors, icon: Users, color: 'text-cyan-300', glow: 'from-cyan-500/20 via-cyan-500/5' },
    { label: 'Views', note: 'Page impressions', value: data.totals.views, icon: Eye, color: 'text-sky-300', glow: 'from-sky-500/20 via-sky-500/5' },
    { label: 'Filtered clicks', note: 'Protected traffic', value: data.totals.filteredClicks, icon: ShieldCheck, color: 'text-emerald-300', glow: 'from-emerald-500/20 via-emerald-500/5' },
    { label: 'Bots / previews', note: 'Automatic traffic', value: data.totals.botsFiltered, icon: Bot, color: 'text-rose-300', glow: 'from-rose-500/20 via-rose-500/5' },
    { label: 'Duplicates / spam', note: 'Repeated actions', value: data.totals.duplicatesFiltered, icon: Activity, color: 'text-amber-300', glow: 'from-amber-500/20 via-amber-500/5' },
    { label: 'Clicks / visitor', note: 'Visitor intensity', value: clicksPerVisitor, icon: Activity, color: 'text-fuchsia-300', glow: 'from-fuchsia-500/20 via-fuchsia-500/5' },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080d] px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <DashboardAtmosphere />
      <div className="relative mx-auto max-w-[1500px]">
        <motion.header initial={reduceMotion ? false : { opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              Analytics
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">
              Your traffic, <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">at a glance.</span>
            </h1>
            <p className="mt-3 text-base text-[#9696a8]">Real clicks only: bots, automatic previews, duplicates, and bursts are filtered out.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-2xl border border-white/[0.08] bg-[#11111a]/80 p-1.5 shadow-xl backdrop-blur-xl">
              {[1, 7, 30, 90].map(value => (
                <button
                  key={value}
                  onClick={() => setDays(value)}
                  className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition ${days === value ? 'text-white' : 'text-[#858598] hover:text-white'}`}
                >
                  {days === value && <motion.span layoutId="analytics-period" className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-b from-violet-500 to-violet-600 shadow-lg shadow-violet-950/40" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                  <span className="relative z-10">{value === 1 ? '24h' : `${value}d`}</span>
                </button>
              ))}
            </div>
            <motion.button whileHover={reduceMotion ? undefined : { rotate: 8, scale: 1.05 }} whileTap={reduceMotion ? undefined : { scale: 0.94 }}
              onClick={loadAnalytics}
              className="rounded-xl border border-[#292936] p-3 text-[#aaaabc] transition hover:border-violet-500/50 hover:text-white"
              aria-label="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
            <motion.button whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-[#292936] px-4 py-3 text-sm font-semibold transition hover:border-violet-500/50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </motion.button>
          </div>
        </motion.header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => (
            <motion.article key={card.label} initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.055, duration: 0.42 }} whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }} className="group relative overflow-hidden rounded-[22px] border border-white/[0.075] bg-[#11111a]/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-colors hover:border-white/[0.13]">
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.glow} to-transparent opacity-55 transition-opacity group-hover:opacity-90`} />
              <div className="relative">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a9aac]">{card.label}</p><p className="mt-1 text-[11px] text-white/35">{card.note}</p></div>
                <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/[0.07] bg-black/20"><card.icon className={`h-5 w-5 ${card.color}`} /></span>
              </div>
              <AnimatePresence mode="wait"><motion.p key={`${card.label}-${card.value}-${loading}`} initial={reduceMotion ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -5 }} className="mt-6 text-3xl font-black tracking-[-0.04em] tabular-nums">
                {loading ? '—' : typeof card.value === 'number' ? card.value.toLocaleString('en-US') : card.value}
              </motion.p></AnimatePresence>
              </div>
            </motion.article>
          ))}
        </section>

        <motion.section initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.5 }} className="relative mt-6 overflow-hidden rounded-[22px] border border-white/[0.075] bg-[#11111a]/90 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-7">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.07] blur-3xl" />
          <div className="relative">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold"><BarChart3 className="h-5 w-5 text-violet-300" />Traffic over time</h2>
            <p className="mt-1 text-sm text-[#8e8ea1]">Clicks and views over the {days === 1 ? 'last 24 hours' : `last ${days} days`}.</p>
          </div>
          <div className="mt-8 h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.summary}>
                <defs>
                  <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#242431" strokeDasharray="4 8" vertical={false} />
                <XAxis dataKey="date" stroke="#6f6f81" tickLine={false} axisLine={false} tickFormatter={value => value.slice(5)} />
                <YAxis stroke="#6f6f81" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#15151f', border: '1px solid #30303e', borderRadius: 12, color: '#fff' }}
                  labelStyle={{ color: '#aaaabc' }}
                />
                <Area isAnimationActive={!reduceMotion} animationDuration={900} type="monotone" dataKey="clicks" name="Clicks" stroke="#a78bfa" strokeWidth={3.5} fill="url(#clicksGradient)" />
                <Area isAnimationActive={!reduceMotion} animationDuration={1050} type="monotone" dataKey="views" name="Views" stroke="#67e8f9" strokeWidth={2.5} fill="url(#viewsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div></div>
        </motion.section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Ranking title="Top countries" items={data.stats.topCountries} reduceMotion={Boolean(reduceMotion)} />
          <Ranking title="Top sources" items={data.stats.topSources} reduceMotion={Boolean(reduceMotion)} />
        </section>
      </div>
    </div>
  )
}

function Ranking({ title, items, reduceMotion }: { title: string; items: Array<[string, number]>; reduceMotion: boolean }) {
  const max = Math.max(...items.map(([, count]) => count), 1)
  return (
    <motion.article initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[22px] border border-white/[0.075] bg-[#11111a]/90 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.length ? items.map(([label, count]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-[#cfcfda]">{label}</span>
              <span className="font-semibold">{count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#242431]">
              <motion.div initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 0.75, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400" />
            </div>
          </div>
        )) : <p className="py-8 text-center text-sm text-[#77778a]">Not enough data yet.</p>}
      </div>
    </motion.article>
  )
}
