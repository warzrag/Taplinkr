'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bot,
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
import { toast } from 'react-hot-toast'

import DashboardAtmosphere from '@/components/dashboard/DashboardAtmosphere'

type AnalyticsTab = 'overview' | 'links' | 'audience' | 'sources'

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
  summary: ChartPoint[]
  linkPerformance: LinkPerformance[]
  stats: {
    topCountries: Array<[string, number]>
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
    topCountries: [], topCities: [], topDevices: [], topBrowsers: [], topOperatingSystems: [], topSources: [],
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
  { id: 'sources', label: 'Sources', description: 'Where they come from' },
]

const cardClass = 'rounded-[22px] border border-white/[0.075] bg-[#11111a]/90 shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl'
const tooltipStyle = { background: '#15151f', border: '1px solid #30303e', borderRadius: 12, color: '#fff' }

export default function AnalyticsPage() {
  const reduceMotion = useReducedMotion()
  const [days, setDays] = useState(7)
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview')
  const [data, setData] = useState<AnalyticsData>(emptyData)
  const [loading, setLoading] = useState(true)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/charts?days=${days}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Unable to load analytics')
      setData({
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
  }, [days])

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
    anchor.download = `taplinkr-analytics-${days}d.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080d] px-4 py-7 text-white sm:px-7 lg:px-10 lg:py-10">
      <DashboardAtmosphere />
      <div className="relative mx-auto max-w-[1500px]">
        <motion.header initial={reduceMotion ? false : { opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-300"><Sparkles className="h-3.5 w-3.5" />Analytics intelligence</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] sm:text-4xl">Understand what <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">drives growth.</span></h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#9696a8] sm:text-base">Verified traffic, conversion signals and actionable insights — without bot or preview noise.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <PeriodSelector days={days} setDays={setDays} />
            <IconButton label="Refresh analytics" onClick={loadAnalytics} reduceMotion={Boolean(reduceMotion)}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></IconButton>
            <motion.button whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }} onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold transition hover:border-violet-400/40 hover:bg-white/[0.05]"><Download className="h-4 w-4" />Export CSV</motion.button>
          </div>
        </motion.header>

        <nav className="mt-8 grid gap-2 rounded-[22px] border border-white/[0.075] bg-[#101018]/80 p-2 shadow-xl backdrop-blur-xl sm:grid-cols-2 xl:grid-cols-4" aria-label="Analytics sections">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative rounded-2xl px-4 py-3 text-left transition ${activeTab === tab.id ? 'text-white' : 'text-[#858598] hover:bg-white/[0.025] hover:text-white'}`}>
              {activeTab === tab.id && <motion.span layoutId="analytics-tab" className="absolute inset-0 rounded-2xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-cyan-500/[0.06] shadow-lg shadow-violet-950/20" />}
              <span className="relative block text-sm font-bold">{tab.label}</span>
              <span className="relative mt-0.5 block text-[11px] opacity-55">{tab.description}</span>
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.28 }}>
            {activeTab === 'overview' && <Overview data={data} insights={insights} loading={loading} reduceMotion={Boolean(reduceMotion)} days={days} />}
            {activeTab === 'links' && <LinksAnalysis items={data.linkPerformance} loading={loading} />}
            {activeTab === 'audience' && <AudienceAnalysis stats={data.stats} reduceMotion={Boolean(reduceMotion)} />}
            {activeTab === 'sources' && <SourcesAnalysis stats={data.stats} reduceMotion={Boolean(reduceMotion)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function PeriodSelector({ days, setDays }: { days: number; setDays: (days: number) => void }) {
  return <div className="flex rounded-2xl border border-white/[0.08] bg-[#11111a]/80 p-1.5 shadow-xl backdrop-blur-xl">
    {[1, 7, 30, 90].map(value => <button key={value} onClick={() => setDays(value)} className={`relative rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${days === value ? 'text-white' : 'text-[#858598] hover:text-white'}`}>
      {days === value && <motion.span layoutId="analytics-period" className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-b from-violet-500 to-violet-600 shadow-lg shadow-violet-950/40" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
      <span className="relative z-10">{value === 1 ? 'Today' : `${value}d`}</span>
    </button>)}
  </div>
}

function IconButton({ label, onClick, reduceMotion, children }: { label: string; onClick: () => void; reduceMotion: boolean; children: React.ReactNode }) {
  return <motion.button whileHover={reduceMotion ? undefined : { rotate: 7, scale: 1.05 }} whileTap={reduceMotion ? undefined : { scale: 0.94 }} onClick={onClick} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[#aaaabc] transition hover:border-violet-400/40 hover:text-white" aria-label={label}>{children}</motion.button>
}

function Overview({ data, insights, loading, reduceMotion, days }: { data: AnalyticsData; insights: Array<{ title: string; text: string; tone: string }>; loading: boolean; reduceMotion: boolean; days: number }) {
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
        <div className="relative flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/45">{card.label}</p><AnimatePresence mode="wait"><motion.p key={`${card.value}-${loading}`} initial={reduceMotion ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-3xl font-black tracking-[-0.04em] tabular-nums">{loading ? '—' : `${card.value.toLocaleString('en-US')}${card.suffix}`}</motion.p></AnimatePresence>{card.growth !== undefined && <Growth value={card.growth} />}</div><span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/[0.08] bg-black/20 text-violet-200"><card.icon className="h-5 w-5" /></span></div>
      </motion.article>)}
    </section>

    <section className="mt-6 grid gap-4 lg:grid-cols-3">
      {insights.map((insight, index) => <motion.article key={insight.title} initial={reduceMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + index * 0.06 }} className={`${cardClass} flex gap-4 p-5`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-300"><Lightbulb className="h-5 w-5" /></span><div><h2 className="font-bold">{insight.title}</h2><p className="mt-1 text-sm leading-5 text-[#9292a5]">{insight.text}</p></div></motion.article>)}
    </section>

    <section className={`${cardClass} relative mt-6 overflow-hidden p-5 sm:p-7`}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.08] blur-3xl" />
      <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-violet-300" />Traffic trend</h2><p className="mt-1 text-sm text-[#8e8ea1]">Clicks, visitors and landing-page views during the {days === 1 ? 'current day' : `last ${days} days`}.</p></div><div className="flex gap-4 text-xs text-white/55"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-violet-400" />Clicks</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-cyan-300" />Visitors</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-sky-500" />Views</span></div></div>
      <div className="relative mt-7 h-[360px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.summary}><defs><linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.38} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient><linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity={0.2} /><stop offset="100%" stopColor="#38bdf8" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#242431" strokeDasharray="4 8" vertical={false} /><XAxis dataKey="date" stroke="#6f6f81" tickLine={false} axisLine={false} tickFormatter={value => value.slice(5)} /><YAxis stroke="#6f6f81" tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#aaaabc' }} /><Area isAnimationActive={!reduceMotion} type="monotone" dataKey="clicks" stroke="#a78bfa" strokeWidth={3.5} fill="url(#clicksGradient)" /><Area isAnimationActive={!reduceMotion} type="monotone" dataKey="visitors" stroke="#67e8f9" strokeWidth={2.5} fill="transparent" /><Area isAnimationActive={!reduceMotion} type="monotone" dataKey="views" stroke="#38bdf8" strokeWidth={2} fill="url(#viewsGradient)" /></AreaChart></ResponsiveContainer></div>
    </section>
  </>
}

function Growth({ value }: { value: number }) {
  const positive = value >= 0
  return <p className={`mt-2 flex items-center gap-1 text-xs font-bold ${positive ? 'text-emerald-300' : 'text-amber-300'}`}>{positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{Math.abs(value)}% vs previous period</p>
}

function LinksAnalysis({ items, loading }: { items: LinkPerformance[]; loading: boolean }) {
  return <section className={`${cardClass} mt-6 overflow-hidden`}>
    <div className="border-b border-white/[0.07] p-5 sm:p-6"><h2 className="text-xl font-bold">Link performance</h2><p className="mt-1 text-sm text-[#8e8ea1]">Sorted by verified clicks. Internal names stay private.</p></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left"><thead className="text-[11px] uppercase tracking-[0.13em] text-white/35"><tr><th className="px-6 py-4">Link</th><th className="px-4 py-4">Period</th><th className="px-4 py-4">Today</th><th className="px-4 py-4">Visitors</th><th className="px-4 py-4">Views</th><th className="px-4 py-4">CTR</th><th className="px-6 py-4">Top source</th></tr></thead><tbody className="divide-y divide-white/[0.055]">{items.map((item, index) => <tr key={item.id} className="transition hover:bg-violet-500/[0.035]"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/10 text-xs font-black text-violet-300">{index + 1}</span><div><p className="font-bold">{item.name}</p><p className="mt-0.5 text-xs text-white/35">/{item.slug} · {item.type}</p></div></div></td><td className="px-4 py-4 text-lg font-black tabular-nums text-violet-200">{item.clicks.toLocaleString('en-US')}</td><td className="px-4 py-4 font-bold tabular-nums text-cyan-200">{item.todayClicks.toLocaleString('en-US')}</td><td className="px-4 py-4 font-semibold tabular-nums">{item.uniqueVisitors.toLocaleString('en-US')}</td><td className="px-4 py-4 font-semibold tabular-nums">{item.views.toLocaleString('en-US')}</td><td className="px-4 py-4 font-semibold">{item.ctr === null ? 'Direct' : `${item.ctr}%`}</td><td className="px-6 py-4 text-sm text-white/65">{item.topSource}</td></tr>)}</tbody></table></div>
    {!loading && !items.length && <EmptyState title="No link data yet" text="Your links will be compared as soon as verified traffic arrives." />}
  </section>
}

function AudienceAnalysis({ stats, reduceMotion }: { stats: AnalyticsData['stats']; reduceMotion: boolean }) {
  return <>
    <section className="mt-6 grid gap-6 xl:grid-cols-3"><Ranking title="Devices" icon={Laptop} items={stats.topDevices} reduceMotion={reduceMotion} /><Ranking title="Browsers" icon={Globe2} items={stats.topBrowsers} reduceMotion={reduceMotion} /><Ranking title="Operating systems" icon={Users} items={stats.topOperatingSystems} reduceMotion={reduceMotion} /></section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><ChartCard title="Best hours" subtitle="When verified clicks happen" icon={Clock3}><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.hourlyDistribution}><CartesianGrid stroke="#242431" strokeDasharray="4 8" vertical={false} /><XAxis dataKey="hour" tickFormatter={value => `${value}h`} stroke="#6f6f81" tickLine={false} axisLine={false} /><YAxis stroke="#6f6f81" tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="clicks" fill="#8b5cf6" radius={[6, 6, 0, 0]} isAnimationActive={!reduceMotion} /></BarChart></ResponsiveContainer></ChartCard><Ranking title="Best days" icon={BarChart3} items={stats.weekdayDistribution.map(item => [item.day, item.clicks])} reduceMotion={reduceMotion} /></section>
  </>
}

function SourcesAnalysis({ stats, reduceMotion }: { stats: AnalyticsData['stats']; reduceMotion: boolean }) {
  return <section className="mt-6 grid gap-6 xl:grid-cols-2"><Ranking title="Traffic sources" icon={MousePointer2} items={stats.topSources} reduceMotion={reduceMotion} /><Ranking title="Top countries" icon={Globe2} items={stats.topCountries} reduceMotion={reduceMotion} /><Ranking title="Top cities" icon={MapPin} items={stats.topCities} reduceMotion={reduceMotion} /><article className={`${cardClass} p-6`}><h2 className="flex items-center gap-2 text-lg font-bold"><Bot className="h-5 w-5 text-emerald-300" />How attribution works</h2><p className="mt-4 text-sm leading-6 text-[#9292a5]">Taplinkr identifies known social networks from referral data and UTM parameters. “Direct” means the browser did not share a source — common with private messages and some in-app browsers.</p><div className="mt-5 rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.05] p-4 text-sm text-emerald-100/80"><ShieldCheck className="mb-2 h-5 w-5" />Bot previews and repeated spam are excluded before these rankings are calculated.</div></article></section>
}

function Ranking({ title, items, reduceMotion, icon: Icon }: { title: string; items: Array<[string, number]>; reduceMotion: boolean; icon: typeof Globe2 }) {
  const max = Math.max(...items.map(([, count]) => count), 1)
  const total = items.reduce((sum, [, count]) => sum + count, 0)
  return <article className={`${cardClass} p-6`}><h2 className="flex items-center gap-2 text-lg font-bold"><Icon className="h-5 w-5 text-violet-300" />{title}</h2><div className="mt-5 space-y-4">{items.length ? items.map(([label, count]) => <div key={label}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="truncate text-[#d4d4dd]">{label}</span><span className="shrink-0 font-semibold tabular-nums">{count.toLocaleString('en-US')} <i className="ml-1 not-italic text-xs font-normal text-white/30">{total ? Math.round((count / total) * 100) : 0}%</i></span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#242431]"><motion.div initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${(count / max) * 100}%` }} transition={{ duration: 0.75, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400" /></div></div>) : <p className="py-8 text-center text-sm text-[#77778a]">Not enough data yet.</p>}</div></article>
}

function ChartCard({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: typeof Clock3; children: React.ReactNode }) {
  return <article className={`${cardClass} p-6`}><h2 className="flex items-center gap-2 text-lg font-bold"><Icon className="h-5 w-5 text-violet-300" />{title}</h2><p className="mt-1 text-sm text-[#8e8ea1]">{subtitle}</p><div className="mt-6 h-[300px]">{children}</div></article>
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="p-12 text-center"><BarChart3 className="mx-auto h-8 w-8 text-violet-300" /><p className="mt-3 font-bold">{title}</p><p className="mt-1 text-sm text-white/40">{text}</p></div>
}
