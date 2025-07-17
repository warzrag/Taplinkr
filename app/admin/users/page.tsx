'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Users, 
  Crown, 
  Gift, 
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Calendar,
  ChevronLeft,
  Sparkles
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  email: string
  username: string
  name?: string
  role: string
  plan: string
  planExpiresAt?: string
  createdAt: string
  _count?: {
    links: number
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [grantType, setGrantType] = useState<'free' | 'discount'>('free')
  const [discountPercent, setDiscountPercent] = useState(50)
  const [planDuration, setPlanDuration] = useState(30) // jours

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || (session.user as any).role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchUsers()
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleGrantAccess = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch('/api/admin/grant-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          plan: grantType === 'free' ? 'pro' : 'pro',
          duration: planDuration,
          discount: grantType === 'discount' ? discountPercent : 0
        })
      })

      if (response.ok) {
        toast.success(
          grantType === 'free' 
            ? `Accès Pro gratuit donné à ${selectedUser.username} pour ${planDuration} jours`
            : `Réduction de ${discountPercent}% appliquée pour ${selectedUser.username}`
        )
        fetchUsers()
        setShowGrantModal(false)
        setSelectedUser(null)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'attribution de l\'accès')
    }
  }

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPlanBadge = (plan: string, role: string) => {
    if (role === 'admin') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
          Admin
        </span>
      )
    }
    
    const colors = {
      free: 'bg-gray-100 text-gray-700',
      pro: 'bg-blue-100 text-blue-700',
      business: 'bg-purple-100 text-purple-700'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[plan as keyof typeof colors]}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-red-600" />
                  Administration des Utilisateurs
                </h1>
                <p className="text-gray-600 mt-1">Gérez les accès et les privilèges</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilisateurs Pro</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.plan === 'pro').length}
                </p>
              </div>
              <Crown className="w-8 h-8 text-yellow-600" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Business</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.plan === 'business').length}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.div 
            className="bg-white rounded-xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gratuits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.plan === 'free' && u.role !== 'admin').length}
                </p>
              </div>
              <Gift className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par email, nom ou username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrit le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expire le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name || user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPlanBadge(user.plan, user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{user._count?.links || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.planExpiresAt ? (
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 mr-1 text-orange-500" />
                          <span className="text-orange-600">
                            {new Date(user.planExpiresAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowGrantModal(true)
                          }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none"
                        >
                          <Gift className="w-4 h-4 mr-1" />
                          Offrir
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grant Access Modal */}
        {showGrantModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div 
              className="bg-white rounded-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Offrir un accès à {selectedUser.username}
              </h3>

              <div className="space-y-4">
                {/* Type de cadeau */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'offre
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setGrantType('free')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        grantType === 'free'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Gift className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      <span className="text-sm font-medium">Gratuit</span>
                    </button>
                    <button
                      onClick={() => setGrantType('discount')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        grantType === 'discount'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                      <span className="text-sm font-medium">Réduction</span>
                    </button>
                  </div>
                </div>

                {/* Pourcentage de réduction */}
                {grantType === 'discount' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pourcentage de réduction
                    </label>
                    <select
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={25}>25%</option>
                      <option value={50}>50%</option>
                      <option value={75}>75%</option>
                      <option value={100}>100% (Gratuit)</option>
                    </select>
                  </div>
                )}

                {/* Durée */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée (jours)
                  </label>
                  <select
                    value={planDuration}
                    onChange={(e) => setPlanDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={7}>7 jours</option>
                    <option value={30}>30 jours</option>
                    <option value={90}>3 mois</option>
                    <option value={180}>6 mois</option>
                    <option value={365}>1 an</option>
                    <option value={-1}>À vie</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    setShowGrantModal(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGrantAccess}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}