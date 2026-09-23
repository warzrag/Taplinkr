'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { CheckCircle, Users } from 'lucide-react'
import Link from 'next/link'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import {
  AuthShell,
  AuthSpinner,
  FieldError,
  PasswordInput,
  fieldBorder,
  fieldClass,
  labelClass,
  pageTitle,
  primaryButton,
  textLink,
} from '@/components/auth/auth-ui'

interface FormData {
  email: string
  password: string
}

// Page de connexion reduite a son role : se connecter. Elle portait une
// colonne d'argumentaire (avantages, chiffres, badge de securite) adressee a
// quelqu'un qui est deja client, et qui debordait de l'ecran. Le cadre, les
// champs et les liens sont partages avec l'inscription (components/auth).
export default function SignIn() {
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

  // Afficher un loader pendant la vérification de session.
  if (status === 'loading') {
    return <AuthSpinner label="Checking your session" />
  }

  // Si déjà connecté, ne pas afficher le formulaire (éviter le flash)
  if (status === 'authenticated') {
    return null
  }

  return (
    <AuthShell>
      <Logo size="md" animated={false} />

      <h1 className={pageTitle}>Welcome back</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className={labelClass}>
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
          <FieldError id="email-error" message={errors.email?.message} />
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
          <PasswordInput
            id="password"
            autoComplete="current-password"
            hasError={Boolean(errors.password)}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', { required: 'Enter your password.' })}
          />
          <FieldError id="password-error" message={errors.password?.message} />
        </div>

        <div className="pt-1">
          <Button type="submit" fullWidth loading={loading} className={primaryButton}>
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
    </AuthShell>
  )
}
