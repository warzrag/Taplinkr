import { Shimmer } from '@/components/dashboard/motion'

/**
 * La silhouette de l'espace membre pendant le chargement, a la place du rond
 * qui tourne : on voit deja ou vont arriver le menu, les chiffres et la
 * courbe. Les blocs scintillent (dash-shimmer, globals.css).
 */

/** Le contenu d'une page : titre, quatre cartes de chiffres, la courbe, une liste. */
export function ContentSkeleton() {
  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10" role="status" aria-label="Loading">
      <div className="mx-auto max-w-[1500px]">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="mt-3 h-8 w-72 max-w-full" />
        <Shimmer className="mt-3 h-4 w-96 max-w-full" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map(card => (
            <div key={card} className="rounded-[22px] border border-white/[0.06] bg-dash-raised/60 p-4">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="mt-5 h-8 w-20" />
              <Shimmer className="mt-4 h-3 w-32" />
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[22px] border border-white/[0.06] bg-dash-raised/60 p-5">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="mt-5 h-[200px] w-full rounded-2xl" />
        </div>
        <div className="mt-5 space-y-2">
          {[0, 1, 2].map(row => <Shimmer key={row} className="h-[72px] w-full rounded-2xl" />)}
        </div>
      </div>
    </div>
  )
}

/** Toute la fenetre : le menu de gauche (ordinateur) et le contenu. */
export function ShellSkeleton() {
  return (
    <div className="dark min-h-screen bg-dash-bg lg:grid lg:h-screen lg:grid-cols-[236px_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[248px_minmax(0,1fr)] 2xl:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="hidden border-r border-dash-line bg-dash-surface lg:flex lg:flex-col" aria-hidden>
        <div className="flex h-16 items-center border-b border-dash-line px-5">
          <Shimmer className="h-6 w-28" />
        </div>
        <div className="border-b border-dash-line p-3">
          <Shimmer className="h-11 w-full" />
        </div>
        <div className="space-y-1.5 px-3 py-3">
          {Array.from({ length: 10 }, (_, item) => <Shimmer key={item} className="h-8 w-full rounded-lg" />)}
        </div>
      </aside>
      <div className="min-w-0 lg:overflow-hidden">
        <div className="flex h-16 items-center border-b border-dash-line px-4 lg:hidden" aria-hidden>
          <Shimmer className="h-9 w-9" />
          <Shimmer className="mx-auto h-6 w-28" />
          <Shimmer className="h-9 w-9 rounded-full" />
        </div>
        <ContentSkeleton />
      </div>
    </div>
  )
}
