'use client'

import { forwardRef, useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

/**
 * Ce que partagent les pages de compte (connexion, inscription) : le cadre,
 * les champs, les liens et les messages d'erreur.
 *
 * Tout vit ici pour que les pages restent identiques. Elles portaient chacune
 * leur propre decor (colonnes d'argumentaire, halos flous, cartes d'etapes) et
 * ne se ressemblaient plus.
 */

// `dark:bg-` est indispensable meme si la variable change deja de valeur en
// sombre : globals.css repeint en mode sombre tout champ qui n'en declare pas,
// fond, texte ET bordure compris, et ecrasait la couleur et le focus d'ici.
// `focus-visible:outline-none` retire le contour indigo que
// performance-optimizations.css pose sur tout element actif : l'anneau du
// champ montre deja le focus, les deux ensemble faisaient un double trait bleu.
// `auth-field` (globals.css) empeche Chrome de peindre en bleu clair les
// champs qu'il remplit tout seul.
export const fieldClass =
  'auth-field block h-11 w-full rounded-xl border bg-[var(--field-bg)] dark:bg-[var(--field-bg)] px-3.5 text-sm text-[var(--field-fg)] caret-violet-500 outline-none focus-visible:outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-gray-500 dark:placeholder:text-dash-text5 focus:ring-[3px]'

// Un champ en erreur garde son rouge pendant qu'on le corrige, en clair comme
// en sombre. Les variantes `dark:focus:` sont necessaires : sans elles, la
// bordure sombre l'emporte sur celle du focus et le champ actif ne se voit plus.
export const fieldBorder = (hasError: boolean) =>
  hasError
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/25 dark:border-rose-400 dark:focus:border-rose-400'
    : 'border-gray-300 hover:border-gray-400 focus:border-violet-500 focus:ring-violet-500/25 dark:border-dash-line2 dark:hover:border-dash-line3 dark:focus:border-violet-500'

export const labelClass = 'mb-2 block text-sm font-medium text-gray-900 dark:text-dash-text2'

export const textLink =
  'rounded-sm font-semibold text-violet-700 underline-offset-4 transition-colors hover:text-violet-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 dark:text-violet-400 dark:hover:text-violet-300'

export const primaryButton =
  'bg-gray-950 font-semibold text-white hover:bg-gray-800 focus-visible:outline-violet-500 active:scale-[0.99] dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200'

export const pageTitle = 'mt-10 text-[28px] font-bold leading-tight tracking-[-0.03em]'

export function AuthShell({ children }: { children: ReactNode }) {
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
        <div className="w-full max-w-[360px]">{children}</div>
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

/**
 * Attente pendant la verification de session. Meme fond que les pages : le
 * passage au formulaire se fait sans eclair de couleur.
 */
export function AuthSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-50 dark:bg-dash-bg" role="status">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-violet-600 dark:border-dash-line2 dark:border-t-violet-400" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mt-2 text-xs text-rose-600 dark:text-rose-400"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  hasError?: boolean
}

/**
 * Champ mot de passe avec le bouton pour l'afficher. `forwardRef` laisse
 * react-hook-form atteindre le vrai champ, sans quoi il ne lit aucune valeur.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ hasError = false, className = '', ...props }, ref) {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        <input
          ref={ref}
          {...props}
          type={visible ? 'text' : 'password'}
          className={`${fieldClass} ${fieldBorder(hasError)} pr-11 ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible(value => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 dark:text-dash-text5 dark:hover:text-dash-text"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    )
  },
)
