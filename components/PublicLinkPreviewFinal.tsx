'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ShieldAlert } from 'lucide-react'
import LandingPageVisual, { LandingActionCard } from './LandingPageVisual'

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
  const title = link?.title || link?.user?.name || link?.user?.username || 'My links'
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
        language: navigator.language || 'en-US',
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
          language: navigator.language || 'en-US',
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
    <main className="min-h-screen">
      <LandingPageVisual
        title={title}
        bio={bio}
        profileImage={profileImage}
        coverImage={coverImage}
        backgroundColor={link?.backgroundColor || '#070a12'}
        textColor={link?.textColor || '#f8fafc'}
        accentColor={link?.color || '#8b5cf6'}
      >
        {multiLinks.length > 0 ? (
          multiLinks.map((item: any) => {
              const itemId = item?.id || item?.url || item?.title
              const itemTitle = item?.title || 'Open link'
              const itemIcon = item?.iconImage || item?.icon || null
              const ageRestricted = isAgeRestricted(item, link)
              const isConfirmed = confirmedLinks.includes(itemId)
              const isClicked = clickedLinks.includes(itemId)

              if (confirmingLink === itemId) {
                return (
                  <div key={itemId} className="rounded-2xl border border-rose-300/35 bg-rose-950/70 p-4 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-100" />
                      <div className="min-w-0 flex-1 text-left">
                        <p className="font-semibold text-white">Adults-only content</p>
                        <p className="mt-1 text-sm leading-5 text-white/70">
                          Confirm that you meet the age requirement before opening this link.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setConfirmingLink(null)}
                        className="rounded-xl border border-white/15 px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setConfirmedLinks((current) => [...current, itemId])
                          setConfirmingLink(null)
                          setTimeout(() => trackAndOpen(item), 0)
                        }}
                        className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-white/90"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <LandingActionCard
                  key={itemId}
                  title={itemTitle}
                  description={item?.description || null}
                  icon={itemIcon}
                  accentColor={link?.color || '#8b5cf6'}
                  borderRadius={link?.borderRadius || 'rounded-2xl'}
                  onClick={() => trackAndOpen(item)}
                  trailing={
                    <span className="flex shrink-0 items-center gap-2 text-xs font-semibold opacity-70">
                      {ageRestricted && !isConfirmed && <span>18+</span>}
                      {isClicked && <Check className="h-4 w-4" />}
                    </span>
                  }
                />
              )
          })
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-center text-sm opacity-70 backdrop-blur">
            No links are available right now.
          </div>
        )}
      </LandingPageVisual>
    </main>
  )
}
