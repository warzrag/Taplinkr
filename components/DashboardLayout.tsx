'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  User, 
  LogOut,
  BarChart3,
  Palette,
  Upload,
  Shield,
  Bell,
  Settings,
  Menu,
  X
} from 'lucide-react'
import LivePhonePreview from '@/components/LivePhonePreview'
import { LinkUpdateProvider } from '@/contexts/LinkUpdateContext'
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
    { icon: Palette, label: 'Templates', href: '/dashboard/templates' },
    { icon: Upload, label: 'Fichiers', href: '/dashboard/files' },
    { icon: Shield, label: 'Protection', href: '/dashboard/protection' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: Settings, label: 'Paramètres', href: '/settings' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-xl font-bold text-gray-900">GetAllMyLinks</span>
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
                    ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-gray-900">GetAllMyLinks</span>
          </div>
          <div className="w-10" /> {/* Spacer pour centrer le logo */}
        </div>

        <LinkUpdateProvider updateLinkInPreview={updateLinkInPreview}>
          {children}
        </LinkUpdateProvider>
      </div>

    </div>
  )
}