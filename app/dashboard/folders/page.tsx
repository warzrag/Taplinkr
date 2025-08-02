'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, FolderPlus } from 'lucide-react'
import Link from 'next/link'
import DragDropDashboard from '@/components/DragDropDashboard'

export default function FoldersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Mes dossiers et liens
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Organisez vos liens avec des dossiers et glissez-déposez pour réorganiser
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <FolderPlus className="w-4 h-4" />
              <span>Utilisez le bouton "Nouveau" ci-dessous pour créer des dossiers</span>
            </div>
          </div>
        </motion.div>

        {/* DragDropDashboard Component */}
        <DragDropDashboard />
      </div>
    </div>
  )
}