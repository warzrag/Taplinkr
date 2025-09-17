'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
  Building
} from 'lucide-react'
import { useTeamPermissions } from '@/hooks/useTeamPermissions'
import { toast } from 'react-hot-toast'
import { PLAN_LIMITS } from '@/lib/permissions'
import { usePermissions } from '@/hooks/usePermissions'

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
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'settings'>('members')
  
  // États pour le formulaire d'invitation
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteLoading, setInviteLoading] = useState(false)
  
  // États pour la création d'équipe
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  
  const { hasPermission, permissions, isAdmin } = useTeamPermissions()
  const isOwner = isAdmin() || team?.owner?.id === permissions.userId
  
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Créer votre équipe
              </h2>
              <form onSubmit={createTeam} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de l'équipe *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Mon équipe"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Description de votre équipe..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
  
  const owner = team.members?.find(member => member.teamRole === 'owner')
  const totalMembers = team.members?.length || 0
  const pendingInvitations = team.invitations?.length || 0
  
  // Obtenir la limite selon le plan (10 pour tous sauf gratuit)
  const userPermissions = usePermissions()
  const teamMembersLimit = userPermissions.permissions.plan === 'free' ? 0 : 10
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Building className="w-8 h-8 text-purple-500" />
                {team.name}
                {isAdmin() && (
                  <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium rounded-full">
                    ADMIN
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {team.description || 'Gérez votre équipe et collaborez ensemble'}
              </p>
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {totalMembers}/{teamMembersLimit} membres
                  </span>
                </div>
                {pendingInvitations > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {pendingInvitations} invitation{pendingInvitations > 1 ? 's' : ''} en attente
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {isOwner && totalMembers < teamMembersLimit && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg transform hover:scale-105"
              >
                <UserPlus className="w-5 h-5" />
                Inviter
              </button>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('members')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'members'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Membres ({totalMembers})
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => setActiveTab('invitations')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'invitations'
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Invitations ({pendingInvitations})
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4"
          >
            {/* Owner */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {owner?.name?.[0] || owner?.email?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {owner?.name || owner?.email || 'Propriétaire'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {owner?.email || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getRoleColor('owner')}`}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon('owner')}
                      {getRoleLabel('owner')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Members */}
            {team.members?.filter(member => member.teamRole !== 'owner').map((member) => (
              <div key={member.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {member.name?.[0] || member.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {member.name || member.email}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getRoleColor(member.teamRole)}`}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(member.teamRole)}
                        {getRoleLabel(member.teamRole)}
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        
        {activeTab === 'invitations' && isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {team.invitations && team.invitations.length > 0 ? (
              team.invitations.map((invitation) => (
                <div key={invitation.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {invitation.email}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Invité le {new Date(invitation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getRoleColor(invitation.role)}`}>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(invitation.role)}
                          {getRoleLabel(invitation.role)}
                        </div>
                      </div>
                      <button
                        onClick={() => cancelInvitation(invitation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Paramètres de l'équipe
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de l'équipe
                </label>
                <input
                  type="text"
                  value={team.name}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={team.description || ''}
                  disabled
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Limite de membres
                </label>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {totalMembers} / {team.maxMembers} membres
                    </span>
                  </div>
                  <button
                    onClick={() => window.location.href = '/dashboard/pricing'}
                    className="px-4 py-3 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors font-medium"
                  >
                    Augmenter la limite
                  </button>
                </div>
              </div>
              
              {/* Zone danger - Suppression de l'équipe */}
              {isOwner && (
                <div className="mt-8 pt-8 border-t border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
                    Zone Danger
                  </h3>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      La suppression de l'équipe est irréversible. Tous les membres seront retirés et toutes les données seront perdues.
                    </p>
                    <button
                      onClick={deleteTeam}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Inviter un membre
            </h2>
            <form onSubmit={inviteMember} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="membre@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rôle
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="admin">Administrateur</option>
                  <option value="member">Membre</option>
                  <option value="viewer">Observateur</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {inviteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer l'invitation
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