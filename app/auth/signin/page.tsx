'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { ArrowLeft, CheckCircle, Eye, EyeOff, Users } from 'lucide-react'
import Link from 'next/link'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'

interface FormData {
  email: string
  password: string
}

// Page de connexion reduite a son role : se connecter. Elle portait une
// colonne d'argumentaire (avantages, chiffres, badge de securite) adressee a
// quelqu'un qui est deja client, et qui debordait de l'ecran.
// `dark:bg-` est indispensable meme si la variable change deja de valeur en
// sombre : globals.css repeint en mode sombre tout champ qui n'en declare pas,
// fond, texte ET bordure compris, et ecrasait la couleur et le focus d'ici.
// `focus-visible:outline-none` retire le contour indigo que
// performance-optimizations.css pose sur tout element actif : l'anneau du
// champ montre deja le focus, les deux ensemble faisaient un double trait bleu.
const fieldClass =
  'auth-field block h-11 w-full rounded-xl border bg-[var(--field-bg)] dark:bg-[var(--field-bg)] px-3.5 text-sm text-[var(--field-fg)] caret-violet-500 outline-none focus-visible:outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-gray-500 dark:placeholder:text-dash-text5 focus:ring-[3px]'

// Un champ en erreur garde son rouge pendant qu'on le corrige, en clair comme
// en sombre. Les variantes `dark:focus:` sont necessaires : sans elles, la
// bordure sombre l'emporte sur celle du focus et le champ actif ne se voit plus.
const fieldBorder = (hasError: boolean) =>
  hasError
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/25 dark:border-rose-400 dark:focus:border-rose-400'
    : 'border-gray-300 hover:border-gray-400 focus:border-violet-500 focus:ring-violet-500/25 dark:border-dash-line2 dark:hover:border-dash-line3 dark:focus:border-violet-500'

const textLink =
  'rounded-sm font-semibold text-violet-700 underline-offset-4 transition-colors hover:text-violet-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:text-violet-400 dark:hover:text-violet-300'

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
      const inviteToken = searchParams.get('invite')
      if (inviteToken) {
        window.location.href = `/dashboard/accept-invitation?token=${encodeURIComponent(inviteToken)}`
        return
      }
      router.push(searchParams.get('welcome') === 'team' ? '/dashboard/team/welcome' : '/dashboard')
    }
  }, [status, session, router, searchParams])

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified successfully. You can now log in.', {
        duration: 5000,
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      })
    }

    if (searchParams.get('message') === 'account_created') {
      toast.success('Account created successfully. Log in to access your workspace.', {
        duration: 5000,
        icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      })
    }

    if (searchParams.get('message') === 'login_to_join') {
      const teamName = searchParams.get('team')
      toast.success(`Log in to join the ${teamName || ''} team`, {
        duration: 5000,
        icon: <Users className="h-5 w-5 text-brand-500" />,
      })
    }
  }, [searchParams])

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      // Déterminer l'URL de callback
      const inviteToken = searchParams.get('invite')
      const welcomeTeam = searchParams.get('welcome') === 'team'
      const callbackUrl = inviteToken
        ? `/dashboard/accept-invitation?token=${encodeURIComponent(inviteToken)}`
        : welcomeTeam
        ? '/dashboard/team/welcome'
        : '/dashboard'

      // Utiliser signIn avec redirect: false pour gérer les erreurs
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          toast.error('Please verify your email before logging in.', { duration: 5000 })
        } else if (result.error === 'RATE_LIMIT_EXCEEDED') {
          toast.error('Too many attempts. Try again in 15 minutes.', { duration: 5000 })
        } else {
          toast.error('Incorrect email or password.')
        }
        setLoading(false)
        return
      }

      if (result?.ok) {
        toast.success('Logged in successfully.')
        // Forcer un rechargement complet de la page pour réinitialiser le SessionProvider
        window.location.href = callbackUrl
      }
    } catch (error) {
      console.error('💥 Erreur:', error)
      toast.error('Unable to log in.')
      setLoading(false)
    }
  }

  // Afficher un loader pendant la vérification de session. Même fond que la
  // page : le passage au formulaire se fait sans éclair de couleur.
  if (status === 'loading') {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 dark:bg-dash-bg" role="status">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-violet-600 dark:border-dash-line2 dark:border-t-violet-400" />
        <span className="sr-only">Checking your session</span>
      </div>
    )
  }

  // Si déjà connecté, ne pas afficher le formulaire (éviter le flash)
  if (status === 'authenticated') {
    return null
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-50 text-gray-950 selection:bg-violet-500/25 dark:bg-dash-bg dark:text-dash-text">
      <header className="px-5 pt-5 sm:px-8 sm:pt-7">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-sm text-sm text-gray-600 transition-colors hover:text-gray-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:text-dash-text4 dark:hover:text-dash-text"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to home
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[360px]">
          <Logo size="md" animated={false} />

          <h1 className="mt-10 text-[28px] font-bold leading-tight tracking-[-0.03em]">
            Welcome back
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 dark:text-dash-text2">
                Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email', {
                  required: 'Enter your email address.',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'This email address looks incomplete.',
                  },
                })}
                className={`${fieldClass} ${fieldBorder(Boolean(errors.email))}`}
                placeholder="you@example.com"
              />
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    id="email-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-2 text-xs text-rose-600 dark:text-rose-400"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between gap-4">
                <label htmlFor="password" className="text-sm font-medium text-gray-900 dark:text-dash-text2">
                  Password
                </label>
                <Link href="/auth/forgot-password" className={`text-xs ${textLink}`}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={errors.password ? true : undefined}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password', { required: 'Enter your password.' })}
                  className={`${fieldClass} ${fieldBorder(Boolean(errors.password))} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 dark:text-dash-text5 dark:hover:text-dash-text"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    id="password-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-2 text-xs text-rose-600 dark:text-rose-400"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-1">
              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="bg-gray-950 font-semibold text-white hover:bg-gray-800 focus-visible:outline-violet-500 active:scale-[0.99] dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
              >
                Log in
              </Button>
            </div>
          </form>

          <p className="mt-8 text-sm text-gray-600 dark:text-dash-text4">
            New to TapLinkr?{' '}
            <Link href="/auth/signup" className={textLink}>
              Create a free account
            </Link>
          </p>
        </div>
      </main>

      <footer className="px-5 pb-6 text-center text-xs text-gray-500 dark:text-dash-text5">
        Need help?{' '}
        <a href="mailto:hello@taplinkr.com" className={textLink}>
          Contact support
        </a>
      </footer>
    </div>
  )
}
