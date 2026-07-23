'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  ArrowUpRight,
  BarChart3,
  Eye,
  ExternalLink,
  Link2,
  MousePointer2,
  Plus,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

import { useLinks } from '@/contexts/LinksContext'
import { useProfile } from '@/contexts/ProfileContext'

const CreateLinkModal = dynamic(() => import('@/components/CreateLinkModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 grid place-items-center bg-black/70"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" /></div>,
})

const cardClass = 'rounded-2xl border border-[#252532] bg-[#11111a] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.12)]'

export default function Dashboard() {
  const { data: session } = useSession()
  const { links, loading, refreshLinks } = useLinks()
  const { profile } = useProfile()
  const [createMode, setCreateMode] = useState<'landing' | 'direct' | null>(null)

  const name = profile?.name || session?.user?.name || session?.user?.email?.split('@')[0] || 'créateur'
  const totalClicks = links.reduce((sum, item) => sum + (item.clicks || 0), 0)
  const totalViews = links.reduce((sum, item) => sum + (item.views || 0), 0)
  const activeLinks = links.filter(item => item.isActive).length
  const directLinks = links.filter(item => item.isDirect).length
  const recentLinks = links.slice(0, 4)

  const stats = [
    { label: 'Clics totaux', value: totalClicks, icon: MousePointer2, color: 'text-violet-400' },
    { label: 'Vues totales', value: totalViews, icon: Eye, color: 'text-sky-400' },
    { label: 'Liens actifs', value: activeLinks, icon: Link2, color: 'text-emerald-400' },
    { label: 'Liens directs', value: directLinks, icon: Zap, color: 'text-amber-400' },
  ]

  return (
    <div className="min-h-screen bg-[#09090f] px-5 py-8 text-white sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#8e8ea2]">Vue d’ensemble · 30 derniers jours</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">Bonjour, {name}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCreateMode('landing')}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2b2b39] bg-[#11111a] px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-500/50"
            >
              <Plus className="h-4 w-4" />
              Créer une page
            </button>
            <button
              onClick={() => setCreateMode('direct')}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              <Zap className="h-4 w-4" />
              Créer un lien direct
            </button>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(stat => (
            <article key={stat.label} className={cardClass}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#a4a4b5]">{stat.label}</p>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-7 text-4xl font-bold tracking-tight">{loading ? '—' : stat.value.toLocaleString('fr-FR')}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className={`${cardClass} p-0`}>
            <div className="flex items-center justify-between border-b border-[#252532] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">Vos derniers liens</h2>
                <p className="mt-1 text-sm text-[#858598]">Accès rapide à vos pages et redirections.</p>
              </div>
              <Link href="/dashboard/links" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300">
                Tout voir
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-[#20202b]">
              {recentLinks.length ? recentLinks.map(item => (
                <Link
                  key={item.id}
                  href="/dashboard/links"
                  className="flex items-center gap-4 px-6 py-4 transition hover:bg-white/[0.025]"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${item.isActive ? 'bg-emerald-400' : 'bg-[#4d4d5c]'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.title}</p>
                    <p className="mt-1 truncate text-sm text-[#858598]">taplinkr.com/{item.slug}</p>
                  </div>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${item.isDirect ? 'bg-violet-500/10 text-violet-300' : 'bg-sky-500/10 text-sky-300'}`}>
                    {item.isDirect ? 'Direct' : 'Page'}
                  </span>
                  <span className="hidden text-sm text-[#a4a4b5] sm:block">{item.clicks || 0} clics</span>
                </Link>
              )) : (
                <div className="px-6 py-14 text-center">
                  <Link2 className="mx-auto h-8 w-8 text-[#555568]" />
                  <p className="mt-4 font-semibold">Aucun lien pour le moment</p>
                  <p className="mt-1 text-sm text-[#858598]">Créez votre première page ou redirection.</p>
                </div>
              )}
            </div>
          </div>

          <aside className={`${cardClass} flex flex-col justify-between`}>
            <div>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10 text-violet-400">
                <BarChart3 className="h-5 w-5" />
              </span>
              <h2 className="mt-6 text-xl font-semibold">Comprendre votre trafic</h2>
              <p className="mt-3 text-sm leading-6 text-[#9393a5]">
                Consultez l’évolution des clics, les visiteurs et les performances de chaque lien.
              </p>
            </div>
            <Link href="/dashboard/analytics" className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl border border-[#30303e] px-4 py-3 text-sm font-semibold transition hover:border-violet-500/50 hover:bg-violet-500/5">
              Voir les analytics
              <ExternalLink className="h-4 w-4" />
            </Link>
          </aside>
        </section>
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
