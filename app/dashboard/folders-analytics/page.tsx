'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Folder,
  Link2,
  Eye,
  ArrowLeft,
  Download,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { useLinks } from '@/contexts/LinksContext'

interface FolderAnalytics {
  id: string
  name: string
  icon: string
  color: string
  description?: string
  totalClicks: number
  directClicks: number
  childrenClicks?: number
  linksCount: number
  childrenCount?: number
  clicksByDay: { date: string; clicks: number }[]
  topLinks: {
    id: string
    title: string
    slug: string
    clicks: number
    icon?: string
  }[]
  growthRate: number
  hasChildren?: boolean
}

export default function FoldersAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { links: contextLinks, folders: contextFolders } = useLinks()
  const [loading, setLoading] = useState(true)
  const [folders, setFolders] = useState<FolderAnalytics[]>([])
  const [unorganized, setUnorganized] = useState<FolderAnalytics | null>(null)
  const [totalClicks, setTotalClicks] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchFoldersAnalytics()
    }
  }, [status, router])

  // Mettre à jour les stats quand les liens du contexte changent
  useEffect(() => {
    if (contextLinks.length > 0 && folders.length > 0) {
      // Recalculer les clics totaux avec les données en temps réel
      const newTotalClicks = contextLinks.reduce((sum, link) => sum + (link.clicks || 0), 0)
      setTotalClicks(newTotalClicks)
      
      // Mettre à jour les stats des dossiers
      const updatedFolders = folders.map(folder => {
        const folderLinks = contextLinks.filter(link => link.folderId === folder.id)
        const folderClicks = folderLinks.reduce((sum, link) => sum + (link.clicks || 0), 0)
        
        return {
          ...folder,
          totalClicks: folderClicks,
          directClicks: folderClicks,
          topLinks: folderLinks
            .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
            .slice(0, 3)
            .map(link => ({
              id: link.id,
              title: link.title,
              slug: link.slug,
              clicks: link.clicks || 0,
              icon: link.icon
            }))
        }
      })
      
      setFolders(updatedFolders)
      
      // Mettre à jour les liens non organisés
      if (unorganized) {
        const unorganizedLinks = contextLinks.filter(link => !link.folderId)
        const unorganizedClicks = unorganizedLinks.reduce((sum, link) => sum + (link.clicks || 0), 0)
        
        setUnorganized({
          ...unorganized,
          totalClicks: unorganizedClicks,
          directClicks: unorganizedClicks,
          linksCount: unorganizedLinks.length,
          topLinks: unorganizedLinks
            .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
            .slice(0, 3)
            .map(link => ({
              id: link.id,
              title: link.title,
              slug: link.slug,
              clicks: link.clicks || 0,
              icon: link.icon
            }))
        })
      }
    }
  }, [contextLinks]) // folders.length retiré pour éviter les re-rendus inutiles

  const fetchFoldersAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders || [])
        setUnorganized(data.unorganized || null)
        setTotalClicks(data.totalClicks || 0)
      }
    } catch (error) {
      console.error('Error fetching folders analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
          />
          <p className="text-gray-600 font-medium">Chargement des analytics...</p>
        </motion.div>
      </div>
    )
  }

  if (!session) return null

  const allFolders = unorganized ? [...folders, unorganized] : folders

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <motion.button
                  className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  Analytics des Dossiers
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  Analysez les performances de vos dossiers et liens
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Global Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clics Totaux</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dossiers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{folders.length}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Folder className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Liens Totaux</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {allFolders.reduce((sum, f) => sum + f.linksCount, 0)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <Link2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Croissance Moy.</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {folders.length > 0 
                    ? Math.round(folders.reduce((sum, f) => sum + f.growthRate, 0) / folders.length)
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Folders List */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-gray-900">Performance par Dossier</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {allFolders.map((folder, index) => (
              <motion.div
                key={folder.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                      style={{ backgroundColor: `${folder.color}20` }}
                    >
                      {folder.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{folder.name}</h4>
                      <p className="text-sm text-gray-600">{folder.linksCount} liens</p>
                    </div>
                  </div>
                  {folder.growthRate !== 0 && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                      folder.growthRate > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {folder.growthRate > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{Math.abs(folder.growthRate)}%</span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Clics totaux</span>
                    <span className="text-2xl font-bold text-gray-900">{folder.totalClicks.toLocaleString()}</span>
                  </div>
                  {folder.hasChildren && (
                    <div className="text-sm text-gray-500">
                      <span>{folder.directClicks} directs • {folder.childrenClicks} sous-dossiers</span>
                    </div>
                  )}
                </div>

                {/* Top Links */}
                {folder.topLinks && folder.topLinks.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Top liens</h5>
                    {folder.topLinks.slice(0, 3).map((link) => (
                      <div key={link.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 truncate">
                          {link.icon && <span>{link.icon}</span>}
                          <span className="text-gray-700 truncate">{link.title}</span>
                        </div>
                        <span className="font-medium text-gray-900">{link.clicks}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}