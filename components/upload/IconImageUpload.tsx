'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

interface IconImageUploadProps {
  value?: string
  onChange: (url: string) => void
}

export default function IconImageUpload({ 
  value, 
  onChange
}: IconImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

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

    if (file.size > 2 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 2MB')
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
      formData.append('type', 'icon')

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
      toast.success('Icône mise à jour')
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
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        {/* Aperçu de l'icône actuelle */}
        <div className="relative">
          <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
            {preview ? (
              <Image
                src={preview}
                alt="Icon"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
          
          {isUploading && (
            <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="w-3.5 h-3.5" />
            {preview ? 'Changer' : 'Ajouter'}
          </motion.button>
          
          {preview && (
            <motion.button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="p-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        PNG, JPG ou WebP • Max 2MB • Format carré recommandé
      </p>
    </div>
  )
}