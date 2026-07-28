'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileSpreadsheet, BarChart3 } from 'lucide-react'

interface ExportButtonProps {
  data: any
  type: 'dashboard' | 'link' | 'folder'
  linkId?: string
}

export default function ExportButton({ data, type, linkId }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const exportToCSV = () => {
    setIsExporting(true)
    
    try {
      let csvContent = ""
      let filename = ""
      
      if (type === 'dashboard' && data.summary) {
        csvContent = "Date,Clicks,Views,Engagement rate\n"
        data.summary.forEach((item: any) => {
          const engagementRate = item.views > 0 ? (item.clicks / item.views * 100).toFixed(2) : 0
          csvContent += `${new Date(item.date).toLocaleDateString()},${item.clicks},${item.views},${engagementRate}%\n`
        })
        filename = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.csv`
      } else if (type === 'link' && data.summary) {
        csvContent = "Date,Clicks,Views,Growth\n"
        data.summary.forEach((item: any) => {
          csvContent += `${new Date(item.date).toLocaleDateString()},${item.clicks},${item.views},${item.clickGrowth || 0}%\n`
        })
        filename = `analytics-link-${linkId}-${new Date().toISOString().split('T')[0]}.csv`
      } else if (type === 'folder') {
        csvContent = "Folder,Total Clicks,Links,Growth Rate\n"
        const folders = Array.isArray(data) ? data : data?.folders || []
        folders.forEach((folder: any) => {
          const name = String(folder.name || 'Untitled').replaceAll('"', '""')
          const links = Array.isArray(folder.links) ? folder.links.length : Number(folder.linkCount || 0)
          const clicks = Number(folder.totalClicks ?? folder.clicks ?? 0)
          const growth = Number(folder.growthRate ?? folder.growth ?? 0)
          csvContent += `"${name}",${clicks},${links},${growth}%\n`
        })
        filename = `analytics-folders-${new Date().toISOString().split('T')[0]}.csv`
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
    } finally {
      setIsExporting(false)
      setShowOptions(false)
    }
  }

  const exportToJSON = () => {
    setIsExporting(true)
    
    try {
      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `analytics-${type}-${new Date().toISOString().split('T')[0]}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erreur lors de l\'export JSON:', error)
    } finally {
      setIsExporting(false)
      setShowOptions(false)
    }
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isExporting}
      >
        {isExporting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>Export</span>
      </motion.button>

      {showOptions && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
        >
          <button
            onClick={exportToCSV}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-3 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">CSV</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">For Excel or Google Sheets</p>
            </div>
          </button>

          <button
            onClick={exportToJSON}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-3 transition-colors border-t border-gray-100 dark:border-gray-800"
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">JSON</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Raw data</p>
            </div>
          </button>
        </motion.div>
      )}

      {/* Overlay pour fermer les options */}
      {showOptions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowOptions(false)}
        />
      )}
    </div>
  )
}
