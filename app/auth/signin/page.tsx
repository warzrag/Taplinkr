'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
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
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/Container'

interface FormData {
  email: string
  password: string
}

const highlights = [
  {
    icon: Shield,
    title: 'Sécurité avancée',
    description: 'Sessions chiffrées, double authentification et gestion des équipes sécurisée.'
  },
  {
    icon: Zap,
    title: 'Analytics en direct',
    description: 'Visualisez vos clics et conversions en temps réel depuis le dashboard.'
  },
  {
    icon: Users,
    title: 'Collaboration fluide',
    description: 'Invitez votre équipe, attribuez des rôles et créez ensemble vos campagnes.'
  },
]

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

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
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          toast.error('Veuillez vérifier votre email avant de vous connecter', { duration: 5000 })
        } else if (result.error === 'RATE_LIMIT_EXCEEDED') {
          toast.error('Trop de tentatives de connexion. Réessayez dans 15 minutes.', { duration: 10000 })
        } else {
          toast.error('Email ou mot de passe incorrect')
        }
      } else if (result?.ok) {
        toast.success('Connexion réussie !')
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[180px]" />
        <div className="absolute -left-20 bottom-[-80px] h-64 w-64 rounded-full bg-secondary-400/15 blur-[160px]" />
      </div>

      <Container className="relative z-10 flex min-h-screen items-center py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden h-full flex-col justify-between rounded-3xl border border-border bg-[hsl(var(--surface))] p-10 shadow-card lg:flex"
          >
            <div className="space-y-4">
              <span className="badge-pill bg-brand-500/10 text-brand-600">Dashboard TapLinkr</span>
              <h2 className="text-3xl font-semibold">Gérez tout depuis un seul espace</h2>
              <p className="text-sm text-foreground/65">
                Visualisez vos analytics, publiez de nouveaux liens, pilotez vos campagnes et collaborez avec votre équipe en toute sécurité.
              </p>
            </div>

            <div className="space-y-6">
              {highlights.map((item) => (
                <div key={item.title} className="flex gap-4 rounded-2xl border border-border/80 bg-[hsl(var(--surface-muted))] p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-foreground/60">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-md rounded-3xl border border-border bg-[hsl(var(--surface))] p-8 shadow-card backdrop-blur"
          >
            <div className="mb-6 flex items-center justify-between text-sm">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-foreground/60 transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
              <Link
                href="/auth/signup"
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                Créer un compte
              </Link>
            </div>

            <div className="mb-8 space-y-3 text-center">
              <div className="flex justify-center">
                <Logo size="md" showText={false} />
              </div>
              <h1 className="text-2xl font-semibold">Bon retour !</h1>
              <p className="text-sm text-foreground/60">Connectez-vous pour retrouver votre espace personnalisé.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Adresse email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    type="email"
                    {...register('email', {
                      required: 'L\'email est requis',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email invalide',
                      },
                    })}
                    className="input pl-12"
                    placeholder="vous@exemple.com"
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Mot de passe</label>
                  <Link href="/auth/forgot-password" className="text-xs text-brand-600 hover:text-brand-500">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Le mot de passe est requis' })}
                    className="input pl-12 pr-12"
                    placeholder="Votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((state) => !state)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-foreground/40 transition-colors hover:text-foreground"
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

              <Button type="submit" fullWidth loading={loading}>
                Se connecter
                <LogIn className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-8 rounded-2xl border border-border bg-[hsl(var(--surface))] p-5 text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">Astuce</p>
              <p className="mt-2 text-sm text-foreground/70">
                Activez le Mode Focus dans votre dashboard pour voir l'impact de vos nouveaux liens en temps réel.
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  )
}
