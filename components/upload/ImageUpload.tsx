'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Upload, X, Camera, Image as ImageIcon, Loader2, Crop } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import ImageCropper from './ImageCropper'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  type?: 'avatar' | 'banner' | 'cover' | 'profile'
  className?: string
  aspectRatio?: 'square' | 'wide' | 'cover'
  compact?: boolean
  onUploadingChange?: (isUploading: boolean) => void
}

export default function ImageUpload({ 
  value, 
  onChange, 
  type = 'avatar',
  className = '',
  aspectRatio = 'square',
  compact = false,
  onUploadingChange
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(value || null)
  }, [value])

  useEffect(() => {
    onUploadingChange?.(isUploading)
  }, [isUploading, onUploadingChange])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    // Vérifier la taille
    if (file.size > 4 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 4MB')
      return
    }

    // Lire le fichier et l'uploader directement (sans cropper)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const imageDataUrl = reader.result as string
      setPreview(imageDataUrl)
      onChange(imageDataUrl)
      setIsUploading(true)

      try {
        // Créer un FormData avec le fichier original
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          console.error('Upload API error:', error)
          throw new Error(error.error || 'Erreur lors de l\'upload')
        }

        const data = await uploadResponse.json()
        onChange(data.url)
        toast.success('Image uploadée avec succès')
      } catch (error) {
        console.error('Erreur upload:', error)
        toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
        setPreview(value || null)
        onChange(value || '')
      } finally {
        setIsUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedImageUrl: string) => {
    setShowCropper(false)
    setPreview(croppedImageUrl)
    onChange(croppedImageUrl)
    setIsUploading(true)

    try {
      // Convertir l'URL blob en fichier
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        console.error('Upload API error:', error)
        throw new Error(error.error || 'Erreur lors de l\'upload')
      }

      const data = await uploadResponse.json()
      onChange(data.url)
      toast.success('Image uploadée avec succès')
    } catch (error) {
      console.error('Erreur upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
      setPreview(value || null)
      onChange(value || '')
    } finally {
      setIsUploading(false)
      setTempImage(null)
    }
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setTempImage(null)
  }

  // Définir les ratios d'aspect selon le type
  const getAspectRatio = () => {
    switch (type) {
      case 'avatar':
      case 'profile':
        return 1 // Carré (1:1)
      case 'banner':
        return 4 // Large (4:1)
      case 'cover':
        return 4/3 // Standard (4:3)
      default:
        return undefined // Libre
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'wide':
        return 'aspect-[4/1]'
      case 'cover':
        return 'aspect-[4/3]'
      default:
        return 'aspect-square'
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full rounded-xl bg-gray-100 dark:bg-gray-800"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto rounded-xl"
            />
            
            {/* Overlay au survol */}
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/30 transition-colors"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleRemove}
                disabled={isUploading}
                className="p-2 bg-black/20 backdrop-blur-sm rounded-lg hover:bg-black/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </motion.div>
        ) : compact ? (
          <motion.button
            key="compact-upload"
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-2xl border border-gray-300 bg-white p-3 text-left transition hover:border-indigo-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gray-100 dark:bg-gray-800">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              ) : (
                <Camera className="h-5 w-5 text-gray-500 dark:text-gray-300" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Ajouter une photo</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Optionnel, modifiable plus tard</p>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              w-full h-auto
              border-2 border-dashed rounded-xl cursor-pointer
              transition-all duration-200
              ${isDragging
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <div className="flex flex-col items-center justify-center p-8">
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin mb-3" />
              ) : (
                <>
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                    {type === 'avatar' || type === 'profile' ? (
                      <Camera className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isDragging ? 'Déposez l\'image ici' : 'Cliquez ou glissez une image'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    JPG, PNG, GIF, WebP • Max 4MB
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Cropper désactivé - upload direct */}
    </div>
  )
}
