'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ArrowUpRight, Clock3, Link2, MapPin } from 'lucide-react'
import { getKnownPlatformForUrl } from '@/lib/platform-icons'

interface LandingPageVisualProps {
  title: string
  bio?: string | null
  profileImage?: string | null
  coverImage?: string | null
  backgroundColor?: string | null
  textColor?: string | null
  accentColor?: string | null
  children: ReactNode
  compact?: boolean
  showBranding?: boolean
  onlineBadge?: boolean
  locationLabel?: string | null
  countdown?: { enabled?: boolean; label?: string; endAt?: string } | null
}

interface LandingActionCardProps {
  title: string
  description?: string | null
  icon?: string | null
  destinationUrl?: string | null
  accentColor?: string | null
  borderRadius?: string | null
  trailing?: ReactNode
  onClick?: () => void
  disabled?: boolean
}

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'TL'
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join('')
}

function readableText(background: string) {
  const value = background.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(value)) return '#ffffff'
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
  return luminance > 0.64 ? '#111827' : '#ffffff'
}

function LandingCountdown({ label, endAt }: { label?: string; endAt?: string }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, new Date(endAt || '').getTime() - Date.now()))
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [endAt])

  if (!endAt || remaining <= 0) return null
  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <div className="mb-4 rounded-2xl border border-white/15 bg-black/15 px-4 py-3 text-center backdrop-blur">
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] opacity-65"><Clock3 className="h-3.5 w-3.5" />{label || 'Offer ends in'}</p>
      <p className="mt-1 text-xl font-black tabular-nums">{days > 0 ? `${days}d ` : ''}{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</p>
    </div>
  )
}

export function LandingActionCard({
  title,
  description,
  icon,
  destinationUrl,
  accentColor = '#8b5cf6',
  borderRadius = 'rounded-2xl',
  trailing,
  onClick,
  disabled,
}: LandingActionCardProps) {
  const resolvedAccent = accentColor || '#8b5cf6'
  const foreground = readableText(resolvedAccent)
  const platformIcon = getKnownPlatformForUrl(destinationUrl)?.icon || null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex min-h-[76px] w-full items-center gap-3 overflow-hidden border border-white/20 px-4 py-3.5 text-left shadow-[0_18px_50px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.18)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:cursor-default disabled:opacity-90 ${borderRadius || 'rounded-2xl'}`}
      style={{ backgroundColor: resolvedAccent, color: foreground }}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10" />
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/15 shadow-inner backdrop-blur-sm">
        {icon || platformIcon ? (
          (icon || platformIcon)!.startsWith('http') || (icon || platformIcon)!.startsWith('/') || (icon || platformIcon)!.startsWith('data:')
            ? <img src={(icon || platformIcon)!} alt="" className="h-8 w-8 object-contain" />
            : <span className="text-lg">{icon}</span>
        ) : (
          <Link2 className="h-5 w-5 opacity-80" />
        )}
      </span>
      <span className="relative min-w-0 flex-1">
        <span className="block break-words text-[15px] font-extrabold leading-5 tracking-[-0.01em]">{title}</span>
        {description && (
          <span className="mt-0.5 block break-words text-xs leading-4 opacity-70">
            {description}
          </span>
        )}
      </span>
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/10">
        {trailing || <ArrowUpRight className="h-5 w-5 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
      </span>
    </button>
  )
}

export default function LandingPageVisual({
  title,
  bio,
  profileImage,
  coverImage,
  backgroundColor = '#070a12',
  textColor = '#f8fafc',
  accentColor = '#8b5cf6',
  children,
  compact = false,
  showBranding = true,
  onlineBadge = false,
  locationLabel,
  countdown,
}: LandingPageVisualProps) {
  const resolvedBackground = backgroundColor || '#070a12'
  const resolvedText = textColor || '#f8fafc'
  const resolvedAccent = accentColor || '#8b5cf6'

  return (
    <div
      className={`relative isolate w-full overflow-hidden ${compact ? 'min-h-[640px]' : 'min-h-screen'}`}
      style={{ backgroundColor: resolvedBackground, color: resolvedText }}
    >
      {coverImage && (
        <div className="absolute inset-0 -z-20">
          <img src={coverImage} alt="" className="h-full w-full object-cover" loading={compact ? 'lazy' : 'eager'} />
          <div className="absolute inset-0 bg-black/55" />
        </div>
      )}

      <div
        className="absolute -left-28 -top-32 -z-10 h-80 w-80 rounded-full blur-[100px]"
        style={{ backgroundColor: `${resolvedAccent}66` }}
      />
      <div
        className="absolute -bottom-36 -right-28 -z-10 h-96 w-96 rounded-full blur-[120px]"
        style={{ backgroundColor: `${resolvedAccent}38` }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_35%,rgba(0,0,0,0.18))]" />

      <div className={`mx-auto flex w-full max-w-[470px] flex-col px-5 ${compact ? 'min-h-[640px] py-10' : 'min-h-screen py-14 sm:px-6 sm:py-20'}`}>
        <header className="text-center">
          {profileImage ? (
            <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white/15 bg-white/10 shadow-2xl">
              <img src={profileImage} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <div
              className="mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-white/15 text-2xl font-black shadow-2xl"
              style={{ backgroundColor: resolvedAccent, color: readableText(resolvedAccent) }}
            >
              {initials(title)}
            </div>
          )}

          <h1 className="mt-5 break-words text-3xl font-black tracking-[-0.035em]" style={{ color: resolvedText }}>
            {title}
          </h1>
          {bio && (
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 opacity-70">
              {bio}
            </p>
          )}
          {(onlineBadge || locationLabel) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {onlineBadge && (
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-sm backdrop-blur-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.65)]" />
                  Online
                </span>
              )}
              {locationLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-600 shadow-sm backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  {locationLabel}
                </span>
              )}
            </div>
          )}
        </header>

        <div className="mt-8 flex-1 space-y-3">
          {countdown?.enabled && <LandingCountdown label={countdown.label} endAt={countdown.endAt} />}
          {children}
        </div>

        {showBranding && (
          <a
            href="https://www.taplinkr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mt-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/10 px-4 py-2 text-xs font-semibold opacity-55 backdrop-blur transition hover:opacity-90"
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: resolvedAccent }} />
            Made with TapLinkr
          </a>
        )}
      </div>
    </div>
  )
}
