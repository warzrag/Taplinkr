'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Clock3,
  ExternalLink,
  Link2,
  MousePointerClick,
  Percent,
  Plus,
  Users,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useLinks } from '@/contexts/LinksContext'
import { useProfile } from '@/contexts/ProfileContext'

const CreateLinkModal = dynamic(() => import('@/components/CreateLinkModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 grid place-items-center bg-black/70"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" /></div>,
})

const cardClass = 'rounded-2xl border border-[#252532] bg-[#11111a] shadow-[0_18px_50px_rgba(0,0,0,0.12)]'
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

function periodStart(period: Period) {
  const start = new Date()
  if (period !== 'today') start.setDate(start.getDate() - (period === '7d' ? 6 : 29))
  start.setHours(0, 0, 0, 0)
  return start.toISOString()
}

function Trend({ value, negativeIsGood = false }: { value: number; negativeIsGood?: boolean }) {
  if (value === 0) return <span className="text-xs font-bold text-[#77778a]">0%</span>

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

function TrafficBars({ values, period }: { values: number[]; period: Period }) {
  const max = Math.max(1, ...values)
  const total = values.reduce((sum, value) => sum + value, 0)

  return (
    <div className="mt-8">
      <div className="flex h-48 items-end gap-1 sm:gap-1.5" aria-label={`${total} real clicks in ${periodLabels[period].toLowerCase()}`}>
        {values.map((value, index) => (
          <div key={index} className="group relative flex h-full min-w-0 flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-violet-300 opacity-80 transition group-hover:opacity-100"
              style={{ height: `${value === 0 ? 3 : Math.max(7, (value / max) * 100)}%` }}
            />
            <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#09090f] px-2 py-1 text-[10px] font-bold text-white shadow-xl group-hover:block">
              {value} click{value === 1 ? '' : 's'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[11px] font-medium text-[#68687a]">
        <span>{period === 'today' ? '12 AM' : 'Start'}</span>
        <span>{period === 'today' ? 'Now' : periodLabels[period]}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
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
          `/api/dashboard/metrics?period=${period}&start=${encodeURIComponent(periodStart(period))}&timeZone=${encodeURIComponent(timeZone)}`,
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
    { key: 'realClicks' as const, label: 'Real clicks', value: metrics.realClicks, suffix: '', icon: MousePointerClick, color: 'text-violet-400' },
    { key: 'uniqueVisitors' as const, label: 'Unique visitors', value: metrics.uniqueVisitors, suffix: '', icon: Users, color: 'text-sky-400' },
    { key: 'clickThroughRate' as const, label: 'Conversion rate', value: metrics.clickThroughRate, suffix: '%', icon: Percent, color: 'text-emerald-400' },
    { key: 'botsFiltered' as const, label: 'Bots filtered', value: metrics.botsFiltered, suffix: '', icon: Bot, color: 'text-amber-400', negativeIsGood: true },
  ]

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">Overview</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Good to see you, {name}</h1>
            <p className="mt-2 text-sm text-[#858598]">Your real traffic and link performance at a glance.</p>
          </div>
          <div className="inline-flex self-start rounded-xl border border-[#2b2b39] bg-[#11111a] p-1 sm:self-auto">
            {([['today', 'Today'], ['7d', '7 days'], ['30d', '30 days']] as Array<[Period, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`rounded-lg px-3.5 py-2 text-sm font-bold transition ${period === value ? 'bg-violet-500 text-white shadow-lg shadow-violet-950/30' : 'text-[#858598] hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {metricsError && <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{metricsError}</div>}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(stat => (
            <article key={stat.key} className={`${cardClass} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#9a9aac]">{stat.label}</p>
                  <p className="mt-4 text-3xl font-black tracking-tight">
                    {metricsLoading ? '—' : `${stat.value.toLocaleString('en-US', { maximumFractionDigits: 1 })}${stat.suffix}`}
                  </p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.035]"><stat.icon className={`h-5 w-5 ${stat.color}`} /></span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Trend value={metrics.changes[stat.key]} negativeIsGood={stat.negativeIsGood} />
                <span className="text-xs text-[#69697b]">vs previous period</span>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <article className={`${cardClass} p-5 sm:p-6`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Traffic</h2>
                <p className="mt-1 text-sm text-[#7f7f92]">Real clicks · {periodLabels[period].toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{metrics.realClicks.toLocaleString('en-US')}</p>
                <p className="text-xs text-[#6d6d80]">{metrics.pageViews.toLocaleString('en-US')} page views</p>
              </div>
            </div>
            {metricsLoading ? <div className="mt-8 h-52 animate-pulse rounded-xl bg-white/[0.025]" /> : <TrafficBars values={chartValues} period={period} />}
          </article>

          <aside className={`${cardClass} p-5`}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#77778a]">Quick actions</p>
            <div className="mt-5 space-y-3">
              <button onClick={() => setCreateMode('direct')} className="flex w-full items-center gap-3 rounded-xl bg-violet-500 px-4 py-3 text-left text-sm font-bold transition hover:bg-violet-400">
                <Zap className="h-4 w-4" /><span className="flex-1">Create direct link</span><ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => setCreateMode('landing')} className="flex w-full items-center gap-3 rounded-xl border border-[#30303e] px-4 py-3 text-left text-sm font-bold transition hover:border-violet-500/50 hover:bg-violet-500/5">
                <Plus className="h-4 w-4" /><span className="flex-1">Create landing page</span><ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/dashboard/visitors" className="flex w-full items-center gap-3 rounded-xl border border-[#30303e] px-4 py-3 text-left text-sm font-bold transition hover:border-violet-500/50 hover:bg-violet-500/5">
                <BarChart3 className="h-4 w-4" /><span className="flex-1">Open click log</span><ExternalLink className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 rounded-xl bg-emerald-400/[0.06] px-4 py-3 text-xs leading-5 text-emerald-200/80">
              Real traffic only. Bot and preview activity is filtered before these numbers are shown.
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <article className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-[#252532] px-5 py-4">
              <div><h2 className="font-bold">Top performing links</h2><p className="mt-1 text-xs text-[#77778a]">Ranked by real clicks</p></div>
              <Link href="/dashboard/links" className="text-xs font-bold text-violet-400 hover:text-violet-300">View links</Link>
            </div>
            {metrics.topLinks.length ? (
              <div className="divide-y divide-[#20202b]">
                {metrics.topLinks.map((item, index) => {
                  const change = item.previousClicks === 0 ? (item.clicks ? 100 : 0) : ((item.clicks - item.previousClicks) / item.previousClicks) * 100
                  return (
                    <Link key={item.id} href={`/dashboard/analytics/${item.id}`} className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/[0.025]">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.035] text-xs font-black text-[#8d8d9f]">{index + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-bold">{item.name}</p><Trend value={change} /></div>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-violet-500" style={{ width: `${(item.clicks / maxTopClicks) * 100}%` }} /></div>
                        <p className="mt-1.5 truncate text-[11px] text-[#656578]">/{item.slug}</p>
                      </div>
                      <p className="text-sm font-black tabular-nums">{item.clicks.toLocaleString('en-US')}</p>
                    </Link>
                  )
                })}
              </div>
            ) : <div className="px-5 py-12 text-center text-sm text-[#747487]">No real clicks during this period.</div>}
          </article>

          <article className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-[#252532] px-5 py-4">
              <div><h2 className="font-bold">Recent activity</h2><p className="mt-1 text-xs text-[#77778a]">Latest verified clicks</p></div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />Live</span>
            </div>
            {metrics.recentActivity.length ? (
              <div className="divide-y divide-[#20202b]">
                {metrics.recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-400"><Link2 className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{activity.linkName}</p><p className="mt-1 truncate text-[11px] text-[#707082]">{[activity.device, activity.country].filter(Boolean).join(' · ') || 'Verified visitor'}</p></div>
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#69697b]"><Clock3 className="h-3 w-3" />{new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(activity.createdAt))}</span>
                  </div>
                ))}
              </div>
            ) : <div className="px-5 py-12 text-center text-sm text-[#747487]">No recent activity for this period.</div>}
          </article>
        </section>

        <p className="mt-5 text-center text-[11px] text-[#5f5f71]">Numbers refresh automatically every minute and when you return to this tab.</p>
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
