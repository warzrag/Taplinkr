'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy, Medal, Award, TrendingUp, Users, BarChart, Eye, ChevronLeft, Crown, Folder
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface LeaderboardMember {
  user: {
    id: string
    name?: string
    email: string
    image?: string
    teamRole: string
  }
  stats: {
    totalClicks: number
    totalViews: number
    totalLinks: number
    conversionRate: number
  }
}

interface CreatorStats {
  folder: {
    id: string
    name: string
    icon: string
    color: string
  }
  stats: {
    totalClicks: number
    totalViews: number
    totalLinks: number
    conversionRate: number
  }
}

interface LeaderboardData {
  leaderboard: LeaderboardMember[]
  teamTotals: {
    totalClicks: number
    totalViews: number
    totalLinks: number
  }
  creatorsStats: CreatorStats[]
  period: string
}

export default function TeamLeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all')

  useEffect(() => {
    fetchLeaderboard()
  }, [period])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/team/leaderboard?period=${period}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors du chargement')
      }
    } catch (error) {
      console.error('Erreur leaderboard:', error)
      toast.error('Erreur lors du chargement du leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getPodiumIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />
      case 2:
        return <Medal className="w-7 h-7 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />
      default:
        return null
    }
  }

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-amber-500'
      case 2:
        return 'from-gray-300 to-gray-400'
      case 3:
        return 'from-orange-400 to-orange-500'
      default:
        return 'from-blue-400 to-cyan-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!data || data.leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/dashboard/team">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6">
              <ChevronLeft className="w-5 h-5" />
              Retour à l'équipe
            </button>
          </Link>
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun membre n'a encore de liens assignés</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard/team">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6">
              <ChevronLeft className="w-5 h-5" />
              Retour à l'équipe
            </button>
          </Link>

          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Leaderboard de l'équipe
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Classement des membres par performance
                </p>
              </div>
            </div>

            {/* Filtre période */}
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'week'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Semaine
              </button>
              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'month'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => setPeriod('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'all'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Tout le temps
              </button>
            </div>
          </div>

          {/* Stats équipe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Clics</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.teamTotals.totalClicks.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Vues</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.teamTotals.totalViews.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Liens Assignés</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {data.teamTotals.totalLinks}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Créatrices */}
        {data.creatorsStats && data.creatorsStats.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Folder className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Stats Créatrices
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.creatorsStats.map((creator, index) => (
                <motion.div
                  key={creator.folder.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4"
                  style={{ borderColor: creator.folder.color }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="text-3xl p-2 rounded-lg"
                      style={{ backgroundColor: `${creator.folder.color}20` }}
                    >
                      {creator.folder.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
                        {creator.folder.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {creator.stats.totalLinks} liens
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Clics</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {creator.stats.totalClicks.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vues</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {creator.stats.totalViews.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Taux de conversion: <span className="font-bold">{creator.stats.conversionRate}%</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Membres */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Leaderboard Membres
            </h2>
          </div>
          {data.leaderboard.length === 0 || data.leaderboard.every(m => m.stats.totalLinks === 0) ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Aucun membre n'a encore de liens assignés
              </p>
            </div>
          ) : (
            data.leaderboard.filter(m => m.stats.totalLinks > 0).map((member, index) => {
              const rank = index + 1
              const isPodium = rank <= 3

              return (
                <motion.div
                  key={member.user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${
                    isPodium ? 'ring-2 ring-offset-2 ring-offset-gray-50 dark:ring-offset-gray-900' : ''
                  } ${
                    rank === 1 ? 'ring-yellow-400' : rank === 2 ? 'ring-gray-400' : rank === 3 ? 'ring-orange-400' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rang + Icône podium */}
                    <div className="flex flex-col items-center gap-1 min-w-[60px]">
                      {isPodium && getPodiumIcon(rank)}
                      <span className={`text-2xl font-bold ${
                        rank === 1 ? 'text-yellow-500' :
                        rank === 2 ? 'text-gray-400' :
                        rank === 3 ? 'text-orange-400' :
                        'text-gray-500'
                      }`}>
                        #{rank}
                      </span>
                    </div>

                  {/* Avatar + Nom */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name || member.user.email}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getPodiumColor(rank)} flex items-center justify-center text-white font-bold text-lg`}>
                        {((member.user as any).nickname || member.user.name || member.user.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                          {(member.user as any).nickname || member.user.name || member.user.email}
                        </h3>
                        {member.user.teamRole === 'owner' && (
                          <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Clics</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {member.stats.totalClicks.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Vues</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {member.stats.totalViews.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Liens</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {member.stats.totalLinks}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Conv.</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {member.stats.conversionRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
        </div>
      </div>
    </div>
  )
}
