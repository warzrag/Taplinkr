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
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Page createur
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white">
                {editingLink ? 'Modifier ma page' : 'Creer ma page Taplinkr'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Ajoutez vos infos, collez vos liens, publiez. Rien de plus complique.
              </p>
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
            <div className="max-h-[calc(100vh-92px)] overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
              <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="w-24 shrink-0">
                    <ImageUpload
                      value={profileImage}
                      onChange={setProfileImage}
                      type="avatar"
                      className="w-24"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Nom affiche
                      </label>
                      <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Florent, ta marque, ton pseudo..."
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
                        placeholder="Ce que les visiteurs doivent comprendre en 2 secondes."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-950 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-950 dark:text-white">Mes liens</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Collez vos destinations importantes. La preview se met a jour en direct.</p>
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
              </section>

              <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
                <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-4">Apparence rapide</h3>
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
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {editingLink ? 'Mettre a jour' : 'Publier ma page'}
              </button>
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
