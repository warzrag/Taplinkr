'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Loader2 } from 'lucide-react'

import { getExternalBrowserUrl, getMobilePlatform } from '@/lib/external-browser'

interface PublicDirectRedirectProps {
  destination: string
  title: string
}

export default function PublicDirectRedirect({ destination, title }: PublicDirectRedirectProps) {
  const [showFallback, setShowFallback] = useState(false)
  const externalUrl = useMemo(() => {
    if (typeof window === 'undefined') return null
    return getExternalBrowserUrl(window.location.href, getMobilePlatform(navigator.userAgent || ''))
  }, [])

  const openExternalBrowser = useCallback(() => {
    if (externalUrl) window.location.href = externalUrl
  }, [externalUrl])

  useEffect(() => {
    const redirectTimer = window.setTimeout(openExternalBrowser, 350)
    const fallbackTimer = window.setTimeout(() => setShowFallback(true), 1800)

    return () => {
      window.clearTimeout(redirectTimer)
      window.clearTimeout(fallbackTimer)
    }
  }, [openExternalBrowser])

  return (
    <main className="min-h-screen bg-[#09090f] px-5 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-500/10 shadow-2xl shadow-violet-950/40">
          <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
          TapLinkr Direct
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Ouverture de {title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">
          Nous ouvrons ce lien dans le navigateur de votre téléphone.
        </p>

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
