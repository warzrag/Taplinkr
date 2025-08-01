'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Shield, Sparkles, Folder, Link2 } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import LinkLogo from '@/components/LinkLogo'
import LinkLogoHero from '@/components/LinkLogoHero'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Chargement...</div>
      </div>
    )
  }

  if (session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5" />
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-3xl opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-full blur-3xl opacity-20"
            animate={{
              x: [0, -50, 0],
              y: [0, 50, 0],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo Hero */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <LinkLogoHero />
            </motion.div>

            {/* Title */}

            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Bienvenue sur TapLinkr 🚀
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p 
              className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Créez une magnifique page bio mobile-first pour partager tous vos liens sociaux. Un simple tap suffit à vos visiteurs pour accéder à votre univers digital.
            </motion.p>

            {/* Feature Pills */}
            <motion.div 
              className="flex flex-wrap justify-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {[
                { icon: Folder, text: "Dossiers imbriqués" },
                { icon: Link2, text: "Drag & Drop" },
                { icon: BarChart3, text: "Analytics" },
                { icon: Shield, text: "Protection" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <item.icon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/auth/signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-2xl hover:shadow-blue-500/25"
                >
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-2xl hover:bg-white border border-gray-200 transition-all duration-200 shadow-lg"
                >
                  Se connecter
                </Link>
              </motion.div>
            </motion.div>

            {/* Demo Link */}
            <motion.p 
              className="text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              Voir un exemple :{' '}
              <Link href="/demo" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4">
                TapLinkr.com/demo
              </Link>
            </motion.p>
          </motion.div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L1440 120L1440 0C1440 0 1140 80 720 80C300 80 0 0 0 0L0 120Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
              Pourquoi choisir TapLinkr ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              La solution mobile-first pour créer votre hub digital personnel
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Folder,
                title: 'Mobile-first design',
                description: 'Interface optimisée pour mobile où chaque tap compte. Parfait sur tous les écrans.',
                gradient: 'from-blue-500 to-indigo-600'
              },
              {
                icon: Link2,
                title: 'One tap, tout accessible',
                description: 'Vos visiteurs accèdent à tous vos contenus en un seul tap. UX pensée mobile.',
                gradient: 'from-emerald-500 to-teal-600'
              },
              {
                icon: BarChart3,
                title: 'Analytics en temps réel',
                description: 'Suivez chaque tap, analysez le comportement mobile de vos visiteurs',
                gradient: 'from-purple-500 to-pink-600'
              },
              {
                icon: Shield,
                title: 'Pages personnalisables',
                description: 'Thèmes, couleurs, animations - créez une expérience unique à votre image',
                gradient: 'from-orange-500 to-red-600'
              }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              En 3 étapes simples, créez votre page de liens
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Créez votre compte',
                description: 'Inscrivez-vous gratuitement en quelques secondes'
              },
              {
                step: '02',
                title: 'Ajoutez vos liens',
                description: 'Créez des liens personnalisés vers vos réseaux sociaux, sites web, portfolios...'
              },
              {
                step: '03',
                title: 'Partagez votre page',
                description: 'Obtenez votre URL personnalisée et partagez-la partout'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à créer votre page de liens ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez des milliers d'utilisateurs qui font confiance à TapLinkr
          </p>
          <Link 
            href="/auth/signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>Commencer maintenant</span>
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <LinkLogo size="lg" showText={false} animated={false} />
            </div>
            <p className="text-gray-400 mb-6">
              © 2024 TapLinkr. Tous droits réservés.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Conditions d'utilisation
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}