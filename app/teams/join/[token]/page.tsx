'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Mail, Lock, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface InvitationData {
  id: string
  email: string
  role: string
  team: {
    name: string
    description?: string
  }
  invitedBy: {
    name?: string
    email: string
  }
  userExists?: boolean
  isAlreadyMember?: boolean
}

export default function JoinTeamPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  
  // Form states
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    checkInvitation()
  }, [])

  const checkInvitation = async () => {
    try {
      const response = await fetch(`/api/teams/join/${params.token}/check`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invitation invalide')
        return
      }

      setInvitation(data.invitation)
      
      // Si l'utilisateur existe déjà
      if (data.invitation.userExists) {
        if (data.invitation.isAlreadyMember) {
          setError('Vous êtes déjà membre de cette équipe')
          return
        }
        // Rediriger vers la page de connexion avec le token d'invitation
        router.push(`/auth/signin?email=${encodeURIComponent(data.invitation.email)}&message=login_to_join&team=${encodeURIComponent(data.invitation.team.name)}&invite=${params.token}`)
        return
      }
      
      setName(data.invitation.email.split('@')[0]) // Suggérer un nom basé sur l'email
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de la vérification de l\'invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setJoining(true)

    try {
      const response = await fetch(`/api/teams/join/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du compte')
      }

      toast.success('Compte créé et équipe rejointe avec succès!')
      
      // Rediriger vers la page de connexion avec les informations pré-remplies
      router.push(`/auth/signin?email=${encodeURIComponent(invitation!.email)}&message=account_created`)
    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.message || 'Erreur lors de la création du compte')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'invitation...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invitation invalide</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Aller à la connexion
          </button>
        </motion.div>
      </div>
    )
  }

  if (!invitation) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rejoindre l'équipe {invitation.team.name}
          </h1>
          <p className="text-gray-600">
            {invitation.invitedBy.name || invitation.invitedBy.email} vous a invité en tant que {getRoleLabel(invitation.role)}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleJoin} className="space-y-6">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={invitation.email}
                disabled
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-600"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre nom *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jean Dupont"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Créer un mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                required
                minLength={8}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Le mot de passe doit contenir au moins 8 caractères
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={joining}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {joining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création du compte...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Créer mon compte et rejoindre l'équipe
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 p-4 bg-purple-50 rounded-xl">
          <p className="text-sm text-purple-700 text-center">
            En créant votre compte, vous acceptez nos conditions d'utilisation et rejoignez automatiquement l'équipe {invitation.team.name}
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    owner: 'Propriétaire',
    admin: 'Administrateur',
    member: 'Membre',
    viewer: 'Observateur'
  }
  return labels[role] || role
}