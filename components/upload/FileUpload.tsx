'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
}

interface FileUploadProps {
  onFileUploaded?: (file: UploadedFile) => void
  accept?: string
  maxSize?: number
  className?: string
  children?: React.ReactNode
}

export default function FileUpload({ 
  onFileUploaded, 
  accept = "image/*", 
  maxSize = 10 * 1024 * 1024,
  className = "",
  children 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const uploadedFile = await response.json()
      console.log('📤 FileUpload - Fichier uploadé:', uploadedFile)
      setUploadedFile(uploadedFile)
      
      if (onFileUploaded) {
        console.log('📞 FileUpload - Appel du callback onFileUploaded')
        onFileUploaded(uploadedFile)
      }
      
      toast.success('File uploaded successfully!')
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const removeFile = async () => {
    if (!uploadedFile) return

    try {
      await fetch(`/api/files/${uploadedFile.id}`, {
        method: 'DELETE'
      })
      setUploadedFile(null)
      toast.success('File removed')
    } catch (error) {
      toast.error('Failed to remove file')
    }
  }

  if (children) {
    return (
      <div className={className}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        <div onClick={handleClick} className="cursor-pointer">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      {uploadedFile ? (
        <div className="relative border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {uploadedFile.mimeType.startsWith('image/') ? (
                <img 
                  src={uploadedFile.url} 
                  alt={uploadedFile.originalName}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <Image size={24} className="text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {uploadedFile.originalName}
              </p>
              <p className="text-xs text-gray-500">
                {Math.round(uploadedFile.size / 1024)} KB
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-green-600" />
              <button
                onClick={removeFile}
                className="p-1 hover:bg-red-100 rounded text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="space-y-2">
            <Upload size={32} className="mx-auto text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                Images up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}