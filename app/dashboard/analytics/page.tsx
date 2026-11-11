'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  CalendarDays,
  Clock3,
  Download,
  Eye,
  Globe2,
  Laptop,
  Lightbulb,
  MapPin,
  MousePointer2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import { toast } from 'react-hot-toast'

import DashboardAtmosphere from '@/components/dashboard/DashboardAtmosphere'
import { CountUp } from '@/components/dashboard/motion'
import { chartColors } from '@/lib/dashboard-colors'

type AnalyticsTab = 'overview' | 'links' | 'audience' | 'countries' | 'sources'
type PeriodName = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'custom'

const periodOptions: Array<{ id: PeriodName; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'custom', label: 'Custom' },
]

interface ChartPoint {
  date: string
  clicks: number
  views: number
  visitors: number
  ctr: number
}

interface LinkPerformance {
  id: string
  name: string
  slug: string
  type: string
  clicks: number
  todayClicks: number
  views: number
  uniqueVisitors: number
  ctr: number | null
  topSource: string
}

interface AnalyticsData {
  period?: { name: PeriodName; from: string; to: string; timeZone: string; chosenTimeZone: string | null }
  summary: ChartPoint[]
  linkPerformance: LinkPerformance[]
  stats: {
    topCountries: Array<[string, number]>
    countries: Array<{ country: string; clicks: number; visitors: number }>
    countriesByLink: Record<string, Array<[string, number]>>
    unlocatedClicks: number
    topCities: Array<[string, number]>
    topDevices: Array<[string, number]>
    topBrowsers: Array<[string, number]>
    topOperatingSystems: Array<[string, number]>
    topSources: Array<[string, number]>
    hourlyDistribution: Array<{ hour: number; clicks: number }>
    weekdayDistribution: Array<{ day: string; clicks: number }>
  }
  totals: {
    clicks: number
    views: number
    uniqueVisitors: number
    ctr: number
    clicksGrowth: number
    viewsGrowth: number
    filteredClicks: number
    botsFiltered: number
    duplicatesFiltered: number
  }
}

const emptyData: AnalyticsData = {
  summary: [],
  linkPerformance: [],
  stats: {
    topCountries: [], countries: [], countriesByLink: {}, unlocatedClicks: 0, topCities: [], topDevices: [], topBrowsers: [], topOperatingSystems: [], topSources: [],
    hourlyDistribution: [], weekdayDistribution: [],
  },
  totals: {
    clicks: 0, views: 0, uniqueVisitors: 0, ctr: 0, clicksGrowth: 0, viewsGrowth: 0,
    filteredClicks: 0, botsFiltered: 0, duplicatesFiltered: 0,
  },
}

const tabs: Array<{ id: AnalyticsTab; label: string; description: string }> = [
  { id: 'overview', label: 'Overview', description: 'What changed' },
  { id: 'links', label: 'Links', description: 'What performs' },
  { id: 'audience', label: 'Audience', description: 'Who clicks' },
  { id: 'countries', label: 'Countries', description: 'Where they click from' },
  { id: 'sources', label: 'Sources', description: 'Where they come from' },
]

const cardClass = 'rounded-[22px] border border-white/[0.075] bg-dash-raised/90 shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl'

export default function AnalyticsPage() {
  const reduceMotion = useReducedMotion()
  const [period, setPeriod] = useState<PeriodName>('7d')
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null)
  const [customOpen, setCustomOpen] = useState(false)
  const deviceTimeZone = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } catch { return 'UTC' }
  }, [])
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview')
  const [data, setData] = useState<AnalyticsData>(emptyData)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const query = new URLSearchParams({ period, timeZone: deviceTimeZone })
      if (period === 'custom' && customRange) {
        query.set('from', customRange.from)
        query.set('to', customRange.to)
      }
      const response = await fetch(`/api/analytics/charts?${query}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load analytics')
      setData({
        period: payload.period,
        summary: payload.summary || [],
        linkPerformance: payload.linkPerformance || [],
        stats: { ...emptyData.stats, ...(payload.stats || {}) },
        totals: { ...emptyData.totals, ...(payload.totals || {}) },
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load analytics.')
    } finally {
      setLoading(false)
    }
  }, [period, customRange, deviceTimeZone])

  const choosePeriod = (next: PeriodName) => {
    if (next === 'custom') {
      setCustomOpen(open => !open)
      return
    }
    setCustomOpen(false)
    setPeriod(next)
  }

  const applyCustomRange = (range: { from: string; to: string }) => {
    setCustomRange(range)
    setPeriod('custom')
    setCustomOpen(false)
  }

  const saveTimeZone = async (timeZone: string | null) => {
    try {
      const response = await fetch('/api/user/timezone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeZone }),
      })
      if (!response.ok) throw new Error('Unable to save the time zone.')
      toast.success(timeZone ? `Days now start at midnight in ${timeZone.replace(/_/g, ' ')}.` : 'Time zone follows this device again.')
      await loadAnalytics()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save the time zone.')
    }
  }

  useEffect(() => { loadAnalytics() }, [loadAnalytics])

  const insights = useMemo(() => {
    const bestLink = data.linkPerformance[0]
    const bestHour = [...data.stats.hourlyDistribution].sort((a, b) => b.clicks - a.clicks)[0]
    const topSource = data.stats.topSources[0]
    return [
      {
        title: data.totals.clicksGrowth >= 0 ? 'Traffic is growing' : 'Traffic needs attention',
        text: `${Math.abs(data.totals.clicksGrowth)}% ${data.totals.clicksGrowth >= 0 ? 'more' : 'fewer'} clicks than the previous period.`,
        tone: data.totals.clicksGrowth >= 0 ? 'emerald' : 'amber',
      },
      {
        title: bestLink ? `${bestLink.name} leads` : 'Your best link will appear here',
        text: bestLink ? `${bestLink.clicks.toLocaleString('en-US')} verified clicks in this period.` : 'Publish and share a link to start comparing performance.',
        tone: 'violet',
      },
      {
        title: bestHour?.clicks ? `Peak hour: ${String(bestHour.hour).padStart(2, '0')}:00` : 'Peak time is being learned',
        text: topSource ? `${topSource[0]} is currently your largest source with ${topSource[1].toLocaleString('en-US')} clicks.` : 'Source attribution will appear as visitors arrive.',
        tone: 'cyan',
      },
    ]
  }, [data])

  const exportCsv = () => {
    const rows = [
      ['date', 'clicks', 'views', 'unique visitors', 'ctr'],
      ...data.summary.map(item => [item.date, item.clicks, item.views, item.visitors, item.ctr]),
    ]
    const blob = new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `taplinkr-analytics-${data.period ? `${data.period.from}_${data.period.to}` : period}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-dash-bg px-4 py-7 text-white sm:px-7 lg:px-10 lg:py-10">
      <DashboardAtmosphere />
      <div className="relative mx-auto max-w-[1500px]">
        <motion.header initial={reduceMotion ? false : { opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300"><Sparkles className="h-3.5 w-3.5" />Analytics intelligence</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">Understand what <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">drives growth.</span></h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-dash-text4 sm:text-base">Verified traffic, conversion signals and actionable insights — without bot or preview noise.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PeriodSelector period={period} customOpen={customOpen} onChoose={choosePeriod} />
          </div>
        </motion.header>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          <TimeZoneSelect chosen={data.period?.chosenTimeZone ?? null} deviceTimeZone={deviceTimeZone} onChange={saveTimeZone} />
          <IconButton label="Refresh analytics" onClick={loadAnalytics} reduceMotion={Boolean(reduceMotion)}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></IconButton>
          <motion.button whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold transition hover:border-violet-400/40 hover:bg-white/[0.05]"><Download className="h-4 w-4" />Export CSV</motion.button>
        </div>

        <AnimatePresence initial={false}>
          {customOpen && <CustomRangePanel key="custom-range" initial={customRange} today={data.period?.to && period !== 'yesterday' && period !== 'custom' ? data.period.to : localDateKey(new Date())} onApply={applyCustomRange} onClose={() => setCustomOpen(false)} reduceMotion={Boolean(reduceMotion)} />}
        </AnimatePresence>

        <nav className="mt-8 grid gap-2 rounded-[22px] border border-white/[0.075] bg-dash-raised/80 p-2 shadow-xl backdrop-blur-xl sm:grid-cols-3 xl:grid-cols-5" aria-label="Analytics sections">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative rounded-2xl px-4 py-3 text-left transition ${activeTab === tab.id ? 'text-white' : 'text-dash-text5 hover:bg-white/[0.025] hover:text-white'}`}>
              {activeTab === tab.id && <motion.span layoutId="analytics-tab" className="absolute inset-0 rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-cyan-500/[0.06] shadow-lg shadow-violet-950/20" />}
              <span className="relative block text-sm font-bold">{tab.label}</span>
              <span className="relative mt-0.5 block text-[11px] opacity-55">{tab.description}</span>
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
            {activeTab === 'overview' && <Overview data={data} insights={insights} loading={loading} reduceMotion={Boolean(reduceMotion)} period={period} />}
            {activeTab === 'links' && <LinksAnalysis items={data.linkPerformance} loading={loading} />}
            {activeTab === 'audience' && <AudienceAnalysis stats={data.stats} reduceMotion={Boolean(reduceMotion)} />}
            {activeTab === 'countries' && <CountriesAnalysis stats={data.stats} links={data.linkPerformance} reduceMotion={Boolean(reduceMotion)} />}
            {activeTab === 'sources' && <SourcesAnalysis stats={data.stats} reduceMotion={Boolean(reduceMotion)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function PeriodSelector({ period, customOpen, onChoose }: { period: PeriodName; customOpen: boolean; onChoose: (period: PeriodName) => void }) {
  return <div className="flex max-w-full overflow-x-auto rounded-2xl border border-white/[0.08] bg-dash-raised/80 p-1.5 shadow-xl backdrop-blur-xl [scrollbar-width:none]">
    {periodOptions.map(option => {
      const active = period === option.id
      return <button key={option.id} onClick={() => onChoose(option.id)} aria-pressed={active} className={`relative shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${active ? 'text-white' : customOpen && option.id === 'custom' ? 'text-violet-200' : 'text-dash-text5 hover:text-white'}`}>
        {active && <motion.span layoutId="analytics-period" className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-b from-violet-500 to-violet-600 shadow-lg shadow-violet-950/40" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
        <span className="relative z-10 flex items-center gap-1.5">{option.id === 'custom' && <CalendarDays className="h-3.5 w-3.5" />}{option.label}</span>
      </button>
    })}
  </div>
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function shiftKey(key: string, days: number) {
  const date = new Date(`${key}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function CustomRangePanel({ initial, today, onApply, onClose, reduceMotion }: { initial: { from: string; to: string } | null; today: string; onApply: (range: { from: string; to: string }) => void; onClose: () => void; reduceMotion: boolean }) {
  const [from, setFrom] = useState(initial?.from || shiftKey(today, -6))
  const [to, setTo] = useState(initial?.to || today)
  const dayCount = from && to && from <= to ? Math.round((new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86_400_000) + 1 : 0
  const error = !from || !to ? 'Choose both dates.' : from > to ? 'The start date must come before the end date.' : dayCount > 90 ? 'Choose 90 days or less.' : ''
  const inputClass = 'w-full rounded-xl border border-white/10 bg-dash-bg px-3 py-2.5 text-sm font-semibold text-white outline-none transition [color-scheme:dark] focus:border-violet-400/50'
  return <motion.form
    initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
    onSubmit={event => { event.preventDefault(); if (!error) onApply({ from, to }) }}
    className={`${cardClass} mt-4 flex flex-col gap-4 p-5 sm:flex-row sm:items-end`}
  >
    <label className="flex flex-1 flex-col gap-1.5 text-xs font-semibold text-white/45">From<input type="date" value={from} max={today} onChange={event => setFrom(event.target.value)} className={inputClass} /></label>
    <label className="flex flex-1 flex-col gap-1.5 text-xs font-semibold text-white/45">To<input type="date" value={to} max={today} onChange={event => setTo(event.target.value)} className={inputClass} /></label>
    <div className="flex flex-col gap-2 sm:items-end">
      <p className={`text-xs ${error ? 'text-amber-300' : 'text-white/45'}`}>{error || `${dayCount} ${dayCount === 1 ? 'day' : 'days'}`}</p>
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/60 transition hover:text-white">Cancel</button>
        <button type="submit" disabled={Boolean(error)} className="rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-950/40 transition disabled:opacity-40">Apply</button>
      </div>
    </div>
  </motion.form>
}

let timeZoneList: string[] | null = null
function allTimeZones() {
  if (!timeZoneList) {
    try {
      const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('timeZone') || []
      timeZoneList = ['UTC', ...supported.filter(zone => zone !== 'UTC')]
    } catch {
      timeZoneList = ['UTC']
    }
  }
  return timeZoneList
}

function TimeZoneSelect({ chosen, deviceTimeZone, onChange }: { chosen: string | null; deviceTimeZone: string; onChange: (timeZone: string | null) => void }) {
  const zones = allTimeZones()
  const label = (zone: string) => zone.replace(/_/g, ' ')
  return <label className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-white/[0.08] bg-dash-raised/80 py-1.5 pl-3 pr-1.5 text-xs font-semibold text-white/45 backdrop-blur-xl">
    <Globe2 className="h-3.5 w-3.5 shrink-0 text-violet-300" />
    <span className="shrink-0">Time zone</span>
    <select value={chosen || ''} onChange={event => onChange(event.target.value || null)} className="min-w-0 max-w-[15rem] truncate rounded-lg border border-white/10 bg-dash-bg px-2 py-1.5 text-xs font-semibold text-white outline-none transition focus:border-violet-400/50">
      <option value="">Automatic · {label(deviceTimeZone)}</option>
      {(chosen && !zones.includes(chosen) ? [chosen, ...zones] : zones).map(zone => <option key={zone} value={zone}>{label(zone)}</option>)}
    </select>
  </label>
}

function IconButton({ label, onClick, reduceMotion, children }: { label: string; onClick: () => void; reduceMotion: boolean; children: React.ReactNode }) {
  return <motion.button whileHover={reduceMotion ? undefined : { rotate: 7, scale: 1.05 }} whileTap={reduceMotion ? undefined : { scale: 0.94 }} onClick={onClick} className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-dash-text3 transition hover:border-violet-400/40 hover:text-white" aria-label={label}>{children}</motion.button>
}

const periodPhrases: Record<PeriodName, string> = {
  today: 'for today',
  yesterday: 'for yesterday',
  '7d': 'over the last 7 days',
  '30d': 'over the last 30 days',
  '90d': 'over the last 90 days',
  custom: 'over the selected period',
}

function Overview({ data, insights, loading, reduceMotion, period }: { data: AnalyticsData; insights: Array<{ title: string; text: string; tone: string }>; loading: boolean; reduceMotion: boolean; period: PeriodName }) {
  const dateRange = formatDateRange(data.summary)
  const cards = [
    { label: 'Verified clicks', value: data.totals.clicks, suffix: '', growth: data.totals.clicksGrowth, icon: MousePointer2, glow: 'from-violet-500/22' },
    { label: 'Unique visitors', value: data.totals.uniqueVisitors, suffix: '', icon: Users, glow: 'from-cyan-500/20' },
    { label: 'Landing views', value: data.totals.views, suffix: '', growth: data.totals.viewsGrowth, icon: Eye, glow: 'from-sky-500/20' },
    { label: 'Click-through rate', value: data.totals.ctr, suffix: '%', icon: Target, glow: 'from-fuchsia-500/20' },
    { label: 'Filtered traffic', value: data.totals.filteredClicks, suffix: '', icon: ShieldCheck, glow: 'from-emerald-500/20' },
  ]
  return <>
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => <motion.article key={card.label} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.045 }} whileHover={reduceMotion ? undefined : { y: -4 }} className={`${cardClass} group relative overflow-hidden p-5`}>
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.glow} to-transparent opacity-65 transition group-hover:opacity-100`} />
        <div className="relative flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/45">{card.label}</p><p className="mt-4 text-3xl font-black tracking-[-0.04em] tabular-nums">{loading ? '—' : <CountUp value={card.value} decimals={card.suffix ? 1 : 0} suffix={card.suffix} />}</p>{card.growth !== undefined && <Growth value={card.growth} />}</div><span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/[0.08] bg-black/20 text-violet-200"><card.icon className="h-5 w-5" /></span></div>
      </motion.article>)}
    </section>

    <section className="mt-6 grid gap-4 lg:grid-cols-3">
      {insights.map((insight, index) => <motion.article key={insight.title} initial={reduceMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + index * 0.06 }} className={`${cardClass} flex gap-4 p-5`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-300"><Lightbulb className="h-5 w-5" /></span><div><h2 className="font-bold">{insight.title}</h2><p className="mt-1 text-sm leading-5 text-dash-text4">{insight.text}</p></div></motion.article>)}
    </section>

    <section className={`${cardClass} relative mt-6 overflow-hidden p-5 sm:p-7`}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-violet-300" />Traffic trend</h2><p className="mt-1 text-sm text-dash-text5">Clicks, visitors and landing-page views {periodPhrases[period]}{data.period ? ` · days start at midnight, ${data.period.timeZone.replace(/_/g, ' ')} time` : ''}.</p></div><div className="flex flex-col gap-3 sm:items-end"><span className="w-fit rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-xs font-semibold text-white/65">{dateRange || 'Waiting for traffic data'}</span><div className="flex gap-4 text-xs text-white/55"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-violet-400" />Clicks</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-cyan-300" />Visitors</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-sky-500" />Views</span></div></div></div>
      <div className="relative mt-7 h-[360px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.summary} margin={{ top: 4, right: 8, bottom: 8, left: 0 }}><defs><linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.38} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient><linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity={0.2} /><stop offset="100%" stopColor="#38bdf8" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke={chartColors.grid} strokeDasharray="4 8" vertical={false} /><XAxis dataKey="date" stroke={chartColors.axisLabel} tickLine={false} axisLine={false} tickFormatter={formatAxisDate} interval={data.summary.length <= 7 ? 0 : 'preserveStartEnd'} minTickGap={data.summary.length <= 30 ? 26 : 42} tickMargin={12} height={38} tick={{ fontSize: 12, fontWeight: 600 }} /><YAxis stroke={chartColors.axis} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip content={<TrafficTooltip />} cursor={{ stroke: 'rgba(167, 139, 250, 0.42)', strokeWidth: 1.5, strokeDasharray: '4 5' }} wrapperStyle={{ outline: 'none', zIndex: 20 }} /><Area isAnimationActive={!reduceMotion} type="monotone" dataKey="clicks" name="Verified clicks" stroke="#a78bfa" strokeWidth={3.5} fill="url(#clicksGradient)" activeDot={{ r: 6, fill: '#a78bfa', stroke: '#ffffff', strokeWidth: 2 }} /><Area isAnimationActive={!reduceMotion} type="monotone" dataKey="visitors" name="Unique visitors" stroke="#67e8f9" strokeWidth={2.5} fill="transparent" activeDot={{ r: 5, fill: '#67e8f9', stroke: '#ffffff', strokeWidth: 2 }} /><Area isAnimationActive={!reduceMotion} type="monotone" dataKey="views" name="Landing views" stroke="#38bdf8" strokeWidth={2} fill="url(#viewsGradient)" activeDot={{ r: 5, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div>
    </section>
  </>
}

function Growth({ value }: { value: number }) {
  const positive = value >= 0
  return <p className={`mt-2 flex items-center gap-1 text-xs font-bold ${positive ? 'text-emerald-300' : 'text-amber-300'}`}>{positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{Math.abs(value)}% vs previous period</p>
}

function LinksAnalysis({ items, loading }: { items: LinkPerformance[]; loading: boolean }) {
  return <section className={`${cardClass} mt-6 overflow-hidden`}>
    <div className="border-b border-white/[0.07] p-5 sm:p-6"><h2 className="text-xl font-bold">Link performance</h2><p className="mt-1 text-sm text-dash-text5">Sorted by verified clicks. Internal names stay private.</p></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left"><thead className="text-[11px] uppercase tracking-[0.13em] text-white/35"><tr><th className="px-6 py-4">Link</th><th className="px-4 py-4">Period</th><th className="px-4 py-4">Today</th><th className="px-4 py-4">Visitors</th><th className="px-4 py-4">Views</th><th className="px-4 py-4">CTR</th><th className="px-6 py-4">Top source</th></tr></thead><tbody className="divide-y divide-white/[0.055]">{items.map((item, index) => <tr key={item.id} className="transition hover:bg-violet-500/[0.035]"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/10 text-xs font-black text-violet-300">{index + 1}</span><div><p className="font-bold">{item.name}</p><p className="mt-0.5 text-xs text-white/35">/{item.slug} · {item.type}</p></div></div></td><td className="px-4 py-4 text-lg font-black tabular-nums text-violet-200">{item.clicks.toLocaleString('en-US')}</td><td className="px-4 py-4 font-bold tabular-nums text-cyan-200">{item.todayClicks.toLocaleString('en-US')}</td><td className="px-4 py-4 font-semibold tabular-nums">{item.uniqueVisitors.toLocaleString('en-US')}</td><td className="px-4 py-4 font-semibold tabular-nums">{item.views.toLocaleString('en-US')}</td><td className="px-4 py-4 font-semibold">{item.ctr === null ? 'Direct' : `${item.ctr}%`}</td><td className="px-6 py-4 text-sm text-white/65">{item.topSource}</td></tr>)}</tbody></table></div>
    {!loading && !items.length && <EmptyState title="No link data yet" text="Your links will be compared as soon as verified traffic arrives." />}
  </section>
}

function AudienceAnalysis({ stats, reduceMotion }: { stats: AnalyticsData['stats']; reduceMotion: boolean }) {
  return <>
    <section className="mt-6 grid gap-6 xl:grid-cols-3"><Ranking title="Devices" icon={Laptop} items={stats.topDevices} reduceMotion={reduceMotion} /><Ranking title="Browsers" icon={Globe2} items={stats.topBrowsers} reduceMotion={reduceMotion} /><Ranking title="Operating systems" icon={Users} items={stats.topOperatingSystems} reduceMotion={reduceMotion} /></section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><ChartCard title="Best hours" subtitle="When verified clicks happen" icon={Clock3}><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.hourlyDistribution}><CartesianGrid stroke={chartColors.grid} strokeDasharray="4 8" vertical={false} /><XAxis dataKey="hour" tickFormatter={value => `${value}h`} stroke={chartColors.axis} tickLine={false} axisLine={false} /><YAxis stroke={chartColors.axis} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip content={<HourlyTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.08)', radius: 8 }} wrapperStyle={{ outline: 'none', zIndex: 20 }} /><Bar dataKey="clicks" name="Verified clicks" fill="#8b5cf6" radius={[6, 6, 0, 0]} isAnimationActive={!reduceMotion} /></BarChart></ResponsiveContainer></ChartCard><Ranking title="Best days" icon={BarChart3} items={stats.weekdayDistribution.map(item => [item.day, item.clicks])} reduceMotion={reduceMotion} /></section>
  </>
}

// Country names are stored in English ("France"); flags need the ISO code.
let countryCodesByName: Map<string, string> | null = null
function countryCode(name: string) {
  if (!countryCodesByName) {
    countryCodesByName = new Map()
    try {
      const names = new Intl.DisplayNames(['en-US'], { type: 'region' })
      for (let a = 65; a <= 90; a += 1) {
        for (let b = 65; b <= 90; b += 1) {
          const code = String.fromCharCode(a, b)
          const label = names.of(code)
          if (label && label !== code && !countryCodesByName.has(label)) countryCodesByName.set(label, code)
        }
      }
    } catch {}
  }
  return countryCodesByName.get(name) || null
}

function CountryFlag({ name }: { name: string }) {
  const code = countryCode(name)
  const [failed, setFailed] = useState(false)
  if (!code || failed) return <span className="grid h-[18px] w-6 shrink-0 place-items-center rounded-[4px] bg-white/[0.06] text-[9px] font-black text-white/45">{code || '?'}</span>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`} alt="" width={24} height={18} loading="lazy" onError={() => setFailed(true)} className="h-[18px] w-6 shrink-0 rounded-[4px] object-cover ring-1 ring-white/10" />
}

function CountriesAnalysis({ stats, links, reduceMotion }: { stats: AnalyticsData['stats']; links: LinkPerformance[]; reduceMotion: boolean }) {
  const [linkId, setLinkId] = useState('all')
  const linksWithClicks = links.filter(link => link.clicks > 0)
  const rows = linkId === 'all'
    ? stats.countries
    : (stats.countriesByLink[linkId] || []).map(([country, clicks]) => ({ country, clicks, visitors: null as number | null }))
  const total = rows.reduce((sum, row) => sum + row.clicks, 0)
  const max = Math.max(...rows.map(row => row.clicks), 1)
  const showVisitors = linkId === 'all'

  return <section className={`${cardClass} mt-6 overflow-hidden`}>
    <div className="flex flex-col gap-4 border-b border-white/[0.06] p-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold"><Globe2 className="h-5 w-5 text-violet-300" />Clicks by country</h2>
        <p className="mt-1 text-sm text-dash-text5">{rows.length ? `${rows.length} ${rows.length === 1 ? 'country' : 'countries'} · ${total.toLocaleString('en-US')} located clicks` : 'Every verified click, grouped by the visitor’s country.'}</p>
      </div>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-semibold text-white/45 sm:w-64">
        Link
        <select value={linkId} onChange={event => setLinkId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-dash-bg px-3 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-violet-400/50">
          <option value="all">All links</option>
          {linksWithClicks.map(link => <option key={link.id} value={link.id}>{link.name}</option>)}
        </select>
      </label>
    </div>
    {rows.length ? <>
      <div className="hidden grid-cols-[2.5rem_minmax(0,1fr)_5rem_5rem_minmax(0,9rem)] gap-3 px-6 pt-4 text-[11px] font-semibold uppercase tracking-[0.13em] text-white/35 sm:grid">
        <span>#</span><span>Country</span><span className="text-right">Clicks</span><span className="text-right">{showVisitors ? 'Visitors' : ''}</span><span className="text-right">Share</span>
      </div>
      <ol className="divide-y divide-white/[0.05] px-3 pb-3 sm:px-0">
        {rows.map((row, index) => {
          const share = total ? Math.round((row.clicks / total) * 1000) / 10 : 0
          return <li key={row.country} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-3 py-3.5 sm:grid-cols-[2.5rem_minmax(0,1fr)_5rem_5rem_minmax(0,9rem)] sm:px-6">
            <span className="hidden text-xs font-black tabular-nums text-white/30 sm:block">{index + 1}</span>
            <span className="flex min-w-0 items-center gap-3"><CountryFlag name={row.country} /><span className="truncate font-semibold text-dash-text2">{row.country}</span></span>
            <span className="text-right font-black tabular-nums text-violet-200">{row.clicks.toLocaleString('en-US')}</span>
            <span className="hidden text-right text-sm tabular-nums text-white/55 sm:block">{showVisitors && row.visitors !== null ? row.visitors.toLocaleString('en-US') : ''}</span>
            <span className="col-span-2 flex items-center gap-3 sm:col-span-1">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]"><motion.span initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${(row.clicks / max) * 100}%` }} transition={{ duration: 0.6, delay: Math.min(index, 12) * 0.03 }} className="block h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300" /></span>
              <span className="w-12 text-right text-xs font-bold tabular-nums text-white/60">{share}%</span>
            </span>
          </li>
        })}
      </ol>
    </> : <EmptyState title="No located clicks yet" text="Countries are recorded for every new verified click." />}
    <div className="flex flex-col gap-2 border-t border-white/[0.06] px-6 py-4 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
      <span>{linkId === 'all' && stats.unlocatedClicks > 0 ? `${stats.unlocatedClicks.toLocaleString('en-US')} clicks in this period have no known location (recorded before Nov 11, 2026, or sent from a private network).` : 'Locations are estimated from the visitor’s network and never shared.'}</span>
      <a href="https://db-ip.com" target="_blank" rel="noopener noreferrer" className="shrink-0 underline decoration-white/20 underline-offset-2 hover:text-white/60">IP Geolocation by DB-IP</a>
    </div>
  </section>
}

function SourcesAnalysis({ stats, reduceMotion }: { stats: AnalyticsData['stats']; reduceMotion: boolean }) {
  return <section className="mt-6 grid gap-6 xl:grid-cols-2"><Ranking title="Traffic sources" icon={MousePointer2} items={stats.topSources} reduceMotion={reduceMotion} /><Ranking title="Top countries" icon={Globe2} items={stats.topCountries} reduceMotion={reduceMotion} /><Ranking title="Top cities" icon={MapPin} items={stats.topCities} reduceMotion={reduceMotion} /><article className={`${cardClass} p-6`}><h2 className="flex items-center gap-2 text-lg font-bold"><Bot className="h-5 w-5 text-emerald-300" />How attribution works</h2><p className="mt-4 text-sm leading-6 text-dash-text4">Taplinkr identifies known social networks from referral data and UTM parameters. “Direct” means the browser did not share a source — common with private messages and some in-app browsers.</p><div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.05] p-4 text-sm text-emerald-100/80"><ShieldCheck className="mb-2 h-5 w-5" />Bot previews and repeated spam are excluded before these rankings are calculated.</div><p className="mt-4 text-xs text-white/35">Countries and cities: <a href="https://db-ip.com" target="_blank" rel="noopener noreferrer" className="underline decoration-white/20 underline-offset-2 hover:text-white/60">IP Geolocation by DB-IP</a></p></article></section>
}

function Ranking({ title, items, reduceMotion, icon: Icon }: { title: string; items: Array<[string, number]>; reduceMotion: boolean; icon: typeof Globe2 }) {
  const max = Math.max(...items.map(([, count]) => count), 1)
  const total = items.reduce((sum, [, count]) => sum + count, 0)
  return <article className={`${cardClass} p-6`}><h2 className="flex items-center gap-2 text-lg font-bold"><Icon className="h-5 w-5 text-violet-300" />{title}</h2><div className="mt-5 space-y-4">{items.length ? items.map(([label, count]) => <div key={label}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="truncate text-dash-text2">{label}</span><span className="shrink-0 font-semibold tabular-nums">{count.toLocaleString('en-US')} <i className="ml-1 not-italic text-xs font-normal text-white/30">{total ? Math.round((count / total) * 100) : 0}%</i></span></div><div className="h-1.5 overflow-hidden rounded-full bg-dash-input"><motion.div initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 0.75, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400" /></div></div>) : <p className="py-8 text-center text-sm text-dash-text6">Not enough data yet.</p>}</div></article>
}

function ChartCard({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: typeof Clock3; children: React.ReactNode }) {
  return <article className={`${cardClass} p-6`}><h2 className="flex items-center gap-2 text-lg font-bold"><Icon className="h-5 w-5 text-violet-300" />{title}</h2><p className="mt-1 text-sm text-dash-text5">{subtitle}</p><div className="mt-6 h-[300px]">{children}</div></article>
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="p-12 text-center"><BarChart3 className="mx-auto h-8 w-8 text-violet-300" /><p className="mt-3 font-bold">{title}</p><p className="mt-1 text-sm text-white/40">{text}</p></div>
}

function TrafficTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const formattedDate = typeof label === 'string'
    ? new Date(`${label}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : String(label || '')
  const colors: Record<string, string> = { clicks: '#a78bfa', visitors: '#67e8f9', views: '#38bdf8' }

  return <motion.div initial={{ opacity: 0, scale: 0.94, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.16 }} className="min-w-[210px] overflow-hidden rounded-2xl border border-white/10 bg-dash-raised/95 p-1 shadow-[0_24px_70px_rgba(0,0,0,.55)] backdrop-blur-2xl">
    <div className="rounded-xl border border-white/[0.05] bg-gradient-to-br from-violet-500/10 to-cyan-500/[0.04] px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-300/80">Traffic snapshot</p>
      <p className="mt-1 text-sm font-bold text-white">{formattedDate}</p>
    </div>
    <div className="space-y-2 px-4 py-3">
      {payload.map(entry => {
        const key = String(entry.dataKey || entry.name || '')
        return <div key={key} className="flex items-center justify-between gap-6 text-sm"><span className="flex items-center gap-2 text-white/55"><i className="h-2 w-2 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: colors[key] || entry.color, color: colors[key] || entry.color }} />{entry.name}</span><strong className="tabular-nums text-white">{Number(entry.value || 0).toLocaleString('en-US')}</strong></div>
      })}
    </div>
  </motion.div>
}

function parseChartDate(value: string) {
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatAxisDate(value: string) {
  const date = parseChartDate(value)
  return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : value
}

function formatDateRange(summary: ChartPoint[]) {
  if (!summary.length) return ''
  const first = parseChartDate(summary[0].date)
  const last = parseChartDate(summary[summary.length - 1].date)
  if (!first || !last) return ''
  if (first.getTime() === last.getTime()) {
    return first.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }
  const sameYear = first.getFullYear() === last.getFullYear()
  return `${first.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: sameYear ? undefined : 'numeric' })} – ${last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

function HourlyTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const hour = Number(label || 0)
  return <motion.div initial={{ opacity: 0, scale: 0.94, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="rounded-2xl border border-violet-300/15 bg-dash-raised/95 px-4 py-3 shadow-[0_20px_55px_rgba(0,0,0,.5)] backdrop-blur-2xl">
    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-300/75">Peak activity</p>
    <p className="mt-1 text-sm font-bold">{String(hour).padStart(2, '0')}:00 – {String((hour + 1) % 24).padStart(2, '0')}:00</p>
    <p className="mt-2 flex items-center justify-between gap-8 text-xs text-white/50"><span>Verified clicks</span><strong className="text-base text-violet-200">{Number(payload[0]?.value || 0).toLocaleString('en-US')}</strong></p>
  </motion.div>
}
