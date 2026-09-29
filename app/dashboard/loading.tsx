import { ContentSkeleton } from '@/components/dashboard/DashboardSkeleton'

// Pendant le chargement d'une page de l'espace membre, le menu reste en place
// (app/dashboard/layout.tsx) : seule la zone de contenu montre sa silhouette.
// L'ancienne version etait gris clair, en plein milieu de l'espace sombre.
export default function DashboardLoading() {
  return <ContentSkeleton />
}
