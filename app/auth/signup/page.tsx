'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

import Logo from '@/components/Logo'
import { Button } from '@/components/ui/button'
import {
  AuthShell,
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
  name: string
  email: string
  password: string
}

// Inscription en un seul ecran. Elle en comptait deux (nom et e-mail, puis
// mot de passe) sans rien envoyer entre les deux : la premiere etape n'etait
// qu'un clic de plus avant de creer son compte. Retires aussi : la colonne
// d'argumentaire, les halos flous du fond, les cartes d'etapes et l'encadre
// « Tip ».
export default function SignUp() {
  const [loading, setLoading] = useState(false)
  const [suggestedUsername, setSuggestedUsername] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [accountState, setAccountState] = useState<'verified' | 'unverified' | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>()

  useEffect(() => {
    const username = searchParams.get('username')
    if (username) {
      setSuggestedUsername(username)
    }
  }, [searchParams])

  const onSubmit = async (data: FormData) => {
    setSubmitError('')
    setAccountState(null)
    setLoading(true)
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20_000)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, username: suggestedUsername || undefined }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const message = error.message || 'Unable to create your account. Please try again.'
        setSubmitError(message)
        setAccountState(
          error.code === 'EMAIL_NOT_VERIFIED'
            ? 'unverified'
            : error.code === 'ACCOUNT_EXISTS'
              ? 'verified'
              : null,
        )
        toast.error(message)
        return
      }

      const result = await response.json()
      if (result.emailSent === false) {
        toast.error('Your account was created, but email delivery is delayed. Use Resend email on the next screen.')
      } else {
        toast.success('Account created. Check your email to finish setup.')
      }
      router.push(
        '/auth/verify-email-waiting?email='
        + encodeURIComponent(data.email)
        + (result.emailSent === false ? '&delivery=delayed' : ''),
      )
    } catch (error) {
      const message = error instanceof DOMException && error.name === 'AbortError'
        ? 'The request is taking too long. Your account may already exist. Try signing in or resend the verification email.'
        : 'Unable to reach TapLinkr. Check your connection and try again.'
      setSubmitError(message)
      toast.error(message)
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <Logo size="md" animated={false} />

      <h1 className={pageTitle}>Create your account</h1>
      {suggestedUsername && (
        <p className="mt-2 text-sm text-gray-600 dark:text-dash-text4">
          Your reserved URL:{' '}
          <span className="font-semibold text-gray-950 dark:text-dash-text">taplinkr.com/{suggestedUsername}</span>
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="name" className={labelClass}>
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name', { required: 'Enter your name.' })}
            className={`${fieldClass} ${fieldBorder(Boolean(errors.name))}`}
            placeholder="Your name"
          />
          <FieldError id="name-error" message={errors.name?.message} />
        </div>

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
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            hasError={Boolean(errors.password)}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? 'password-error' : 'password-hint'}
            {...register('password', {
              required: 'Choose a password.',
              // Memes bornes que le serveur (/api/auth/register) : sinon l'erreur
              // n'arrive qu'apres l'envoi, sous forme de message generique.
              minLength: { value: 8, message: 'Use at least 8 characters.' },
              maxLength: { value: 128, message: 'Use 128 characters or fewer.' },
            })}
          />
          {errors.password ? (
            <FieldError id="password-error" message={errors.password.message} />
          ) : (
            <p id="password-hint" className="mt-2 text-xs text-gray-500 dark:text-dash-text5">
              At least 8 characters.
            </p>
          )}
        </div>

        <div className="pt-1">
          <Button type="submit" fullWidth loading={loading} className={primaryButton}>
            Create my account
          </Button>
        </div>

        <div aria-live="polite">
          {loading && (
            <p className="text-center text-sm text-gray-600 dark:text-dash-text4">
              Creating your account… Please keep this page open.
            </p>
          )}

          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-300"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p>{submitError}</p>
              </div>
              {accountState && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 pl-6">
                  {accountState === 'unverified' && (
                    <Link
                      href={`/auth/resend-verification?email=${encodeURIComponent(getValues('email') || '')}`}
                      className={textLink}
                    >
                      Resend verification email
                    </Link>
                  )}
                  <Link href="/auth/signin" className={textLink}>
                    Go to login
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </form>

      <p className="mt-8 text-sm text-gray-600 dark:text-dash-text4">
        Already have an account?{' '}
        <Link href="/auth/signin" className={textLink}>
          Log in
        </Link>
      </p>
    </AuthShell>
  )
}
