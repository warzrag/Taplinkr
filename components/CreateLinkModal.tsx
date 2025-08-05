'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, Plus, Sparkles, ArrowRight, ExternalLink, Layers, Shield, Zap } from 'lucide-react'
import { Link as LinkType } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
import ImageUpload from './upload/ImageUpload'
import CoverImageUpload from './upload/CoverImageUpload'

interface CreateLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingLink?: LinkType | null
}

interface FormData {
  title: string
  slug?: string
}

interface MultiLinkData {
  title: string
  url: string
}

export default function CreateLinkModal({ isOpen, onClose, onSuccess, editingLink }: CreateLinkModalProps) {
  const { hasPermission, requirePermission } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [linkType, setLinkType] = useState<'direct' | 'multi'>(
    editingLink?.isDirect ? 'direct' : 'multi'
  )
  const [directUrl, setDirectUrl] = useState(editingLink?.directUrl || '')
  const [shieldEnabled, setShieldEnabled] = useState(editingLink?.shieldEnabled || false)
  const [isUltraLink, setIsUltraLink] = useState(editingLink?.isUltraLink || false)
  const [multiLinks, setMultiLinks] = useState<MultiLinkData[]>(
    editingLink?.multiLinks && editingLink.multiLinks.length > 0
      ? editingLink.multiLinks.map(ml => ({
          title: ml.title,
          url: ml.url
        }))
      : [{ title: '', url: '' }]
  )
  const [profileImage, setProfileImage] = useState(editingLink?.profileImage || '')
  const [coverImage, setCoverImage] = useState(editingLink?.coverImage || '')
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    defaultValues: editingLink ? {
      title: editingLink.title,
      slug: editingLink.slug
    } : {
      title: '',
      slug: ''
    }
  })

  const handleClose = () => {
    if (!loading) {
      setStep(1)
      setLinkType('multi')
      setDirectUrl('')
      setShieldEnabled(false)
      setIsUltraLink(false)
      setMultiLinks([{ title: '', url: '' }])
      setProfileImage('')
      setCoverImage('')
      reset()
      onClose()
    }
  }

  const addMultiLink = () => {
    setMultiLinks([...multiLinks, { title: '', url: '' }])
  }

  const removeMultiLink = (index: number) => {
    if (multiLinks.length > 1) {
      setMultiLinks(multiLinks.filter((_, i) => i !== index))
    }
  }

  const updateMultiLink = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...multiLinks]
    updated[index][field] = value
    setMultiLinks(updated)
  }

  const onSubmit = async (data: FormData) => {
    // Validation selon le type de lien
    if (linkType === 'direct') {
      // Vérifier si l'utilisateur peut créer des liens directs
      if (!hasPermission('hasCustomThemes')) {
        requirePermission('hasCustomThemes')
        return
      }
      
      if (!directUrl) {
        toast.error('L\'URL de redirection est requise')
        return
      }
    } else {
      // Vérifier qu'au moins un lien est rempli
      const validLinks = multiLinks.filter(link => link.title && link.url)
      if (validLinks.length === 0) {
        toast.error('Ajoutez au moins un lien')
        return
      }
    }

    setLoading(true)
    
    try {
      const url = editingLink ? `/api/links/${editingLink.id}` : '/api/links'
      const method = editingLink ? 'PUT' : 'POST'
      
      const requestBody = {
        ...data,
        isDirect: linkType === 'direct',
        directUrl: linkType === 'direct' ? directUrl : null,
        shieldEnabled: linkType === 'direct' ? shieldEnabled : false,
        isUltraLink: linkType === 'direct' ? isUltraLink : false,
        multiLinks: linkType === 'multi' ? multiLinks.filter(link => link.title && link.url) : [],
        profileImage: profileImage || null,
        coverImage: coverImage || null
      }
      
      console.log('Sending request:', { url, method, body: requestBody })
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.message || errorData.error || 'Erreur lors de la sauvegarde')
      }

      toast.success(editingLink ? 'Lien modifié avec succès' : 'Lien créé avec succès')
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Erreur:', error)
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const goToStep2 = () => {
    const title = watch('title')
    if (!title) {
      toast.error('Le titre est requis')
      return
    }
    setStep(2)
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end sm:items-center justify-center min-h-screen">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: window.innerWidth < 640 ? '100%' : 0, scale: window.innerWidth < 640 ? 1 : 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: window.innerWidth < 640 ? '100%' : 0, scale: window.innerWidth < 640 ? 1 : 0.95 }}
          className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg lg:max-w-2xl sm:max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8 pb-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {editingLink ? 'Modifier le lien' : 'Créer un nouveau lien'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Étape {step} sur 2
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
            </button>
          </div>

          {/* Form - Scrollable */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6">
            <div className="space-y-6">
              {step === 1 ? (
                /* Étape 1: Informations de base */
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du lien
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: true })}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-base"
                      placeholder="Mon super lien"
                      autoFocus
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">Le titre est requis</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL personnalisée (optionnel)
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm mr-2">/link/</span>
                      <input
                        type="text"
                        {...register('slug')}
                        className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-base"
                        placeholder="mon-lien"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Laissez vide pour générer automatiquement
                    </p>
                  </div>

                  {/* Bouton suivant */}
                  <button
                    type="button"
                    onClick={goToStep2}
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-base"
                  >
                    Suivant
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                /* Étape 2: Type de lien */
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Sélecteur de type */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">
                      Type de lien
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hasPermission('hasCustomThemes') ? (
                        <button
                          type="button"
                          onClick={() => setLinkType('direct')}
                          className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                            linkType === 'direct'
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        >
                          <ExternalLink className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${
                            linkType === 'direct' ? 'text-indigo-600' : 'text-gray-400'
                          }`} />
                          <h4 className="font-medium text-sm">Lien direct</h4>
                          <p className="text-xs text-gray-500 mt-1 hidden sm:block">Redirige directement vers une URL</p>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => requirePermission('hasCustomThemes')}
                          className="p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-gray-200 bg-gray-50 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-gray-200/50" />
                          <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-gray-300" />
                          <h4 className="font-medium text-sm text-gray-500">Lien direct</h4>
                          <p className="text-xs text-gray-400 mt-1 hidden sm:block">Plan Standard requis</p>
                          <div className="absolute top-1 right-1">
                            <span className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">
                              🔒 PRO
                            </span>
                          </div>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setLinkType('multi')}
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                          linkType === 'multi'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <Layers className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${
                          linkType === 'multi' ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <h4 className="font-medium text-sm">Multi-liens</h4>
                        <p className="text-xs text-gray-500 mt-1 hidden sm:block">Page avec plusieurs liens</p>
                      </button>
                    </div>
                  </div>

                  {/* Contenu selon le type */}
                  {linkType === 'direct' ? (
                    /* Lien direct */
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        URL de redirection
                      </label>
                      <input
                        type="url"
                        value={directUrl}
                        onChange={(e) => setDirectUrl(e.target.value)}
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                        placeholder="https://example.com"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Les visiteurs seront redirigés directement vers cette URL
                      </p>

                      {/* Options de protection */}
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700">Options de protection</h4>
                        
                        {/* Shield Niveau 2 */}
                        <div 
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            shieldEnabled && !isUltraLink
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          } ${isUltraLink ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => {
                            if (!isUltraLink) {
                              setShieldEnabled(!shieldEnabled)
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Shield className={`w-5 h-5 mt-0.5 ${
                              shieldEnabled && !isUltraLink ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm">Shield Protection</h5>
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                  Niveau 2
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                Protection standard avec page intermédiaire, timer de 3 secondes et détection basique des crawlers
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={shieldEnabled && !isUltraLink}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600 rounded"
                              disabled={isUltraLink}
                            />
                          </div>
                        </div>

                        {/* ULTRA LINK Niveau 3 */}
                        <div 
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isUltraLink
                              ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => {
                            setIsUltraLink(!isUltraLink)
                            if (!isUltraLink) {
                              setShieldEnabled(false)
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Zap className={`w-5 h-5 mt-0.5 ${
                              isUltraLink ? 'text-purple-600' : 'text-gray-400'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                  ULTRA LINK
                                </h5>
                                <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full">
                                  Niveau 3 MAX
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                Protection maximale avec contenu adaptatif, rotation de domaines, obfuscation JavaScript avancée et IA anti-détection
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={isUltraLink}
                              onChange={() => {}}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                          </div>
                        </div>

                        {(shieldEnabled || isUltraLink) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-3 bg-amber-50 border border-amber-200 rounded-lg"
                          >
                            <p className="text-xs text-amber-800">
                              <strong>Note :</strong> {isUltraLink ? 'ULTRA LINK offre une protection maximale avec 95%+ de taux de réussite contre les bannissements.' : 'Le Shield offre une protection efficace à 92% contre les détections automatiques.'}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Multi-liens */
                    <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                      {multiLinks.map((link, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-xl p-4 space-y-3"
                        >
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateMultiLink(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                            placeholder="Titre du lien"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateMultiLink(index, 'url', e.target.value)}
                            className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                            placeholder="https://example.com"
                          />
                          {multiLinks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMultiLink(index)}
                              className="text-red-500 text-sm hover:text-red-700 transition-colors"
                            >
                              Supprimer
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {linkType === 'multi' && (
                    <>
                      <button
                        type="button"
                        onClick={addMultiLink}
                        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <Plus className="w-5 h-5" />
                        Ajouter un lien
                      </button>

                      {/* Section des images */}
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700">Personnalisation visuelle</h4>
                        
                        {/* Photo de profil */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photo de profil
                          </label>
                          <ImageUpload
                            value={profileImage}
                            onChange={setProfileImage}
                            type="profile"
                            aspectRatio="square"
                            className="w-32"
                          />
                        </div>

                        {/* Photo de couverture */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photo de couverture
                          </label>
                          <CoverImageUpload
                            value={coverImage}
                            onChange={setCoverImage}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-2 sm:gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 text-base"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-base"
                    >
                      {loading ? (
                        <>
                          <motion.div
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Création...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {editingLink ? 'Enregistrer' : 'Créer'}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}