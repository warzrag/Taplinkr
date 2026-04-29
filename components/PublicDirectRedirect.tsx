'use client'

import { useEffect } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'

interface PublicDirectRedirectProps {
  linkId: string
  title: string
  url: string
}

function normalizeUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export default function PublicDirectRedirect({ linkId, title, url }: PublicDirectRedirectProps) {
  const targetUrl = normalizeUrl(url)

  useEffect(() => {
    let cancelled = false

    const redirectVisitor = async () => {
      try {
        await fetch('/api/track-link-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkId }),
          keepalive: true,
        })
      } finally {
        if (!cancelled) {
          window.location.replace(targetUrl)
        }
      }
    }

    redirectVisitor()

    return () => {
      cancelled = true
    }
  }, [linkId, targetUrl])

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-neutral-950 shadow-2xl">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
          TapLinkr
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Redirection vers {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Nous préparons le lien et enregistrons la visite proprement.
        </p>
        <a
          href={targetUrl}
          className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/35 hover:text-white"
        >
          Continuer maintenant
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </main>
  )
}
