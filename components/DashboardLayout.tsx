'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  CreditCard,
  ExternalLink,
  FolderKanban,
  Globe2,
  LayoutGrid,
  LogOut,
  Menu,
  MousePointerClick,
  Settings2,
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
  { icon: LayoutGrid, label: 'Overview', href: '/dashboard' },
  { icon: ExternalLink, label: 'Links', href: '/dashboard/links' },
  { icon: FolderKanban, label: 'Folders', href: '/dashboard/folders' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: MousePointerClick, label: 'Click log', href: '/dashboard/visitors' },
  { icon: Users, label: 'Team', href: '/dashboard/team' },
  { icon: Shield, label: 'Protection', href: '/dashboard/protection' },
  { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
  { icon: Globe2, label: 'Custom domains', href: '/dashboard/domains' },
  { icon: User, label: 'Profile', href: '/dashboard/profile' },
  { icon: BookOpen, label: 'Help', href: '/dashboard/support' },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [canAccessAdmin, setCanAccessAdmin] = useState(session?.user?.role === 'admin')

  useEffect(() => {
    if (!session?.user) {
      setCanAccessAdmin(false)
      return
    }
    if (session.user.role === 'admin') {
      setCanAccessAdmin(true)
      return
    }

    let cancelled = false
    fetch('/api/admin/access', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : { canAccess: false })
      .then(data => {
        if (!cancelled) setCanAccessAdmin(Boolean(data.canAccess))
      })
      .catch(() => {
        if (!cancelled) setCanAccessAdmin(false)
      })

    return () => {
      cancelled = true
    }
  }, [session?.user])

  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'My workspace'
  const initials = displayName.slice(0, 2).toUpperCase()

  const isActive = (href: string) => href === '/dashboard'
    ? pathname === href
    : pathname.startsWith(href)

  const navigate = (href: string) => {
    router.push(href)
    setSidebarOpen(false)
    setWorkspaceMenuOpen(false)
  }

  return (
    <div className="dark min-h-screen bg-[#09090f] text-[#f7f7fb]">
      {sidebarOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[286px] flex-col overflow-hidden border-r border-[#22222d] bg-[#0c0c14] transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-[88px] shrink-0 items-center justify-between border-b border-[#22222d] px-6">
          <Logo size="md" showText />
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-[#9696a8] hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-[#22222d] p-4">
          <button
            type="button"
            onClick={() => setWorkspaceMenuOpen(open => !open)}
            aria-expanded={workspaceMenuOpen}
            aria-haspopup="menu"
            className="flex w-full items-center gap-3 rounded-xl border border-[#2a2a38] bg-[#11111b] px-4 py-3 text-left transition hover:border-violet-500/50"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/10 text-violet-400">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{displayName}</span>
            <ChevronDown className={`h-4 w-4 text-[#77778a] transition-transform ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {workspaceMenuOpen && (
            <div role="menu" className="mt-2 space-y-1 rounded-xl border border-[#2a2a38] bg-[#11111b] p-2 shadow-2xl">
              <button type="button" role="menuitem" onClick={() => navigate('/dashboard/profile')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#b6b6c6] transition hover:bg-white/5 hover:text-white">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
              <button type="button" role="menuitem" onClick={() => navigate('/dashboard/team')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#b6b6c6] transition hover:bg-white/5 hover:text-white">
                <Users className="h-4 w-4" />
                <span>Team</span>
              </button>
              {canAccessAdmin && (
                <button type="button" role="menuitem" onClick={() => navigate('/admin')} className="flex w-full items-center gap-3 rounded-lg bg-violet-500/10 px-3 py-2.5 text-left text-sm font-semibold text-violet-200 transition hover:bg-violet-500/15">
                  <Settings2 className="h-4 w-4 text-violet-400" />
                  <span>Administration</span>
                </button>
              )}
            </div>
          )}
          {canAccessAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="mt-3 flex w-full items-center gap-3 rounded-xl border border-violet-500/25 bg-violet-500/[0.09] px-4 py-3 text-left text-sm font-semibold text-violet-100 transition hover:border-violet-400/40 hover:bg-violet-500/15"
            >
              <Settings2 className="h-[19px] w-[19px] text-violet-400" />
              <span>Administration</span>
            </button>
          )}
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-4 py-6">
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
          {session?.user?.role === 'admin' && (
            <>
              <div className="mx-4 my-4 border-t border-[#22222d]" />
              <button
                onClick={() => navigate('/admin')}
                className="group relative flex w-full items-center gap-3 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] px-4 py-3 text-left text-sm font-medium text-violet-200 transition hover:bg-violet-500/10"
              >
                <Settings2 className="h-[19px] w-[19px] text-violet-400" />
                <span>Administration</span>
              </button>
            </>
          )}
        </nav>

        <div className="shrink-0 border-t border-[#22222d] bg-[#0c0c14] p-4">
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
            Log out
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[286px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#22222d] bg-[#09090f]/90 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-[#2a2a38] p-2 text-[#c7c7d3]"
            aria-label="Open menu"
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
