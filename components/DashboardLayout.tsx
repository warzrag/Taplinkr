'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  User, 
  LogOut,
  BarChart3,
  Shield,
  Settings,
  Menu,
  X,
  CreditCard,
  Users,
  ExternalLink,
  Gift,
  HelpCircle,
  Map,
  MessageCircle,
  Activity,
  Folder,
  Database
} from 'lucide-react'
import Logo from '@/components/Logo'
import LivePhonePreview from '@/components/LivePhonePreview'
import { LinkUpdateProvider } from '@/contexts/LinkUpdateContext'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { LinksProvider } from '@/contexts/LinksContext'
import ThemeToggle from '@/components/ThemeToggle'
import { useState, useEffect } from 'react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [links, setLinks] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Fonction pour mettre à jour un lien spécifique en temps réel
  const updateLinkInPreview = (updatedLink: any) => {
    setLinks(prevLinks => 
      prevLinks.map(link => 
        link.id === updatedLink.id ? updatedLink : link
      )
    )
  }

  // Récupérer les liens pour la prévisualisation
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch('/api/links')
        if (response.ok) {
          const data = await response.json()
          setLinks(data)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des liens:', error)
      }
    }

    if (session) {
      fetchLinks()
      // Rafraîchir les liens toutes les 5 secondes pour la prévisualisation live
      const interval = setInterval(fetchLinks, 5000)
      return () => clearInterval(interval)
    }
  }, [session])

  // Control Panel Section
  const controlPanelItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: ExternalLink, label: 'Links', href: '/dashboard/links' },
    { icon: Folder, label: 'Dossiers', href: '/dashboard/folders' },
    { icon: BarChart3, label: 'Social Analytics', href: '/dashboard/analytics' },
    { icon: Activity, label: 'Visiteurs', href: '/dashboard/visitors' },
    { icon: Users, label: 'Teams', href: '/dashboard/team' },
  ]

  // Account Section
  const accountItems = [
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
    { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
    { icon: Gift, label: 'Tarifs', href: '/dashboard/pricing' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  // Help Section
  const helpItems = [
    { icon: HelpCircle, label: 'FAQ', href: '/dashboard/faq' },
    { icon: Map, label: 'Roadmap', href: '/dashboard/roadmap' },
    { icon: MessageCircle, label: 'Support', href: '/dashboard/support' },
  ]
  
  // Admin section (if applicable)
  const adminItems = (session?.user?.role === 'admin' || session?.user?.role === 'manager')
    ? [
        { icon: Shield, label: 'Admin', href: '/admin/users' },
        { icon: Database, label: 'Base de données', href: '/admin/database' }
      ]
    : []

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[280px] lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col
        ${sidebarOpen ? 'block' : 'hidden lg:flex'}
      `}>
        {/* Logo */}
        <div className="p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute right-0 top-0 z-10 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-center">
              <Logo size="lg" showText={true} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Control Panel Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
              Control Panel
            </h3>
            <div className="space-y-1">
              {controlPanelItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      active 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Account Section */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
              Account
            </h3>
            <div className="space-y-1">
              {accountItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      active 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Help Section */}
          {(
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                Help
              </h3>
              <div className="space-y-1">
                {helpItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        active 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Admin Section (if applicable) */}
          {adminItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                Administration
              </h3>
              <div className="space-y-1">
                {adminItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.href)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        active 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Fixed Header with Theme Toggle */}
        <div className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:px-6 lg:py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden flex-1 flex justify-center px-4">
              <Logo size="md" showText={true} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>

        {/* Content with padding top to account for fixed header */}
        <div className="flex-1 overflow-auto pt-[60px] lg:pt-[72px]">
          <ProfileProvider>
            <LinksProvider>
              <LinkUpdateProvider updateLinkInPreview={updateLinkInPreview}>
                {children}
              </LinkUpdateProvider>
            </LinksProvider>
          </ProfileProvider>
        </div>
      </div>

    </div>
  )
}