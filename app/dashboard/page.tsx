'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { BarChart3, Copy, ExternalLink, Eye, MousePointer, Palette, Plus, Shield, Sparkles } from 'lucide-react'
import { useLinks } from '@/contexts/LinksContext'
import { useProfile } from '@/contexts/ProfileContext'

const CreateLinkModal = dynamic(() => import('@/components/CreateLinkModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 grid place-items-center bg-black/50"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" /></div>,
})

import { useState } from 'react'

const getPreviewTextColor = (backgroundColor?: string | null, textColor?: string | null) => {
  if (textColor && textColor.toLowerCase() !== '#ffffff' && textColor.toLowerCase() !== 'white') {
    return textColor
  }
  if (!backgroundColor || backgroundColor.toLowerCase() === '#ffffff' || backgroundColor.toLowerCase() === 'white') {
    return '#111827'
  }
  return textColor || '#111827'
}

function PhonePreview({ page }: { page: any }) {
  const links = page?.multiLinks || []
  const previewBackground = page?.backgroundColor || '#ffffff'
  const previewText = getPreviewTextColor(previewBackground, page?.textColor)
  const mutedPreviewText = previewText === '#111827' ? '#4b5563' : previewText

  return (
    <div className="mx-auto w-full max-w-[290px] rounded-[2rem] bg-gray-950 p-3 shadow-2xl">
      <div className="aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-white">
        <div className="h-full overflow-y-auto" style={{ backgroundColor: previewBackground, color: previewText }}>
          {page?.coverImage ? (
            <img src={page.coverImage} alt="" className="h-28 w-full object-cover" />
          ) : (
            <div className="h-24 bg-gradient-to-br from-indigo-500/30 to-cyan-400/10" />
          )}
          <div className="-mt-9 px-5 pb-8 text-center">
            <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg">
              {page?.profileImage || page?.user?.image ? (
                <img src={page.profileImage || page.user.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-2xl font-bold text-gray-500">
                  {(page?.title || 'T')[0]}
                </div>
              )}
            </div>
            <h3 className="mt-3 text-xl font-bold" style={{ color: previewText }}>{page?.title || 'Ma page Taplinkr'}</h3>
            <p className="mt-1 text-sm" style={{ color: mutedPreviewText }}>{page?.description || 'Tous mes liens importants en un seul endroit.'}</p>
            <div className="mt-5 space-y-3">
              {(links.length ? links : [{ title: 'Instagram' }, { title: 'Telegram' }, { title: 'Mon contenu' }]).slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="rounded-2xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white">
                  {item.title || `Lien ${index + 1}`}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data: session } = useSession()
  const { links, loading, refreshLinks } = useLinks()
  const { profile } = useProfile()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const mainPage = links[0]
  const publicUrl = mainPage ? `${typeof window !== 'undefined' ? window.location.origin : 'https://www.taplinkr.com'}/${mainPage.slug}` : ''
  const totalClicks = links.reduce((total, page) => total + (page.clicks || 0), 0)
  const totalViews = links.reduce((total, page) => total + (page.views || 0), 0)
  const activePages = links.filter(page => page.isActive).length

  const copyUrl = async () => {
    if (!publicUrl) return
    await navigator.clipboard.writeText(publicUrl)
    toast.success('Lien de page copié')
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-950 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Studio créateur Taplinkr
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Bonjour, {profile?.name || session?.user?.email?.split('@')[0] || 'créateur'}
            </h1>
            <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
              Gérez vos pages de conversion, partagez votre lien et suivez ce qui transforme votre audience en clics.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              Nouvelle page
            </button>
            <Link href="/dashboard/links" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-800 hover:border-indigo-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
              Mes pages
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Page principale</p>
                <h2 className="mt-3 text-2xl font-bold">{mainPage?.title || 'Créez votre première page'}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {mainPage ? `taplinkr.com/${mainPage.slug}` : 'Une page mobile-first avec vos liens, vos socials et vos protections avancées.'}
                </p>
              </div>
              {mainPage && (
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${mainPage.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {mainPage.isActive ? 'Publiée' : 'Inactive'}
                </span>
              )}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {mainPage ? (
                <>
                  <button onClick={copyUrl} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">
                    <Copy className="h-4 w-4" />
                    Copier
                  </button>
                  <a href={`/${mainPage.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-semibold hover:border-indigo-300 dark:border-gray-800">
                    <ExternalLink className="h-4 w-4" />
                    Voir
                  </a>
                  <Link href="/dashboard/links" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-semibold hover:border-indigo-300 dark:border-gray-800">
                    <Palette className="h-4 w-4" />
                    Modifier
                  </Link>
                </>
              ) : (
                <button onClick={() => setShowCreateModal(true)} className="sm:col-span-3 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700">
                  <Plus className="h-4 w-4" />
                  Créer ma première page
                </button>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-950">
                <MousePointer className="mb-3 h-5 w-5 text-indigo-500" />
                <p className="text-3xl font-bold">{totalClicks}</p>
                <p className="text-sm text-gray-500">Clics</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-950">
                <Eye className="mb-3 h-5 w-5 text-emerald-500" />
                <p className="text-3xl font-bold">{totalViews}</p>
                <p className="text-sm text-gray-500">Vues</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-950">
                <ExternalLink className="mb-3 h-5 w-5 text-cyan-500" />
                <p className="text-3xl font-bold">{activePages}</p>
                <p className="text-sm text-gray-500">Pages actives</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <PhonePreview page={mainPage} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/links" className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-indigo-300 dark:border-gray-800 dark:bg-gray-900">
            <ExternalLink className="mb-4 h-6 w-6 text-indigo-500" />
            <h3 className="font-bold">Gérer mes pages</h3>
            <p className="mt-1 text-sm text-gray-500">Créer, dupliquer, activer et modifier vos landing pages.</p>
          </Link>
          <Link href="/dashboard/visitors" className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-indigo-300 dark:border-gray-800 dark:bg-gray-900">
            <BarChart3 className="mb-4 h-6 w-6 text-emerald-500" />
            <h3 className="font-bold">Voir les analytics</h3>
            <p className="mt-1 text-sm text-gray-500">Comprendre les clics, les sources, les pays et les meilleurs boutons.</p>
          </Link>
          <Link href="/dashboard/protection" className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-indigo-300 dark:border-gray-800 dark:bg-gray-900">
            <Shield className="mb-4 h-6 w-6 text-amber-500" />
            <h3 className="font-bold">Protection & 18+</h3>
            <p className="mt-1 text-sm text-gray-500">Préparer les pages sensibles, warnings et options avancées.</p>
          </Link>
        </section>
      </div>

      {showCreateModal && (
        <CreateLinkModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={async () => {
            setShowCreateModal(false)
            await refreshLinks()
          }}
        />
      )}
    </div>
  )
}
