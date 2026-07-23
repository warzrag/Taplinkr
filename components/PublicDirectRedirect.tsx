'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, Loader2 } from 'lucide-react'

import type { DirectRedirectLocale } from '@/lib/external-browser'

interface PublicDirectRedirectProps {
  destination: string
  title: string
  externalBrowserUrl: string | null
  locale: DirectRedirectLocale
}

export default function PublicDirectRedirect({
  destination,
  title,
  externalBrowserUrl,
  locale,
}: PublicDirectRedirectProps) {
  const [showFallback, setShowFallback] = useState(false)
  const automaticUrl = externalBrowserUrl || destination
  const copy = locale === 'en'
    ? {
        ariaLabel: 'Opening your browser',
        heading: `Opening ${title}`,
        description: "We're opening this link in your phone's browser.",
        button: 'Open in my browser',
        fallback: 'Continue here if opening is blocked',
      }
    : {
        ariaLabel: 'Ouverture du navigateur',
        heading: `Ouverture de ${title}`,
        description: 'Nous ouvrons automatiquement le navigateur de votre téléphone.',
        button: 'Ouvrir dans mon navigateur',
        fallback: "Continuer ici si l’ouverture est bloquée",
      }

  const openExternalBrowser = useCallback(() => {
    window.location.href = automaticUrl
  }, [automaticUrl])

  useEffect(() => {
    // The server-rendered meta refresh starts this before hydration. This second
    // attempt covers in-app browsers that ignore meta refreshes.
    window.location.href = automaticUrl
    const fallbackTimer = window.setTimeout(() => setShowFallback(true), 1200)

    return () => {
      window.clearTimeout(fallbackTimer)
    }
  }, [automaticUrl])

  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${automaticUrl}`} />
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
          aria-label={copy.ariaLabel}
        >
          <Loader2 className="h-9 w-9 animate-spin" aria-hidden="true" />
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
          {copy.heading}
        </h1>
        <p
          className="mt-3 text-sm leading-6 text-white/60"
          style={{ marginTop: 12, color: 'rgba(255,255,255,.68)', fontSize: 14, lineHeight: 1.7 }}
        >
          {copy.description}
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
            className="h-full w-full animate-pulse rounded-full bg-violet-500"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 9999,
              background: '#8b5cf6',
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
              {copy.button}
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <a
              href={destination}
              className="mt-3 inline-flex text-xs text-white/45 underline decoration-white/20 underline-offset-4"
            >
              {copy.fallback}
            </a>
          </div>
        )}
        </div>
      </main>
    </>
  )
}
