'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, LayoutTemplate, Link2, LockKeyhole, Share2 } from 'lucide-react'

type UsageItem = { used: number; limit: number }

interface SidebarUsage {
  plan: 'free' | 'standard' | 'premium'
  landingPages: UsageItem
  directLinks: UsageItem
  socialAccounts: { used: number; locked: boolean }
  canManagePlan: boolean
}

function UsageRow({ icon: Icon, label, item }: { icon: typeof Link2; label: string; item: UsageItem }) {
  const unlimited = item.limit === -1
  const progress = unlimited || item.limit === 0 ? 0 : Math.min(100, (item.used / item.limit) * 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-[11px]">
        <Icon className="h-3.5 w-3.5 shrink-0 text-violet-400" />
        <span className="min-w-0 flex-1 truncate font-medium text-[#c9c9d6]">{label}</span>
        <span className="font-semibold tabular-nums text-violet-300">
          {item.used} / {unlimited ? '∞' : item.limit}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-[width] duration-500 ${unlimited && item.used > 0 ? 'w-1/4' : ''}`}
          style={unlimited ? undefined : { width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default function SidebarUsageCard() {
  const router = useRouter()
  const [usage, setUsage] = useState<SidebarUsage | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/sidebar-usage', { cache: 'no-store', signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => setUsage(data))
      .catch(error => {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Unable to load plan usage:', error)
        }
      })

    return () => controller.abort()
  }, [])

  if (!usage) return null

  const planName = usage.plan.charAt(0).toUpperCase() + usage.plan.slice(1)

  return (
    <section className="mx-1 mt-5 rounded-xl border border-violet-500/15 bg-gradient-to-b from-violet-500/[0.08] to-transparent p-3" aria-label="Plan usage">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#77778a]">Plan usage</span>
        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300">{planName}</span>
      </div>

      <div className="space-y-3">
        <UsageRow icon={LayoutTemplate} label="Landing pages" item={usage.landingPages} />
        <UsageRow icon={Link2} label="Direct links" item={usage.directLinks} />

        <div className="flex items-center gap-2 border-t border-white/[0.06] pt-2.5 text-[11px]">
          <Share2 className={`h-3.5 w-3.5 ${usage.socialAccounts.locked ? 'text-[#555566]' : 'text-violet-400'}`} />
          <span className={`min-w-0 flex-1 truncate font-medium ${usage.socialAccounts.locked ? 'text-[#686879]' : 'text-[#c9c9d6]'}`}>Social accounts</span>
          <span className={`inline-flex items-center gap-1 font-medium ${usage.socialAccounts.locked ? 'text-[#5f5f70]' : 'text-violet-300'}`}>
            {usage.socialAccounts.locked ? <><LockKeyhole className="h-3 w-3" /> Locked</> : `${usage.socialAccounts.used} connected`}
          </span>
        </div>
      </div>

      {usage.plan === 'free' && (
        usage.canManagePlan ? (
          <button
            type="button"
            onClick={() => router.push('/dashboard/pricing')}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 py-2 text-[11px] font-semibold text-violet-200 transition hover:bg-violet-500/15"
          >
            Upgrade plan <ExternalLink className="h-3 w-3" />
          </button>
        ) : (
          <p className="mt-3 border-t border-white/[0.06] pt-2.5 text-center text-[10px] leading-4 text-[#77778a]">
            Ask your team owner to upgrade
          </p>
        )
      )}
    </section>
  )
}
