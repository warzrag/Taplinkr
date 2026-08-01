'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  CreditCard,
  Globe2,
  LayoutDashboard,
  Menu,
  Settings2,
  Users,
  X,
} from 'lucide-react'

import Logo from '@/components/Logo'

const items = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users & promo codes', icon: Users },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/domains', label: 'Domains', icon: Globe2 },
  { href: '/admin/diagnostics', label: 'System health', icon: Activity },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const navigate = (href: string) => {
    router.push(href)
    setOpen(false)
  }

  return (
    <div className="dark min-h-screen bg-[#08080d] text-white">
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          aria-label="Close admin navigation"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/10 bg-[#0d0d14] transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Logo size="md" showText />
          <button className="rounded-lg p-2 text-white/50 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pt-5">
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              <Settings2 className="h-4 w-4" />
              Administration
            </div>
            <p className="mt-1 text-xs text-white/45">Taplinkr operations</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {items.map((item) => {
            const cleanHref = item.href.split('?')[0]
            const active = cleanHref === '/admin' ? pathname === '/admin' : pathname.startsWith(cleanHref)
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? 'border-violet-500/25 bg-violet-500/10 text-white'
                    : 'border-transparent text-white/50 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] ${active ? 'text-violet-400' : 'text-white/35'}`} />
                {item.label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-400" />}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#08080d]/90 px-4 backdrop-blur-xl lg:hidden">
          <button className="rounded-lg border border-white/10 p-2 text-white/70" onClick={() => setOpen(true)} aria-label="Open admin navigation">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold">Taplinkr Admin</span>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600" />
        </header>
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
