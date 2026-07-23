'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  CreditCard,
  ExternalLink,
  LayoutGrid,
  LogOut,
  Menu,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react'

import Logo from '@/components/Logo'
import { LinkUpdateProvider } from '@/contexts/LinkUpdateContext'
import { LinksProvider } from '@/contexts/LinksContext'
import { ProfileProvider } from '@/contexts/ProfileContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { icon: LayoutGrid, label: 'Aperçu', href: '/dashboard' },
  { icon: ExternalLink, label: 'Liens', href: '/dashboard/links' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Users, label: 'Équipe', href: '/dashboard/team' },
  { icon: Shield, label: 'Protection', href: '/dashboard/protection' },
  { icon: CreditCard, label: 'Facturation', href: '/dashboard/billing' },
  { icon: User, label: 'Profil', href: '/dashboard/profile' },
  { icon: BookOpen, label: 'Aide', href: '/dashboard/support' },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Mon espace'
  const initials = displayName.slice(0, 2).toUpperCase()

  const isActive = (href: string) => href === '/dashboard'
    ? pathname === href
    : pathname.startsWith(href)

  const navigate = (href: string) => {
    router.push(href)
    setSidebarOpen(false)
  }

  return (
    <div className="dark min-h-screen bg-[#09090f] text-[#f7f7fb]">
      {sidebarOpen && (
        <button
          aria-label="Fermer le menu"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r border-[#22222d] bg-[#0c0c14] transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-[88px] items-center justify-between border-b border-[#22222d] px-6">
          <Logo size="md" showText />
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-[#9696a8] hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-[#22222d] p-4">
          <button className="flex w-full items-center gap-3 rounded-xl border border-[#2a2a38] bg-[#11111b] px-4 py-3 text-left transition hover:border-violet-500/50">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/10 text-violet-400">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{displayName}</span>
            <ChevronDown className="h-4 w-4 text-[#77778a]" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {navItems.map(item => {
            const active = isActive(item.href)
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  active
                    ? 'border border-violet-500/30 bg-violet-500/[0.08] text-white shadow-[0_0_24px_rgba(139,92,246,0.08)]'
                    : 'border border-transparent text-[#9292a4] hover:bg-white/[0.035] hover:text-white'
                }`}
              >
                <item.icon className={`h-[19px] w-[19px] ${active ? 'text-violet-400' : 'text-[#77778a] group-hover:text-[#b8b8c8]'}`} />
                <span>{item.label}</span>
                {active && <span className="ml-auto h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_12px_#8b5cf6]" />}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-[#22222d] p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-xs text-[#858598]">{session?.user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin', redirect: true })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#2a2a38] px-4 py-2.5 text-sm font-semibold text-[#d8d8e2] transition hover:border-violet-500/40 hover:bg-violet-500/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[286px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#22222d] bg-[#09090f]/90 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-[#2a2a38] p-2 text-[#c7c7d3]"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo size="sm" showText />
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600" />
        </header>

        <main className="min-h-screen">
          <ProfileProvider>
            <LinksProvider>
              <LinkUpdateProvider updateLinkInPreview={() => undefined}>
                {children}
              </LinkUpdateProvider>
            </LinksProvider>
          </ProfileProvider>
        </main>
      </div>
    </div>
  )
}
