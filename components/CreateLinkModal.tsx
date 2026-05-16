'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  GripVertical,
  Image as ImageIcon,
  Link2,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { Link as LinkType } from '@/types'
import ImageUpload from './upload/ImageUpload'
import CoverImageUpload from './upload/CoverImageUpload'
import IconUpload from './upload/IconUpload'
import EditPhonePreview from './EditPhonePreview'

interface CreateLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newLink?: any) => void
  editingLink?: LinkType | null
}

interface PageLink {
  title: string
  url: string
  description?: string
  icon?: string
  iconImage?: string
}

const defaultLinks: PageLink[] = [
  { title: 'Instagram', url: '', description: '', icon: '', iconImage: '' },
  { title: 'Telegram', url: '', description: '', icon: '', iconImage: '' },
]

const themes = [
  { label: 'Clean', backgroundColor: '#ffffff', textColor: '#111827', accent: '#6366f1' },
  { label: 'Dark', backgroundColor: '#0f172a', textColor: '#f8fafc', accent: '#22c55e' },
  { label: 'Rose', backgroundColor: '#fff1f2', textColor: '#881337', accent: '#f43f5e' },
  { label: 'Mint', backgroundColor: '#ecfdf5', textColor: '#064e3b', accent: '#10b981' },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function inferTitleFromUrl(url: string) {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '')
    const name = host.split('.')[0]
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : ''
  } catch {
    return ''
  }
}

export default function CreateLinkModal({ isOpen, onClose, onSuccess, editingLink }: CreateLinkModalProps) {
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [activePanel, setActivePanel] = useState<'start' | 'identity' | 'links' | 'style'>('start')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [links, setLinks] = useState<PageLink[]>(defaultLinks)
  const [instagramUrl, setInstagramUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [textColor, setTextColor] = useState('#111827')
  const [accentColor, setAccentColor] = useState('#6366f1')
  const [borderRadius, setBorderRadius] = useState('rounded-2xl')
  const [customSlugTouched, setCustomSlugTouched] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    if (editingLink) {
      setTitle(editingLink.title || '')
      setDescription(editingLink.description || editingLink.bio || '')
      setSlug(editingLink.slug || '')
      setProfileImage(editingLink.profileImage || '')
      setCoverImage(editingLink.coverImage || '')
      setLinks(
        editingLink.multiLinks?.length
          ? editingLink.multiLinks.map(link => ({
              title: link.title || '',
              url: link.url || '',
              description: link.description || '',
              icon: link.icon || '',
              iconImage: link.iconImage || '',
            }))
          : [{ title: '', url: '', description: '', icon: '', iconImage: '' }]
      )
      setInstagramUrl(editingLink.instagramUrl || '')
      setTiktokUrl(editingLink.tiktokUrl || '')
      setTwitterUrl(editingLink.twitterUrl || '')
      setYoutubeUrl(editingLink.youtubeUrl || '')
      setBackgroundColor(editingLink.backgroundColor || '#ffffff')
      setTextColor(editingLink.textColor || '#111827')
      setAccentColor(editingLink.color || '#6366f1')
      setBorderRadius(editingLink.borderRadius || 'rounded-2xl')
      setCustomSlugTouched(true)
    } else {
      setTitle('')
      setDescription('')
      setSlug('')
      setProfileImage('')
      setCoverImage('')
      setLinks(defaultLinks)
      setInstagramUrl('')
      setTiktokUrl('')
      setTwitterUrl('')
      setYoutubeUrl('')
      setBackgroundColor('#ffffff')
      setTextColor('#111827')
      setAccentColor('#6366f1')
      setBorderRadius('rounded-2xl')
      setCustomSlugTouched(false)
      setShowAdvanced(false)
      setActivePanel('start')
    }
  }, [isOpen, editingLink])

  useEffect(() => {
    if (!customSlugTouched) {
      setSlug(slugify(title))
    }
  }, [title, customSlugTouched])

  useEffect(() => {
    if (!slug || slug === editingLink?.slug) {
      setSlugAvailable(null)
      setCheckingSlug(false)
      return
    }

    setCheckingSlug(true)
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/links/check-slug?slug=${encodeURIComponent(slug)}${editingLink ? `&linkId=${editingLink.id}` : ''}`)
        const data = await response.json()
        setSlugAvailable(Boolean(data.available))
      } catch {
        setSlugAvailable(null)
      } finally {
        setCheckingSlug(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [slug, editingLink])

  const validLinks = useMemo(
    () => links.filter(link => link.title.trim() && link.url.trim()),
    [links]
  )

  const previewLink = useMemo(() => ({
    id: editingLink?.id || 'preview',
    slug: slug || 'votre-page',
    title: title || 'Votre nom',
    description,
    profileImage,
    profileStyle: 'circle',
    coverImage,
    isDirect: false,
    isActive: true,
    instagramUrl,
    tiktokUrl,
    twitterUrl,
    youtubeUrl,
    animation: 'none',
    borderRadius,
    fontFamily: 'system',
    backgroundColor,
    textColor,
    color: accentColor,
    multiLinks: links.map((link, index) => ({
      id: `${index}`,
      parentLinkId: '',
      title: link.title || inferTitleFromUrl(link.url) || `Lien ${index + 1}`,
      url: link.url || '#',
      description: link.description || '',
      icon: link.icon || '',
      iconImage: link.iconImage || '',
      animation: '',
      order: index,
      clicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    userId: '',
    directUrl: '',
    shieldEnabled: false,
    isUltraLink: false,
    isOnline: false,
    order: 0,
    clicks: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }), [accentColor, backgroundColor, borderRadius, coverImage, description, editingLink?.id, instagramUrl, links, profileImage, slug, textColor, tiktokUrl, title, twitterUrl, youtubeUrl])

  const updateLink = (index: number, field: keyof PageLink, value: string) => {
    setLinks(current => {
      const next = [...current]
      const updated = { ...next[index], [field]: value }
      if (field === 'url' && !updated.title.trim()) {
        updated.title = inferTitleFromUrl(value)
      }
      next[index] = updated
      return next
    })
  }

  const addLink = () => {
    setLinks(current => [...current, { title: '', url: '', description: '', icon: '', iconImage: '' }])
  }

  const addPresetLink = (preset: PageLink) => {
    setLinks(current => {
      const emptyIndex = current.findIndex(link => !link.title.trim() && !link.url.trim())
      if (emptyIndex >= 0) {
        const next = [...current]
        next[emptyIndex] = preset
        return next
      }
      return [...current, preset]
    })
    setActivePanel('links')
  }

  const applyStarter = (kind: 'creator' | 'premium' | 'social') => {
    if (kind === 'creator') {
      setDescription(description || 'Tous mes contenus, reseaux et offres au meme endroit.')
      setLinks([
        { title: 'Instagram', url: 'https://instagram.com/', description: '', icon: '', iconImage: '' },
        { title: 'Telegram', url: 'https://t.me/', description: '', icon: '', iconImage: '' },
        { title: 'Mon contenu', url: '', description: '', icon: '', iconImage: '' },
      ])
    }
    if (kind === 'premium') {
      setDescription(description || 'Accedez a mes contenus, offres privees et nouveautes.')
      setLinks([
        { title: 'Mon contenu premium', url: '', description: '', icon: '', iconImage: '' },
        { title: 'Telegram prive', url: 'https://t.me/', description: '', icon: '', iconImage: '' },
        { title: 'Me contacter', url: '', description: '', icon: '', iconImage: '' },
      ])
    }
    if (kind === 'social') {
      setDescription(description || 'Retrouvez-moi sur toutes mes plateformes.')
      setLinks([
        { title: 'Instagram', url: 'https://instagram.com/', description: '', icon: '', iconImage: '' },
        { title: 'TikTok', url: 'https://tiktok.com/@', description: '', icon: '', iconImage: '' },
        { title: 'YouTube', url: 'https://youtube.com/', description: '', icon: '', iconImage: '' },
      ])
    }
    setActivePanel('identity')
  }

  const removeLink = (index: number) => {
    setLinks(current => current.length > 1 ? current.filter((_, i) => i !== index) : current)
  }

  const handleCopyPreviewUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${slug || 'votre-page'}`)
      toast.success('URL copiee')
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!title.trim()) {
      toast.error('Ajoutez un nom pour votre page')
      return
    }

    if (!slug.trim()) {
      toast.error('Choisissez une URL publique')
      return
    }

    if (slugAvailable === false) {
      toast.error('Cette URL est deja utilisee')
      return
    }

    if (validLinks.length === 0) {
      toast.error('Ajoutez au moins un lien avec un titre et une URL')
      return
    }

    setLoading(true)

    try {
      const requestBody = {
        title: title.trim(),
        internalName: null,
        slug: slug.trim(),
        description: description.trim() || null,
        bio: description.trim() || null,
        isDirect: false,
        directUrl: null,
        shieldEnabled: false,
        isUltraLink: false,
        multiLinks: validLinks.map((link, index) => ({
          title: link.title.trim(),
          url: link.url.trim(),
          description: link.description?.trim() || null,
          icon: link.icon || '',
          iconImage: link.iconImage || '',
          order: index,
        })),
        profileImage: profileImage || null,
        profileStyle: 'circle',
        coverImage: coverImage || null,
        color: accentColor,
        backgroundColor,
        textColor,
        borderRadius,
        fontFamily: 'system',
        instagramUrl: instagramUrl || null,
        tiktokUrl: tiktokUrl || null,
        twitterUrl: twitterUrl || null,
        youtubeUrl: youtubeUrl || null,
        animation: 'none',
      }

      const response = await fetch(editingLink ? `/api/links/${editingLink.id}` : '/api/links-create-final', {
        method: editingLink ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Erreur lors de la sauvegarde')
      }

      const savedLink = await response.json()
      toast.success(editingLink ? 'Page mise a jour' : 'Page publiee')
      onSuccess(savedLink)
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="min-h-screen px-0 sm:px-6 py-0 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative mx-auto w-full max-w-5xl min-h-screen sm:min-h-0 bg-white dark:bg-gray-950 sm:rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Page createur
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white">
                {editingLink ? 'Modifier ma page' : 'Assistant de creation Taplinkr'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choisissez un depart, Taplinkr prepare la structure, puis vous ajustez.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ['start', 'Depart'],
                  ['identity', '1. Profil'],
                  ['links', '2. Liens'],
                  ['style', '3. Style'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setActivePanel(value as typeof activePanel)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      activePanel === value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="max-h-[calc(100vh-140px)] overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
              <section className={`${activePanel === 'start' ? 'block' : 'hidden'} rounded-3xl border border-indigo-200 bg-indigo-50/70 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/10 sm:p-6`}>
                <div className="max-w-2xl">
                  <p className="text-sm font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Nouveau</p>
                  <h3 className="mt-2 text-3xl font-bold leading-tight text-gray-950 dark:text-white">
                    On part de quoi ?
                  </h3>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                    Choisissez le type de page. Les boutons de base seront pre-remplis, vous n'aurez plus qu'a remplacer les URLs.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => applyStarter('creator')}
                    className="rounded-2xl border border-white bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-white">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-gray-950 dark:text-white">Createur</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Instagram, Telegram, contenu principal.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyStarter('premium')}
                    className="rounded-2xl border border-white bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gray-950 text-white dark:bg-white dark:text-gray-950">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-gray-950 dark:text-white">Premium</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Offre privee, Telegram, contact.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyStarter('social')}
                    className="rounded-2xl border border-white bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-cyan-500 text-white">
                      <ExternalLink className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-gray-950 dark:text-white">Reseaux</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Instagram, TikTok, YouTube.</p>
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 dark:bg-gray-950">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vous pouvez aussi partir de zero.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActivePanel('identity')}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                  >
                    Commencer sans modele
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>

              <section className={`${activePanel === 'identity' ? 'block' : 'hidden'} rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5`}>
                <div className="mb-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">Etape 1</p>
                  <h3 className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">Qui voit-on sur la page ?</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Mettez juste le nom et la phrase que vos visiteurs doivent comprendre en premier.</p>
                </div>
                <div className="grid gap-4">
                  <div>
                    <ImageUpload
                      value={profileImage}
                      onChange={setProfileImage}
                      type="avatar"
                      compact
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Nom affiche
                      </label>
                      <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Ex : Florent, Taplinkr, votre pseudo..."
                        className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-950 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Bio courte
                      </label>
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Ex : Retrouvez tous mes contenus, offres et reseaux ici."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-950 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActivePanel('links')}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                  >
                    Continuer vers les liens
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>

              <section className={`${activePanel === 'links' ? 'block' : 'hidden'} rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5`}>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">Etape 2</p>
                    <h3 className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">Ajoutez vos boutons</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Un titre + une URL. C'est tout. Taplinkr fera la page autour.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addLink}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {[
                    { title: 'Instagram', url: 'https://instagram.com/', description: '', icon: '', iconImage: '' },
                    { title: 'Telegram', url: 'https://t.me/', description: '', icon: '', iconImage: '' },
                    { title: 'TikTok', url: 'https://tiktok.com/@', description: '', icon: '', iconImage: '' },
                    { title: 'Mon contenu', url: '', description: '', icon: '', iconImage: '' },
                  ].map(preset => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => addPresetLink(preset)}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-indigo-500/10"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {preset.title}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {links.map((link, index) => (
                    <div key={index} className="rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3">
                      <div className="flex gap-3">
                        <div className="pt-1">
                          <IconUpload
                            value={link.iconImage || link.icon}
                            onChange={(value) => updateLink(index, 'iconImage', value)}
                          />
                        </div>
                        <div className="flex-1 grid sm:grid-cols-2 gap-3">
                          <input
                            value={link.title}
                            onChange={(event) => updateLink(index, 'title', event.target.value)}
                            placeholder="Titre du bouton"
                            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                          />
                          <input
                            value={link.url}
                            onChange={(event) => updateLink(index, 'url', event.target.value)}
                            placeholder="https://..."
                            className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                          />
                          <input
                            value={link.description || ''}
                            onChange={(event) => updateLink(index, 'description', event.target.value)}
                            placeholder="Description optionnelle"
                            className="sm:col-span-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2.5 text-sm text-gray-950 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                          />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-300 mt-3" />
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            disabled={links.length === 1}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex justify-between">
                  <button type="button" onClick={() => setActivePanel('identity')} className="rounded-xl px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Retour</button>
                  <button type="button" onClick={() => setActivePanel('style')} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">
                    Choisir le style
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>

              <section className={`${activePanel === 'style' ? 'block' : 'hidden'} rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5`}>
                <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">Etape 3</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">Choisissez l'ambiance</h3>
                <p className="mb-4 mt-1 text-sm text-gray-500 dark:text-gray-400">Vous pourrez modifier le style plus tard. Le plus important est de publier une page claire.</p>
                <div className="grid sm:grid-cols-4 gap-3 mb-5">
                  {themes.map(theme => (
                    <button
                      key={theme.label}
                      type="button"
                      onClick={() => {
                        setBackgroundColor(theme.backgroundColor)
                        setTextColor(theme.textColor)
                        setAccentColor(theme.accent)
                      }}
                      className="rounded-2xl border border-gray-200 dark:border-gray-800 p-3 text-left hover:border-indigo-400 transition-colors"
                    >
                      <div className="h-16 rounded-xl mb-3 border" style={{ backgroundColor: theme.backgroundColor }}>
                        <div className="w-10 h-2 rounded-full m-3" style={{ backgroundColor: theme.accent }} />
                        <div className="w-16 h-2 rounded-full mx-3 opacity-60" style={{ backgroundColor: theme.textColor }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{theme.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fond
                    <input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="mt-2 h-11 w-full rounded-xl" />
                  </label>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Texte
                    <input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="mt-2 h-11 w-full rounded-xl" />
                  </label>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Accent
                    <input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="mt-2 h-11 w-full rounded-xl" />
                  </label>
                </div>
                <div className="mt-5 flex justify-between">
                  <button type="button" onClick={() => setActivePanel('links')} className="rounded-xl px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Retour</button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {editingLink ? 'Mettre a jour' : 'Publier ma page'}
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-950 dark:text-white">Options avancees</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">URL publique, socials, couverture et style de boutons.</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                {showAdvanced && (
                  <div className="px-4 sm:px-5 pb-5 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        URL publique
                      </label>
                      <div className="flex rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                        <span className="hidden sm:flex items-center bg-gray-50 dark:bg-gray-900 px-3 text-sm text-gray-500">taplinkr.com/</span>
                        <input
                          value={slug}
                          onChange={(event) => {
                            setCustomSlugTouched(true)
                            setSlug(slugify(event.target.value))
                          }}
                          className="min-w-0 flex-1 bg-white dark:bg-gray-950 px-3 py-3 text-gray-950 dark:text-white outline-none"
                          placeholder="mon-pseudo"
                        />
                        <button type="button" onClick={handleCopyPreviewUrl} className="px-3 text-gray-500 hover:text-indigo-600">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2 min-h-5 text-xs">
                        {checkingSlug && <span className="inline-flex items-center gap-1 text-gray-500"><Loader2 className="w-3 h-3 animate-spin" /> Verification...</span>}
                        {!checkingSlug && slugAvailable === true && <span className="inline-flex items-center gap-1 text-green-600"><Check className="w-3 h-3" /> URL disponible</span>}
                        {!checkingSlug && slugAvailable === false && <span className="inline-flex items-center gap-1 text-red-600"><AlertCircle className="w-3 h-3" /> URL deja prise</span>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Photo de couverture</label>
                      <CoverImageUpload value={coverImage} onChange={setCoverImage} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <input value={instagramUrl} onChange={(event) => setInstagramUrl(event.target.value)} placeholder="Instagram URL" className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                      <input value={tiktokUrl} onChange={(event) => setTiktokUrl(event.target.value)} placeholder="TikTok URL" className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                      <input value={twitterUrl} onChange={(event) => setTwitterUrl(event.target.value)} placeholder="X / Twitter URL" className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                      <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="YouTube URL" className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Style des boutons</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          ['rounded-lg', 'Soft'],
                          ['rounded-2xl', 'Round'],
                          ['rounded-full', 'Pill'],
                        ].map(([value, label]) => (
                          <button
                            type="button"
                            key={value}
                            onClick={() => setBorderRadius(value)}
                            className={`py-2.5 px-3 border text-sm font-semibold ${value} ${borderRadius === value ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300'}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            <aside className="hidden lg:block border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-5">
              <div className="sticky top-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Apercu live</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Comme sur mobile</p>
                  </div>
                  <a href={`/${slug || ''}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-white dark:bg-gray-800 text-gray-500 hover:text-indigo-600">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="rounded-[2rem] bg-gray-950 p-3 shadow-2xl">
                  <div className="rounded-[1.5rem] overflow-hidden bg-white">
                    <div className="aspect-[9/16] overflow-hidden">
                      <div className="h-full overflow-y-auto" style={{ backgroundColor, color: textColor }}>
                        {coverImage ? (
                          <img src={coverImage} alt="" className="h-32 w-full object-cover" />
                        ) : (
                          <div className="h-24" style={{ background: `linear-gradient(135deg, ${accentColor}33, transparent)` }} />
                        )}
                        <div className="-mt-10 px-5 pb-8 text-center">
                          <div className="mx-auto h-20 w-20 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                            {profileImage ? <img src={profileImage} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="m-6 h-8 w-8 text-gray-400" />}
                          </div>
                          <h4 className="mt-3 text-xl font-bold">{title || 'Votre nom'}</h4>
                          <p className="mt-1 text-sm opacity-75">{description || 'Votre bio apparaîtra ici.'}</p>
                          <div className="mt-5 space-y-3">
                            {links.map((link, index) => (
                              <div key={index} className={`flex items-center justify-between px-4 py-3 shadow-sm ${borderRadius}`} style={{ backgroundColor: accentColor, color: '#fff' }}>
                                <span className="truncate text-sm font-semibold">{link.title || inferTitleFromUrl(link.url) || 'Nouveau lien'}</span>
                                <ArrowRight className="w-4 h-4 shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="lg:hidden sticky bottom-0 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur px-4 py-3">
              {activePanel === 'style' ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {editingLink ? 'Mettre a jour' : 'Publier ma page'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActivePanel(activePanel === 'start' ? 'identity' : activePanel === 'identity' ? 'links' : 'style')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
                >
                  Continuer
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-2xl dark:border-gray-800 dark:bg-gray-950">
              <div className="text-sm text-gray-500">
                {validLinks.length} lien{validLinks.length > 1 ? 's' : ''} pret{validLinks.length > 1 ? 's' : ''}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {editingLink ? 'Mettre a jour' : 'Publier ma page'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <EditPhonePreview
        isVisible={false}
        user={{ name: title, bio: description, image: profileImage }}
        links={[previewLink]}
      />
    </div>
  )
}
