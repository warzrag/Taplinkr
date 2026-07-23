'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { getExternalBrowserUrl, getMobilePlatform } from '@/lib/external-browser'

interface PublicDirectRedirectProps {
  destination: string
  title: string
}

export default function PublicDirectRedirect({ destination, title }: PublicDirectRedirectProps) {
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
    const startedAt = Date.now()
    const countdownTimer = window.setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000)
      setSecondsLeft(Math.max(0, 3 - elapsedSeconds))
    }, 200)
    const redirectTimer = window.setTimeout(openExternalBrowser, 3000)
    const fallbackTimer = window.setTimeout(() => setShowFallback(true), 4500)

    return () => {
      window.clearInterval(countdownTimer)
      window.clearTimeout(redirectTimer)
      window.clearTimeout(fallbackTimer)
    }
  }, [openExternalBrowser])

  return (
    <main className="min-h-screen bg-[#09090f] px-5 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-3xl font-bold text-violet-300 shadow-2xl shadow-violet-950/40">
          {secondsLeft}
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
          TapLinkr Direct
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Redirection vers {title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Vous allez être redirigé vers le navigateur de votre téléphone dans {secondsLeft} seconde{secondsLeft === 1 ? '' : 's'}.
        </p>
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-violet-500 transition-[width] duration-200"
            style={{ width: `${((3 - secondsLeft) / 3) * 100}%` }}
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
  )
}
