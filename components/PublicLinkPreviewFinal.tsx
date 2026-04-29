'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Check, ExternalLink, ShieldAlert } from 'lucide-react'

interface PublicLinkPreviewProps {
  link: any
}

function normalizeUrl(url: string) {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

function getSessionId() {
  const key = 'taplinkr_visit_session'
  const timeout = 30 * 60 * 1000
  const now = Date.now()

  try {
    const existing = localStorage.getItem(key)
    if (existing) {
      const parsed = JSON.parse(existing)
      if (parsed?.id && now - parsed.lastActivity < timeout) {
        localStorage.setItem(key, JSON.stringify({ ...parsed, lastActivity: now }))
        return parsed.id as string
      }
    }
  } catch {}

  const id = `${now}-${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(key, JSON.stringify({ id, lastActivity: now }))
  return id
}

function isAgeRestricted(item: any, parent: any) {
  const url = String(item?.url || '').toLowerCase()
  return Boolean(
    item?.requiresAgeConfirmation ||
      item?.ageRestricted ||
      item?.isAdult ||
      item?.nsfw ||
      parent?.requiresAgeConfirmation ||
      parent?.ageRestricted ||
      url.includes('onlyfans.com')
  )
}

export default function PublicLinkPreviewFinal({ link }: PublicLinkPreviewProps) {
  const [sessionId, setSessionId] = useState('')
  const [clickedLinks, setClickedLinks] = useState<string[]>([])
  const [confirmedLinks, setConfirmedLinks] = useState<string[]>([])
  const [confirmingLink, setConfirmingLink] = useState<string | null>(null)

  const profileImage = link?.profileImage || null
  const coverImage = link?.coverImage || null
  const backgroundImage = link?.profileStyle === 'beacon' ? profileImage : coverImage
  const title = link?.title || link?.user?.name || link?.user?.username || 'Mes liens'
  const bio = link?.description || link?.user?.bio || null
  const multiLinks = useMemo(() => {
    return Array.isArray(link?.multiLinks)
      ? [...link.multiLinks].sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999))
      : []
  }, [link?.multiLinks])

  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  useEffect(() => {
    if (!link?.id) return

    const key = `taplinkr_tracked_${link.id}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, 'true')

    fetch('/api/track-link-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        linkId: link.id,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || 'fr',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      keepalive: true,
    }).catch(() => {
      sessionStorage.removeItem(key)
    })
  }, [link?.id])

  const trackAndOpen = async (item: any) => {
    const itemId = item?.id
    const itemUrl = normalizeUrl(item?.url || '#')
    if (!itemId || itemUrl === '#') return

    const ageRestricted = isAgeRestricted(item, link)
    if (ageRestricted && !confirmedLinks.includes(itemId)) {
      setConfirmingLink(itemId)
      return
    }

    setClickedLinks((current) => (current.includes(itemId) ? current : [...current, itemId]))

    const openedWindow = window.open('about:blank', '_blank')
    if (openedWindow) openedWindow.opener = null

    try {
      await fetch('/api/track-multilink-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          multiLinkId: itemId,
          sessionId,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language || 'fr',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        keepalive: true,
      })
    } catch {}

    if (openedWindow) {
      openedWindow.location.href = itemUrl
    } else {
      window.location.href = itemUrl
    }
  }

  if (!link) {
    return <main className="min-h-screen bg-neutral-950" />
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-0">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,#334155_0%,#020617_52%,#000_100%)]" />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 to-transparent" />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[304px] flex-col justify-end px-0 pb-8 pt-16 sm:max-w-[430px] sm:px-6">
        <div className="mb-7 text-center">
          {profileImage && link?.profileStyle !== 'beacon' && (
            <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border border-white/35 bg-white/10 shadow-2xl">
              <img src={profileImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            TapLinkr
          </p>
          <h1 className="mx-auto max-w-sm break-words text-3xl font-semibold leading-tight text-white drop-shadow">
            {title}
          </h1>
          {bio && (
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/75">
              {bio}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {multiLinks.length > 0 ? (
            multiLinks.map((item: any) => {
              const itemId = item?.id || item?.url || item?.title
              const itemTitle = item?.title || 'Ouvrir le lien'
              const itemIcon = item?.iconImage || item?.icon || null
              const ageRestricted = isAgeRestricted(item, link)
              const isConfirmed = confirmedLinks.includes(itemId)
              const isClicked = clickedLinks.includes(itemId)

              if (confirmingLink === itemId) {
                return (
                  <div
                    key={itemId}
                    className="rounded-2xl border border-rose-300/35 bg-rose-950/55 p-4 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-100" />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="font-semibold text-white">Contenu réservé aux adultes</p>
                        <p className="mt-1 text-sm leading-5 text-white/70">
                          Confirmez que vous avez l'âge requis avant d'ouvrir ce lien.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setConfirmingLink(null)}
                        className="rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => {
                          setConfirmedLinks((current) => [...current, itemId])
                          setConfirmingLink(null)
                          setTimeout(() => trackAndOpen(item), 0)
                        }}
                        className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-white/90"
                      >
                        Confirmer
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <button
                  key={itemId}
                  onClick={() => trackAndOpen(item)}
                  className="group flex min-h-[64px] w-full items-center gap-2 rounded-2xl border border-white/15 bg-white/90 px-3 py-3 text-left text-neutral-950 shadow-2xl shadow-black/15 backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/25"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 text-lg">
                    {itemIcon ? (
                      String(itemIcon).startsWith('http') ||
                      String(itemIcon).startsWith('/') ||
                      String(itemIcon).startsWith('data:') ? (
                        <img src={itemIcon} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span>{itemIcon}</span>
                      )
                    ) : (
                      <ExternalLink className="h-5 w-5 text-neutral-500" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-[13px] font-semibold leading-4 text-neutral-950 sm:text-sm sm:leading-5">
                      {itemTitle}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                      {ageRestricted && !isConfirmed && <span>18+</span>}
                      {isClicked && (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <Check className="h-3 w-3" />
                          Visité
                        </span>
                      )}
                    </span>
                  </span>

                  <ArrowUpRight className="h-5 w-5 flex-shrink-0 text-neutral-400 transition group-hover:text-neutral-900" />
                </button>
              )
            })
          ) : (
            <div className="rounded-2xl border border-white/12 bg-white/10 p-6 text-center text-sm text-white/70 backdrop-blur">
              Aucun lien disponible pour le moment.
            </div>
          )}
        </div>

        <a
          href="https://www.taplinkr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/20 px-4 py-2 text-xs font-medium text-white/55 backdrop-blur transition hover:text-white"
        >
          Créé avec TapLinkr
        </a>
      </section>
    </main>
  )
}
