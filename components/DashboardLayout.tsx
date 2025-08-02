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
  Users
} from 'lucide-react'
import LinkLogo from '@/components/LinkLogo'
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

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Users, label: 'Équipe', href: '/dashboard/team' },
    { icon: CreditCard, label: 'Tarifs', href: '/dashboard/pricing' },
    { icon: Shield, label: 'Protection', href: '/dashboard/protection' },
    { icon: Settings, label: 'Paramètres', href: '/settings' },
  ]
  
  // Ajouter le menu Admin si l'utilisateur est admin
  if (session?.user?.role === 'admin') {
    sidebarItems.push({ icon: Shield, label: 'Admin', href: '/admin' })
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[280px] lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
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
              <LinkLogo size="lg" showText={true} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const active = isActive(item.href)
            
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  active 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Theme Toggle */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 lg:px-6 lg:py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden flex-1 flex justify-center px-4">
              <LinkLogo size="md" showText={true} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>

        <ProfileProvider>
          <LinksProvider>
            <LinkUpdateProvider updateLinkInPreview={updateLinkInPreview}>
              {children}
            </LinkUpdateProvider>
          </LinksProvider>
        </ProfileProvider>
      </div>

    </div>
  )
}