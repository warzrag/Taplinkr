'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface IconUploadProps {
  value?: string
  onChange: (value: string) => void
  className?: string
}

export default function IconUpload({ value, onChange, className = '' }: IconUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Select an image.')
      return
    }

    // Limite de taille : 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('The image must be 2 MB or smaller.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'icon')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Unable to upload the image.')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      console.error('Erreur upload:', error)
      alert('Unable to upload the icon.')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative w-12 h-12 group">
          <img
            src={value}
            alt="Icon"
            className="w-full h-full object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label
          className={`
            relative w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg
            hover:border-indigo-400 transition-colors cursor-pointer
            flex items-center justify-center
            ${isDragging ? 'border-indigo-500 bg-indigo-50' : ''}
          `}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <ImageIcon className="w-5 h-5 text-gray-400" />
        </label>
      )}
    </div>
  )
}
