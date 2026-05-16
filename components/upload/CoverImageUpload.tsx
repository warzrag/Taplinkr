'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, X, Loader2, ImageIcon, Smartphone } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

interface CoverImageUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
  onUploadingChange?: (isUploading: boolean) => void
}

export default function CoverImageUpload({ 
  value, 
  onChange,
  className = '',
  onUploadingChange
}: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPreview(value || null)
  }, [value])

  useEffect(() => {
    onUploadingChange?.(isUploading)
  }, [isUploading, onUploadingChange])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 4MB')
      return
    }

    // Preview immédiat
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string
      setPreview(imageDataUrl)
      onChange(imageDataUrl)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'cover')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Erreur lors de l\'upload')
      }

      const data = await uploadResponse.json()
      onChange(data.url)
      toast.success('Photo de couverture mise à jour')
    } catch (error) {
      console.error('Erreur upload:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload')
      setPreview(value || null)
      onChange(value || '')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* Container simple avec aspect ratio fixe */}
            <div className="relative rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Apercu couverture mobile</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Zone visible en haut de la page publique.</p>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  <Smartphone className="h-3.5 w-3.5" />
                  Mobile
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] bg-gray-950 p-2">
                <div className="overflow-hidden rounded-[1.1rem] bg-white">
                  <div className="relative h-28 w-full overflow-hidden sm:h-32">
                    <Image
                      src={preview}
                      alt=""
                      fill
                      className="scale-110 object-cover blur-xl opacity-45"
                      priority
                    />
                    <Image
                      src={preview}
                      alt="Cover"
                      fill
                      className="object-contain"
                      priority
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/85 to-transparent" />
                    <div className="pointer-events-none absolute bottom-2 left-1/2 h-16 w-16 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-white/70 shadow-lg" />
                  </div>
                  <div className="h-20 bg-white" />
                </div>
              </div>
              
              {/* Actions overlay */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">L'image est centree comme dans le telephone.</p>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <Upload className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-60 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Loading overlay */}
              {isUploading && (
                <div className="absolute inset-3 bg-black/45 flex items-center justify-center rounded-2xl">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Info text */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Format recommandé : 16:9 (paysage) ou 9:16 (portrait) • Max 4MB
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative cursor-pointer rounded-2xl overflow-hidden
              transition-all duration-300 group
              ${isDragging ? 'scale-[1.02]' : ''}
            `}
          >
            <div className={`
              aspect-[16/9] w-full flex flex-col items-center justify-center
              bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900
              border-2 border-dashed rounded-2xl
              ${isDragging 
                ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10' 
                : 'border-gray-300 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-600'
              }
              transition-all duration-200
            `}>
              <motion.div
                animate={{ 
                  y: isDragging ? -5 : 0,
                  scale: isDragging ? 0.95 : 1
                }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                  <ImageIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isDragging ? 'Déposer l\'image ici' : 'Ajouter une photo de couverture'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Cliquer ou glisser-déposer • JPG, PNG, WebP
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
