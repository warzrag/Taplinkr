import { Suspense } from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#09090f] text-white">
          <p className="text-sm text-white/60">Chargement…</p>
        </main>
      }
    >
      {children}
    </Suspense>
  )
}
