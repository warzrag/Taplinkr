'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Settings,
  Check,
  X,
  Copy,
  MoreVertical,
  Crown,
  Eye,
  UserCheck,
  Clock,
  Trash2,
  Send,
  Building,
  Link2,
  Trophy,
  Edit3
} from 'lucide-react'
import { useTeamPermissions } from '@/hooks/useTeamPermissions'
import { toast } from 'react-hot-toast'
import { PLAN_LIMITS } from '@/lib/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import TeamLinkManager from '@/components/TeamLinkManager'
import { useSession } from 'next-auth/react'

interface TeamMember {
  id: string
  name?: string
  email: string
  image?: string
  teamRole: string
}

interface TeamInvitation {
  id: string
  email: string
  role: string
  createdAt: string
  expiresAt?: string
}

interface Team {
  id: string
  name: string
  description?: string
  slug: string
  owner?: TeamMember
  members: TeamMember[]
  invitations?: TeamInvitation[]
  maxMembers: number
}

export default function TeamPage() {
  const { data: session } = useSession()
  const userPermissions = usePermissions()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'members' | 'links' | 'leaderboard' | 'invitations' | 'settings'>('members')
  
  // États pour le formulaire d'invitation
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteLoading, setInviteLoading] = useState(false)
  
  // États pour la création d'équipe
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  
  const { hasPermission, permissions, isAdmin } = useTeamPermissions()
  
  useEffect(() => {
    fetchTeam()
  }, [])
  
  const fetchTeam = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teams')
      const data = await response.json()
      
      if (response.ok && data.team) {
        setTeam(data.team)
      } else {
        setTeam(null)
      }
    } catch (error) {
      console.error('Erreur chargement équipe:', error)
      toast.error('Erreur lors du chargement de l\'équipe')
    } finally {
      setLoading(false)
    }
  }
  
  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          description: teamDescription
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création')
      }
      
      setTeam(data.team)
      setShowCreateModal(false)
      setTeamName('')
      setTeamDescription('')
      toast.success('Équipe créée avec succès !')
      fetchTeam() // Recharger pour avoir toutes les infos
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création')
    } finally {
      setCreateLoading(false)
    }
  }
  
  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)
    
    console.log('Tentative d\'invitation:', {
      teamId: team?.id,
      email: inviteEmail,
      role: inviteRole,
      team: team
    })
    
    try {
      const response = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team!.id,
          email: inviteEmail,
          role: inviteRole
        })
      })
      
      const data = await response.json()
      console.log('Réponse de l\'API:', { ok: response.ok, status: response.status, data })
      
      if (!response.ok) {
        console.error('Erreur invitation:', data)
        throw new Error(data.error || 'Erreur lors de l\'invitation')
      }
      
      toast.success('Invitation envoyée avec succès !')
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteRole('member')
      fetchTeam()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'invitation')
    } finally {
      setInviteLoading(false)
    }
  }
  
  const removeMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre ?')) return

    try {
      const response = await fetch(`/api/teams/members/${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      toast.success('Membre retiré de l\'équipe')
      fetchTeam()
    } catch (error) {
      toast.error('Erreur lors de la suppression du membre')
    }
  }

  const updateNickname = async (memberId: string, currentNickname: string | null, memberName: string) => {
    const newNickname = prompt(
      'Surnom du membre (laissez vide pour utiliser le nom réel):',
      currentNickname || ''
    )

    if (newNickname === null) return // Annulé

    try {
      const response = await fetch('/api/team/update-nickname', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          nickname: newNickname.trim() || null
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      toast.success('Surnom mis à jour !')
      fetchTeam()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du surnom')
    }
  }
  
  const cancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/teams/invitations/${invitationId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation')
      }
      
      toast.success('Invitation annulée')
      fetchTeam()
    } catch (error) {
      toast.error('Erreur lors de l\'annulation de l\'invitation')
    }
  }
  
  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    toast.success('Lien d\'invitation copié !')
  }
  
  const deleteTeam = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer l\'équipe ? Cette action est irréversible et tous les membres seront retirés.')) {
      return
    }
    
    if (!confirm('Vraiment sûr ? Tapez "SUPPRIMER" pour confirmer.')) {
      return
    }
    
    try {
      const response = await fetch('/api/teams/delete', {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }
      
      toast.success('Équipe supprimée avec succès')
      // Recharger la page pour afficher l'écran de création
      window.location.reload()
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'équipe')
    }
  }
  
  const getRoleIcon = (role: string) => {
    const icons = {
      owner: <Crown className="w-4 h-4" />,
      admin: <Shield className="w-4 h-4" />,
      member: <UserCheck className="w-4 h-4" />,
      viewer: <Eye className="w-4 h-4" />
    }
    return icons[role as keyof typeof icons] || null
  }
  
  const getRoleLabel = (role: string) => {
    const labels = {
      owner: 'Propriétaire',
      admin: 'Administrateur',
      member: 'Membre',
      viewer: 'Observateur'
    }
    return labels[role as keyof typeof labels] || role
  }
  
  const getRoleColor = (role: string) => {
    const colors = {
      owner: 'bg-gradient-to-r from-yellow-400 to-amber-500',
      admin: 'bg-gradient-to-r from-purple-400 to-pink-500',
      member: 'bg-gradient-to-r from-blue-400 to-cyan-500',
      viewer: 'bg-gradient-to-r from-gray-400 to-gray-500'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-400'
  }
  
  // Vérifier les permissions (sauf pour les admins)
  if (!isAdmin() && !hasPermission('hasTeamMembers')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Fonctionnalité Premium
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Créez et gérez votre équipe avec le plan Premium. Collaborez efficacement sur TapLinkr !
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/pricing'}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Passer au Premium
          </button>
        </motion.div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }
  
  // Si pas d'équipe, afficher l'écran de création
  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12">
            <Building className="w-24 h-24 text-purple-500 mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Créez votre équipe
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
              Commencez à collaborer avec votre équipe sur TapLinkr
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold text-lg hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-3"
            >
              <UserPlus className="w-6 h-6" />
              Créer une équipe
            </button>
          </div>
        </motion.div>
        
        {/* Modal de création d'équipe */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 max-w-md w-full"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
                Créer votre équipe
              </h2>
              <form onSubmit={createTeam} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l'équipe *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Mon équipe"
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Description de votre équipe..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createLoading ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    )
  }
  
  const totalMembers = team.members?.length || 0
  const pendingInvitations = team.invitations?.length || 0
  
  // Déterminer qui est le propriétaire
  const owner = team.members?.find(member => member.teamRole === 'owner')
  const isOwner = owner?.id === permissions.userId || team.ownerId === permissions.userId
  const userEmail = session?.user?.email || ''
  const userTeamRole = team.members.find(m => m.email === userEmail)?.teamRole || 'viewer'
  const isTeamOwner = isOwner // Pour être plus clair
  
  // Obtenir la limite selon le plan (10 pour tous sauf gratuit)
  const teamMembersLimit = userPermissions.permissions.plan === 'free' ? 0 : 10
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:gap-3 flex-wrap">
                <Building className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
                <span className="truncate">{team.name}</span>
                {isAdmin() && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs sm:text-sm font-medium rounded-full whitespace-nowrap">
                    ADMIN
                  </span>
                )}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 line-clamp-2">
                {team.description || 'Gérez votre équipe et collaborez ensemble'}
              </p>
              <div className="flex items-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm flex-wrap">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {totalMembers}/{teamMembersLimit} membres
                  </span>
                </div>
                {pendingInvitations > 0 && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {pendingInvitations} invitation{pendingInvitations > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {isOwner && totalMembers < teamMembersLimit && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Inviter</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max sm:min-w-0">
              <button
                onClick={() => setActiveTab('members')}
                className={`py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'members'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Membres ({totalMembers})
              </button>
              <button
                onClick={() => setActiveTab('links')}
                className={`py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'links'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Liens
                </span>
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === 'leaderboard'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Leaderboard
                </span>
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => setActiveTab('invitations')}
                    className={`py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeTab === 'invitations'
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Invitations ({pendingInvitations})
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-2 sm:py-3 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      activeTab === 'settings'
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Paramètres
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-3 sm:gap-4"
          >
            {/* Owner */}
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-base sm:text-lg">
                      {owner?.name?.[0] || owner?.email?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                      {owner?.name || owner?.email || 'Propriétaire'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {owner?.email || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className={`px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-medium ${getRoleColor('owner')}`}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon('owner')}
                      <span className="hidden sm:inline">{getRoleLabel('owner')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            {team.members?.filter(member => member.teamRole !== 'owner').map((member) => (
              <div key={member.id} className="group relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-base sm:text-lg">
                        {member.name?.[0] || member.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                          {(member as any).nickname || member.name || member.email}
                        </h3>
                        {(isOwner || isAdmin()) && (
                          <button
                            onClick={() => updateNickname(member.id, (member as any).nickname, member.name || member.email)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                            title="Modifier le surnom"
                          >
                            <Edit3 size={14} className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400" />
                          </button>
                        )}
                      </div>
                      {(member as any).nickname && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                          ({member.name || member.email})
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-medium ${getRoleColor(member.teamRole)}`}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.teamRole)}
                        <span className="hidden sm:inline">{getRoleLabel(member.teamRole)}</span>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        
        {activeTab === 'links' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TeamLinkManager
              userRole={userTeamRole}
              userId={session?.user?.id}
              teamId={team.id}
            />
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Le leaderboard complet est disponible sur une page dédiée
            </p>
            <Link href="/dashboard/team-leaderboard">
              <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-xl font-semibold hover:from-yellow-500 hover:to-amber-600 transition-all shadow-lg inline-flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Voir le Leaderboard
              </button>
            </Link>
          </motion.div>
        )}

        {activeTab === 'invitations' && isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3 sm:space-y-4"
          >
            {team.invitations && team.invitations.length > 0 ? (
              team.invitations.map((invitation) => (
                <div key={invitation.id} className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                        {invitation.email}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                        Invité le {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <div className={`px-2 sm:px-3 py-1 rounded-full text-white text-xs sm:text-sm font-medium ${getRoleColor(invitation.role)}`}>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(invitation.role)}
                          <span className="hidden sm:inline">{getRoleLabel(invitation.role)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => cancelInvitation(invitation.id)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
                <Mail className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  Aucune invitation en attente
                </p>
              </div>
            )}
          </motion.div>
        )}
        
        {activeTab === 'settings' && isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
              Paramètres de l'équipe
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de l'équipe
                </label>
                <input
                  type="text"
                  value={team.name}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={team.description || ''}
                  disabled
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Limite de membres
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    <span className="text-sm sm:text-base text-gray-900 dark:text-gray-100 font-medium">
                      {totalMembers} / {team.maxMembers} membres
                    </span>
                  </div>
                  <button
                    onClick={() => window.location.href = '/dashboard/pricing'}
                    className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg sm:rounded-xl transition-colors font-medium whitespace-nowrap"
                  >
                    Augmenter la limite
                  </button>
                </div>
              </div>

              {/* Zone danger - Suppression de l'équipe */}
              {isOwner && (
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-red-200 dark:border-red-800">
                  <h3 className="text-base sm:text-lg font-semibold text-red-600 dark:text-red-400 mb-3 sm:mb-4">
                    Zone Danger
                  </h3>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 mb-3 sm:mb-4">
                      La suppression de l'équipe est irréversible. Tous les membres seront retirés et toutes les données seront perdues.
                    </p>
                    <button
                      onClick={deleteTeam}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      Supprimer l'équipe
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Modal d'invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 max-w-md w-full"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
              Inviter un membre
            </h2>
            <form onSubmit={inviteMember} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="membre@example.com"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rôle
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="admin">Administrateur</option>
                  <option value="member">Membre</option>
                  <option value="viewer">Observateur</option>
                </select>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {inviteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Envoi...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Envoyer l'invitation</span>
                      <span className="sm:hidden">Envoyer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}