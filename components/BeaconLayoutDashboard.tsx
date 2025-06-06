'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, Twitter, MessageCircle, Globe, ExternalLink, Plus, Eye, Settings } from 'lucide-react'

interface BeaconLayoutDashboardProps {
  children: React.ReactNode
  currentUser?: {
    name?: string
    username?: string
    image?: string
    bio?: string
  }
  currentLinks?: Array<{
    id: string
    title: string
    url: string
    description?: string
    icon?: string
    isActive: boolean
  }>
}

export default function BeaconLayoutDashboard({ 
  children, 
  currentUser, 
  currentLinks = [] 
}: BeaconLayoutDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('links')

  // Liens de démonstration si aucun lien fourni
  const demoLinks = currentLinks.length > 0 ? currentLinks : [
    {
      id: '1',
      title: 'MON ONLY FANS GRATUIT',
      url: '#',
      description: 'Contenu exclusif',
      icon: '💎',
      isActive: true
    },
    {
      id: '2', 
      title: 'MON TELEGRAM PRIVÉ',
      url: '#',
      description: 'Messages privés',
      icon: '✈️',
      isActive: true
    },
    {
      id: '3',
      title: 'Try for free!',
      url: '#',
      description: 'Essai gratuit',
      icon: '🔗',
      isActive: true
    }
  ]

  const activeLinks = demoLinks.filter(link => link.isActive)

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Téléphone fixe à gauche - Style Beacons */}
      <div className="w-80 bg-white border-r border-gray-200 p-8 flex items-center justify-center sticky top-0 h-screen">
        <div className="relative">
          {/* iPhone Frame */}
          <div className="w-[280px] h-[500px] bg-black rounded-[30px] p-1 shadow-2xl">
            {/* Screen */}
            <div className="w-full h-full bg-gray-900 rounded-[26px] overflow-hidden relative">
              {/* Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center justify-between px-4 text-white text-xs z-20">
                <span>9:41</span>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-2 border border-white rounded-sm">
                    <div className="w-3 h-1 bg-white rounded-xs m-0.5" />
                  </div>
                </div>
              </div>

              {/* Background Image */}
              <div className="absolute inset-0">
                {currentUser?.image ? (
                  <img
                    src={currentUser.image}
                    alt={currentUser.name || currentUser.username || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500" />
                )}
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-6 pt-12">
                {/* Profile Info */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <h1 className="text-white text-3xl font-bold mb-1 drop-shadow-lg">
                    {currentUser?.name || currentUser?.username || 'Laura'}
                  </h1>
                  {(currentUser?.bio || 'gratuit pour les prochaines 24h') && (
                    <p className="text-white/90 text-sm drop-shadow-md">
                      {currentUser?.bio || 'gratuit pour les prochaines 24h'}
                    </p>
                  )}
                  
                  {/* Instagram handle */}
                  <div className="flex items-center justify-center mt-2">
                    <Instagram className="w-4 h-4 text-white mr-1" />
                    <span className="text-white/90 text-sm">@{currentUser?.username || 'laura'}</span>
                  </div>
                </motion.div>

                {/* Links */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {activeLinks.map((link, index) => (
                      <motion.div
                        key={link.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-white/90 backdrop-blur-md rounded-2xl p-4 hover:bg-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                      >
                        <div className="flex items-center">
                          {/* Icon */}
                          <div className="mr-3 text-2xl">
                            {link.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-sm">
                              {link.title}
                            </h3>
                            {link.description && (
                              <p className="text-gray-600 text-xs mt-1">
                                {link.description}
                              </p>
                            )}
                          </div>

                          {/* Arrow */}
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 flex items-center justify-center"
                >
                  <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-900 rounded-full" />
                    </div>
                    <span className="text-white text-xs font-medium">GetAllMyLinks</span>
                  </div>
                </motion.div>
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full" />
            </div>
          </div>

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-[30px] pointer-events-none"
            animate={{ x: [-300, 300] }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5,
              ease: 'easeInOut'
            }}
          />
        </div>
      </div>

      {/* Contenu principal à droite - Style Beacons */}
      <div className="flex-1 flex flex-col">
        {/* Header style Beacons */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Link in Bio</h1>
              <div className="flex items-center space-x-6 mt-2">
                <button
                  onClick={() => setSelectedTab('links')}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    selectedTab === 'links' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setSelectedTab('pages')}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    selectedTab === 'pages' 
                      ? 'text-blue-600 border-blue-600' 
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  + New Page
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">MANAGE PAGES</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">beacons.ai/laura_bpt</span>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  SHARE
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl">
            {/* Section + Add block */}
            <div className="bg-gray-800 text-white rounded-lg p-4 mb-6 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-medium">Add block</span>
            </div>

            {/* Sections avec toggles */}
            <div className="space-y-4 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <span className="font-medium text-gray-900">Header</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🔗</span>
                    </div>
                    <span className="font-medium text-gray-900">Links</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal injecté */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}