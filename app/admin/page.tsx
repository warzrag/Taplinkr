'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Shield } from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== 'admin') {
    return null
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Panneau d'administration</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Utilisateurs</h3>
            <p className="text-3xl font-bold text-blue-600">-</p>
            <p className="text-gray-600">Total des utilisateurs</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Liens</h3>
            <p className="text-3xl font-bold text-green-600">-</p>
            <p className="text-gray-600">Total des liens créés</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Clics</h3>
            <p className="text-3xl font-bold text-purple-600">-</p>
            <p className="text-gray-600">Total des clics</p>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Informations admin</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Rôle:</strong> {session.user.role}</p>
            <p><strong>Plan:</strong> {session.user.plan}</p>
          </div>
        </div>
      </div>
    </div>
  )
}