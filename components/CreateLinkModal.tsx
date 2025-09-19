'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, Plus, Sparkles, ArrowRight, ExternalLink, Layers, Shield, Zap, Smartphone, Eye, Camera, User, Sparkle, Check, AlertCircle, Loader2, Instagram, Twitter, Youtube, Info } from 'lucide-react'
import { Link as LinkType } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
import ImageUpload from './upload/ImageUpload'
import CoverImageUpload from './upload/CoverImageUpload'
import IconUpload from './upload/IconUpload'
import LivePhonePreview from './LivePhonePreview'

interface CreateLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newLink?: any) => void
  editingLink?: LinkType | null
}

interface FormData {
  title: string
  slug?: string
  description?: string
  instagramUrl?: string
  tiktokUrl?: string
  twitterUrl?: string
  youtubeUrl?: string
}

interface MultiLinkData {
  title: string
  url: string
  icon?: string
}

export default function CreateLinkModal({ isOpen, onClose, onSuccess, editingLink }: CreateLinkModalProps) {
  const { hasPermission, requirePermission } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(editingLink ? 5 : 1) // Si on édite, on passe directement à l'étape finale
  const [linkType, setLinkType] = useState<'direct' | 'multi' | null>(
    editingLink?.isDirect ? 'direct' : editingLink ? 'multi' : null
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
  const [profileStyle, setProfileStyle] = useState<'circle' | 'beacon'>(editingLink?.profileStyle || 'circle')
  const [coverImage, setCoverImage] = useState(editingLink?.coverImage || '')
  const [showPreview, setShowPreview] = useState(false)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugTimer, setSlugTimer] = useState<NodeJS.Timeout | null>(null)
  
  // États pour la personnalisation
  const [linkAnimation, setLinkAnimation] = useState(editingLink?.animation || 'none')
  const [borderRadius, setBorderRadius] = useState(editingLink?.borderRadius || 'rounded-xl')
  const [fontFamily, setFontFamily] = useState(editingLink?.fontFamily || 'system')
  const [backgroundColor, setBackgroundColor] = useState(editingLink?.backgroundColor || '#ffffff')
  const [textColor, setTextColor] = useState(editingLink?.textColor || '#1f2937')
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    defaultValues: editingLink ? {
      title: editingLink.title,
      slug: editingLink.slug,
      description: editingLink.description || '',
      instagramUrl: editingLink.instagramUrl || '',
      tiktokUrl: editingLink.tiktokUrl || '',
      twitterUrl: editingLink.twitterUrl || '',
      youtubeUrl: editingLink.youtubeUrl || ''
    } : {
      title: '',
      slug: '',
      description: '',
      instagramUrl: '',
      tiktokUrl: '',
      twitterUrl: '',
      youtubeUrl: ''
    }
  })

  const watchedSlug = watch('slug')
  const watchedTitle = watch('title')
  const watchedDescription = watch('description')
  
  // Debug
  useEffect(() => {
    console.log('Titre surveillé:', watchedTitle)
    console.log('Étape actuelle:', step)
    console.log('MultiLinks:', multiLinks)
    console.log('Nombre de multiLinks:', multiLinks.length)
    console.log('MultiLinks filtrés:', multiLinks.filter(ml => ml.title || ml.url))
  }, [watchedTitle, step, multiLinks])

  // Vérifier la disponibilité du slug
  useEffect(() => {
    if (slugTimer) {
      clearTimeout(slugTimer)
    }

    if (!watchedSlug || watchedSlug === editingLink?.slug) {
      setSlugAvailable(null)
      setCheckingSlug(false)
      return
    }

    setCheckingSlug(true)
    setSlugAvailable(null)

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/links/check-slug?slug=${encodeURIComponent(watchedSlug)}${editingLink ? `&linkId=${editingLink.id}` : ''}`)
        if (!response.ok) {
          console.error('Erreur API:', response.status)
          setSlugAvailable(null)
          return
        }
        const data = await response.json()
        console.log('Vérification slug:', watchedSlug, 'Disponible:', data.available)
        setSlugAvailable(data.available)
      } catch (error) {
        console.error('Erreur vérification slug:', error)
        setSlugAvailable(null)
      } finally {
        setCheckingSlug(false)
      }
    }, 500) // Debounce de 500ms

    setSlugTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [watchedSlug, editingLink])

  const handleClose = () => {
    if (!loading) {
      setStep(editingLink ? 3 : 1)
      setLinkType(editingLink?.isDirect ? 'direct' : editingLink ? 'multi' : null)
      setDirectUrl('')
      setShieldEnabled(false)
      setIsUltraLink(false)
      setMultiLinks([{ title: '', url: '' }])
      setProfileImage('')
      setCoverImage('')
      setShowPreview(false)
      reset()
      onClose()
    }
  }

  const addMultiLink = () => {
    const newLinks = [...multiLinks, { title: '', url: '' }]
    console.log('Ajout d\'un nouveau lien. Total:', newLinks.length)
    setMultiLinks(newLinks)
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
    // Vérifier la disponibilité du slug
    if (data.slug && slugAvailable === false) {
      toast.error('Cette URL est déjà utilisée')
      return
    }

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
      const url = editingLink ? `/api/links/${editingLink.id}` : '/api/links-create-final'
      const method = editingLink ? 'PUT' : 'POST'
      
      const requestBody = {
        ...data,
        isDirect: linkType === 'direct',
        directUrl: linkType === 'direct' ? directUrl : null,
        shieldEnabled: linkType === 'direct' ? shieldEnabled : false,
        isUltraLink: linkType === 'direct' ? isUltraLink : false,
        multiLinks: linkType === 'multi' ? multiLinks.filter(link => link.title || link.url) : [],
        profileImage: profileImage || null,
        profileStyle: profileStyle || 'circle',
        coverImage: coverImage || null,
        description: data.description || null,
        instagramUrl: data.instagramUrl || null,
        tiktokUrl: data.tiktokUrl || null,
        twitterUrl: data.twitterUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        animation: linkAnimation || 'none',
        borderRadius: borderRadius || 'rounded-xl',
        fontFamily: fontFamily || 'system',
        backgroundColor: backgroundColor || '#ffffff',
        textColor: textColor || '#1f2937'
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

      const newLink = await response.json()
      toast.success(editingLink ? 'Lien modifié avec succès' : 'Lien créé avec succès')
      onSuccess(newLink)
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
          className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg lg:max-w-2xl max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
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
                  Étape {step} sur {linkType === 'multi' ? '5' : '2'}
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
                /* Étape 1: Choix du type de lien */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center min-h-[400px] py-8"
                >
                  <motion.h3 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-gray-900 mb-8 text-center"
                  >
                    Quel type de lien souhaitez-vous créer ?
                  </motion.h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    {/* Multi-liens */}
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: 0.2,
                        type: "spring",
                        stiffness: 100,
                        damping: 10
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setLinkType('multi')
                        setShowPreview(true) // Activer automatiquement la preview
                        setStep(2)
                      }}
                      className="relative p-8 rounded-2xl border-2 border-gray-200 hover:border-indigo-500 bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group overflow-hidden"
                    >
                      {/* Background animation */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        initial={false}
                      />
                      
                      <motion.div 
                        className="absolute top-4 right-4"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        <motion.span 
                          animate={{ 
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full font-semibold shadow-lg"
                        >
                          Recommandé
                        </motion.span>
                      </motion.div>
                      
                      <motion.div
                        className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center relative z-10 shadow-xl"
                        whileHover={{ 
                          rotate: [0, -10, 10, -10, 0],
                          transition: { duration: 0.5 }
                        }}
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-700 rounded-2xl opacity-50 blur-xl"
                        />
                        <Layers className="w-10 h-10 text-white relative z-10" />
                      </motion.div>
                      
                      <h4 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Multi-liens</h4>
                      <p className="text-gray-600 text-sm relative z-10">
                        Page avec plusieurs liens, parfait pour partager tous vos réseaux
                      </p>
                      
                      <motion.div 
                        className="mt-4 flex items-center justify-center gap-2 text-indigo-600 font-medium relative z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <span>Créer</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </motion.div>
                    </motion.button>

                    {/* Lien direct */}
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: 0.3,
                        type: "spring",
                        stiffness: 100,
                        damping: 10
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!hasPermission('hasCustomThemes')) {
                          requirePermission('hasCustomThemes')
                          return
                        }
                        setLinkType('direct')
                        setStep(3)
                      }}
                      className="relative p-8 rounded-2xl border-2 border-gray-200 hover:border-purple-500 bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group overflow-hidden"
                    >
                      {/* Background animation */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        initial={false}
                      />
                      
                      {!hasPermission('hasCustomThemes') && (
                        <motion.div 
                          className="absolute top-4 right-4"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6, type: "spring" }}
                        >
                          <motion.span 
                            animate={{ 
                              rotate: [0, -5, 5, -5, 0],
                            }}
                            transition={{ 
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                            className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full font-semibold shadow-lg inline-block"
                          >
                            🔒 PRO
                          </motion.span>
                        </motion.div>
                      )}
                      
                      <motion.div
                        className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center relative z-10 shadow-xl"
                        whileHover={{ 
                          scale: [1, 1.2, 1.1],
                          transition: { duration: 0.3 }
                        }}
                      >
                        <motion.div
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                          className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-700 rounded-2xl blur-xl"
                        />
                        <motion.div
                          animate={{ 
                            rotate: 45,
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            rotate: { duration: 0.5 },
                            scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                          }}
                        >
                          <Zap className="w-10 h-10 text-white relative z-10" />
                        </motion.div>
                      </motion.div>
                      
                      <h4 className="text-xl font-bold text-gray-900 mb-2 relative z-10">Lien direct</h4>
                      <p className="text-gray-600 text-sm relative z-10">
                        Redirection instantanée vers une URL unique
                      </p>
                      
                      <motion.div 
                        className="mt-4 flex items-center justify-center gap-2 text-purple-600 font-medium relative z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <span>Créer</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </motion.div>
                    </motion.button>
                  </div>
                </motion.div>
              ) : step === 2 && linkType === 'multi' ? (
                /* Étape 2: Upload de photo de profil (uniquement pour multi-liens) */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center min-h-[400px] py-8"
                >
                  <motion.h3 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-gray-900 mb-2 text-center"
                  >
                    Ajoutez votre photo de profil
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-600 mb-8 text-center"
                  >
                    Une photo de profil rend votre page plus personnelle et professionnelle
                  </motion.p>
                  
                  {/* Zone d'upload centrale avec animations */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: 0.3,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    className="relative w-48 h-48"
                  >
                    {/* Cercle animé en arrière-plan */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-xl"
                    />
                    
                    {/* Sparkles animés autour */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      <Sparkle className="absolute -top-2 right-8 w-4 h-4 text-yellow-500" />
                      <Sparkle className="absolute bottom-8 -left-2 w-3 h-3 text-purple-500" />
                      <Sparkle className="absolute top-16 -left-3 w-5 h-5 text-indigo-500" />
                    </motion.div>
                    
                    {/* Zone d'upload */}
                    <div className="relative w-full h-full">
                      {!profileImage ? (
                        <>
                          {/* Icône animée en overlay */}
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
                          >
                            <Camera className="w-12 h-12 text-indigo-600 mb-2" />
                            <span className="text-sm font-medium text-gray-700">Cliquez pour ajouter</span>
                            <span className="text-xs text-gray-500 mt-1">JPG, PNG • Max 5MB</span>
                          </motion.div>
                          
                          {/* Composant ImageUpload avec style circulaire */}
                          <div className="[&>div>div:last-child]:rounded-full [&>div>div:last-child]:bg-gradient-to-br [&>div>div:last-child]:from-indigo-100 [&>div>div:last-child]:to-purple-100 [&>div>div:last-child]:border-indigo-300 [&>div>div:last-child:hover]:border-indigo-500 [&>div>div]:h-full">
                            <ImageUpload
                              value={profileImage}
                              onChange={setProfileImage}
                              type="profile"
                              aspectRatio="square"
                              className="w-full h-full [&_svg]:hidden [&_p]:hidden [&_div]:bg-transparent"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Image avec effet de succès */}
                          <motion.div
                            animate={{
                              boxShadow: [
                                "0 0 0 0 rgba(99, 102, 241, 0)",
                                "0 0 0 20px rgba(99, 102, 241, 0.2)",
                                "0 0 0 40px rgba(99, 102, 241, 0)"
                              ]
                            }}
                            transition={{ duration: 1.5 }}
                            className="relative w-full h-full rounded-full overflow-hidden border-4 border-indigo-500 shadow-xl"
                          >
                            <ImageUpload
                              value={profileImage}
                              onChange={setProfileImage}
                              type="profile"
                              aspectRatio="square"
                              className="w-full h-full"
                            />
                          </motion.div>
                          
                          {/* Badge de succès */}
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-20"
                          >
                            <Sparkles className="w-6 h-6 text-white" />
                          </motion.div>
                        </>
                      )}
                    </div>
                  </motion.div>

                  {/* Message d'encouragement */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-gray-500 mt-6 text-center max-w-sm"
                  >
                    {profileImage 
                      ? "Parfait ! Votre photo est superbe 🎉" 
                      : "Les profils avec photo reçoivent 3x plus de clics"}
                  </motion.p>

                  {/* Sélecteur de style de photo */}
                  {profileImage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 space-y-3"
                    >
                      <p className="text-sm font-medium text-gray-700 text-center">Style d'affichage</p>
                      <div className="flex gap-3 justify-center">
                        {/* Style rond classique */}
                        <motion.button
                          type="button"
                          onClick={() => setProfileStyle('circle')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative p-3 rounded-xl border-2 transition-all ${
                            profileStyle === 'circle'
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-white" />
                            </div>
                            <span className="text-xs font-medium">Classique</span>
                          </div>
                          {profileStyle === 'circle' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>

                        {/* Style Beacon */}
                        <motion.button
                          type="button"
                          onClick={() => setProfileStyle('beacon')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative p-3 rounded-xl border-2 transition-all ${
                            profileStyle === 'beacon'
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-end flex-col overflow-hidden">
                              <div className="w-10 h-10 rounded-full bg-white mb-1" />
                            </div>
                            <span className="text-xs font-medium">Style Beacon</span>
                          </div>
                          {profileStyle === 'beacon' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Option pour passer sans photo */}
                  {!profileImage && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => setStep(3)}
                      className="text-sm text-gray-500 hover:text-gray-700 underline mt-4"
                    >
                      Continuer sans photo
                    </motion.button>
                  )}

                  {/* Boutons d'action */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-3 mt-8"
                  >
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      Retour
                    </button>
                    <motion.button
                      type="button"
                      onClick={() => setStep(3)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                        profileImage 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                </motion.div>
              ) : step === 3 && linkType === 'multi' ? (
                /* Étape 3: Liens sociaux */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-8"
                  >
                    <motion.h3 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold text-gray-900 mb-2"
                    >
                      Connectez vos réseaux sociaux
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-gray-600"
                    >
                      Ajoutez vos profils pour faciliter le suivi (optionnel)
                    </motion.p>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Instagram */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center"
                        >
                          <Instagram className="w-4 h-4 text-white" />
                        </motion.div>
                        Instagram
                      </label>
                      <input
                        type="text"
                        {...register('instagramUrl')}
                        placeholder="@votrecompte"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      />
                    </motion.div>

                    {/* TikTok */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                          </svg>
                        </motion.div>
                        TikTok
                      </label>
                      <input
                        type="text"
                        {...register('tiktokUrl')}
                        placeholder="@votrecompte"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/20 focus:border-gray-700 transition-all"
                      />
                    </motion.div>

                    {/* Twitter */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"
                        >
                          <Twitter className="w-4 h-4 text-white" />
                        </motion.div>
                        Twitter
                      </label>
                      <input
                        type="text"
                        {...register('twitterUrl')}
                        placeholder="@votrecompte"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </motion.div>

                    {/* YouTube */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center"
                        >
                          <Youtube className="w-4 h-4 text-white" />
                        </motion.div>
                        YouTube
                      </label>
                      <input
                        type="text"
                        {...register('youtubeUrl')}
                        placeholder="@votrecompte"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all"
                      />
                    </motion.div>
                  </div>

                  {/* Note informative avec animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Info className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">
                          Astuce Pro
                        </p>
                        <p className="text-xs text-blue-700">
                          Les icônes de réseaux sociaux apparaîtront en bas de votre page pour un accès rapide à vos profils
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Boutons d'action */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-3 mt-8"
                  >
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      Retour
                    </button>
                    <motion.button
                      type="button"
                      onClick={() => setStep(4)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
                    >
                      Continuer
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                </motion.div>
              ) : step === 5 && linkType === 'multi' ? (
                /* Étape 5: Personnalisation des liens (dernière étape) */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-8"
                  >
                    <motion.h3 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold text-gray-900 mb-2"
                    >
                      Personnalisez vos liens
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-gray-600"
                    >
                      Donnez du style à vos liens pour les rendre uniques
                    </motion.p>
                  </motion.div>

                  {/* Animation des liens */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Animation des liens
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { value: 'none', label: 'Aucune', icon: '⚪' },
                        { value: 'pulse', label: 'Pulse', icon: '💗' },
                        { value: 'rotate', label: 'Rotate', icon: '🔄' },
                        { value: 'lift', label: 'Lift', icon: '🚀' }
                      ].map((anim) => (
                        <motion.button
                          key={anim.value}
                          type="button"
                          onClick={() => setLinkAnimation(anim.value)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            linkAnimation === anim.value
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-2xl mb-1">{anim.icon}</div>
                          <div className="text-xs font-medium">{anim.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Forme des liens */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Forme des liens
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'rounded', label: 'Léger', preview: 'rounded' },
                        { value: 'rounded-xl', label: 'Moyen', preview: 'rounded-xl' },
                        { value: 'rounded-2xl', label: 'Arrondi', preview: 'rounded-2xl' },
                        { value: 'rounded-3xl', label: 'Très arrondi', preview: 'rounded-3xl' },
                        { value: 'rounded-full', label: 'Pilule', preview: 'rounded-full' },
                        { value: 'rounded-none', label: 'Carré', preview: 'rounded-none' }
                      ].map((shape) => (
                        <motion.button
                          key={shape.value}
                          type="button"
                          onClick={() => setBorderRadius(shape.value)}
                          className={`p-4 border-2 transition-all ${
                            borderRadius === shape.value
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className={`w-full h-8 bg-gradient-to-r from-indigo-400 to-purple-400 ${shape.preview}`} />
                          <div className="text-xs font-medium mt-2">{shape.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Typographie */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Police de caractères
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'system', label: 'Système', className: 'font-sans' },
                        { value: 'inter', label: 'Inter', className: 'font-inter' },
                        { value: 'roboto', label: 'Roboto', className: 'font-roboto' },
                        { value: 'poppins', label: 'Poppins', className: 'font-poppins' },
                        { value: 'montserrat', label: 'Montserrat', className: 'font-montserrat' },
                        { value: 'playfair', label: 'Playfair', className: 'font-playfair' },
                        { value: 'mono', label: 'Mono', className: 'font-mono' }
                      ].map((font) => (
                        <motion.button
                          key={font.value}
                          type="button"
                          onClick={() => setFontFamily(font.value)}
                          className={`p-4 border-2 transition-all ${
                            fontFamily === font.value
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${font.className}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-lg font-bold">Aa</div>
                          <div className="text-xs mt-1">{font.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Couleurs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {/* Couleur de fond */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur de fond des liens
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="#ffffff"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        {['#ffffff', '#f3f4f6', '#e5e7eb', '#fef3c7', '#dbeafe', '#e9d5ff', '#fecaca'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setBackgroundColor(color)}
                            className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Couleur du texte */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur du texte
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="#1f2937"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        {['#1f2937', '#374151', '#6b7280', '#0f172a', '#7c3aed', '#2563eb', '#dc2626'].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setTextColor(color)}
                            className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Boutons d'action */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-3 mt-8"
                  >
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      Retour
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    </motion.button>
                  </motion.div>
                </motion.div>
              ) : step === 4 && linkType === 'multi' ? (
                /* Étape 4: Détails du lien */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  className="space-y-6"
                >
                  {/* Titre avec animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute -top-3 -left-3"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Sparkle className="w-5 h-5 text-yellow-500" />
                      </motion.div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Donnez un titre à votre page
                      </label>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="text"
                          {...register('title', { required: true })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base font-medium"
                          placeholder="Ex: Mes liens favoris ✨"
                          autoFocus
                        />
                      </motion.div>
                      {errors.title && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1"
                        >
                          Le titre est requis
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  {/* URL personnalisée avec animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personnalisez votre URL
                    </label>
                    <div className="relative">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative"
                      >
                        <div className="flex items-center">
                          <span className="text-gray-500 text-sm mr-2 font-medium">taplinkr.com/</span>
                          <input
                            type="text"
                            {...register('slug', {
                              pattern: {
                                value: /^[a-zA-Z0-9-]+$/,
                                message: 'Seuls les lettres, chiffres et tirets sont autorisés'
                              }
                            })}
                            className={`flex-1 px-4 py-3 pr-12 border-2 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-base ${
                              slugAvailable === false
                                ? 'border-red-400 focus:border-red-500'
                                : slugAvailable === true
                                ? 'border-green-400 focus:border-green-500'
                                : 'border-gray-300 focus:border-indigo-500'
                            }`}
                            placeholder="mon-lien-unique"
                            onChange={(e) => {
                              // Nettoyer automatiquement les caractères non autorisés
                              e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                              register('slug').onChange(e)
                            }}
                          />
                          
                          {/* Indicateur de statut */}
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AnimatePresence mode="wait">
                              {checkingSlug && (
                                <motion.div
                                  key="checking"
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                >
                                  <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                                </motion.div>
                              )}
                              {!checkingSlug && slugAvailable === true && watchedSlug && (
                                <motion.div
                                  key="available"
                                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                  transition={{ type: "spring", stiffness: 200 }}
                                  className="bg-green-500 rounded-full p-1.5 shadow-lg"
                                >
                                  <Check className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                              {!checkingSlug && slugAvailable === false && (
                                <motion.div
                                  key="unavailable"
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                  transition={{ type: "spring", stiffness: 200 }}
                                  className="bg-red-500 rounded-full p-1.5 shadow-lg"
                                >
                                  <X className="w-4 h-4 text-white" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                      
                      <AnimatePresence mode="wait">
                        {!watchedSlug && (
                          <motion.p 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xs text-gray-500 mt-1 flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Laissez vide pour une URL magique automatique
                          </motion.p>
                        )}
                        {slugAvailable === true && watchedSlug && (
                          <motion.div
                            key="available-msg"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 150 }}
                            className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2"
                          >
                            <p className="text-sm text-green-700 flex items-center gap-2 font-medium">
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                              >
                                <Check className="w-4 h-4" />
                              </motion.div>
                              Super ! Cette URL est disponible
                            </p>
                          </motion.div>
                        )}
                        {slugAvailable === false && (
                          <motion.div
                            key="unavailable-msg"
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 150 }}
                            className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2"
                          >
                            <p className="text-sm text-red-700 flex items-center gap-2 font-medium">
                              <motion.div
                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                              >
                                <AlertCircle className="w-4 h-4" />
                              </motion.div>
                              Oops ! Cette URL est déjà prise
                            </p>
                            <p className="text-xs text-red-600 mt-1 ml-6">
                              Essayez d'ajouter des chiffres ou des tirets
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Description avec animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optionnel)
                    </label>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <textarea
                        {...register('description')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-base resize-none"
                        placeholder="Décrivez votre page en quelques mots..."
                        rows={3}
                      />
                    </motion.div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xs text-gray-500 mt-1"
                    >
                      Une bonne description aide vos visiteurs à comprendre votre contenu
                    </motion.p>
                  </motion.div>

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
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
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
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Vos liens</h3>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-sm text-indigo-600 font-medium"
                        >
                          {multiLinks.filter(l => l.title && l.url).length} / ∞
                        </motion.div>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                        {multiLinks.map((link, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              delay: 0.3 + index * 0.1,
                              type: "spring",
                              stiffness: 100
                            }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 space-y-3 border-2 border-transparent hover:border-indigo-300 transition-all"
                          >
                          <div className="flex gap-3">
                            <IconUpload
                              value={link.icon}
                              onChange={(iconUrl) => updateMultiLink(index, 'icon', iconUrl)}
                            />
                            <div className="flex-1 space-y-3">
                              <input
                                type="text"
                                value={link.title}
                                onChange={(e) => updateMultiLink(index, 'title', e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                                placeholder="Titre du lien"
                              />
                              <input
                                type="url"
                                value={link.url}
                                onChange={(e) => updateMultiLink(index, 'url', e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                                placeholder="https://example.com"
                              />
                            </div>
                          </div>
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
                    </motion.div>
                  )}

                  {linkType === 'multi' && (
                    <>
                      <motion.button
                        type="button"
                        onClick={addMultiLink}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 border-2 border-dashed border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl text-indigo-600 hover:border-indigo-500 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <motion.div
                          animate={{ rotate: [0, 180, 360] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Plus className="w-5 h-5" />
                        </motion.div>
                        Ajouter un nouveau lien magique
                      </motion.button>

                      {/* Photo de couverture */}
                      <div className="pt-4 border-t">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Photo de couverture (optionnel)
                        </label>
                        <CoverImageUpload
                          value={coverImage}
                          onChange={setCoverImage}
                        />
                      </div>
                    </>
                  )}

                  {/* Boutons d'action */}
                  <div className="flex gap-2 sm:gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(linkType === 'multi' ? 3 : 1)}
                      className="flex-1 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 text-base"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-base"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Suivant
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Dernière étape alternative si pas multi */
                null
              )}
            </div>
          </form>
        </motion.div>
        
      </div>

      {/* Live Phone Preview - similaire à EditLinkModal */}
      <AnimatePresence>
        {showPreview && linkType === 'multi' && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="xl:hidden fixed inset-y-0 right-0 w-full md:w-96 bg-gray-100 z-60 overflow-y-auto shadow-2xl"
          >
            <div className="p-4">
              <motion.button
                onClick={() => setShowPreview(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-gray-700" />
              </motion.button>
              
              <div className="mt-16">
                <LivePhonePreview
                  currentStep={step}
                  links={[{
                    id: Date.now().toString(),
                    slug: watch('slug') || 'preview',
                    title: step >= 4 ? (watchedTitle || 'Mon lien') : 'Mon lien',
                    description: step >= 4 ? (watchedDescription || '') : '',
                    profileImage: profileImage || '',
                    profileStyle: profileStyle || 'circle',
                    coverImage: step >= 4 ? coverImage : '',
                    isDirect: false,
                    isActive: true,
                    instagramUrl: step >= 3 ? watch('instagramUrl') : '',
                    tiktokUrl: step >= 3 ? watch('tiktokUrl') : '',
                    twitterUrl: step >= 3 ? watch('twitterUrl') : '',
                    youtubeUrl: step >= 3 ? watch('youtubeUrl') : '',
                    animation: step >= 5 ? linkAnimation : 'none',
                    borderRadius: step >= 5 ? borderRadius : 'rounded-xl',
                    fontFamily: step >= 5 ? fontFamily : 'system',
                    backgroundColor: step >= 5 ? backgroundColor : '#ffffff',
                    textColor: step >= 5 ? textColor : '#1f2937',
                    multiLinks: step >= 4 ? (
                      step === 4 
                        ? multiLinks.map((ml, index) => ({
                            id: index.toString(),
                            parentLinkId: '',
                            title: ml.title || `Lien ${index + 1}`,
                            url: ml.url || '#',
                            description: '',
                            icon: '',
                            iconImage: '',
                            animation: '',
                            order: index,
                            clicks: 0,
                            createdAt: new Date(),
                            updatedAt: new Date()
                          }))
                        : [
                            { title: 'Mon Instagram', url: 'https://instagram.com' },
                            { title: 'Mon Portfolio', url: 'https://example.com' },
                            { title: 'Contactez-moi', url: 'mailto:contact@example.com' }
                          ].map((ml, index) => ({
                            id: index.toString(),
                            parentLinkId: '',
                            title: ml.title,
                            url: ml.url,
                            description: '',
                            icon: '',
                            iconImage: '',
                            animation: '',
                            order: index,
                            clicks: 0,
                            createdAt: new Date(),
                            updatedAt: new Date()
                          }))
                    ) : [],
                    // Valeurs par défaut
                    userId: '',
                    directUrl: '',
                    shieldEnabled: false,
                    isUltraLink: false,
                    isOnline: false,
                    order: 0,
                    clicks: 0,
                    views: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  }]}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview desktop fixe à droite */}
      <AnimatePresence>
        {showPreview && linkType === 'multi' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="hidden xl:block fixed right-8 top-24 bottom-8 w-[375px] z-20"
          >
            <LivePhonePreview
              currentStep={step}
              links={[{
                id: Date.now().toString(),
                slug: watch('slug') || 'preview',
                title: step >= 4 ? (watchedTitle || 'Mon lien') : 'Mon lien',
                description: step >= 4 ? (watchedDescription || '') : '',
                profileImage: profileImage || '',
                profileStyle: profileStyle || 'circle',
                coverImage: step >= 4 ? coverImage : '',
                isDirect: false,
                isActive: true,
                instagramUrl: step >= 3 ? watch('instagramUrl') : '',
                tiktokUrl: step >= 3 ? watch('tiktokUrl') : '',
                twitterUrl: step >= 3 ? watch('twitterUrl') : '',
                youtubeUrl: step >= 3 ? watch('youtubeUrl') : '',
                animation: step >= 5 ? linkAnimation : 'none',
                borderRadius: step >= 5 ? borderRadius : 'rounded-xl',
                fontFamily: step >= 5 ? fontFamily : 'system',
                backgroundColor: step >= 5 ? backgroundColor : '#ffffff',
                textColor: step >= 5 ? textColor : '#1f2937',
                multiLinks: step >= 4 ? (
                  multiLinks.length > 0
                    ? multiLinks.map((ml, index) => ({
                        id: index.toString(),
                        parentLinkId: '',
                        title: ml.title || `Lien ${index + 1}`,
                        url: ml.url || '#',
                        description: '',
                        icon: '',
                        iconImage: ml.icon || '',
                        animation: '',
                        order: index,
                        clicks: 0,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      }))
                    : [
                        { title: 'Mon Instagram', url: 'https://instagram.com' },
                        { title: 'Mon Portfolio', url: 'https://example.com' },
                        { title: 'Contactez-moi', url: 'mailto:contact@example.com' }
                      ].map((ml, index) => ({
                        id: index.toString(),
                        parentLinkId: '',
                        title: ml.title,
                        url: ml.url,
                        description: '',
                        icon: '',
                        iconImage: ml.icon || '',
                        animation: '',
                        order: index,
                        clicks: 0,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      }))
                ) : [],
                // Valeurs par défaut
                userId: '',
                directUrl: '',
                shieldEnabled: false,
                isUltraLink: false,
                isOnline: false,
                order: 0,
                clicks: 0,
                views: 0,
                createdAt: new Date(),
                updatedAt: new Date()
              }]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}