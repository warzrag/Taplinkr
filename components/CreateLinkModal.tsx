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
  RefreshCw,
  Sparkles,
  Trash2,
  Zap,
  X,
} from 'lucide-react'
import { Link as LinkType } from '@/types'
import { createShortPublicSlug } from '@/lib/public-slug'
import { normalizeHttpURL } from '@/lib/url-validator'
import ImageUpload from './upload/ImageUpload'
import CoverImageUpload from './upload/CoverImageUpload'
import IconUpload from './upload/IconUpload'
import EditPhonePreview from './EditPhonePreview'
import LandingPageVisual, { LandingActionCard } from './LandingPageVisual'

interface CreateLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newLink?: any) => void
  editingLink?: LinkType | null
  initialMode?: 'landing' | 'direct'
}

interface PageLink {
  title: string
  url: string
  description?: string
  icon?: string
  iconImage?: string
}

const defaultLinks: PageLink[] = [
  { title: '', url: '', description: '', icon: '', iconImage: '' },
]

const themes = [
  { label: 'Midnight', backgroundColor: '#070a12', textColor: '#f8fafc', accent: '#8b5cf6' },
  { label: 'Cloud', backgroundColor: '#f8fafc', textColor: '#0f172a', accent: '#4f46e5' },
  { label: 'Sunset', backgroundColor: '#2a102f', textColor: '#fff7ed', accent: '#fb7185' },
  { label: 'Ocean', backgroundColor: '#071b2d', textColor: '#f0fdfa', accent: '#22d3ee' },
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

export default function CreateLinkModal({ isOpen, onClose, onSuccess, editingLink, initialMode = 'landing' }: CreateLinkModalProps) {
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [activePanel, setActivePanel] = useState<'start' | 'identity' | 'links' | 'style'>('start')
  const [pageMode, setPageMode] = useState<'landing' | 'direct'>('landing')
  const [directUrl, setDirectUrl] = useState('')

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
  const [backgroundColor, setBackgroundColor] = useState('#070a12')
  const [textColor, setTextColor] = useState('#f8fafc')
  const [accentColor, setAccentColor] = useState('#8b5cf6')
  const [borderRadius, setBorderRadius] = useState('rounded-2xl')
  const [customSlugTouched, setCustomSlugTouched] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    if (editingLink) {
      setPageMode(editingLink.isDirect ? 'direct' : 'landing')
      setDirectUrl(editingLink.directUrl || '')
      setActivePanel('identity')
      setTitle(editingLink.isDirect ? (editingLink.internalName || editingLink.title || '') : (editingLink.title || ''))
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
      setBackgroundColor(editingLink.backgroundColor || '#070a12')
      setTextColor(editingLink.textColor || '#f8fafc')
      setAccentColor(editingLink.color || '#8b5cf6')
      setBorderRadius(editingLink.borderRadius || 'rounded-2xl')
      setCustomSlugTouched(true)
    } else {
      setPageMode(initialMode)
      setDirectUrl('')
      setTitle('')
      setDescription('')
      setSlug(initialMode === 'direct' ? createShortPublicSlug() : '')
      setProfileImage('')
      setCoverImage('')
      setLinks(defaultLinks)
      setInstagramUrl('')
      setTiktokUrl('')
      setTwitterUrl('')
      setYoutubeUrl('')
      setBackgroundColor('#070a12')
      setTextColor('#f8fafc')
      setAccentColor('#8b5cf6')
      setBorderRadius('rounded-2xl')
      setCustomSlugTouched(false)
      setShowAdvanced(false)
      setActivePanel('identity')
    }
  }, [isOpen, editingLink, initialMode])

  useEffect(() => {
    if (!editingLink && !customSlugTouched && pageMode === 'landing') {
      setSlug(slugify(title))
    }
  }, [title, customSlugTouched, pageMode, editingLink])

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

  const panelSteps = pageMode === 'direct'
    ? [
        ['start', 'Type', 'Page or redirect'],
        ['identity', 'Destination', 'Name, URL, and destination'],
      ]
    : [
        ['start', 'Template', 'Choose a starting point'],
        ['identity', 'Profile', 'Name, bio, photo'],
        ['links', 'Buttons', 'Links to publish'],
        ['style', 'Design', 'Colors and appearance'],
      ]

  const previewLink = useMemo(() => ({
    id: editingLink?.id || 'preview',
    slug: slug || 'votre-page',
    title: title || 'Your name',
    description,
    profileImage,
    profileStyle: 'circle',
    coverImage,
    isDirect: pageMode === 'direct',
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
      title: link.title || inferTitleFromUrl(link.url) || `Link ${index + 1}`,
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
    directUrl,
    shieldEnabled: false,
    isUltraLink: false,
    isOnline: false,
    order: 0,
    clicks: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }), [accentColor, backgroundColor, borderRadius, coverImage, description, directUrl, editingLink?.id, instagramUrl, links, pageMode, profileImage, slug, textColor, tiktokUrl, title, twitterUrl, youtubeUrl])

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
    setPageMode('landing')
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
      setDescription(description || 'Find all my links in one place.')
      setLinks([
        { title: 'Instagram', url: 'https://instagram.com/', description: '', icon: '', iconImage: '' },
        { title: 'TikTok', url: 'https://tiktok.com/@', description: '', icon: '', iconImage: '' },
        { title: 'YouTube', url: 'https://youtube.com/', description: '', icon: '', iconImage: '' },
      ])
    }
    setActivePanel('identity')
  }

  const startDirectLink = () => {
    setPageMode('direct')
    if (!editingLink) {
      setSlug(createShortPublicSlug())
      setCustomSlugTouched(false)
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
      toast.error('Unable to copy the link')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!title.trim()) {
      toast.error('Add a name for your page')
      return
    }

    if (!slug.trim()) {
      toast.error('Choose a public URL.')
      return
    }

    if (slugAvailable === false) {
      toast.error('This public URL is already in use')
      return
    }

    if (imageUploading) {
      toast.error("Laissez l'image finir son upload")
      return
    }

    const normalizedDirectUrl = normalizeHttpURL(directUrl)
    if (pageMode === 'direct' && !normalizedDirectUrl) {
      toast.error('Ajoutez l’URL de destination')
      return
    }

    if (pageMode === 'landing' && validLinks.length === 0) {
      toast.error('Add at least one link with a title and URL')
      return
    }

    setLoading(true)

    try {
      const requestBody = {
        title: pageMode === 'direct' ? 'Direct link' : title.trim(),
        internalName: pageMode === 'direct' ? title.trim() : null,
        slug: slug.trim(),
        description: description.trim() || null,
        bio: description.trim() || null,
        isDirect: pageMode === 'direct',
        directUrl: pageMode === 'direct' ? normalizedDirectUrl : null,
        shieldEnabled: pageMode === 'direct' ? Boolean(editingLink?.shieldEnabled) : false,
        isUltraLink: pageMode === 'direct' ? Boolean(editingLink?.isUltraLink) : false,
        multiLinks: pageMode === 'landing'
          ? validLinks.map((link, index) => ({
              title: link.title.trim(),
              url: normalizeHttpURL(link.url),
              description: link.description?.trim() || null,
              icon: link.icon || '',
              iconImage: link.iconImage || '',
              order: index,
            }))
          : [],
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
        throw new Error(errorData.message || errorData.error || 'Unable to save your link')
      }

      const savedLink = await response.json()
      toast.success(
        pageMode === 'direct'
          ? (editingLink ? 'Direct link updated' : 'Direct link published')
          : (editingLink ? 'Page updated' : 'Page published')
      )
      onSuccess(savedLink)
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  if (pageMode === 'landing') {
    const landingSteps = [
      { id: 'identity' as const, label: 'Page info', helper: 'Name, photo, and address' },
      { id: 'links' as const, label: 'Links', helper: 'Add what visitors can open' },
      { id: 'style' as const, label: 'Design', helper: 'Choose the final look' },
    ]
    const currentStep = Math.max(0, landingSteps.findIndex(step => step.id === activePanel))

    const goToStep = (step: 'identity' | 'links' | 'style') => {
      if ((step === 'links' || step === 'style') && (!title.trim() || !slug.trim())) {
        toast.error('Add your page name and public address first')
        setActivePanel('identity')
        return
      }
      if ((step === 'links' || step === 'style') && slugAvailable === false) {
        toast.error('Choose an available public address')
        setActivePanel('identity')
        return
      }
      if (step === 'style' && validLinks.length === 0) {
        toast.error('Add at least one complete link first')
        setActivePanel('links')
        return
      }
      setActivePanel(step)
    }

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070a12] text-white">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070a12]/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-4 sm:px-7">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">
                  {editingLink ? 'Edit page' : 'Create a page'}
                </p>
                <h2 className="mt-1 truncate text-lg font-black sm:text-xl">
                  {title.trim() || 'Your new page'}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Close</span>
              </button>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-[1480px] lg:grid-cols-[minmax(0,1fr)_430px]">
            <div className="min-w-0 px-4 py-6 sm:px-7 lg:py-9">
              <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-white">Step {currentStep + 1} of 3</span>
                    <span className="text-white/45">{landingSteps[currentStep]?.label}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
                    />
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {landingSteps.map((step, index) => (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => goToStep(step.id)}
                        className={`rounded-2xl border px-3 py-3 text-left transition ${
                          activePanel === step.id
                            ? 'border-violet-500/60 bg-violet-500/15'
                            : index < currentStep
                              ? 'border-emerald-400/20 bg-emerald-400/5 hover:bg-emerald-400/10'
                              : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-sm font-bold">
                          <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                            index < currentStep ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10'
                          }`}>
                            {index < currentStep ? <Check className="h-3.5 w-3.5" /> : index + 1}
                          </span>
                          <span className="hidden sm:inline">{step.label}</span>
                        </span>
                        <span className="mt-1 hidden text-xs text-white/40 md:block">{step.helper}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {activePanel === 'identity' && (
                  <section>
                    <p className="text-sm font-bold text-violet-400">PAGE INFO</p>
                    <h3 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Introduce yourself.</h3>
                    <p className="mt-2 text-white/55">This is the first thing people will see. You can change it anytime.</p>

                    <div className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
                      <div className="grid gap-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
                        <ImageUpload
                          value={profileImage}
                          onChange={setProfileImage}
                          type="avatar"
                          compact
                          onUploadingChange={setImageUploading}
                        />
                        <div>
                          <h4 className="font-bold">Profile photo</h4>
                          <p className="mt-1 text-sm leading-6 text-white/45">
                            Use a clear portrait or logo. Square images work best.
                          </p>
                        </div>
                      </div>

                      <label className="block">
                        <span className="text-sm font-bold">Display name</span>
                        <input
                          value={title}
                          onChange={event => setTitle(event.target.value)}
                          placeholder="e.g. Madison"
                          autoFocus
                          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-bold">Short bio <span className="font-normal text-white/35">(optional)</span></span>
                        <textarea
                          value={description}
                          onChange={event => setDescription(event.target.value)}
                          placeholder="Tell visitors what they will find here."
                          rows={3}
                          className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-bold">Public page address</span>
                        <div className="mt-2 flex overflow-hidden rounded-2xl border border-white/10 bg-black/20 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
                          <span className="hidden items-center border-r border-white/10 bg-white/5 px-4 text-sm text-white/40 sm:flex">taplinkr.com/</span>
                          <input
                            value={slug}
                            onChange={event => {
                              setCustomSlugTouched(true)
                              setSlug(slugify(event.target.value))
                            }}
                            placeholder="your-name"
                            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-white outline-none placeholder:text-white/25"
                          />
                          <span className="grid w-12 place-items-center">
                            {checkingSlug ? (
                              <Loader2 className="h-4 w-4 animate-spin text-white/45" />
                            ) : slug && slugAvailable === true ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : slugAvailable === false ? (
                              <X className="h-4 w-4 text-rose-400" />
                            ) : null}
                          </span>
                        </div>
                        <p className={`mt-2 text-xs ${slugAvailable === false ? 'text-rose-400' : 'text-white/35'}`}>
                          {slugAvailable === false ? 'This address is already taken.' : 'Short, memorable, and easy to share.'}
                        </p>
                      </label>
                    </div>
                  </section>
                )}

                {activePanel === 'links' && (
                  <section>
                    <p className="text-sm font-bold text-violet-400">YOUR LINKS</p>
                    <h3 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">What should people open?</h3>
                    <p className="mt-2 text-white/55">Add one or more destinations. Only complete links will be published.</p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {['Instagram', 'TikTok', 'YouTube', 'Telegram', 'Website'].map(label => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => addPresetLink({ title: label, url: '', description: '', icon: '', iconImage: '' })}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/65 transition hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white"
                        >
                          + {label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 space-y-4">
                      {links.map((link, index) => (
                        <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                          <div className="mb-4 flex items-center justify-between">
                            <span className="inline-flex items-center gap-2 text-sm font-bold text-white/55">
                              <Link2 className="h-4 w-4 text-violet-400" />
                              Link {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeLink(index)}
                              disabled={links.length === 1}
                              className="rounded-xl p-2 text-white/35 transition hover:bg-rose-500/10 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-20"
                              aria-label={`Remove link ${index + 1}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label>
                              <span className="text-xs font-bold text-white/55">Button title</span>
                              <input
                                value={link.title}
                                onChange={event => updateLink(index, 'title', event.target.value)}
                                placeholder="e.g. Follow me on Instagram"
                                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm outline-none placeholder:text-white/25 focus:border-violet-500"
                              />
                            </label>
                            <label>
                              <span className="text-xs font-bold text-white/55">Destination URL</span>
                              <input
                                value={link.url}
                                onChange={event => updateLink(index, 'url', event.target.value)}
                                placeholder="https://..."
                                inputMode="url"
                                className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm outline-none placeholder:text-white/25 focus:border-violet-500"
                              />
                            </label>
                          </div>
                          <label className="mt-3 block">
                            <span className="text-xs font-bold text-white/55">Description <span className="font-normal">(optional)</span></span>
                            <input
                              value={link.description || ''}
                              onChange={event => updateLink(index, 'description', event.target.value)}
                              placeholder="A short reason to click"
                              className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-sm outline-none placeholder:text-white/25 focus:border-violet-500"
                            />
                          </label>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addLink}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-400/35 bg-violet-500/5 px-4 py-4 text-sm font-bold text-violet-300 transition hover:bg-violet-500/10"
                    >
                      <Plus className="h-4 w-4" />
                      Add another link
                    </button>
                  </section>
                )}

                {activePanel === 'style' && (
                  <section>
                    <p className="text-sm font-bold text-violet-400">DESIGN</p>
                    <h3 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Make it feel like you.</h3>
                    <p className="mt-2 text-white/55">Pick a polished style. Your preview updates instantly.</p>

                    <div className="mt-8 space-y-7 rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-7">
                      <div>
                        <h4 className="text-sm font-bold">Choose a theme</h4>
                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {themes.map(theme => {
                            const selected = backgroundColor === theme.backgroundColor && accentColor === theme.accent
                            return (
                              <button
                                key={theme.label}
                                type="button"
                                onClick={() => {
                                  setBackgroundColor(theme.backgroundColor)
                                  setTextColor(theme.textColor)
                                  setAccentColor(theme.accent)
                                }}
                                className={`rounded-2xl border p-2 text-left transition ${selected ? 'border-violet-400 ring-4 ring-violet-500/10' : 'border-white/10 hover:border-white/25'}`}
                              >
                                <span className="block h-20 rounded-xl p-2" style={{ backgroundColor: theme.backgroundColor }}>
                                  <span className="mt-6 block h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
                                  <span className="mt-2 block h-2 w-2/3 rounded-full bg-white/15" />
                                </span>
                                <span className="mt-2 block px-1 text-xs font-bold">{theme.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold">Button shape</h4>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {[
                            ['rounded-xl', 'Soft'],
                            ['rounded-2xl', 'Rounded'],
                            ['rounded-full', 'Pill'],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setBorderRadius(value)}
                              className={`border px-3 py-3 text-sm font-bold transition ${value} ${
                                borderRadius === value ? 'border-violet-400 bg-violet-500/15 text-violet-200' : 'border-white/10 bg-white/5 text-white/55 hover:bg-white/10'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 text-sm font-bold">Background image <span className="font-normal text-white/35">(optional)</span></h4>
                        <CoverImageUpload
                          value={coverImage}
                          onChange={setCoverImage}
                          onUploadingChange={setImageUploading}
                        />
                      </div>
                    </div>
                  </section>
                )}

                <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
                  <button
                    type="button"
                    onClick={() => activePanel === 'identity' ? onClose() : goToStep(activePanel === 'style' ? 'links' : 'identity')}
                    className="rounded-xl px-4 py-3 text-sm font-bold text-white/55 transition hover:bg-white/5 hover:text-white"
                  >
                    {activePanel === 'identity' ? 'Cancel' : 'Back'}
                  </button>
                  {activePanel === 'style' ? (
                    <button
                      type="submit"
                      disabled={loading || imageUploading || checkingSlug}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-600/25 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {editingLink ? 'Save changes' : 'Publish my page'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => goToStep(activePanel === 'identity' ? 'links' : 'style')}
                      disabled={checkingSlug}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#070a12] transition hover:bg-violet-100 disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <aside className="border-l border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-[81px] lg:h-[calc(100vh-81px)] lg:overflow-y-auto">
              <div className="mx-auto max-w-[380px]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">Live preview</p>
                    <p className="mt-1 text-sm text-white/65">Exactly what visitors will see</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPreviewUrl}
                    className="rounded-xl border border-white/10 p-2.5 text-white/45 transition hover:bg-white/10 hover:text-white"
                    aria-label="Copy page address"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-hidden rounded-[34px] border-[8px] border-[#171b26] bg-[#171b26] shadow-2xl">
                  <LandingPageVisual
                    compact
                    title={title || 'Your name'}
                    bio={description || 'Your bio will appear here.'}
                    profileImage={profileImage}
                    coverImage={coverImage}
                    backgroundColor={backgroundColor}
                    textColor={textColor}
                    accentColor={accentColor}
                  >
                    {(validLinks.length ? validLinks : [{ title: 'Your first link', url: '#', description: '' }]).slice(0, 5).map((link, index) => (
                      <LandingActionCard
                        key={`${link.title}-${index}`}
                        title={link.title || 'Untitled link'}
                        description={link.description}
                        accentColor={accentColor}
                        borderRadius={borderRadius}
                        disabled
                      />
                    ))}
                  </LandingPageVisual>
                </div>
              </div>
            </aside>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-white">
      <div className="min-h-screen px-0">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-950"
        >
          <div className="sticky top-0 z-20 flex items-start justify-between border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95 sm:px-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Taplinkr creator
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white">
                {editingLink
                  ? (pageMode === 'direct' ? 'Edit my direct link' : 'Edit my page')
                  : (pageMode === 'direct' ? 'Create a direct link' : 'Create a link page')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {pageMode === 'direct'
                  ? 'A short Taplinkr URL that instantly redirects to your destination.'
                  : 'Profile, buttons, design, and publishing in one place.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {panelSteps.map(([value, label]) => (
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
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
            >
              <X className="w-5 h-5 text-gray-500" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto grid w-full max-w-7xl lg:grid-cols-[220px_minmax(0,1fr)_380px]">
            <aside className="hidden border-r border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-950 lg:block">
              <div className="sticky top-28 space-y-2">
                {panelSteps.map(([value, label, helper]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setActivePanel(value as typeof activePanel)}
                    className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                      activePanel === value
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
                    }`}
                  >
                    <span className="block text-sm font-bold">{label}</span>
                    <span className={`mt-0.5 block text-xs ${activePanel === value ? 'text-indigo-100' : 'text-gray-400'}`}>{helper}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="px-4 sm:px-6 py-6 space-y-6">
              <section className={`${activePanel === 'start' ? 'block' : 'hidden'} rounded-3xl border border-indigo-200 bg-indigo-50/70 p-5 dark:border-indigo-500/20 dark:bg-indigo-500/10 sm:p-6`}>
                <div className="max-w-2xl">
                  <p className="text-sm font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Nouveau</p>
                  <h3 className="mt-2 text-3xl font-bold leading-tight text-gray-950 dark:text-white">
                    Choose a page template
                  </h3>
                  <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                    Choose a page type. Starter buttons are prefilled, so you only need to replace the URLs.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                  <button
                    type="button"
                    onClick={startDirectLink}
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg dark:border-amber-500/30 dark:bg-amber-500/10"
                  >
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-amber-500 text-white">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold text-gray-950 dark:text-white">Direct link</h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">A short URL that redirects without an intermediate page.</p>
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 dark:bg-gray-950">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You can also start from scratch.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActivePanel('identity')}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
                  >
                    Create a blank page
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>

              <section className={`${activePanel === 'identity' ? 'block' : 'hidden'} rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5`}>
                {pageMode === 'direct' ? (
                  <>
                    <div className="mb-5">
                      <p className="text-sm font-bold uppercase tracking-wide text-amber-600 dark:text-amber-300">Direct link</p>
                      <h3 className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">Choose the destination</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Le visiteur clique sur votre URL Taplinkr et arrive directement sur cette adresse.</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">Internal name</label>
                        <input
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder="Example: My shop, Summer offer..."
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                        <p className="mt-1.5 text-xs text-gray-500">This name helps you find the link in your dashboard. It is never shown publicly.</p>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">URL de destination</label>
                        <input
                          type="text"
                          inputMode="url"
                          value={directUrl}
                          onChange={(event) => setDirectUrl(event.target.value)}
                          placeholder="https://your-site.com/offer"
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">Public address</label>
                        <div className="flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-gray-700">
                          <span className="hidden items-center bg-gray-50 px-3 text-sm text-gray-500 dark:bg-gray-950 sm:flex">taplinkr.com/</span>
                          <input
                            value={slug}
                            onChange={(event) => {
                              setCustomSlugTouched(true)
                              setSlug(slugify(event.target.value))
                            }}
                            placeholder="my-offer"
                            className="min-w-0 flex-1 bg-white px-3 py-3 text-gray-950 outline-none dark:bg-gray-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCustomSlugTouched(true)
                              setSlug(createShortPublicSlug())
                            }}
                            className="border-l border-gray-200 bg-gray-50 px-3 text-gray-500 transition hover:text-indigo-600 dark:border-gray-700 dark:bg-gray-950"
                            title="Generate a new address"
                            aria-label="Generate a new public address"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="mt-1.5 text-xs text-gray-500">This address is public. Your internal name is never shown here.</p>
                        <div className="mt-2 min-h-5 text-xs">
                          {checkingSlug && <span className="inline-flex items-center gap-1 text-gray-500"><Loader2 className="h-3 w-3 animate-spin" /> Checking...</span>}
                          {!checkingSlug && slugAvailable === true && <span className="inline-flex items-center gap-1 text-green-600"><Check className="h-3 w-3" /> URL disponible</span>}
                          {!checkingSlug && slugAvailable === false && <span className="inline-flex items-center gap-1 text-red-600"><AlertCircle className="h-3 w-3" /> URL already taken</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-between gap-3">
                      <button type="button" onClick={() => setActivePanel('start')} className="rounded-xl px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Changer de type</button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        {editingLink ? 'Update' : 'Publish direct link'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
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
                          onUploadingChange={setImageUploading}
                        />
                      </div>
                      <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Display name
                      </label>
                      <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Example: Madison, Taplinkr, your handle..."
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
                        placeholder="Example: Find all my content, offers, and social profiles here."
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
                        Continue to links
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
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
                    Add
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
                            placeholder="Button title"
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
                            placeholder="Optional description"
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
                  <button type="button" onClick={() => setActivePanel('identity')} className="rounded-xl px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Back</button>
                  <button type="button" onClick={() => setActivePanel('style')} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">
                    Choose a style
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </section>

              <section className={`${activePanel === 'style' ? 'block' : 'hidden'} rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5`}>
                <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">Etape 3</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">Choose a style</h3>
                <p className="mb-4 mt-1 text-sm text-gray-500 dark:text-gray-400">You can change the style later. Start by publishing a clear, focused page.</p>
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
                  <button type="button" onClick={() => setActivePanel('links')} className="rounded-xl px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Back</button>
                  <button
                    type="submit"
                    disabled={loading || imageUploading}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {loading || imageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {imageUploading ? 'Uploading...' : editingLink ? 'Update' : 'Publish my page'}
                  </button>
                </div>
              </section>

              {(pageMode as 'landing' | 'direct') === 'landing' && (
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
                          placeholder="my-handle"
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
                      <CoverImageUpload value={coverImage} onChange={setCoverImage} onUploadingChange={setImageUploading} />
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
              )}
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

                {pageMode === 'direct' && (
                  <div className="rounded-3xl bg-gray-950 p-6 text-white shadow-2xl">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500">
                      <Zap className="h-6 w-6" />
                    </div>
                    <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-white/45">Your short link</p>
                    <p className="mt-2 break-all text-lg font-bold">taplinkr.com/{slug || 'my-offer'}</p>
                    <div className="my-6 flex items-center gap-3 text-white/45">
                      <div className="h-px flex-1 bg-white/15" />
                      <ArrowRight className="h-5 w-5" />
                      <div className="h-px flex-1 bg-white/15" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Destination</p>
                    <p className="mt-2 break-all text-sm text-white/80">{directUrl || 'https://your-site.com/offer'}</p>
                    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                      Instant redirect with click tracking included.
                    </div>
                  </div>
                )}

                <div className={pageMode === 'direct' ? 'hidden' : 'rounded-[2rem] bg-gray-950 p-3 shadow-2xl'}>
                  <div className="rounded-[1.5rem] overflow-hidden bg-white">
                    <div className="aspect-[9/16] overflow-hidden">
                      <div className="h-full overflow-y-auto" style={{ backgroundColor, color: textColor }}>
                        {coverImage ? (
                          <div className="relative h-28 w-full overflow-hidden bg-gray-100">
                            <img src={coverImage} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-45" />
                            <img src={coverImage} alt="" className="relative h-full w-full object-contain" />
                            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/90 to-transparent" />
                          </div>
                        ) : (
                          <div className="h-24" style={{ background: `linear-gradient(135deg, ${accentColor}33, transparent)` }} />
                        )}
                        <div className="-mt-10 px-5 pb-8 text-center">
                          <div className="mx-auto h-20 w-20 rounded-full border-4 border-white bg-gray-100 overflow-hidden shadow-lg">
                            {profileImage ? <img src={profileImage} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="m-6 h-8 w-8 text-gray-400" />}
                          </div>
                          <h4 className="mt-3 text-xl font-bold">{title || 'Your name'}</h4>
                          <p className="mt-1 text-sm opacity-75">{description || 'Your bio will appear here.'}</p>
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
              {activePanel === 'style' || (pageMode === 'direct' && activePanel === 'identity') ? (
                <button
                  type="submit"
                  disabled={loading || imageUploading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {loading || imageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {imageUploading
                    ? 'Upload en cours'
                    : editingLink
                      ? 'Mettre a jour'
                      : pageMode === 'direct'
                        ? 'Publish direct link'
                        : 'Publish my page'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActivePanel(activePanel === 'start' ? 'identity' : activePanel === 'identity' ? 'links' : 'style')}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="hidden lg:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-2xl dark:border-gray-800 dark:bg-gray-950">
              <div className="text-sm text-gray-500">
                {pageMode === 'direct'
                  ? (directUrl ? 'Destination ready' : 'Add a destination')
                  : `${validLinks.length} lien${validLinks.length > 1 ? 's' : ''} pret${validLinks.length > 1 ? 's' : ''}`}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || imageUploading}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading || imageUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {imageUploading
                  ? 'Upload en cours'
                  : editingLink
                    ? 'Mettre a jour'
                    : pageMode === 'direct'
                      ? 'Publish direct link'
                      : 'Publish my page'}
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
