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
import SidebarUsageCard from '@/components/SidebarUsageCard'
import { LinkUpdateProvider } from '@/contexts/LinkUpdateContext'
import { LinksProvider } from '@/contexts/LinksContext'
import { ProfileProvider } from '@/contexts/ProfileContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { icon: LayoutGrid, label: 'Overview', href: '/dashboard' },
  { icon: ExternalLink, label: 'Links', href: '/dashboard/links' },
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
    <div className="dark min-h-screen bg-[#09090f] text-[#f7f7fb] lg:grid lg:h-screen lg:grid-cols-[236px_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[248px_minmax(0,1fr)] 2xl:grid-cols-[264px_minmax(0,1fr)]">
      {sidebarOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-[min(264px,calc(100vw-24px))] flex-col overflow-hidden border-r border-[#22222d] bg-[#0c0c14] transition-transform duration-300 lg:static lg:inset-auto lg:h-full lg:min-h-0 lg:w-full lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="dashboard-sidebar-header flex h-16 shrink-0 items-center justify-between border-b border-[#22222d] px-5">
          <Logo size="sm" showText />
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-[#9696a8] hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="dashboard-sidebar-workspace relative shrink-0 border-b border-[#22222d] p-3">
          <button
            type="button"
            onClick={() => setWorkspaceMenuOpen(open => !open)}
            aria-expanded={workspaceMenuOpen}
            aria-haspopup="menu"
            className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-[#2a2a38] bg-[#11111b] px-3 text-left transition hover:border-violet-500/50"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-500/10 text-violet-400">
              <LayoutGrid className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{displayName}</span>
            <ChevronDown className={`h-4 w-4 text-[#77778a] transition-transform ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {workspaceMenuOpen && (
            <div role="menu" className="absolute left-3 right-3 top-[58px] z-30 space-y-1 rounded-xl border border-[#353547] bg-[#12121d] p-2 shadow-[0_20px_55px_rgba(0,0,0,0.55)]">
              <button type="button" role="menuitem" onClick={() => navigate('/dashboard/profile')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#b6b6c6] transition hover:bg-white/5 hover:text-white">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
              <button type="button" role="menuitem" onClick={() => navigate('/dashboard/team')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#b6b6c6] transition hover:bg-white/5 hover:text-white">
                <Users className="h-4 w-4" />
                <span>Team</span>
              </button>
            </div>
          )}
          {canAccessAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="dashboard-admin-shortcut mt-2 flex h-10 w-full items-center gap-2.5 rounded-xl border border-violet-500/25 bg-violet-500/[0.09] px-3 text-left text-sm font-semibold text-violet-100 transition hover:border-violet-400/40 hover:bg-violet-500/15"
            >
              <Settings2 className="h-[19px] w-[19px] text-violet-400" />
              <span>Administration</span>
            </button>
          )}
        </div>

        <nav className="dashboard-sidebar-nav min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-3 py-3">
          {navItems.map(item => {
            const active = isActive(item.href)
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`dashboard-sidebar-nav-item group relative flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition ${
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

        <div className="dashboard-sidebar-usage shrink-0 border-t border-[#22222d] bg-[#0c0c14] px-2.5 pb-2.5">
          <SidebarUsageCard />
        </div>

        <div className="dashboard-sidebar-account shrink-0 border-t border-[#22222d] bg-[#0c0c14] p-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="dashboard-sidebar-email truncate text-xs text-[#858598]">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin', redirect: true })}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#2a2a38] text-[#9a9aac] transition hover:border-violet-500/40 hover:bg-violet-500/5 hover:text-white"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto">
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

        <main className="min-h-screen lg:min-h-full">
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
