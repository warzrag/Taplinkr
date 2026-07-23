'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { getExternalBrowserUrl, getMobilePlatform } from '@/lib/external-browser'

interface PublicDirectRedirectProps {
  destination: string
  title: string
  instagramExternalUrl?: string | null
}

export default function PublicDirectRedirect({
  destination,
  title,
  instagramExternalUrl = null,
}: PublicDirectRedirectProps) {
  const [showFallback, setShowFallback] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(3)
  const externalUrl = useMemo(() => {
    if (typeof window === 'undefined') return null
    return getExternalBrowserUrl(window.location.href, getMobilePlatform(navigator.userAgent || ''))
  }, [])

  const openExternalBrowser = useCallback(() => {
    if (externalUrl) window.location.href = externalUrl
  }, [externalUrl])

  useEffect(() => {
    let countdownTimer: number | undefined
    let redirectTimer: number | undefined
    let fallbackTimer: number | undefined
    let secondFrame: number | undefined

    // Instagram handles this private scheme itself and hands the URL directly
    // to the external browser. The standard countdown remains as a fallback.
    if (instagramExternalUrl) {
      window.location.href = instagramExternalUrl
    }

    // X and Instagram can hydrate the page before painting it. Waiting for two
    // frames guarantees that the user sees the initial "3" before the delay starts.
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const startedAt = Date.now()
        countdownTimer = window.setInterval(() => {
          const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000)
          setSecondsLeft(Math.max(0, 3 - elapsedSeconds))
        }, 200)
        redirectTimer = window.setTimeout(openExternalBrowser, 3000)
        fallbackTimer = window.setTimeout(() => setShowFallback(true), 4500)
      })
    })

    return () => {
      window.cancelAnimationFrame(firstFrame)
      if (secondFrame !== undefined) window.cancelAnimationFrame(secondFrame)
      if (countdownTimer !== undefined) window.clearInterval(countdownTimer)
      if (redirectTimer !== undefined) window.clearTimeout(redirectTimer)
      if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer)
    }
  }, [instagramExternalUrl, openExternalBrowser])

  return (
    <>
      {instagramExternalUrl && <meta httpEquiv="refresh" content={`0;url=${instagramExternalUrl}`} />}
      <main
        className="min-h-screen bg-[#09090f] px-5 text-white"
        style={{ minHeight: '100dvh', background: '#09090f', color: '#fff', padding: '0 20px' }}
      >
      <div
        className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center text-center"
        style={{
          minHeight: '100dvh',
          maxWidth: 384,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-3xl font-bold text-violet-300 shadow-2xl shadow-violet-950/40"
          style={{
            width: 80,
            height: 80,
            flex: '0 0 80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 9999,
            border: '1px solid rgba(167, 139, 250, .3)',
            background: 'rgba(139, 92, 246, .12)',
            color: '#c4b5fd',
            fontSize: 30,
            fontWeight: 700,
          }}
          aria-live="polite"
          aria-label={`Redirection dans ${secondsLeft} secondes`}
        >
          {secondsLeft}
        </div>
        <p
          className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400"
          style={{ marginTop: 24, color: '#a78bfa', fontSize: 12, fontWeight: 600, letterSpacing: '.22em' }}
        >
          TapLinkr Direct
        </p>
        <h1
          className="mt-3 text-2xl font-semibold"
          style={{ marginTop: 12, color: '#fff', fontSize: 24, fontWeight: 600 }}
        >
          Redirection vers {title}
        </h1>
        <p
          className="mt-3 text-sm leading-6 text-white/60"
          style={{ marginTop: 12, color: 'rgba(255,255,255,.68)', fontSize: 14, lineHeight: 1.7 }}
        >
          Vous allez être redirigé vers le navigateur de votre téléphone dans {secondsLeft} seconde
          {secondsLeft === 1 ? '' : 's'}.
        </p>
        <div
          className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
          style={{
            width: '100%',
            height: 6,
            marginTop: 24,
            overflow: 'hidden',
            borderRadius: 9999,
            background: 'rgba(255,255,255,.1)',
          }}
        >
          <div
            className="h-full rounded-full bg-violet-500 transition-[width] duration-200"
            style={{
              width: `${((3 - secondsLeft) / 3) * 100}%`,
              height: '100%',
              borderRadius: 9999,
              background: '#8b5cf6',
              transition: 'width 200ms ease',
            }}
          />
        </div>

        {showFallback && (
          <div className="mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <button
              type="button"
              onClick={openExternalBrowser}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Ouvrir dans mon navigateur
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <a
              href={destination}
              className="mt-3 inline-flex text-xs text-white/45 underline decoration-white/20 underline-offset-4"
            >
              Continuer ici si l’ouverture est bloquée
            </a>
          </div>
        )}
        </div>
      </main>
    </>
  )
}
