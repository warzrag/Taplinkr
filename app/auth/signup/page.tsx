'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, UserPlus, ArrowLeft, User, Mail, Lock, Sparkles, Check } from 'lucide-react'
import Link from 'next/link'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>()
  const password = watch('password')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      // Créer le compte
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        })
      })

      if (!registerResponse.ok) {
        const error = await registerResponse.json()
        toast.error(error.message || 'Erreur lors de l\'inscription')
        return
      }

      toast.success('Compte créé avec succès!')

      // Connecter automatiquement l'utilisateur
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full">
          {/* Back to home */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-8 transition-colors group"
            >
              <motion.div
                whileHover={{ x: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.div>
              <span>Retour à l'accueil</span>
            </Link>
          </motion.div>

          {/* Card */}
          <motion.div 
            className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Header */}
            <div className="relative px-8 py-8 text-center">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10" />
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <UserPlus className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </motion.div>
              
              <motion.h1 
                className="text-3xl font-bold text-white mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Bienvenue !
              </motion.h1>
              <motion.p 
                className="text-white/80 text-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Créez votre compte et commencez dès maintenant
              </motion.p>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-white mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Nom complet</span>
                    </div>
                  </label>
                  <motion.input
                    type="text"
                    {...register('name', { 
                      required: 'Le nom est requis',
                      minLength: {
                        value: 2,
                        message: 'Le nom doit contenir au moins 2 caractères'
                      }
                    })}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-400 ring-2 ring-red-400/50' : ''}`}
                    placeholder="Votre nom complet"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p 
                        className="mt-2 text-sm text-red-400 flex items-center space-x-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <span>⚠️</span>
                        <span>{errors.name.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Email */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-semibold text-white mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>Adresse email</span>
                    </div>
                  </label>
                  <motion.input
                    type="email"
                    {...register('email', { 
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email invalide'
                      }
                    })}
                    className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-400 ring-2 ring-red-400/50' : ''}`}
                    placeholder="votre@email.com"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p 
                        className="mt-2 text-sm text-red-400 flex items-center space-x-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <span>⚠️</span>
                        <span>{errors.email.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-semibold text-white mb-3">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Mot de passe</span>
                    </div>
                  </label>
                  <div className="relative">
                    <motion.input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { 
                        required: 'Le mot de passe est requis',
                        minLength: {
                          value: 6,
                          message: 'Le mot de passe doit contenir au moins 6 caractères'
                        }
                      })}
                      className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-400 ring-2 ring-red-400/50' : ''}`}
                      placeholder="••••••••"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p 
                        className="mt-2 text-sm text-red-400 flex items-center space-x-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <span>⚠️</span>
                        <span>{errors.password.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Confirm Password */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <label className="block text-sm font-semibold text-white mb-3">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>Confirmer le mot de passe</span>
                    </div>
                  </label>
                  <div className="relative">
                    <motion.input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', { 
                        required: 'La confirmation du mot de passe est requise',
                        validate: value => value === password || 'Les mots de passe ne correspondent pas'
                      })}
                      className={`w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? 'border-red-400 ring-2 ring-red-400/50' : ''}`}
                      placeholder="••••••••"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p 
                        className="mt-2 text-sm text-red-400 flex items-center space-x-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <span>⚠️</span>
                        <span>{errors.confirmPassword.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="pt-2"
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-2xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Création du compte...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <UserPlus className="w-5 h-5" />
                        <span>Créer mon compte</span>
                      </div>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* Terms */}
              <motion.p 
                className="mt-6 text-xs text-white/60 text-center leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                En créant un compte, vous acceptez nos{' '}
                <a href="#" className="text-purple-300 hover:text-purple-200 underline">
                  Conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="#" className="text-purple-300 hover:text-purple-200 underline">
                  Politique de confidentialité
                </a>.
              </motion.p>

              {/* Divider */}
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <p className="text-white/80">
                  Déjà un compte ?{' '}
                  <Link 
                    href="/auth/signin" 
                    className="text-purple-300 hover:text-purple-200 font-semibold transition-colors underline underline-offset-4"
                  >
                    Se connecter
                  </Link>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}