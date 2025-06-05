'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { X, Edit, Shield, Globe } from 'lucide-react'

interface Link {
  id: string
  slug: string
  url: string
  title?: string
  description?: string
  type: string
  shield: boolean
  isActive: boolean
  clicks: number
}

interface EditLinkModalProps {
  isOpen: boolean
  link: Link
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  url: string
  title?: string
  description?: string
  type: string
  shield: boolean
}

export default function EditLinkModal({ isOpen, link, onClose, onSuccess }: EditLinkModalProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>()

  useEffect(() => {
    if (link) {
      reset({
        url: link.url,
        title: link.title || '',
        description: link.description || '',
        type: link.type,
        shield: link.shield
      })
    }
  }, [link, reset])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        toast.success('Lien modifié avec succès!')
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erreur lors de la modification')
      }
    } catch (error) {
      toast.error('Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !link) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Modifier le lien</h2>
              <p className="text-sm text-gray-500">getallmylinks.com/{link.slug}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Current Slug (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug actuel
            </label>
            <div className="flex rounded-lg border border-gray-200 bg-gray-50">
              <span className="inline-flex items-center px-3 rounded-l-lg border-r border-gray-200 bg-gray-100 text-gray-500 text-sm">
                getallmylinks.com/
              </span>
              <div className="flex-1 px-3 py-2 text-gray-700 bg-gray-50 rounded-r-lg">
                {link.slug}
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Le slug ne peut pas être modifié après création
            </p>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de destination *
            </label>
            <input
              type="url"
              {...register('url', { 
                required: 'L\'URL est requise',
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: 'L\'URL doit commencer par http:// ou https://'
                }
              })}
              className={`input ${errors.url ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="https://example.com"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre (optionnel)
            </label>
            <input
              type="text"
              {...register('title')}
              className="input"
              placeholder="Titre de votre lien"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description privée (optionnel)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input resize-none"
              placeholder="Note privée pour vous aider à identifier ce lien"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de lien
            </label>
            <select {...register('type')} className="input">
              <option value="Landing Page">Landing Page</option>
              <option value="Social Media">Social Media</option>
              <option value="Website">Website</option>
              <option value="Portfolio">Portfolio</option>
              <option value="Blog">Blog</option>
              <option value="Store">Store</option>
              <option value="Other">Autre</option>
            </select>
          </div>

          {/* Shield Protection */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              {...register('shield')}
              id="shield-edit"
              className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="shield-edit" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Protection Shield</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Ajoute une protection contre les bots et le spam avant la redirection
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Statistiques</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total des clics</p>
                <p className="font-medium text-gray-900">{link.clicks}</p>
              </div>
              <div>
                <p className="text-gray-500">Statut</p>
                <p className={`font-medium ${link.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {link.isActive ? 'Actif' : 'Inactif'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? 'Modification...' : 'Modifier le lien'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}