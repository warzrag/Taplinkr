'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, Plus, Sparkles, ArrowRight, ExternalLink, Layers } from 'lucide-react'
import { Link as LinkType } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'

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
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [linkType, setLinkType] = useState<'direct' | 'multi'>(
    editingLink?.isDirect ? 'direct' : 'multi'
  )
  const [directUrl, setDirectUrl] = useState(editingLink?.directUrl || '')
  const [multiLinks, setMultiLinks] = useState<MultiLinkData[]>(
    editingLink?.multiLinks && editingLink.multiLinks.length > 0
      ? editingLink.multiLinks.map(ml => ({
          title: ml.title,
          url: ml.url
        }))
      : [{ title: '', url: '' }]
  )
  
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
      setMultiLinks([{ title: '', url: '' }])
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
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          isDirect: linkType === 'direct',
          directUrl: linkType === 'direct' ? directUrl : null,
          multiLinks: linkType === 'multi' ? multiLinks.filter(link => link.title && link.url) : []
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
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
      <div className="flex items-center justify-center min-h-screen p-4">
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingLink ? 'Modifier le lien' : 'Créer un nouveau lien'}
                </h2>
                <p className="text-sm text-gray-500">
                  Étape {step} sur 2
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
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
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLinkType('direct')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          linkType === 'direct'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <ExternalLink className={`w-6 h-6 mx-auto mb-2 ${
                          linkType === 'direct' ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <h4 className="font-medium text-sm">Lien direct</h4>
                        <p className="text-xs text-gray-500 mt-1">Redirige directement vers une URL</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLinkType('multi')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          linkType === 'multi'
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <Layers className={`w-6 h-6 mx-auto mb-2 ${
                          linkType === 'multi' ? 'text-indigo-600' : 'text-gray-400'
                        }`} />
                        <h4 className="font-medium text-sm">Multi-liens</h4>
                        <p className="text-xs text-gray-500 mt-1">Page avec plusieurs liens</p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="https://example.com"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        Les visiteurs seront redirigés directement vers cette URL
                      </p>
                    </div>
                  ) : (
                    /* Multi-liens */
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Titre du lien"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateMultiLink(index, 'url', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    <button
                      type="button"
                      onClick={addMultiLink}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Ajouter un lien
                    </button>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
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