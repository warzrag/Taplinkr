'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, LogIn, ArrowLeft, Mail, Lock, CheckCircle, Users, Zap, Shield, Star } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/Logo'

interface FormData {
  email: string
  password: string
}

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>()

  useEffect(() => {
    // Afficher un message si l'email vient d'être vérifié
    if (searchParams.get('verified') === 'true') {
      toast.success('Email vérifié avec succès ! Vous pouvez maintenant vous connecter.', {
        duration: 5000,
        icon: <CheckCircle className="w-5 h-5" />
      })
    }
    
    // Afficher un message si le compte vient d'être créé
    if (searchParams.get('message') === 'account_created') {
      toast.success('Compte créé avec succès ! Connectez-vous pour accéder à votre équipe.', {
        duration: 5000,
        icon: <CheckCircle className="w-5 h-5" />
      })
    }
    
    // Afficher un message si l'utilisateur doit se connecter pour rejoindre une équipe
    if (searchParams.get('message') === 'login_to_join') {
      const teamName = searchParams.get('team')
      toast.success(`Connectez-vous pour rejoindre l'équipe ${teamName || ''}`, {
        duration: 5000,
        icon: <Users className="w-5 h-5" />
      })
    }
    
    // Pré-remplir l'email si fourni
    const email = searchParams.get('email')
    if (email) {
      setValue('email', decodeURIComponent(email))
    }
  }, [searchParams, setValue])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          toast.error('Veuillez vérifier votre email avant de vous connecter', {
            duration: 5000
          })
        } else {
          toast.error('Email ou mot de passe incorrect')
        }
      } else if (result?.ok) {
        toast.success('Connexion réussie!')
        
        // Vérifier si on doit accepter une invitation ou aller à la page de bienvenue
        const inviteToken = searchParams.get('invite')
        const welcomeTeam = searchParams.get('welcome') === 'team'
        
        if (inviteToken) {
          router.push(`/dashboard/accept-invitation?token=${inviteToken}`)
        } else if (welcomeTeam) {
          router.push('/dashboard/team/welcome')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: Zap, text: "Analytics en temps réel" },
    { icon: Shield, text: "Sécurité maximale" },
    { icon: Star, text: "Interface intuitive" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link 
            href="/"
            className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour</span>
          </Link>
          
          <Link 
            href="/auth/signup"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm sm:text-base"
          >
            Créer un compte
          </Link>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20">
          <div className="w-full max-w-md">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 sm:mb-10"
            >
              <div className="mb-4 flex justify-center">
                <Logo size="md" showText={false} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bon retour !</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Connectez-vous pour accéder à votre espace
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email invalide'
                      }
                    })}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="votre@email.com"
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { 
                      required: 'Le mot de passe est requis',
                      minLength: {
                        value: 6,
                        message: 'Le mot de passe doit contenir au moins 6 caractères'
                      }
                    })}
                    className="w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </motion.form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full py-2.5 sm:py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-3 text-sm sm:text-base"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuer avec Google</span>
            </button>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
                Créer un compte gratuitement
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Image/Graphics */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-blue-700 items-center justify-center p-12">
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
            >
              <h2 className="text-3xl font-bold text-white mb-6">
                Gérez tous vos liens en un seul endroit
              </h2>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-white/90 text-lg">{feature.text}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 bg-white/30 rounded-full border-2 border-white/50" />
                    ))}
                  </div>
                  <p className="text-white/90">
                    Rejoint par <span className="font-semibold">50,000+</span> créateurs
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}