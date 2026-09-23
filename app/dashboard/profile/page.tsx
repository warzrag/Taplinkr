'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { BadgeCheck, Crown, Lock } from 'lucide-react'

import DashboardAtmosphere from '@/components/dashboard/DashboardAtmosphere'
import { PLAN_LIMITS, type UserPlan } from '@/lib/permissions'

interface ProfileData {
  name: string
  username: string
  email: string
  image: string
  plan: string
  planExpiresAt?: string
  emailVerified: boolean
  createdAt: string
}

// Memes prix que lib/stripe.ts (PRICING_PLANS). Ce module charge le SDK Stripe
// cote serveur : l'importer ici l'enverrait dans le navigateur.
const PLANS: Record<UserPlan, { label: string; price: string | null }> = {
  free: { label: 'Free', price: null },
  standard: { label: 'Standard', price: '€9.99' },
  premium: { label: 'Premium', price: '€24.99' },
}

// Page refaite dans la palette du tableau de bord, toujours sombre. Elle avait
// la sienne (bleu, degrades, titre en degrade) et plusieurs pieces mortes : un
// bouton appareil photo sans action, « Last changed: Never » ecrit en dur, un
// bouton « Comparer tous les plans » sans action, et un encadre d'usage qui
// repetait celui de la barre laterale.

// `dark:bg-` et `focus-visible:outline-none` echappent aux deux regles globales
// qui repeignent tout champ (voir components/auth/auth-ui.tsx). `dash-field`
// (globals.css) empeche Chrome de peindre en bleu clair un champ pre-rempli.
const fieldClass =
  'dash-field block h-11 w-full rounded-xl border border-dash-line2 bg-dash-bg dark:bg-dash-bg px-3.5 text-sm text-dash-text outline-none focus-visible:outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-dash-text6 hover:border-dash-line3 focus:border-violet-500 focus:ring-[3px] focus:ring-violet-500/20'

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400'

const primaryButton =
  `inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`

const secondaryButton =
  `inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-dash-line2 bg-white/[0.03] px-4 text-sm font-semibold text-dash-text2 transition hover:border-dash-line3 hover:bg-white/[0.06] hover:text-dash-text disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`

const card =
  'overflow-hidden rounded-2xl border border-white/[0.075] bg-dash-raised/90 shadow-[0_24px_70px_rgba(0,0,0,0.22)]'

// Prenom = premier mot, nom = tout le reste. Un nom compose (« Le Gall »)
// reste ainsi entier dans le champ du nom.
function separerNom(nomComplet: string): [string, string] {
  const [prenom = '', ...reste] = nomComplet.trim().split(/\s+/)
  return [prenom, reste.join(' ')]
}

const normaliser = (nom: string) => nom.trim().split(/\s+/).filter(Boolean).join(' ')

function Row({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-3 px-5 py-5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6 sm:px-6">
      <p className="pt-0.5 text-sm font-semibold text-dash-text">{label}</p>
      <div className="min-w-0">
        {children}
        {hint && <p className="mt-2 text-xs text-dash-text5">{hint}</p>}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const fileInput = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    username: '',
    email: '',
    image: '',
    plan: 'free',
    emailVerified: true,
    createdAt: new Date().toISOString()
  })
  // Prenom et nom edites separement, puis recolles a l'enregistrement. Les deux
  // champs relisaient auparavant le nom complet a chaque frappe : modifier le
  // prenom effacait le nom, et on ne pouvait pas taper d'espace.
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const currentPlan = (['free', 'standard', 'premium'].includes(profile.plan)
    ? profile.plan
    : 'free') as UserPlan
  const maxPages = PLAN_LIMITS[currentPlan].maxPages

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session) {
      const loadProfile = async () => {
        try {
          const response = await fetch('/api/profile', { cache: 'no-store' })
          if (!response.ok) throw new Error('Unable to load your profile.')
          const data = await response.json()
          setProfile({
            name: data.name || '',
            username: data.username || session.user.username || '',
            email: data.email || session.user.email || '',
            image: data.image || '',
            plan: data.plan || session.user.plan || 'free',
            planExpiresAt: data.planExpiresAt || session.user.planExpiresAt?.toString(),
            emailVerified: Boolean(data.emailVerified),
            createdAt: data.createdAt || new Date().toISOString()
          })
          const [prenom, nom] = separerNom(data.name || '')
          setFirstName(prenom)
          setLastName(nom)
        } catch {
          setProfile({
            name: session.user.name || '',
            username: session.user.username || '',
            email: session.user.email || '',
            image: session.user.image || '',
            plan: session.user.plan || 'free',
            planExpiresAt: session.user.planExpiresAt?.toString(),
            emailVerified: true,
            createdAt: new Date().toISOString()
          })
          const [prenom, nom] = separerNom(session.user.name || '')
          setFirstName(prenom)
          setLastName(nom)
        } finally {
          setLoading(false)
        }
      }
      loadProfile()
    }
  }, [status, session, router])

  const nomSaisi = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ')
  const nameChanged = normaliser(nomSaisi) !== normaliser(profile.name)

  const handleSave = async () => {
    setSaving(true)
    const nomComplet = nomSaisi
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nomComplet
        })
      })

      if (response.ok) {
        setProfile(prev => ({ ...prev, name: nomComplet }))
        // Le nom en bas de la barre laterale vient de la session : sans cet
        // appel, il garde l'ancien nom jusqu'au prochain rafraichissement.
        await update()
        toast.success('Name updated.')
      } else {
        toast.error('Unable to save your name.')
      }
    } catch (error) {
      toast.error('Unable to save your name.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok || !uploadData.url) {
        throw new Error(uploadData.error || 'Unable to upload the image.')
      }

      const updateResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: uploadData.url })
      })

      if (!updateResponse.ok) {
        throw new Error('Unable to save your profile.')
      }

      setProfile(prev => ({ ...prev, image: uploadData.url }))
      toast.success('Photo updated.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to upload the image.')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleImageDelete = async () => {
    setUploadingImage(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: '' })
      })

      if (!response.ok) {
        throw new Error('Unable to delete the image.')
      }

      setProfile(prev => ({ ...prev, image: '' }))
      toast.success('Photo removed.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete the image.')
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-dash-bg px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-3xl animate-pulse" role="status">
          <span className="sr-only">Loading your profile</span>
          <div className="h-9 w-36 rounded-lg bg-white/[0.05]" />
          <div className="mt-3 h-4 w-64 rounded bg-white/[0.04]" />
          <div className="mt-8 h-[440px] rounded-2xl bg-white/[0.035]" />
          <div className="mt-10 h-28 rounded-2xl bg-white/[0.035]" />
        </div>
      </div>
    )
  }

  const isPaid = currentPlan !== 'free'
  // Memes deux lettres que l'avatar de la barre laterale, pour qu'on s'y retrouve.
  const initials = (profile.name || profile.email).slice(0, 2).toUpperCase()
  const plan = PLANS[currentPlan]
  const planStatus = isPaid
    ? profile.planExpiresAt
      ? `Access through ${new Date(profile.planExpiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
      : 'Billed monthly'
    : maxPages === -1
      ? 'Unlimited pages'
      : `${maxPages} page${maxPages > 1 ? 's' : ''} included`

  return (
    <div className="relative min-h-screen overflow-hidden bg-dash-bg px-5 py-8 text-dash-text sm:px-8 lg:px-10 lg:py-10">
      <DashboardAtmosphere />
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-3xl"
      >
        <header>
          <h1 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">Profile</h1>
          <p className="mt-2 text-base text-dash-text4">Your photo, your name and your plan.</p>
        </header>

        <section className={`mt-8 divide-y divide-dash-line ${card}`} aria-label="Your details">
          <Row label="Photo" hint="JPG, PNG, GIF or WebP, up to 4 MB.">
            <div className="flex flex-wrap items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-violet-500/15 text-lg font-bold text-violet-200 ring-1 ring-white/[0.08]">
                {profile.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.image} alt="Your profile photo" className="h-full w-full object-cover" />
                ) : (
                  <span aria-hidden>{initials}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  tabIndex={-1}
                  aria-hidden
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploadingImage}
                  className={secondaryButton}
                >
                  {uploadingImage ? 'Uploading…' : profile.image ? 'Change photo' : 'Add a photo'}
                </button>
                {profile.image && (
                  <button
                    type="button"
                    onClick={handleImageDelete}
                    disabled={uploadingImage}
                    className={`inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold text-dash-text4 transition hover:bg-white/[0.04] hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </Row>

          <Row label="Name">
            <form
              onSubmit={event => {
                event.preventDefault()
                if (nameChanged && !saving) void handleSave()
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="profile-first-name" className="mb-1.5 block text-xs font-medium text-dash-text4">
                    First name
                  </label>
                  <input
                    id="profile-first-name"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="profile-last-name" className="mb-1.5 block text-xs font-medium text-dash-text4">
                    Last name
                  </label>
                  <input
                    id="profile-last-name"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>
              <button type="submit" disabled={!nameChanged || saving} className={`mt-4 ${primaryButton}`}>
                {saving ? 'Saving…' : 'Save name'}
              </button>
            </form>
          </Row>

          <Row label="Username">
            <p className="flex min-w-0 items-center gap-2 text-sm text-dash-text2">
              <span className="truncate">{profile.username}</span>
              <Lock className="h-3.5 w-3.5 shrink-0 text-dash-text6" aria-hidden />
              <span className="sr-only">(locked)</span>
            </p>
          </Row>

          <Row
            label="Email"
            hint={<>To change it, <a href="mailto:hello@taplinkr.com" className={`rounded-sm font-semibold text-violet-300 underline-offset-4 hover:text-violet-200 hover:underline ${focusRing}`}>contact support</a>.</>}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="truncate text-sm text-dash-text2">{profile.email}</span>
              {profile.emailVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  Verified
                </span>
              )}
            </div>
          </Row>

          <Row label="Password">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-dash-text3">We&apos;ll email you a link to choose a new one.</p>
              <Link
                href={`/auth/forgot-password?email=${encodeURIComponent(profile.email)}`}
                className={secondaryButton}
              >
                Reset password
              </Link>
            </div>
          </Row>
        </section>

        <section className="mt-10" aria-labelledby="profile-plan">
          <h2 id="profile-plan" className="mb-3 text-sm font-semibold text-dash-text3">Plan</h2>
          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6">
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="inline-flex items-center gap-2 text-lg font-bold text-dash-text">
                    {currentPlan === 'premium' && <Crown className="h-4 w-4 text-amber-300" aria-hidden />}
                    {plan.label}
                  </span>
                  {plan.price && <span className="text-sm text-dash-text4">{plan.price} / month</span>}
                </p>
                <p className="mt-1 text-sm text-dash-text4">{planStatus}</p>
              </div>
              {isPaid ? (
                <Link href="/dashboard/billing" className={secondaryButton}>
                  Manage subscription
                </Link>
              ) : (
                <Link href="/pricing" className={primaryButton}>
                  Upgrade
                </Link>
              )}
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  )
}
