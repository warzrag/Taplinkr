'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Users,
  Search,
  MoreVertical,
  Ban,
  Trash2,
  Mail,
  Calendar,
  Check,
  X,
  Crown,
  Shield,
  AlertCircle,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
  Filter,
  Gift,
  Clock,
  Zap
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  username: string
  role: string
  plan: string
  planExpiresAt: string | null
  emailVerified: boolean
  isActive: boolean
  createdAt: string
  _count: {
    links: number
  }
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [showActions, setShowActions] = useState<string | null>(null)
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const [showRoleModal, setShowRoleModal] = useState<string | null>(null)
  const [showPlanModal, setShowPlanModal] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.role !== 'admin' && session?.user?.role !== 'manager') {
      router.push('/dashboard')
      return
    }
    fetchUsers()
  }, [session, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error('Erreur lors du chargement des utilisateurs')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    setProcessingUser(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(currentStatus ? 'Utilisateur désactivé' : 'Utilisateur activé')
        fetchUsers()
      } else {
        toast.error('Erreur lors de la modification')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setProcessingUser(null)
      setShowActions(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return
    }

    setProcessingUser(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Utilisateur supprimé')
        fetchUsers()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setProcessingUser(null)
      setShowActions(null)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setProcessingUser(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        toast.success('Rôle modifié avec succès')
        fetchUsers()
      } else {
        toast.error('Erreur lors de la modification du rôle')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setProcessingUser(null)
      setShowRoleModal(null)
    }
  }

  const handlePlanChange = async (userId: string, newPlan: string, duration?: number) => {
    setProcessingUser(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan, duration })
      })

      if (response.ok) {
        toast.success('Abonnement modifié avec succès')
        fetchUsers()
      } else {
        toast.error('Erreur lors de la modification de l\'abonnement')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setProcessingUser(null)
      setShowPlanModal(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && user.isActive) ||
      (filter === 'inactive' && !user.isActive) ||
      (filter === 'verified' && user.emailVerified) ||
      (filter === 'unverified' && !user.emailVerified) ||
      (filter === 'premium' && user.plan === 'premium') ||
      (filter === 'admin' && user.role === 'admin')
    
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    verified: users.filter(u => u.emailVerified).length,
    premium: users.filter(u => u.plan === 'premium').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                Gestion des utilisateurs
              </h1>
              <p className="text-gray-600 mt-1">Gérez les comptes et permissions des utilisateurs</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchUsers}
              className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Vérifiés</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
                </div>
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Premium</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.premium}</p>
                </div>
                <Crown className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par email, nom ou username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les utilisateurs</option>
              <option value="active">Actifs seulement</option>
              <option value="inactive">Inactifs seulement</option>
              <option value="verified">Email vérifié</option>
              <option value="unverified">Email non vérifié</option>
              <option value="premium">Premium seulement</option>
              <option value="admin">Admins seulement</option>
            </select>
          </div>
        </motion.div>

        {/* Users table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liens
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrit le
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {user.name?.[0] || user.email[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'Sans nom'}
                            </div>
                            {user.role === 'admin' && (
                              <Shield className="w-4 h-4 text-red-500" />
                            )}
                            {user.role === 'manager' && (
                              <Shield className="w-4 h-4 text-purple-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </span>
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <Check className="w-3 h-3" />
                            Email vérifié
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                            <X className="w-3 h-3" />
                            Non vérifié
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.plan === 'premium'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.plan === 'premium' ? (
                            <>
                              <Crown className="w-3 h-3 mr-1" />
                              Premium
                            </>
                          ) : (
                            'Gratuit'
                          )}
                        </span>
                        {user.plan === 'premium' && user.planExpiresAt && (
                          <span className="text-xs text-gray-500">
                            Expire le {new Date(user.planExpiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user._count.links}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                          disabled={processingUser === user.id}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {processingUser === user.id ? (
                            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                          ) : (
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        <AnimatePresence>
                          {showActions === user.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10"
                            >
                              <button
                                onClick={() => handleToggleActive(user.id, user.isActive)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX className="w-4 h-4 text-amber-600" />
                                    <span className="text-amber-600">Désactiver</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 text-green-600" />
                                    <span className="text-green-600">Activer</span>
                                  </>
                                )}
                              </button>
                              
                              <button
                                onClick={() => {
                                  setShowRoleModal(user.id)
                                  setShowActions(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Shield className="w-4 h-4 text-purple-600" />
                                <span>Changer le rôle</span>
                              </button>
                              
                              {session?.user?.role === 'admin' && (
                                <button
                                  onClick={() => {
                                    setShowPlanModal(user.id)
                                    setShowActions(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Crown className="w-4 h-4 text-yellow-600" />
                                  <span>Gérer l'abonnement</span>
                                </button>
                              )}
                              
                              {user.role !== 'admin' && user.role !== 'manager' && (
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Supprimer
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          )}
        </motion.div>

        {/* Modal de changement de rôle */}
        <AnimatePresence>
          {showRoleModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRoleModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Changer le rôle de l'utilisateur
                </h3>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    Utilisateur : <span className="font-medium text-gray-900">
                      {users.find(u => u.id === showRoleModal)?.email}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Rôle actuel : <span className="font-medium text-gray-900">
                      {users.find(u => u.id === showRoleModal)?.role === 'admin' 
                        ? 'Administrateur' 
                        : users.find(u => u.id === showRoleModal)?.role === 'manager' 
                        ? 'Manager' 
                        : 'Utilisateur'}
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleRoleChange(showRoleModal, 'user')}
                    disabled={users.find(u => u.id === showRoleModal)?.role === 'user'}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      users.find(u => u.id === showRoleModal)?.role === 'user'
                        ? 'border-blue-500 bg-blue-50 cursor-not-allowed opacity-50'
                        : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Utilisateur</p>
                        <p className="text-sm text-gray-500">Accès standard à l'application</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange(showRoleModal, 'manager')}
                    disabled={users.find(u => u.id === showRoleModal)?.role === 'manager' || session?.user?.role !== 'admin'}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      users.find(u => u.id === showRoleModal)?.role === 'manager'
                        ? 'border-purple-500 bg-purple-50 cursor-not-allowed opacity-50'
                        : session?.user?.role !== 'admin'
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                        : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Manager</p>
                        <p className="text-sm text-gray-500">Peut gérer les utilisateurs (sauf admin/manager)</p>
                        {session?.user?.role !== 'admin' && (
                          <p className="text-xs text-red-500 mt-1">Seul l'admin peut attribuer ce rôle</p>
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleChange(showRoleModal, 'admin')}
                    disabled={true}
                    className="w-full p-4 rounded-xl border-2 text-left transition-all border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">Administrateur</p>
                        <p className="text-sm text-gray-500">Accès complet - Un seul admin autorisé</p>
                        <p className="text-xs text-red-500 mt-1">Il ne peut y avoir qu'un seul administrateur</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowRoleModal(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de gestion des abonnements */}
        <AnimatePresence>
          {showPlanModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowPlanModal(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Gérer l'abonnement
                </h3>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    Utilisateur : <span className="font-medium text-gray-900">
                      {users.find(u => u.id === showPlanModal)?.email}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Plan actuel : <span className="font-medium text-gray-900">
                      {users.find(u => u.id === showPlanModal)?.plan === 'premium' ? 'Premium' : 'Gratuit'}
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handlePlanChange(showPlanModal, 'free')}
                    disabled={users.find(u => u.id === showPlanModal)?.plan === 'free'}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      users.find(u => u.id === showPlanModal)?.plan === 'free'
                        ? 'border-gray-500 bg-gray-50 cursor-not-allowed opacity-50'
                        : 'border-gray-200 hover:border-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Plan Gratuit</p>
                        <p className="text-sm text-gray-500">Accès aux fonctionnalités de base</p>
                      </div>
                    </div>
                  </button>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Offrir Premium :</p>
                    
                    <button
                      onClick={() => handlePlanChange(showPlanModal, 'premium', 30)}
                      className="w-full p-4 rounded-xl border-2 text-left transition-all border-gray-200 hover:border-yellow-500 hover:bg-yellow-50"
                    >
                      <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900">Offrir 1 mois Premium</p>
                          <p className="text-sm text-gray-500">30 jours d'accès Premium gratuit</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handlePlanChange(showPlanModal, 'premium', 90)}
                      className="w-full p-4 rounded-xl border-2 text-left transition-all border-gray-200 hover:border-yellow-500 hover:bg-yellow-50"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900">Offrir 3 mois Premium</p>
                          <p className="text-sm text-gray-500">90 jours d'accès Premium gratuit</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handlePlanChange(showPlanModal, 'premium', 365)}
                      className="w-full p-4 rounded-xl border-2 text-left transition-all border-gray-200 hover:border-yellow-500 hover:bg-yellow-50"
                    >
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-gray-900">Offrir 1 an Premium</p>
                          <p className="text-sm text-gray-500">365 jours d'accès Premium gratuit</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handlePlanChange(showPlanModal, 'premium')}
                      className="w-full p-4 rounded-xl border-2 text-left transition-all border-gray-200 hover:border-purple-500 hover:bg-purple-50"
                    >
                      <div className="flex items-center gap-3">
                        <Crown className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">Premium à vie</p>
                          <p className="text-sm text-gray-500">Accès illimité pour toujours</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowPlanModal(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}