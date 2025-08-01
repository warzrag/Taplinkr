'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

interface CoverImageUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
}

export default function CoverImageUpload({ 
  value, 
  onChange,
  className = ''
}: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 10MB')
      return
    }

    // Preview immédiat
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
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
            <div className="relative aspect-[9/16] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={preview}
                alt="Cover"
                fill
                className="object-cover"
                priority
              />
              
              {/* Actions overlay */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-lg hover:bg-white transition-colors shadow-lg"
                >
                  <Upload className="w-4 h-4 text-gray-700" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-lg hover:bg-white transition-colors shadow-lg"
                >
                  <X className="w-4 h-4 text-gray-700" />
                </motion.button>
              </div>

              {/* Loading overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Info text */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              Format recommandé : 16:9 (paysage) ou 9:16 (portrait) • Max 10MB
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