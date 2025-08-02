'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Sparkles, 
  Users, 
  CheckCircle, 
  Zap,
  Globe,
  Shield,
  BarChart3,
  Palette,
  Link,
  Gift,
  ArrowRight
} from 'lucide-react'
import confetti from 'canvas-confetti'

export default function TeamWelcomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [teamInfo, setTeamInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Lancer les confettis
    const launchConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#ec4899', '#3b82f6']
      })
    }
    
    setTimeout(launchConfetti, 500)
    
    // Récupérer les infos de l'équipe
    fetchTeamInfo()
  }, [])

  const fetchTeamInfo = async () => {
    try {
      const response = await fetch('/api/user/team')
      if (response.ok) {
        const data = await response.json()
        setTeamInfo(data)
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const premiumFeatures = [
    {
      icon: Link,
      title: 'Liens illimités',
      description: 'Créez autant de liens que vous voulez'
    },
    {
      icon: Palette,
      title: 'Thèmes Premium',
      description: 'Accédez à tous les thèmes exclusifs'
    },
    {
      icon: BarChart3,
      title: 'Analytics avancés',
      description: 'Statistiques détaillées en temps réel'
    },
    {
      icon: Globe,
      title: 'Domaine personnalisé',
      description: 'Utilisez votre propre nom de domaine'
    },
    {
      icon: Shield,
      title: 'Protection par mot de passe',
      description: 'Sécurisez vos pages sensibles'
    },
    {
      icon: Zap,
      title: 'Support prioritaire',
      description: 'Assistance rapide et personnalisée'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-pulse">
          <Crown className="w-16 h-16 text-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header avec animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white"
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 px-6 py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full mb-6"
          >
            <Crown className="w-12 h-12 text-yellow-300" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Bienvenue dans l'équipe {teamInfo?.team?.name} ! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            Félicitations ! Vous avez maintenant accès à toutes les fonctionnalités Premium
            grâce au plan {teamInfo?.teamOwner?.plan === 'premium' ? 'Premium' : 'Standard'} de votre équipe
          </motion.p>
        </div>

        {/* Effet de particules */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: -10,
              }}
              animate={{
                y: window.innerHeight + 10,
                x: Math.random() * window.innerWidth,
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Message de bienvenue personnalisé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-12"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Vos nouveaux super-pouvoirs
            </h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            En tant que membre de l'équipe, vous bénéficiez automatiquement de tous les avantages
            du plan {teamInfo?.teamOwner?.plan === 'premium' ? 'Premium' : 'Standard'}. Aucun paiement supplémentaire n'est requis !
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Statistiques de l'équipe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white mb-12"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Users className="w-8 h-8 mx-auto mb-2 text-white/80" />
              <div className="text-3xl font-bold">{teamInfo?.team?.members?.length || 1}</div>
              <div className="text-white/80">Membres dans l'équipe</div>
            </div>
            <div>
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-white/80" />
              <div className="text-3xl font-bold">∞</div>
              <div className="text-white/80">Liens disponibles</div>
            </div>
            <div>
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-white/80" />
              <div className="text-3xl font-bold">100%</div>
              <div className="text-white/80">Fonctionnalités débloquées</div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col md:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            Commencer à créer
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => router.push('/dashboard/team')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <Users className="w-5 h-5" />
            Voir mon équipe
          </button>
        </motion.div>
      </div>
    </div>
  )
}