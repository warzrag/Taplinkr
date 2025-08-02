'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Check, 
  X, 
  Sparkles, 
  Shield, 
  Zap, 
  BarChart3,
  Users,
  Globe,
  Palette,
  Link2,
  Instagram,
  Youtube,
  Twitter,
  Github,
  Linkedin,
  Star,
  TrendingUp,
  Clock,
  Heart
} from 'lucide-react'
import { debounce } from 'lodash'

const features = [
  {
    icon: Link2,
    title: "Tous vos liens en un seul endroit",
    description: "Partagez facilement tous vos réseaux sociaux, sites web et contenus"
  },
  {
    icon: Palette,
    title: "Personnalisation complète",
    description: "Thèmes, couleurs, animations - créez une page qui vous ressemble"
  },
  {
    icon: BarChart3,
    title: "Analytics en temps réel",
    description: "Suivez vos visiteurs, clics et performances détaillées"
  },
  {
    icon: Shield,
    title: "Protection et sécurité",
    description: "Liens protégés par mot de passe et dates d'expiration"
  },
  {
    icon: Users,
    title: "Gestion d'équipe",
    description: "Collaborez avec votre équipe sur des pages partagées"
  },
  {
    icon: Zap,
    title: "Ultra rapide",
    description: "Pages optimisées pour une performance maximale"
  }
]

const testimonials = [
  {
    name: "Sophie Martin",
    role: "Influenceuse",
    avatar: "SM",
    content: "TapLinkr a révolutionné ma présence en ligne. Je peux enfin partager tous mes projets en un seul lien !",
    rating: 5
  },
  {
    name: "Thomas Dubois",
    role: "Entrepreneur",
    avatar: "TD",
    content: "Les analytics détaillés m'aident à comprendre mon audience et optimiser ma stratégie.",
    rating: 5
  },
  {
    name: "Emma Laurent",
    role: "Artiste",
    avatar: "EL",
    content: "La personnalisation est incroyable ! Ma page reflète parfaitement mon univers créatif.",
    rating: 5
  }
]

const popularUsers = [
  { name: "influenceur", icon: Instagram, color: "from-pink-500 to-purple-500" },
  { name: "createur", icon: Youtube, color: "from-red-500 to-pink-500" },
  { name: "artiste", icon: Heart, color: "from-purple-500 to-indigo-500" },
  { name: "entrepreneur", icon: TrendingUp, color: "from-blue-500 to-cyan-500" }
]

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const checkUsername = useCallback(
    debounce(async (value: string) => {
      if (!value || value.length < 3) {
        setAvailable(null)
        setError('')
        return
      }

      setChecking(true)
      setError('')

      try {
        const response = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`)
        const data = await response.json()
        
        setAvailable(data.available)
        if (!data.available && data.error) {
          setError(data.error)
        }
      } catch (err) {
        console.error('Erreur vérification:', err)
        setError('Erreur de vérification')
      } finally {
        setChecking(false)
      }
    }, 500),
    []
  )

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setUsername(value)
    setAvailable(null)
    
    if (value) {
      checkUsername(value)
    }
  }

  const handleGetStarted = () => {
    if (available && username) {
      router.push(`/auth/signup?username=${encodeURIComponent(username)}`)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
      </div>
    )
  }

  if (session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TapLinkr
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Fonctionnalités
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                Témoignages
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Tarifs
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                href="/auth/signin" 
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Se connecter
              </Link>
              <Link 
                href="/auth/signup" 
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-8"
            >
              <TrendingUp className="w-4 h-4" />
              Plus de 50,000 créateurs nous font confiance
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Un seul lien
              </span>
              <br />
              pour tout partager
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Créez votre page personnalisée et partagez tous vos liens importants en un seul endroit. 
              Simple, élégant et puissant.
            </p>

            {/* Username Checker */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="relative">
                <div className="flex items-center bg-gray-50 rounded-2xl p-2 border-2 border-gray-200 focus-within:border-purple-500 transition-all">
                  <span className="text-gray-500 pl-4 pr-1 text-lg">taplinkr.com/</span>
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="votreusername"
                    className="flex-1 bg-transparent outline-none text-lg px-2 py-3"
                    maxLength={30}
                  />
                  
                  <AnimatePresence mode="wait">
                    {checking && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mr-2"
                      >
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      </motion.div>
                    )}
                    
                    {!checking && available === true && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mr-2"
                      >
                        <Check className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                    
                    {!checking && available === false && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="mr-2"
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleGetStarted}
                    disabled={!available || checking}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      available
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    C'est parti !
                  </button>
                </div>
              </div>
              
              {/* Status Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-red-600"
                  >
                    {error}
                  </motion.div>
                )}
                
                {available === true && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 text-sm text-green-600"
                  >
                    Parfait ! Ce nom d'utilisateur est disponible
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Popular Examples */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="text-sm text-gray-500">Exemples populaires :</span>
              {popularUsers.map((user, index) => (
                <motion.button
                  key={user.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => {
                    setUsername(user.name)
                    checkUsername(user.name)
                  }}
                  className="group flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
                >
                  <div className={`w-6 h-6 bg-gradient-to-r ${user.color} rounded flex items-center justify-center`}>
                    <user.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    taplinkr.com/{user.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600">
              Des fonctionnalités puissantes pour créer la page parfaite
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Ils adorent TapLinkr
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez ce que nos utilisateurs en pensent
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6">"{testimonial.content}"</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez des milliers de créateurs et commencez à partager vos liens dès aujourd'hui
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Créer mon TapLinkr gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">TapLinkr</span>
            </div>
            
            <p className="text-gray-400 text-sm">
              © 2024 TapLinkr. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}