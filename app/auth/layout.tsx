import { Suspense } from 'react'

import { AuthSpinner } from '@/components/auth/auth-ui'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // L'attente reprend le fond des pages de compte. Elle etait toujours noire,
    // meme en mode clair : un eclair sombre avant chaque page claire.
    <Suspense fallback={<AuthSpinner />}>
      {children}
    </Suspense>
  )
}
