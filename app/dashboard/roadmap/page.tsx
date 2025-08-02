'use client'

import { motion } from 'framer-motion'
import { Map, CheckCircle, Circle, Clock, ArrowLeft, Zap, Shield, Globe, Users } from 'lucide-react'
import Link from 'next/link'

interface RoadmapItem {
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'planned'
  quarter: string
  icon: any
}

const roadmapItems: RoadmapItem[] = [
  {
    title: 'Analytics avancés',
    description: 'Dashboard détaillé avec graphiques, heatmaps et insights visiteurs',
    status: 'completed',
    quarter: 'Q4 2024',
    icon: Zap
  },
  {
    title: 'Système de monétisation',
    description: 'Intégration Stripe pour les abonnements et paiements',
    status: 'in-progress',
    quarter: 'Q1 2025',
    icon: Shield
  },
  {
    title: 'Domaines personnalisés',
    description: 'Utilisez votre propre nom de domaine pour vos liens',
    status: 'planned',
    quarter: 'Q1 2025',
    icon: Globe
  },
  {
    title: 'Mode équipe',
    description: 'Collaboration en équipe avec rôles et permissions',
    status: 'in-progress',
    quarter: 'Q1 2025',
    icon: Users
  },
  {
    title: 'Application mobile',
    description: 'App iOS et Android pour gérer vos liens en déplacement',
    status: 'planned',
    quarter: 'Q2 2025',
    icon: Zap
  },
  {
    title: 'Intégrations avancées',
    description: 'Webhooks, API publique et intégrations tierces',
    status: 'planned',
    quarter: 'Q2 2025',
    icon: Shield
  }
]

export default function RoadmapPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
      case 'planned':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
      default:
        return ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />
      case 'in-progress':
        return <Clock className="w-5 h-5" />
      case 'planned':
        return <Circle className="w-5 h-5" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé'
      case 'in-progress':
        return 'En cours'
      case 'planned':
        return 'Planifié'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Retour au dashboard
            </button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
              <Map className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Roadmap
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Découvrez les futures fonctionnalités de TapLinkr
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-green-100 dark:bg-green-900/20 rounded-xl p-4 text-center"
          >
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
              {roadmapItems.filter(item => item.status === 'completed').length}
            </div>
            <div className="text-green-600 dark:text-green-500">Terminées</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-100 dark:bg-blue-900/20 rounded-xl p-4 text-center"
          >
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {roadmapItems.filter(item => item.status === 'in-progress').length}
            </div>
            <div className="text-blue-600 dark:text-blue-500">En cours</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center"
          >
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-400">
              {roadmapItems.filter(item => item.status === 'planned').length}
            </div>
            <div className="text-gray-600 dark:text-gray-500">Planifiées</div>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${getStatusColor(item.status)}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quarter}
                      </span>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="text-sm font-medium">
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Suggestion Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Une idée de fonctionnalité ?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Nous adorons entendre vos suggestions pour améliorer TapLinkr
          </p>
          <Link href="/dashboard/support">
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
              Suggérer une fonctionnalité
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}