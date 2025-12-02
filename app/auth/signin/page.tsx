'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  Shield,
  BarChart3,
  Users,
  Zap,
  TrendingUp,
  Globe,
} from 'lucide-react'
import Link from 'next/link'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/Container'

interface FormData {
  email: string
  password: string
}

const benefits = [
  {
    icon: BarChart3,
    title: 'Analytics en temps réel',
    description: 'Tableaux de bord intuitifs pour mesurer vos performances et optimiser votre ROI'
  },
  {
    icon: Shield,
    title: 'Sécurité enterprise',
    description: 'Chiffrement SSL 256-bit, authentification 2FA et conformité RGPD garantie'
  },
  {
    icon: Users,
    title: 'Collaboration avancée',
    description: 'Gestion d\'équipe avec rôles granulaires et workflows collaboratifs sécurisés'
  },
]

const metrics = [
  { value: '500K+', label: 'Professionnels', icon: Users },
  { value: '99.9%', label: 'Uptime', icon: TrendingUp },
  { value: '2.4Mds', label: 'Interactions/an', icon: Globe },
  { value: '<200ms', label: 'Temps réponse', icon: Zap },
]

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  // Rediriger si déjà connecté
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('✅ Déjà connecté, redirection vers /dashboard')
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email vérifié avec succès ! Vous pouvez maintenant vous connecter.', {
        duration: 5000,
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      })
    }

    if (searchParams.get('message') === 'account_created') {
      toast.success('Compte créé avec succès ! Connectez-vous pour accéder à votre espace.', {
        duration: 5000,
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      })
    }

    if (searchParams.get('message') === 'login_to_join') {
      const teamName = searchParams.get('team')
      toast.success(`Connectez-vous pour rejoindre l'équipe ${teamName || ''}`, {
        duration: 5000,
        icon: <Users className="h-5 w-5 text-brand-500" />,
      })
    }
  }, [searchParams])

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    console.log('🔐 Tentative de connexion...', { email: data.email })

    // Déterminer l'URL de callback
    const inviteToken = searchParams.get('invite')
    const welcomeTeam = searchParams.get('welcome') === 'team'
    const callbackUrl = inviteToken
      ? `/dashboard/accept-invitation?token=${inviteToken}`
      : welcomeTeam
      ? '/dashboard/team/welcome'
      : '/dashboard'

    // Utiliser signIn avec redirect: true - NextAuth gère tout
    await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: true,
      callbackUrl,
    })

    // Si on arrive ici, c'est qu'il y a eu une erreur (redirect: true ne retourne que sur erreur)
    setLoading(false)
  }

  // Afficher un loader pendant la vérification de session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Vérification...</p>
        </div>
      </div>
    )
  }

  // Si déjà connecté, ne pas afficher le formulaire (éviter le flash)
  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950">
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
      </div>

      <Container className="relative z-10 min-h-screen py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16 items-center">
          {/* Left Column - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block space-y-12"
          >
            <div className="space-y-6">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Link>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-1.5 text-sm font-medium">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-gray-700 dark:text-gray-300">Plateforme professionnelle</span>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 dark:text-white lg:text-5xl">
                  Accédez à votre dashboard
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Centralisez vos liens, analysez vos performances et collaborez avec votre équipe en toute sécurité.
                </p>
              </div>
            </div>

            {/* Benefits Cards */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="flex gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 text-center"
                >
                  <div className="mx-auto mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                    <metric.icon className="h-4 w-4" />
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Sign In Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 lg:p-10 shadow-xl">
              {/* Mobile Back Link */}
              <div className="mb-8 flex items-center justify-between lg:hidden">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors"
                >
                  Créer un compte
                </Link>
              </div>

              {/* Logo & Title */}
              <div className="mb-8 space-y-4 text-center">
                <div className="flex justify-center">
                  <Logo size="md" showText={false} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">
                    Bon retour
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connectez-vous pour accéder à votre dashboard
                  </p>
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Adresse email professionnelle
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      {...register('email', {
                        required: 'L\'email est requis',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email invalide',
                        },
                      })}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      placeholder="vous@entreprise.com"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs text-rose-500"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Mot de passe
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-medium text-brand-600 hover:text-brand-500 transition-colors"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { required: 'Le mot de passe est requis' })}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-12 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs text-rose-500"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900"
                >
                  Se connecter
                  <LogIn className="h-4 w-4" />
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                    Pas encore de compte ?
                  </span>
                </div>
              </div>

              {/* Sign Up Link */}
              <Link
                href="/auth/signup"
                className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Créer un compte gratuit
              </Link>

              {/* Security Badge */}
              <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      Connexion sécurisée SSL 256-bit
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Vos données sont protégées et conformes RGPD
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Link */}
            <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
              Besoin d'aide ?{' '}
              <Link href="/support" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
                Contactez notre support
              </Link>
            </p>
          </motion.div>
        </div>
      </Container>
    </div>
  )
}
