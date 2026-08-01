'use client'

import { useEffect, useState } from 'react'

export default function RefreshTaplinkrPage() {
  const [status, setStatus] = useState('Removing the old dashboard cache…')

  useEffect(() => {
    let redirectTimer: number | undefined

    const refreshClient = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(registrations.map(registration => registration.unregister()))
        }
        if ('caches' in window) {
          const names = await caches.keys()
          await Promise.all(names.map(name => caches.delete(name)))
        }
        setStatus('Update complete. Opening your dashboard…')
      } catch {
        setStatus('Opening the latest dashboard…')
      }

      redirectTimer = window.setTimeout(() => {
        window.location.replace('/dashboard?client_refresh=20260801')
      }, 700)
    }

    void refreshClient()
    return () => {
      if (redirectTimer) window.clearTimeout(redirectTimer)
    }
  }, [])

  return (
    <main className="grid min-h-screen place-items-center bg-[#09090f] px-6 text-[#f7f7fb]">
      <section className="w-full max-w-[430px] rounded-3xl border border-[#292938] bg-[#11111b] p-9 text-center shadow-2xl">
        <div className="mx-auto mb-5 grid h-[52px] w-[52px] place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl">
          ↻
        </div>
        <h1 className="mb-2.5 text-2xl font-bold">Updating TapLinkr</h1>
        <p className="leading-relaxed text-[#a6a6b8]">{status}</p>
        <div aria-hidden="true" className="mx-auto mt-6 h-6 w-6 animate-spin rounded-full border-[3px] border-[#343445] border-t-violet-400" />
      </section>
    </main>
  )
}
