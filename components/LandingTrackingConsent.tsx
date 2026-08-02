'use client'

import { useEffect, useState } from 'react'

interface TrackingIds {
  metaPixelId?: string
  googleAnalyticsId?: string
  googleAdsId?: string
}

const CONSENT_KEY = 'taplinkr_tracking_consent'

export default function LandingTrackingConsent({ tracking }: { tracking?: TrackingIds | null }) {
  const [consent, setConsent] = useState<'accepted' | 'rejected' | null>(null)
  const hasTracking = Boolean(tracking?.metaPixelId || tracking?.googleAnalyticsId || tracking?.googleAdsId)

  useEffect(() => {
    if (!hasTracking) return
    const saved = localStorage.getItem(CONSENT_KEY)
    if (saved === 'accepted' || saved === 'rejected') setConsent(saved)
  }, [hasTracking])

  useEffect(() => {
    if (consent !== 'accepted' || !hasTracking) return

    const googleIds = [tracking?.googleAnalyticsId, tracking?.googleAdsId].filter(Boolean) as string[]
    if (googleIds.length) {
      const firstId = googleIds[0]
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(firstId)}`
      document.head.appendChild(script)
      const win = window as any
      win.dataLayer = win.dataLayer || []
      win.gtag = win.gtag || function gtag(...args: any[]) { win.dataLayer.push(args) }
      win.gtag('js', new Date())
      googleIds.forEach(id => win.gtag('config', id, { anonymize_ip: true }))
    }

    if (tracking?.metaPixelId) {
      const win = window as any
      if (!win.fbq) {
        const fbq: any = (...args: any[]) => fbq.queue.push(args)
        fbq.queue = []
        fbq.loaded = true
        fbq.version = '2.0'
        win.fbq = fbq
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://connect.facebook.net/en_US/fbevents.js'
        document.head.appendChild(script)
      }
      win.fbq('init', tracking.metaPixelId)
      win.fbq('track', 'PageView')
    }
  }, [consent, hasTracking, tracking?.googleAdsId, tracking?.googleAnalyticsId, tracking?.metaPixelId])

  if (!hasTracking || consent) return null

  const choose = (value: 'accepted' | 'rejected') => {
    localStorage.setItem(CONSENT_KEY, value)
    setConsent(value)
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-white/15 bg-[#11131d]/95 p-4 text-white shadow-2xl backdrop-blur-xl">
      <p className="text-sm font-bold">Your privacy choices</p>
      <p className="mt-1 text-xs leading-5 text-white/60">This page would like to use optional analytics and advertising cookies. You can continue without accepting them.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => choose('rejected')} className="rounded-xl border border-white/15 px-3 py-2 text-sm font-semibold transition hover:bg-white/10">Reject</button>
        <button type="button" onClick={() => choose('accepted')} className="rounded-xl bg-violet-500 px-3 py-2 text-sm font-semibold transition hover:bg-violet-400">Accept</button>
      </div>
    </div>
  )
}
