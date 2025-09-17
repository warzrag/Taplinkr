'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  PartyPopper, 
  Users, 
  ArrowRight,
  Link as LinkIcon,
  BarChart3,
  Palette,
  Shield
} from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function TeamWelcomePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [teamName, setTeamName] = useState('')

  useEffect(() => {
    // Animation de confettis simple avec CSS
    const style = document.createElement('style')
    style.textContent = `
      @keyframes confetti-fall {
        to {
          transform: translateY(100vh) rotate(360deg);
        }
      }
      .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        background: #f0f;
        animation: confetti-fall 3s linear forwards;
      }
    `
    document.head.appendChild(style)

    // Créer des confettis
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div')
        confetti.className = 'confetti'
        confetti.style.left = Math.random() * 100 + '%'
        confetti.style.top = '-10px'
        confetti.style.background = ['#ff0', '#f0f', '#0ff', '#0f0', '#f00'][Math.floor(Math.random() * 5)]
        confetti.style.animationDelay = Math.random() * 3 + 's'
        document.body.appendChild(confetti)
        setTimeout(() => confetti.remove(), 6000)
      }, i * 50)
    }

    // Récupérer le nom de l'équipe
    fetchTeamInfo()
  }, [])

  const fetchTeamInfo = async () => {
    try {
      const response = await fetch('/api/teams')
      const data = await response.json()
      if (data.team) {
        setTeamName(data.team.name)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const features = [
    {
      icon: LinkIcon,
      title: 'Créez vos liens',
      description: 'Partagez vos pages et liens avec votre équipe'
    },
    {
      icon: BarChart3,
      title: 'Analytics partagées',
      description: 'Suivez les performances de toute l\'équipe'
    },
    {
      icon: Palette,
      title: 'Templates d\'équipe',
      description: 'Utilisez les modèles créés par vos collègues'
    },
    {
      icon: Shield,
      title: 'Accès sécurisé',
      description: 'Vos données sont protégées et partagées en toute sécurité'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.5 
            }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-6"
          >
            <PartyPopper className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
          >
            Bienvenue dans l'équipe {teamName} !
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xl text-gray-600 dark:text-gray-400 mb-2"
          >
            Bonjour {session?.user?.name || session?.user?.email} ! 🎉
          </motion.p>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            Vous faites maintenant partie de l'équipe. Découvrez tout ce que vous pouvez faire ensemble !
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                  <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center"
        >
          <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-2">Prêt à commencer ?</h2>
          <p className="mb-6 opacity-90">
            Explorez votre espace d'équipe et commencez à collaborer
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/team')}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Voir mon équipe
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-colors flex items-center justify-center gap-2"
            >
              Aller au dashboard
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}