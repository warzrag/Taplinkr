'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Linkedin,
  TrendingUp,
  ChevronLeft,
  Sparkles,
  Bell,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function SocialAnalyticsPage() {
  const [email, setEmail] = useState('')
  const [notified, setNotified] = useState(false)

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Veuillez entrer votre email')
      return
    }

    // TODO: Envoyer l'email à une API pour notification
    setNotified(true)
    toast.success('✅ Vous serez notifié du lancement !')
    setEmail('')
  }

  const socialPlatforms = [
    { icon: Instagram, name: 'Instagram', color: 'from-purple-600 to-pink-500' },
    { icon: Twitter, name: 'Twitter', color: 'from-blue-400 to-blue-600' },
    { icon: Youtube, name: 'YouTube', color: 'from-red-500 to-red-600' },
    { icon: Facebook, name: 'Facebook', color: 'from-blue-600 to-blue-700' },
    { icon: Linkedin, name: 'LinkedIn', color: 'from-blue-700 to-blue-800' },
  ]

  const features = [
    {
      icon: TrendingUp,
      title: 'Analyse de croissance',
      description: 'Suivez l\'évolution de vos followers en temps réel'
    },
    {
      icon: BarChart3,
      title: 'Engagement détaillé',
      description: 'Likes, commentaires, partages, tout en un seul endroit'
    },
    {
      icon: Calendar,
      title: 'Planification de contenu',
      description: 'Planifiez vos posts pour maximiser votre impact'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col items-center text-center">
          {/* Icon Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20"
              />
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-3xl shadow-2xl">
                <BarChart3 className="w-20 h-20 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wider">
                Bientôt disponible
              </span>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Social Analytics
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Analysez vos performances sur tous vos réseaux sociaux en un seul endroit
            </p>
          </motion.div>

          {/* Social Platforms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 mb-12"
          >
            {socialPlatforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className={`p-4 rounded-2xl bg-gradient-to-br ${platform.color} shadow-lg`}
              >
                <platform.icon className="w-8 h-8 text-white" />
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Notification Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="w-full max-w-md"
          >
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Soyez notifié du lancement
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Recevez un email dès que Social Analytics sera disponible
              </p>

              {!notified ? (
                <form onSubmit={handleNotifyMe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Notifier
                  </motion.button>
                </form>
              ) : (
                <div className="text-center py-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                    className="inline-flex items-center gap-2 text-green-600 dark:text-green-400"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      ✓
                    </div>
                    <span className="font-medium">Vous serez notifié !</span>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Back to Dashboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12"
          >
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm font-medium"
              >
                ← Retour au tableau de bord
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
