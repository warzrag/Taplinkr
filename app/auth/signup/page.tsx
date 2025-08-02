'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Eye, 
  EyeOff, 
  UserPlus, 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Sparkles, 
  CheckCircle,
  Shield,
  Zap,
  Globe,
  Star,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface FormData {
  name: string
  email: string
  password: string
}

const benefits = [
  {
    icon: Globe,
    title: "Portée mondiale",
    description: "Partagez votre page avec le monde entier"
  },
  {
    icon: Shield,
    title: "100% sécurisé",
    description: "Vos données sont protégées et chiffrées"
  },
  {
    icon: Zap,
    title: "Ultra rapide",
    description: "Pages optimisées pour la performance"
  }
]

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!registerResponse.ok) {
        const error = await registerResponse.json()
        toast.error(error.message || 'Erreur lors de l\'inscription')
        return
      }

      toast.success('Compte créé avec succès!')

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = async () => {
    const isValid = await trigger(['name', 'email'])
    if (isValid) {
      setStep(2)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link 
            href="/"
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour</span>
          </Link>
          
          <Link 
            href="/auth/signin"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Se connecter
          </Link>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-md">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Créer votre compte</h1>
              <p className="text-gray-600 mt-2">Rejoignez des milliers de créateurs</p>
            </motion.div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    backgroundColor: step >= 1 ? '#8b5cf6' : '#e5e7eb',
                    scale: step === 1 ? 1.1 : 1
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                >
                  {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                </motion.div>
                <motion.div
                  animate={{
                    backgroundColor: step >= 2 ? '#8b5cf6' : '#e5e7eb',
                  }}
                  className="w-16 h-1 rounded"
                />
                <motion.div
                  animate={{
                    backgroundColor: step >= 2 ? '#8b5cf6' : '#e5e7eb',
                    scale: step === 2 ? 1.1 : 1
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                >
                  2
                </motion.div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Votre nom
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          {...register('name', { 
                            required: 'Le nom est requis',
                            minLength: {
                              value: 2,
                              message: 'Le nom doit contenir au moins 2 caractères'
                            }
                          })}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="Jean Dupont"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          {...register('email', { 
                            required: 'L\'email est requis',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Email invalide'
                            }
                          })}
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="votre@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                    >
                      Continuer
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Créer un mot de passe
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password', { 
                            required: 'Le mot de passe est requis',
                            minLength: {
                              value: 8,
                              message: 'Le mot de passe doit contenir au moins 8 caractères'
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                              message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
                            }
                          })}
                          className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.password.message}
                        </p>
                      )}
                      
                      {/* Password Requirements */}
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full ${getValues('password')?.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={getValues('password')?.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                            Au moins 8 caractères
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(getValues('password') || '') ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={/[A-Z]/.test(getValues('password') || '') ? 'text-green-600' : 'text-gray-500'}>
                            Une lettre majuscule
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(getValues('password') || '') ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={/\d/.test(getValues('password') || '') ? 'text-green-600' : 'text-gray-500'}>
                            Un chiffre
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                      >
                        Retour
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Création...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Créer mon compte
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuer avec Google
            </button>

            {/* Terms */}
            <p className="mt-6 text-xs text-gray-500 text-center">
              En créant un compte, vous acceptez nos{' '}
              <Link href="/terms" className="text-purple-600 hover:text-purple-700">
                Conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link href="/privacy" className="text-purple-600 hover:text-purple-700">
                Politique de confidentialité
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-600 to-pink-600 items-center justify-center px-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Commencez votre aventure avec TapLinkr
              </h2>
              <p className="text-white/90 text-lg mb-12">
                Créez votre page personnalisée en quelques minutes et partagez tous vos liens importants en un seul endroit.
              </p>

              {/* Benefits */}
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-white/80 text-sm">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 italic mb-4">
                  "TapLinkr a transformé ma présence en ligne. Je peux maintenant partager tous mes projets et réseaux sociaux en un seul lien !"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full" />
                  <div>
                    <p className="text-white font-semibold text-sm">Marie L.</p>
                    <p className="text-white/70 text-xs">Créatrice de contenu</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}