'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Eye, MousePointer, 
  Clock, Calendar, BarChart3, Users 
} from 'lucide-react'

interface FolderAnalyticsData {
  totalClicks: number
  growthRate: number
  topLink?: {
    title: string
    clicks: number
  }
  peakHour?: number
  lastActivity?: string
  linksCount?: number
}

interface FolderAnalyticsTooltipProps {
  folderId: string
  folderName: string
  isVisible: boolean
  position: { x: number; y: number }
  onDataLoaded?: (data: FolderAnalyticsData) => void
}

export default function FolderAnalyticsTooltip({ 
  folderId, 
  folderName, 
  isVisible, 
  position,
  onDataLoaded 
}: FolderAnalyticsTooltipProps) {
  const [data, setData] = useState<FolderAnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isVisible && !data && !loading) {
      fetchAnalytics()
    }
  }, [isVisible, folderId])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/folder-preview/${folderId}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
        onDataLoaded?.(analyticsData)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed z-[1000] pointer-events-none"
        style={{
          left: position.x + 20,
          top: position.y - 10,
        }}
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-4 min-w-[320px] max-w-[360px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm truncate max-w-[200px]">
                {folderName}
              </h3>
            </div>
            {data?.growthRate !== undefined && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
                data.growthRate > 0 
                  ? 'bg-green-100 text-green-700' 
                  : data.growthRate < 0 
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                {data.growthRate > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : data.growthRate < 0 ? (
                  <TrendingDown className="w-3 h-3" />
                ) : null}
                <span>{Math.abs(data.growthRate)}%</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
              />
            </div>
          ) : data ? (
            <div className="space-y-3">
              {/* Stat principale */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <MousePointer className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">Total des clics</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{data.totalClicks.toLocaleString()}</p>
                  </div>
                  {data.linksCount && (
                    <div className="text-right">
                      <p className="text-xs text-blue-600">{data.linksCount} liens</p>
                      <p className="text-xs text-blue-700 font-medium">
                        ~{Math.round(data.totalClicks / data.linksCount)} clics/lien
                      </p>
                    </div>
                  )}
                </div>
              </div>


              {/* Top Link */}
              {data.topLink && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-700">Top lien</span>
                  </div>
                  <p className="text-sm font-semibold text-orange-900 truncate">{data.topLink.title}</p>
                  <p className="text-xs text-orange-700">{data.topLink.clicks} clics</p>
                </div>
              )}

              {/* Infos supplémentaires */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {data.peakHour !== undefined && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>Peak: {data.peakHour}h</span>
                  </div>
                )}
                {data.lastActivity && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-3 h-3" />
                    <span>{data.lastActivity}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Petite flèche */}
        <div 
          className="absolute -left-1 top-4 w-2 h-2 bg-white/95 border-l border-t border-white/30 rotate-45"
          style={{ transform: 'rotate(45deg)' }}
        />
      </motion.div>
    </AnimatePresence>
  )
}