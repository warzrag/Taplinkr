'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ShieldAlert } from 'lucide-react'
import LandingPageVisual, { LandingActionCard } from './LandingPageVisual'
import LandingTrackingConsent from './LandingTrackingConsent'
import { parseLandingSettings } from '@/lib/landing-settings'

interface PublicLinkPreviewProps {
  link: any
}

function normalizeUrl(url: string) {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

function countryName(countryCode: string) {
  if (!countryCode) return ''
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode.toUpperCase()) || countryCode
  } catch {
    return countryCode
  }
}

function visitorLocationLabel(template: string, city: string, countryCode: string) {
  const needsCity = template.includes('{city}')
  const needsCountry = template.includes('{country}')
  const country = countryName(countryCode)
  if ((needsCity && !city) || (needsCountry && !country)) return null

  return template
    .replaceAll('{city}', city)
    .replaceAll('{country}', country)
    .trim() || null
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
  const [ageConfirmed, setAgeConfirmed] = useState(false)

  const profileImage = link?.profileImage || null
  const coverImage = link?.coverImage || null
  const title = link?.title || link?.user?.name || link?.user?.username || 'My links'
  const bio = link?.description || link?.user?.bio || null
  const settings = useMemo(() => parseLandingSettings(link?.shieldConfig), [link?.shieldConfig])
  const locationLabel = settings.visitorLocationBadge
    ? visitorLocationLabel(settings.locationBadgeTemplate, link?._visitorCity || '', link?._visitorCountry || '')
    : null
  const multiLinks = useMemo(() => {
    return Array.isArray(link?.multiLinks)
      ? [...link.multiLinks].sort((a: any, b: any) => (a.order ?? 999) - (b.order ?? 999))
      : []
  }, [link?.multiLinks])

  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  useEffect(() => {
    if (!settings.ageGateEnabled) return
    setAgeConfirmed(localStorage.getItem(`taplinkr_age_${link?.id}`) === 'confirmed')
  }, [link?.id, settings.ageGateEnabled])

  useEffect(() => {
    if (!link?.id) return

    const key = `taplinkr_tracked_${link.id}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, 'true')

    // Jeton anonyme depose par VenusBot dans l'adresse (?vb=). Il permet de
    // relier ce clic a la conversation qui a envoye le lien, sans rien savoir
    // du fan lui-meme.
    const fanToken = new URLSearchParams(window.location.search).get('vb')

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
        ...(fanToken ? { fanToken } : {}),
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
    if (ageRestricted && !settings.ageGateEnabled && !confirmedLinks.includes(itemId)) {
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

    const win = window as any
    win.gtag?.('event', 'select_content', { content_type: 'landing_link', item_id: itemId })
    win.fbq?.('trackCustom', 'TaplinkrLinkClick', { link_id: itemId })

    if (openedWindow) {
      openedWindow.location.href = itemUrl
    } else {
      window.location.href = itemUrl
    }
  }

  if (!link) {
    return <main className="min-h-screen bg-neutral-950" />
  }

  if (settings.ageGateEnabled && !ageConfirmed) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#070a12] px-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-7 text-center shadow-2xl">
          <ShieldAlert className="mx-auto h-10 w-10 text-violet-300" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-violet-300">Age-restricted content</p>
          <h1 className="mt-3 text-2xl font-black">Are you 18 or older?</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">You must meet the age requirement to view this page.</p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { window.location.href = 'https://www.google.com/' }} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold transition hover:bg-white/10">Leave</button>
            <button type="button" onClick={() => { localStorage.setItem(`taplinkr_age_${link.id}`, 'confirmed'); setAgeConfirmed(true) }} className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-bold transition hover:bg-violet-400">I am 18+</button>
          </div>
        </div>
      </main>
    )
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
        onlineBadge={Boolean(link?.isOnline)}
        locationLabel={locationLabel}
        countdown={settings.countdown}
      >
        {multiLinks.length > 0 ? (
          multiLinks.map((item: any) => {
              const itemId = item?.id || item?.url || item?.title
              const itemTitle = item?.title || 'Open link'
              const itemIcon = item?.iconImage || item?.icon || null
              const ageRestricted = isAgeRestricted(item, link)
              const isConfirmed = confirmedLinks.includes(itemId)
              const needsLinkAgeConfirmation = ageRestricted && !settings.ageGateEnabled && !isConfirmed
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
                        className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-white/90 dark:bg-white dark:text-neutral-950"
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
                  destinationUrl={item?.url || null}
                  accentColor={link?.color || '#8b5cf6'}
                  borderRadius={link?.borderRadius || 'rounded-2xl'}
                  onClick={() => trackAndOpen(item)}
                  trailing={
                    <span className="flex shrink-0 items-center gap-2 text-xs font-semibold opacity-70">
                      {needsLinkAgeConfirmation && <span>18+</span>}
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
      <LandingTrackingConsent tracking={settings.tracking} />
    </main>
  )
}
