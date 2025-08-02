'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  Tag,
  Plus,
  X,
  Calendar,
  Users,
  Percent,
  Clock,
  Trash2,
  Power,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface PromoCode {
  id: string
  code: string
  description?: string
  discountType: string
  discountValue: number
  validFrom: string
  validUntil?: string
  maxUses?: number
  currentUses: number
  requiredPlan?: string
  isActive: boolean
  createdAt: string
  _count?: {
    promoRedemptions: number
  }
}

interface PromoCodesManagerProps {
  promoCodes: PromoCode[]
  onRefresh: () => void
  onClose: () => void
}

export default function PromoCodesManager({
  promoCodes,
  onRefresh,
  onClose
}: PromoCodesManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'fixed_days',
    discountValue: 30,
    validUntil: '',
    maxUses: '',
    requiredPlan: ''
  })
  const [loading, setLoading] = useState(false)

  const handleCreatePromo = async () => {
    if (!formData.code || !formData.discountValue) {
      toast.error('Code et valeur de réduction requis')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: parseInt(formData.discountValue.toString()),
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null
        })
      })

      if (response.ok) {
        toast.success('Code promo créé avec succès')
        setFormData({
          code: '',
          description: '',
          discountType: 'fixed_days',
          discountValue: 30,
          validUntil: '',
          maxUses: '',
          requiredPlan: ''
        })
        setShowCreateForm(false)
        onRefresh()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(currentStatus ? 'Code promo désactivé' : 'Code promo activé')
        onRefresh()
      }
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Code promo supprimé')
        onRefresh()
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Code copié !')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          Gestion des codes promo
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Bouton créer */}
      {!showCreateForm && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateForm(true)}
          className="w-full mb-6 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
        >
          <Plus className="w-5 h-5" />
          Créer un code promo
        </motion.button>
      )}

      {/* Formulaire de création */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-xl"
          >
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code promo
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de réduction
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="fixed_days">Jours gratuits</option>
                    <option value="percentage">Pourcentage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.discountType === 'fixed_days' ? 'Nombre de jours' : 'Pourcentage (%)'}
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                    min={formData.discountType === 'percentage' ? 0 : 1}
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valide jusqu'au
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre max d'utilisations
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Illimité"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan requis
                  </label>
                  <select
                    value={formData.requiredPlan}
                    onChange={(e) => setFormData({ ...formData, requiredPlan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Tous les plans</option>
                    <option value="free">Gratuit seulement</option>
                    <option value="premium">Premium seulement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnelle)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Offre spéciale été 2024"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreatePromo}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer le code'}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des codes promo */}
      <div className="space-y-3">
        {promoCodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun code promo créé
          </div>
        ) : (
          promoCodes.map((promo) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 bg-white rounded-xl border ${
                promo.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono font-bold text-lg text-gray-900">
                        {promo.code}
                      </h4>
                      <button
                        onClick={() => copyCode(promo.code)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    {promo.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Inactif
                      </span>
                    )}
                  </div>

                  {promo.description && (
                    <p className="text-sm text-gray-600 mb-2">{promo.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      {promo.discountType === 'fixed_days' ? (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>{promo.discountValue} jours gratuits</span>
                        </>
                      ) : (
                        <>
                          <Percent className="w-4 h-4" />
                          <span>{promo.discountValue}% de réduction</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {promo._count?.promoRedemptions || promo.currentUses || 0}
                        {promo.maxUses && `/${promo.maxUses}`} utilisations
                      </span>
                    </div>

                    {promo.validUntil && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Expire le {new Date(promo.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {promo.requiredPlan && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>Plan {promo.requiredPlan} requis</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(promo.id, promo.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      promo.isActive 
                        ? 'hover:bg-amber-100 text-amber-600' 
                        : 'hover:bg-green-100 text-green-600'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}