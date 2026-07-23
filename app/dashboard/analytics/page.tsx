'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  BarChart3,
  Download,
  Eye,
  MousePointer2,
  RefreshCw,
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
  }
}

const emptyData: AnalyticsData = {
  summary: [],
  stats: { topCountries: [], topSources: [] },
  totals: { clicks: 0, views: 0, uniqueVisitors: 0, growthRate: 0 },
}

export default function AnalyticsPage() {
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
      toast.error(error instanceof Error ? error.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const exportCsv = () => {
    const rows = [
      ['date', 'clics', 'vues'],
      ...data.summary.map(item => [item.date, item.clicks, item.views]),
    ]
    const blob = new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `taplinkr-analytics-${days}j.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const clicksPerVisitor = data.totals.uniqueVisitors > 0
    ? Math.round((data.totals.clicks / data.totals.uniqueVisitors) * 10) / 10
    : 0

  const cards = [
    { label: 'Clics totaux', value: data.totals.clicks, icon: MousePointer2, color: 'text-violet-400' },
    { label: 'Visiteurs uniques', value: data.totals.uniqueVisitors, icon: Users, color: 'text-sky-400' },
    { label: 'Vues', value: data.totals.views, icon: Eye, color: 'text-emerald-400' },
    { label: 'Clics / visiteur', value: clicksPerVisitor, icon: Activity, color: 'text-amber-400' },
  ]

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-8 text-white sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-violet-400">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
              Votre trafic, <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">en un coup d’œil.</span>
            </h1>
            <p className="mt-3 text-base text-[#9696a8]">Des données réelles issues de vos pages et liens directs.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl border border-[#292936] bg-[#101018] p-1">
              {[1, 7, 30, 90].map(value => (
                <button
                  key={value}
                  onClick={() => setDays(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${days === value ? 'bg-violet-500 text-white' : 'text-[#858598] hover:text-white'}`}
                >
                  {value === 1 ? '24h' : `${value}j`}
                </button>
              ))}
            </div>
            <button
              onClick={loadAnalytics}
              className="rounded-xl border border-[#292936] p-3 text-[#aaaabc] transition hover:border-violet-500/50 hover:text-white"
              aria-label="Actualiser"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-[#292936] px-4 py-3 text-sm font-semibold transition hover:border-violet-500/50"
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </button>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(card => (
            <article key={card.label} className="rounded-2xl border border-[#252532] bg-[#11111a] p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8e8ea1]">{card.label}</p>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="mt-7 text-4xl font-bold tracking-tight">
                {loading ? '—' : typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-[#252532] bg-[#11111a] p-5 sm:p-7">
          <div>
            <h2 className="text-xl font-semibold">Trafic dans le temps</h2>
            <p className="mt-1 text-sm text-[#8e8ea1]">Clics et vues sur les {days === 1 ? 'dernières 24 heures' : `${days} derniers jours`}.</p>
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
                <Area type="monotone" dataKey="clicks" name="Clics" stroke="#8b5cf6" strokeWidth={3} fill="url(#clicksGradient)" />
                <Area type="monotone" dataKey="views" name="Vues" stroke="#38bdf8" strokeWidth={2.5} fill="url(#viewsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Ranking title="Principaux pays" items={data.stats.topCountries} />
          <Ranking title="Principales sources" items={data.stats.topSources} />
        </section>
      </div>
    </div>
  )
}

function Ranking({ title, items }: { title: string; items: Array<[string, number]> }) {
  const max = Math.max(...items.map(([, count]) => count), 1)
  return (
    <article className="rounded-2xl border border-[#252532] bg-[#11111a] p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.length ? items.map(([label, count]) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-[#cfcfda]">{label}</span>
              <span className="font-semibold">{count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#242431]">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400" style={{ width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        )) : <p className="py-8 text-center text-sm text-[#77778a]">Pas encore assez de données.</p>}
      </div>
    </article>
  )
}
