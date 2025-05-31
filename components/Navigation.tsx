'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from '@/contexts/ThemeContext'

interface UsageData {
  usage: {
    links: {
      current: number
      limit: number
      percentage: number
    }
    clicks: {
      current: number
      limit: number
      percentage: number
    }
  }
  plan: {
    name: string
    type: string
  }
}

export function Navigation() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [usage, setUsage] = useState<UsageData | null>(null)

  const isActive = (path: string) => pathname === path

  // Fetch usage data
  useEffect(() => {
    if (session) {
      fetchUsage()
    }
  }, [session])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage')
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    }
  }

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  if (status === 'loading') {
    return null
  }

  if (!session) {
    return null
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500'
    if (percentage >= 75) return 'text-orange-500'
    return 'text-green-500'
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/analytics', label: 'Analytics', icon: '📊' },
    { href: '/pricing', label: 'Pricing', icon: '💎' },
  ]

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link href="/dashboard" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">LT</span>
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:block">LinkTracker</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Usage Indicator */}
              {usage && (
                <Link
                  href="/pricing"
                  className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Links</span>
                      <span className={`text-xs font-medium ${getUsageColor(usage.usage.links.percentage)}`}>
                        {usage.usage.links.current}/{usage.usage.links.limit === -1 ? '∞' : usage.usage.links.limit}
                      </span>
                    </div>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Clicks</span>
                      <span className={`text-xs font-medium ${getUsageColor(usage.usage.clicks.percentage)}`}>
                        {usage.usage.clicks.current}/{usage.usage.clicks.limit === -1 ? '∞' : usage.usage.clicks.limit}
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {session.user?.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile Right Section */}
            <div className="flex lg:hidden items-center space-x-2">
              {/* Mobile Usage Indicator */}
              {usage && (
                <Link
                  href="/pricing"
                  className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-1.5">
                    <div className="flex items-center">
                      <span className={`text-xs font-medium ${getUsageColor(usage.usage.links.percentage)}`}>
                        {usage.usage.links.current}/{usage.usage.links.limit === -1 ? '∞' : usage.usage.links.limit}
                      </span>
                      <span className="text-xs text-gray-400 mx-1">•</span>
                      <span className={`text-xs font-medium ${getUsageColor(usage.usage.clicks.percentage)}`}>
                        {usage.usage.clicks.current}/{usage.usage.clicks.limit === -1 ? '∞' : usage.usage.clicks.limit}
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-80 max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">LT</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{session.user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{usage?.plan.name} Plan</p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(link.href)
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>

            {/* Usage Stats in Mobile Menu */}
            {usage && (
              <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Usage This Month</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Links</span>
                      <span className={`text-sm font-medium ${getUsageColor(usage.usage.links.percentage)}`}>
                        {usage.usage.links.current}/{usage.usage.links.limit === -1 ? '∞' : usage.usage.links.limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usage.usage.links.percentage >= 90
                            ? 'bg-red-500'
                            : usage.usage.links.percentage >= 75
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usage.usage.links.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Clicks</span>
                      <span className={`text-sm font-medium ${getUsageColor(usage.usage.clicks.percentage)}`}>
                        {usage.usage.clicks.current}/{usage.usage.clicks.limit === -1 ? '∞' : usage.usage.clicks.limit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          usage.usage.clicks.percentage >= 90
                            ? 'bg-red-500'
                            : usage.usage.clicks.percentage >= 75
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usage.usage.clicks.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                {usage.plan.type === 'FREE' && (
                  <Link
                    href="/pricing"
                    className="mt-4 w-full block text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium"
                  >
                    Upgrade to Pro
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
              {theme === 'dark' ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}