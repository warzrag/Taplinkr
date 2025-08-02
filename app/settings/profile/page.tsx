'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { 
  User,
  Mail,
  Shield,
  Camera,
  Check,
  Crown,
  Sparkles,
  Lock,
  Calendar,
  AlertCircle,
  ChevronRight,
  Upload,
  Trash2,
  BadgeCheck,
  Zap,
  BarChart3,
  Link,
  Globe,
  Palette,
  ShieldCheck
} from 'lucide-react'
import Image from 'next/image'

interface ProfileData {
  name: string
  username: string
  email: string
  image: string
  plan: string
  planExpiresAt?: string
  emailVerified: boolean
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    username: '',
    email: '',
    image: '',
    plan: 'free',
    emailVerified: true,
    createdAt: new Date().toISOString()
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Limites selon le plan
  const limits = {
    deepLinks: session?.user?.plan === 'premium' ? 50 : 1,
    landingPages: session?.user?.plan === 'premium' ? 10 : 1
  }

  // Usage actuel (à récupérer depuis l'API)
  const usage = {
    deepLinks: 1,
    landingPages: 1
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session) {
      setProfile({
        name: session.user.name || '',
        username: session.user.username || '',
        email: session.user.email || '',
        image: session.user.image || '',
        plan: session.user.plan || 'free',
        planExpiresAt: session.user.planExpiresAt?.toString(),
        emailVerified: true,
        createdAt: new Date().toISOString()
      })
      setLoading(false)
    }
  }, [status, session, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name
        })
      })

      if (response.ok) {
        toast.success('Profil mis à jour avec succès!')
      } else {
        toast.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // TODO: Implémenter l'upload d'image
      toast.success('Upload d\'image à implémenter')
    }
  }

  if (loading || status === 'loading') {
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

  const isPremium = profile.plan === 'premium'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                Mon Profil
              </h1>
              <p className="text-gray-600 mt-1">Gérez vos informations personnelles et votre abonnement</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo de profil */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold mb-2">Photo de profil</h2>
              <p className="text-sm text-gray-600 mb-6">
                Cette photo sera affichée sur votre profil et à travers la plateforme.
              </p>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    {profile.image ? (
                      <img 
                        src={profile.image} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-blue-600" />
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-gray-200"
                  >
                    <Camera className="w-4 h-4 text-gray-600" />
                  </motion.button>
                </div>
                
                <div className="flex gap-3">
                  <label>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl flex items-center gap-2 font-medium"
                      onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Télécharger
                    </motion.button>
                  </label>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Supprimer
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Informations personnelles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-lg font-semibold mb-6">Informations personnelles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={profile.name.split(' ')[0] || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={profile.name.split(' ')[1] || ''}
                    onChange={(e) => setProfile({ ...profile, name: profile.name.split(' ')[0] + ' ' + e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                    />
                    {profile.emailVerified && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <div className="flex items-center gap-1 text-green-600">
                          <BadgeCheck className="w-4 h-4" />
                          <span className="text-xs font-medium">Vérifié</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Contactez le support pour modifier votre adresse email
                  </p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-600/25 disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
              </motion.button>
            </motion.div>

            {/* Sécurité */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold">Sécurité</h2>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-900">Mot de passe</h3>
                  <p className="text-sm text-gray-600 mt-1">Dernière modification : Jamais</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-gray-400 rounded-full" />
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-white flex items-center gap-2"
                  >
                    Modifier
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Colonne latérale - Plan et usage */}
          <div className="space-y-6">
            {/* Plan actuel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`relative overflow-hidden rounded-2xl shadow-sm border ${
                isPremium 
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-200' 
                  : 'bg-white border-gray-100'
              }`}
            >
              {isPremium && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              )}
              
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isPremium ? (
                        <Crown className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-gray-600" />
                      )}
                      <h3 className={`font-semibold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                        Plan {isPremium ? 'Premium' : 'Gratuit'}
                      </h3>
                    </div>
                    <p className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                      {isPremium ? '9,99€' : 'Gratuit'}
                    </p>
                  </div>
                  {isPremium && (
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                  )}
                </div>
                
                <div className={`text-sm ${isPremium ? 'text-white/80' : 'text-gray-600'} mb-4`}>
                  {isPremium ? (
                    <>Renouvellement le {new Date(profile.planExpiresAt || '').toLocaleDateString()}</>
                  ) : (
                    <>Aucun renouvellement</>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-2.5 rounded-xl font-medium ${
                    isPremium 
                      ? 'bg-white text-purple-600 hover:bg-gray-100' 
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  }`}
                >
                  {isPremium ? 'Gérer l\'abonnement' : 'Passer au Premium'}
                </motion.button>
              </div>
            </motion.div>

            {/* Usage du plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="font-semibold mb-4">Utilisation du plan</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Liens directs</span>
                    <span className="text-sm font-bold text-gray-900">
                      {usage.deepLinks} / {limits.deepLinks}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        usage.deepLinks >= limits.deepLinks 
                          ? 'bg-red-500' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${(usage.deepLinks / limits.deepLinks) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Landing Pages</span>
                    <span className="text-sm font-bold text-gray-900">
                      {usage.landingPages} / {limits.landingPages}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        usage.landingPages >= limits.landingPages 
                          ? 'bg-red-500' 
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${(usage.landingPages / limits.landingPages) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Fonctionnalités du plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="font-semibold mb-4">
                Fonctionnalités {isPremium ? 'Premium' : 'Gratuites'}
              </h3>
              
              <div className="space-y-3">
                {[
                  { icon: Link, label: `${limits.landingPages} Landing Page${limits.landingPages > 1 ? 's' : ''}`, available: true },
                  { icon: BarChart3, label: 'Analytics de base', available: true },
                  { icon: Globe, label: 'Liens directs', available: true },
                  { icon: Globe, label: 'Domaines personnalisés', available: isPremium },
                  { icon: Palette, label: 'Personnalisation avancée', available: isPremium },
                  { icon: ShieldCheck, label: 'Protection Shield complète', available: isPremium },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`p-1.5 rounded-lg ${
                      feature.available 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm ${
                      feature.available ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {feature.label}
                    </span>
                    {feature.available && (
                      <Check className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
              >
                Comparer tous les plans
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}