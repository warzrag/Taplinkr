'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, FileSpreadsheet, BarChart3, Calendar } from 'lucide-react'

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
        csvContent = "Date,Clics,Vues,Taux d'engagement\n"
        data.summary.forEach((item: any) => {
          const engagementRate = item.views > 0 ? (item.clicks / item.views * 100).toFixed(2) : 0
          csvContent += `${new Date(item.date).toLocaleDateString()},${item.clicks},${item.views},${engagementRate}%\n`
        })
        filename = `analytics-dashboard-${new Date().toISOString().split('T')[0]}.csv`
      } else if (type === 'link' && data.summary) {
        csvContent = "Date,Clics,Vues,Croissance\n"
        data.summary.forEach((item: any) => {
          csvContent += `${new Date(item.date).toLocaleDateString()},${item.clicks},${item.views},${item.clickGrowth || 0}%\n`
        })
        filename = `analytics-link-${linkId}-${new Date().toISOString().split('T')[0]}.csv`
      } else if (type === 'folder') {
        csvContent = "Dossier,Clics Totaux,Liens,Taux de croissance\n"
        // Simulated folder data
        csvContent += "Exemple,100,5,15%\n"
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

  const exportToPDF = async () => {
    setIsExporting(true)
    
    try {
      // Simuler l'export PDF
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // En réalité, ici on utiliserait une librairie comme jsPDF
      console.log('Export PDF non implémenté dans cette démo')
      
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error)
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
        <span>Exporter</span>
      </motion.button>

      {showOptions && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
        >
          <button
            onClick={exportToCSV}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">CSV</p>
              <p className="text-xs text-gray-500">Pour Excel/Google Sheets</p>
            </div>
          </button>

          <button
            onClick={exportToPDF}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
          >
            <FileText className="w-4 h-4 text-red-600" />
            <div>
              <p className="font-medium text-gray-900">PDF</p>
              <p className="text-xs text-gray-500">Rapport complet</p>
            </div>
          </button>

          <button
            onClick={exportToJSON}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors border-t border-gray-100"
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">JSON</p>
              <p className="text-xs text-gray-500">Données brutes</p>
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