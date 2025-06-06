'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Upload, Trash2, Eye, Download, ArrowLeft, Image as ImageIcon, File } from 'lucide-react'
import FileUpload from '@/components/upload/FileUpload'

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  createdAt: string
}

export default function FilesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchFiles()
    }
  }, [status, router])

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files/upload')
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      toast.error('Erreur lors du chargement des fichiers')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUploaded = (file: UploadedFile) => {
    setFiles(prev => [file, ...prev])
  }

  const deleteFile = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      return
    }

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        setSelectedFile(null)
        toast.success('Fichier supprimé')
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isImage = (mimeType: string) => {
    return mimeType.startsWith('image/')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement des fichiers...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestionnaire de Fichiers</h1>
              <p className="text-gray-600">
                Uploadez et gérez vos images et fichiers
              </p>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Uploader un nouveau fichier
            </h2>
            <FileUpload onFileUploaded={handleFileUploaded} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Files List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Mes Fichiers ({files.length})
                </h3>
              </div>
              
              <div className="p-6">
                {files.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                          selectedFile?.id === file.id
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        {/* File Preview */}
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          {isImage(file.mimeType) ? (
                            <img
                              src={file.url}
                              alt={file.originalName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <File className="w-12 h-12 text-gray-400" />
                          )}
                        </div>

                        {/* File Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                          <p className="text-xs font-medium truncate">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-300">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteFile(file.id)
                            }}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun fichier
                    </h3>
                    <p className="text-gray-500">
                      Uploadez votre premier fichier pour commencer.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-8">
              {selectedFile ? (
                <div>
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Détails du fichier
                    </h3>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {/* Preview */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {isImage(selectedFile.mimeType) ? (
                        <img
                          src={selectedFile.url}
                          alt={selectedFile.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <File className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Nom
                        </label>
                        <p className="text-sm text-gray-900 break-words">
                          {selectedFile.originalName}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Taille
                        </label>
                        <p className="text-sm text-gray-900">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Type
                        </label>
                        <p className="text-sm text-gray-900">
                          {selectedFile.mimeType}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Uploadé le
                        </label>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedFile.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          URL
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={`${window.location.origin}${selectedFile.url}`}
                            readOnly
                            className="flex-1 text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}${selectedFile.url}`)
                              toast.success('URL copiée!')
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Copier
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4">
                      <a
                        href={selectedFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir</span>
                      </a>
                      <button
                        onClick={() => deleteFile(selectedFile.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sélectionnez un fichier
                  </h3>
                  <p className="text-gray-500">
                    Cliquez sur un fichier pour voir ses détails.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}