'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { BarChart3, Copy, ExternalLink, Eye, EyeOff, MoreVertical, MousePointer, Plus, Sparkles } from 'lucide-react'
import { useLinks } from '@/contexts/LinksContext'
import { Link as LinkType } from '@/types'

const CreateLinkModal = dynamic(() => import('@/components/CreateLinkModal'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-50 grid place-items-center bg-black/50"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" /></div>,
})

export default function PagesDashboard() {
  const { personalLinks, loading, refreshLinks } = useLinks()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPage, setEditingPage] = useState<LinkType | null>(null)

  const copyPage = async (slug: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
    toast.success('Lien de page copié')
  }

  const togglePage = async (page: LinkType) => {
    const response = await fetch('/api/links/toggle', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId: page.id, isActive: !page.isActive }),
    })
    if (response.ok) {
      toast.success(!page.isActive ? 'Page publiée' : 'Page désactivée')
      await refreshLinks()
    }
  }

  const duplicatePage = async (page: LinkType) => {
    const response = await fetch(`/api/links/${page.id}/duplicate`, { method: 'POST' })
    if (response.ok) {
      toast.success('Page dupliquée')
      await refreshLinks()
    } else {
      toast.error('Impossible de dupliquer cette page')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-950 dark:bg-gray-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Pages & deeplinks
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mes pages</h1>
            <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
              Chaque page est une landing page partageable avec ses boutons, son design, ses protections et ses analytics.
            </p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Nouvelle page
          </button>
        </header>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(item => <div key={item} className="h-56 animate-pulse rounded-3xl bg-white dark:bg-gray-900" />)}
          </div>
        ) : personalLinks.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {personalLinks.map(page => (
              <article key={page.id} className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
                <div className="h-28 bg-gradient-to-br from-indigo-500/30 to-cyan-400/10">
                  {page.coverImage && <img src={page.coverImage} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="p-5">
                  <div className="-mt-12 mb-4 flex items-end justify-between">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-lg dark:border-gray-900">
                      {page.profileImage ? (
                        <img src={page.profileImage} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-2xl font-bold text-gray-500">{page.title[0]}</div>
                      )}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${page.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {page.isActive ? 'Publiée' : 'Inactive'}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold">{page.title}</h2>
                  <p className="mt-1 truncate text-sm text-gray-500">taplinkr.com/{page.slug}</p>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-950">
                      <MousePointer className="mb-2 h-4 w-4 text-indigo-500" />
                      <p className="font-bold">{page.clicks || 0}</p>
                      <p className="text-xs text-gray-500">clics</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-950">
                      <ExternalLink className="mb-2 h-4 w-4 text-cyan-500" />
                      <p className="font-bold">{page.multiLinks?.length || 0}</p>
                      <p className="text-xs text-gray-500">boutons</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-3 dark:bg-gray-950">
                      <Eye className="mb-2 h-4 w-4 text-emerald-500" />
                      <p className="font-bold">{page.views || 0}</p>
                      <p className="text-xs text-gray-500">vues</p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button onClick={() => copyPage(page.slug)} className="flex-1 rounded-xl bg-gray-950 px-3 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950">
                      <Copy className="mr-1 inline h-4 w-4" />
                      Copier
                    </button>
                    <button onClick={() => setEditingPage(page)} className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold hover:border-indigo-300 dark:border-gray-800">
                      Modifier
                    </button>
                    <button onClick={() => togglePage(page)} className="rounded-xl border border-gray-200 px-3 py-2.5 hover:border-indigo-300 dark:border-gray-800">
                      {page.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <a href={`/${page.slug}`} target="_blank" rel="noreferrer" className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-center text-sm font-semibold hover:border-indigo-300 dark:border-gray-800">
                      Ouvrir
                    </a>
                    <Link href={`/dashboard/analytics/${page.id}`} className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-center text-sm font-semibold hover:border-indigo-300 dark:border-gray-800">
                      <BarChart3 className="mr-1 inline h-4 w-4" />
                      Stats
                    </Link>
                    <button onClick={() => duplicatePage(page)} className="rounded-xl border border-gray-200 px-3 py-2 hover:border-indigo-300 dark:border-gray-800" title="Dupliquer">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10">
              <Plus className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-bold">Créez votre première page de conversion</h2>
            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Ajoutez vos contenus, partagez une seule URL et suivez les performances de chaque bouton.
            </p>
            <button onClick={() => setShowCreateModal(true)} className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700">
              Nouvelle page
            </button>
          </div>
        )}
      </div>

      {(showCreateModal || editingPage) && (
        <CreateLinkModal
          isOpen={showCreateModal || Boolean(editingPage)}
          editingLink={editingPage}
          onClose={() => {
            setShowCreateModal(false)
            setEditingPage(null)
          }}
          onSuccess={async () => {
            setShowCreateModal(false)
            setEditingPage(null)
            await refreshLinks()
          }}
        />
      )}
    </div>
  )
}
