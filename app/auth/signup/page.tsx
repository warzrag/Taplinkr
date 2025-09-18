'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  UserPlus,
} from 'lucide-react'
import Link from 'next/link'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/Container'

interface FormData {
  name: string
  email: string
  password: string
}

const benefits = [
  {
    icon: Shield,
    title: 'Sécurité et confiance',
    description: 'Contrôlez vos liens, définissez des accès privés et collaborez en toute sérénité.'
  },
  {
    icon: UserPlus,
    title: 'Personnalisation totale',
    description: 'Composez une page fidèle à votre identité et adaptez-la à chaque campagne.'
  },
  {
    icon: Mail,
    title: 'Onboarding assisté',
    description: 'Notre équipe vous accompagne pour configurer vos premiers liens et vos analytics.'
  },
]

const steps = [
  { label: 'Votre profil', description: 'Présentez-vous en quelques mots' },
  { label: 'Sécurité', description: 'Créez votre mot de passe' },
]

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [suggestedUsername, setSuggestedUsername] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<FormData>()

  useEffect(() => {
    const username = searchParams.get('username')
    if (username) {
      setSuggestedUsername(username)
    }
  }, [searchParams])

  const nextStep = async () => {
    const isValid = await trigger(['name', 'email'])
    if (isValid) {
      setStep(1)
    }
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.message || "Erreur lors de l'inscription")
        return
      }

      toast.success('Compte créé avec succès ! Vérifiez vos emails pour finaliser.')
      router.push('/auth/verify-email-waiting?email=' + encodeURIComponent(data.email))
    } catch (error) {
      toast.error("Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/2 top-0 h-[420px] w-[420px] translate-x-1/3 rounded-full bg-brand-500/15 blur-[180px]" />
        <div className="absolute left-1/2 bottom-[-80px] h-64 w-64 -translate-x-1/2 rounded-full bg-secondary-400/20 blur-[140px]" />
      </div>

      <Container className="relative z-10 flex min-h-screen items-center py-16">
        <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden h-full flex-col justify-between rounded-3xl border border-border bg-white/92 p-10 shadow-card lg:flex"
          >
            <div className="space-y-4">
              <span className="badge-pill bg-brand-500/10 text-brand-600">Décollage en quelques minutes</span>
              <h2 className="text-3xl font-semibold">Construisez une présence qui vous ressemble</h2>
              <p className="text-sm text-foreground/65">
                Centralisez vos liens, vos offres et vos contenus dans une page fluide, responsive et optimisée pour la conversion.
              </p>
            </div>

            <div className="space-y-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4 rounded-2xl border border-border/80 bg-white/95 p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{benefit.title}</p>
                    <p className="text-xs text-foreground/60">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-md rounded-3xl border border-border bg-white/95 p-8 shadow-card backdrop-blur"
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
                href="/auth/signin"
                className="text-foreground/70 transition-colors hover:text-foreground"
              >
                J'ai déjà un compte
              </Link>
            </div>

            <div className="mb-8 space-y-3 text-center">
              <div className="flex justify-center">
                <Logo size="md" showText={false} />
              </div>
              <h1 className="text-2xl font-semibold">Créez votre compte</h1>
              <p className="text-sm text-foreground/60">
                {suggestedUsername
                  ? `Votre URL réservée : taplinkr.com/${suggestedUsername}`
                  : 'Rejoignez des milliers de créateurs inspirants.'}
              </p>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {steps.map((item, index) => {
                const active = step === index
                const completed = step > index
                return (
                  <div
                    key={item.label}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                      active
                        ? 'border-brand-500 bg-brand-500/10 text-brand-600'
                        : completed
                          ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-600'
                          : 'border-border bg-white/90 text-foreground/60'
                    }`}
                  >
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-foreground/50">{item.description}</p>
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                {step === 0 ? (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Nom complet</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                        <input
                          type="text"
                          {...register('name', { required: 'Le nom est requis' })}
                          className="input pl-12"
                          placeholder="Votre nom"
                        />
                      </div>
                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-xs text-rose-500"
                          >
                            {errors.name.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Adresse email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                        <input
                          type="email"
                          {...register('email', {
                            required: "L'email est requis",
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

                    <Button type="button" fullWidth onClick={nextStep}>
                      Continuer
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('password', {
                            required: 'Le mot de passe est requis',
                            minLength: { value: 8, message: 'Au moins 8 caractères' },
                          })}
                          className="input pl-12 pr-12"
                          placeholder="Créer un mot de passe"
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
                      Créer mon compte
                      <UserPlus className="h-4 w-4" />
                    </Button>

                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="w-full text-sm text-foreground/50 transition-colors hover:text-foreground/70"
                    >
                      Retour à l'étape précédente
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="mt-8 rounded-2xl border border-border bg-[hsl(var(--surface))] p-5 text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-foreground/50">Conseil</p>
              <p className="mt-2 text-sm text-foreground/70">
                Une fois inscrit, personnalisez votre page avec nos templates premium et activez l’analytics avancé en 1 clic.
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  )
}
